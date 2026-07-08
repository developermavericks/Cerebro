const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const db = require('./db');
const { GoogleDecoder } = require('google-news-url-decoder');

const sentiment = new Sentiment();
const decoder = new GoogleDecoder();
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
  }
});

function cleanForWin1252(str) {
  if (!str) return '';
  let s = str.toString()
           .replace(/₹/g, 'Rs.')
           .replace(/[\u2018\u2019]/g, "'")
           .replace(/[\u201C\u201D]/g, '"')
           .replace(/\u2014/g, '--')
           .replace(/\u2013/g, '-')
           .replace(/\u2026/g, '...')
           .replace(/\u00A0/g, ' ');
  
  let result = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if ((code >= 0 && code <= 127) || (code >= 160 && code <= 255)) {
      result += s[i];
    } else {
      const allowedPoints = [
        0x20AC, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 
        0x2030, 0x0160, 0x2039, 0x0152, 0x017D, 0x2018, 0x2019, 0x201C, 
        0x201D, 0x2022, 0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A, 
        0x0153, 0x017E, 0x0178
      ];
      if (allowedPoints.includes(code)) {
        result += s[i];
      } else {
        if (code === 305) result += 'i';
        else if (code === 304) result += 'I';
        else result += ' ';
      }
    }
  }
  return result;
}

// Enforce 2 days window
function isWithin2Days(pubDateStr) {
  if (!pubDateStr || pubDateStr === 'Unknown Date') return false;
  const pubDate = new Date(pubDateStr);
  if (isNaN(pubDate.getTime())) return false;
  const diffMs = Date.now() - pubDate.getTime();
  // Allow articles up to 2 days old, and do not filter out future-dated articles due to clock skew
  return diffMs <= 2 * 24 * 60 * 60 * 1000;
}

// Decode Google News redirect URL
async function decodeGoogleNewsUrl(url) {
  if (url.includes('news.google.com')) {
    try {
      const result = await decoder.decode(url);
      if (result && result.status && result.decoded_url) {
        return result.decoded_url;
      }
    } catch (e) {
      console.error(`Error decoding Google News URL: ${url}`, e.message);
    }
  }
  return url;
}

// Extract publish date from article HTML metadata
function extractPublishDate(html) {
  const $ = cheerio.load(html);
  
  // Meta tags check
  const metaSelectors = [
    'meta[property="article:published_time"]',
    'meta[name="pubdate"]',
    'meta[property="og:published_time"]',
    'meta[name="publish-date"]',
    'meta[name="publication-date"]',
    'meta[name="date"]',
    'meta[property="rnews:datePublished"]'
  ];
  
  for (const sel of metaSelectors) {
    const content = $(sel).attr('content');
    if (content) {
      const parsed = new Date(content);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  
  // JSON-LD check
  let jsonLdDate = null;
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      const dateStr = data.datePublished || data.dateModified || (data['@graph'] && data['@graph'].find(item => item.datePublished)?.datePublished);
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          jsonLdDate = parsed;
          return false; // break loop
        }
      }
    } catch (e) {}
  });
  
  if (jsonLdDate) return jsonLdDate;
  
  // HTML5 time tag check
  const timeText = $('time[datetime]').attr('datetime');
  if (timeText) {
    const parsed = new Date(timeText);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return null;
}

// Extract main article body text
function extractMainContent(html) {
  const $ = cheerio.load(html);
  
  // Clean unwanted elements
  $('script, style, nav, header, footer, iframe, noscript, svg, form, .comment, #comment, .footer, #footer, .header, #header').remove();
  
  let paragraphs = [];
  $('p').each((i, el) => {
    const txt = $(el).text().trim();
    if (txt.length > 50 && txt.includes(' ')) {
      paragraphs.push(txt);
    }
  });
  
  if (paragraphs.length > 0) {
    return paragraphs.join('\n\n');
  }
  
  // Fallback to article element or body text
  const articleText = $('article').text().trim();
  if (articleText.length > 200) {
    return articleText;
  }
  
  return $('body').text().trim().replace(/\s+/g, ' ');
}

async function fetchRssForCompany(company) {
  const regionsToFetch = company.region === 'Both' ? ['Global', 'India'] : [company.region];
  let newCount = 0;
  const pingTimestamp = new Date().toISOString();

  try {
    await db.query('UPDATE companies SET last_ping_at = $1 WHERE id = $2', [pingTimestamp, company.id]);
  } catch (pingErr) {
    console.error(`Error updating last_ping_at for ${company.name}:`, pingErr.message);
  }

  for (const r of regionsToFetch) {
    const encodedQuery = encodeURIComponent(company.name);
    const suffix = r === 'India' ? '&gl=IN&ceid=IN:en' : '';
    // Query Google News search with when:2d (2 days)
    const newsUrl = `https://news.google.com/rss/search?q=${encodedQuery}+when:2d${suffix}`;

    try {
      let feed = null;
      let usedProxy = false;

      // Helper to fetch and parse RSS feeds
    async function tryFetchFeed(useProxyAgent) {
      const config = {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        }
      };
      if (useProxyAgent && process.env.DATAIMPULSE_PROXY_URL) {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        const agent = new HttpsProxyAgent(process.env.DATAIMPULSE_PROXY_URL);
        config.httpAgent = agent;
        config.httpsAgent = agent;
        config.timeout = 15000;
      }
      const response = await axios.get(newsUrl, config);
      if (response.status === 200 && response.data) {
        return await parser.parseString(response.data);
      }
      throw new Error(`Invalid response status: ${response.status}`);
    }

    try {
      // Attempt 1: Direct IP
      feed = await tryFetchFeed(false);
      if (!feed || !feed.items || feed.items.length === 0) {
        throw new Error('Fetched feed is empty (below expected output)');
      }
    } catch (err) {
      console.warn(`[Fetcher] Direct RSS fetch failed or empty for ${company.name} (${r}): ${err.message}. Retrying via proxy...`);
      // Attempt 2: DataImpulse Proxy Failover
      if (process.env.DATAIMPULSE_PROXY_URL) {
        try {
          feed = await tryFetchFeed(true);
          usedProxy = true;
          console.log(`[Fetcher] Successfully polled RSS via proxy for ${company.name} (${r}).`);
        } catch (proxyErr) {
          console.error(`[Fetcher] Proxy RSS fetch also failed for ${company.name} (${r}): ${proxyErr.message}`);
        }
      }
    }

    if (!feed || !feed.items) {
      continue;
    }

    const filteredItems = feed.items.filter(item => {
      const pubDateStr = item.pubDate || item.isoDate || new Date().toISOString();
      return isWithin2Days(pubDateStr);
    });

      // Concurrency limit of 3 parallel requests
      const concurrencyLimit = 3;
      for (let i = 0; i < filteredItems.length; i += concurrencyLimit) {
        const chunk = filteredItems.slice(i, i + concurrencyLimit);
        await Promise.all(chunk.map(async (item) => {
          const pubDateStr = item.pubDate || item.isoDate || new Date().toISOString();
          let title = item.title || 'No Title';
          let source = item.source || 'Google News';
          if (!item.source && title.includes(' - ')) {
            const parts = title.split(' - ');
            source = parts.pop().trim();
            title = parts.join(' - ').trim();
          }

          const link = item.link || '';
          if (!link) return;

          // Resolve Google News redirect link
          const decodedUrl = await decodeGoogleNewsUrl(link);
          
          // Background fetcher: Skip direct page crawling.
          // Save the Google News RSS item snippet directly to be extracted on-demand later.
          const rawContent = item.contentSnippet || item.content || item.summary || 'Summary pending extraction...';
          const cleanContent = cheerio.load(rawContent).text().trim();
          const fullContent = cleanContent ? cleanContent : rawContent;

          // Duplicate checking based on company_id and title
          const cleanTitle = cleanForWin1252(title);
          const dupRes = await db.query('SELECT id FROM articles WHERE company_id = $1 AND title = $2', [company.id, cleanTitle]);
          if (dupRes.rows.length > 0) {
            return;
          }

          // Perform sentiment analysis on title + first 1000 chars of full content
          const result = sentiment.analyze(title + ' ' + fullContent.slice(0, 1000));
          let sentimentScore = 'Neutral';
          if (result.score > 1) sentimentScore = 'Positive';
          else if (result.score < -1) sentimentScore = 'Negative';

          const insertRes = await db.query(`
            INSERT INTO articles (company_id, title, link, published_at, source, summary, sentiment, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (link) DO NOTHING
          `, [company.id, cleanTitle, decodedUrl, pubDateStr, cleanForWin1252(source), cleanForWin1252(fullContent), sentimentScore, pingTimestamp]);

          if (insertRes.rowCount > 0) {
            newCount++;
          }
        }));
      }
    } catch (err) {
      console.error(`Error pinging ${r} Google News for ${company.name}:`, err.message);
    }
  }

  try {
    const countRes = await db.query('SELECT COUNT(DISTINCT title) FROM articles WHERE company_id = $1', [company.id]);
    const mentions = parseInt(countRes.rows[0].count, 10);

    const nowStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    const statusMsg = `[${nowStr}] Checked ${company.region}: Found ${newCount} new items`;

    await db.query('UPDATE companies SET last_status = $1, mentions = $2 WHERE id = $3', [statusMsg, mentions, company.id]);
  } catch (err) {
    console.error(`Error updating status for ${company.name}:`, err.message);
  }

  return newCount;
}

async function fetchAllCompanies() {
  console.log('Starting Google News ping across all tracked companies...');
  try {
    await db.query(`
      INSERT INTO status (key, value) VALUES ('last_fetch_time', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [new Date().toISOString()]);

    const res = await db.query('SELECT * FROM companies');
    const companies = res.rows;

    let totalNew = 0;
    for (const comp of companies) {
      const count = await fetchRssForCompany(comp);
      totalNew += count;
    }

    console.log(`Completed Google News ping. Total new articles found: ${totalNew}`);
    return totalNew;
  } catch (err) {
    console.error('Error in fetchAllCompanies:', err);
    return 0;
  }
}

module.exports = {
  fetchRssForCompany,
  fetchAllCompanies
};
