const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

const OTHER_BRANDS_POOL = [
  "TCS", "Infosys", "Wipro", "HCLTech", "IBM", "Deloitte", "PwC", "EY", "KPMG", 
  "LTIMindtree", "Persistent Systems", "Zensar Technologies", "Happiest Minds", "Mu Sigma", 
  "DataRobot", "C3.ai", "Palantir Technologies", "Scale AI", "LeewayHertz", "Elysium Technologies", 
  "Ksolves", "Innowise Group", "ScienceSoft", "Addepto", "Markovate", "Sarvika Technologies", 
  "Intellectyx", "Millipixels Interactive", "InnovationM", "Sigmoid", "Google DeepMind", 
  "Meta AI", "Mistral AI", "Cohere", "xAI", "Perplexity AI", "DeepSeek", "Stability AI", 
  "Inflection AI", "Hugging Face", "Character.ai", "Adept AI", "Reka AI", "01.AI", 
  "LightOn", "Aleph Alpha", "AI21 Labs", "Kyutai", "Suno", "ElevenLabs", "AMD", "Intel", 
  "TSMC", "Broadcom", "Qualcomm", "Arm Holdings", "Groq", "Cerebras Systems", "SambaNova Systems", 
  "Graphcore", "Tenstorrent", "Lightmatter", "CoreWeave", "Lambda Labs", "ASML", 
  "Marvell Technology", "Micron Technology", "SK Hynix", "Supermicro", "SiliconFlow", 
  "Databricks", "Snowflake", "Runway", "Pika Labs", "Luma AI", "Sora", "Cursor", 
  "Cognition AI", "Harvey", "Abnormal Security", "Glean", "Shield AI", "Anduril Industries", 
  "Waymo", "Tesla", "Canva", "Adobe", "Notion", "Jasper", "Copy.ai", "Synthesia", 
  "Midjourney", "Haptik", "Uniphore", "Arya.ai", "Mad Street Den", "Locus.sh", "SigTuple", 
  "Ambience Healthcare", "Safe Superintelligence", "Sarvam AI", "Krutrim", "Tata Elxsi", 
  "Netweb Technologies", "E2E Networks", "Reliance Jio", "Qure.ai", "Yellow.ai", 
  "GreyOrange", "Cropin", "Bhashini", "BharatGen", "CoRover", "Gnani.ai", "Entropik", 
  "Skit.ai", "Niramai", "Intello Labs", "Myelin Foundry", "Rephrase.ai", "Observe.AI", 
  "LogiNext", "Assert AI", "Kore.ai", "Active.ai", "Vernacular.ai", "Staqu", 
  "AIndra Systems", "Soket AI Labs"
];

// Maps frontend dropdown value → canonical DB sector value
const SECTOR_TO_DB = {
  'AI':          'AI',
  'TECH':        'Tech',
  'FOODS_DRINKS':'Foods & Drinks',
  'HEALTHCARE':  'Healthcare',
  'TRAVEL':      'Travel',
  'CONSULTANCY': 'Consultancies',
  'STARTUP':     'Startups',
  'LIFESTYLE':   'Lifestyle',
  'POLICIES':    'Policies',
  'STOCK_MARKET':'Stock Market',
  'REAL_ESTATE': 'Real Estate',
  'GOOGLE':      'Google',
  'EDUCATION':   'Education',
  'FINTECH':     'Fintech',
  'AUTOMOBILE':  'Automobile',
  'MEDIA':       'Media & Entertainment',
};

const BRAND_FAMILIES = {
  "Qualcomm": ["Qualcomm", "Snapdragon"],
  "MediaTek": ["MediaTek", "Dimensity", "Helio"],
  "Intel": ["Intel", "Core i", "Xeon", "Arc GPU", "Lakefield"],
  "AMD": ["AMD", "Ryzen", "Radeon", "EPYC", "Threadripper"],
  "Nvidia": ["Nvidia", "GeForce", "RTX", "GTX", "H100", "A100", "B100", "Grace Hopper"]
};

const INDIAN_SOURCES_KEYWORDS = [
  "economic times", "times of india", "the times of india", "toi", "timesofindia", 
  "the hindu", "hindustantimes", "hindustan times", "the hindustan times",
  "business standard", "livemint", "mint", "ndtv", "india today", "firstpost",
  "indian express", "financial express", "moneycontrol", "yourstory", "inc42",
  "business today", "zee news", "news18", "deccan herald", "outlook india",
  "the week", "businessworld", "forbes india", "fortune india", "vccircle",
  "techcircle", "entrackr", "trak.in", "techgig", "analytics india", "cnbc tv18",
  "pti", "ians", "ani", "deccan chronicle", "pib", "dainik", "jagran", "amar ujala",
  "bhaskar", "lokmat", "malayala", "mathrubhumi", "enadu", "sakshi", "dinakaran",
  "the pioneer", "tribune india", "new indian express", "telangana today",
  "kashmir reader", "greater kashmir", "assam tribune", "sentinel assam"
];

function isIndianSource(sourceName) {
  if (!sourceName) return false;
  const sn = sourceName.toLowerCase();
  if (sn.includes("propakistani")) return false;

  for (const kw of INDIAN_SOURCES_KEYWORDS) {
    if (kw.length <= 4) {
      if (new RegExp('\\b' + escapeRegExp(kw) + '\\b', 'i').test(sn)) return true;
    } else if (sn.includes(kw)) {
      return true;
    }
  }
  return false;
}

function normalizePublicationName(name) {
  if (!name) return "Unknown";
  const n = name.trim();
  const nl = n.toLowerCase();

  const mapping = {
    "the times of india": "Times of India",
    "times of india": "Times of India",
    "toi": "Times of India",
    "the economic times": "Economic Times",
    "economic times": "Economic Times",
    "the indian express": "Indian Express",
    "indian express": "Indian Express",
    "the new indian express": "New Indian Express",
    "new indian express": "New Indian Express",
    "the hindu": "The Hindu",
    "hindu": "The Hindu",
    "hindustantimes": "Hindustan Times",
    "hindustan times": "Hindustan Times",
    "the hindustan times": "Hindustan Times",
    "livemint": "Mint",
    "mint": "Mint",
    "moneycontrol": "Moneycontrol",
    "business standard": "Business Standard",
    "cnbc tv18": "CNBC TV18",
    "india today": "India Today",
    "financial express": "Financial Express",
    "deccan herald": "Deccan Herald",
    "the pioneer": "The Pioneer",
    "outlook india": "Outlook India"
  };

  for (const [key, val] of Object.entries(mapping)) {
    if (key === nl || (key.length > 5 && nl.includes(key))) {
      return val;
    }
  }
  if (nl.startsWith("the ")) {
    return n.substring(4);
  }
  return n;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text) {
  if (!text) return "";
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function analyzeSpecificBrands({ targetKeywords = [], excludedKeywords = [], topic = 'All', startDate = null, endDate = null }) {
  const db = require('./db');

  const targetBrands = (targetKeywords || []).map(b => b.trim()).filter(Boolean);
  if (!targetBrands.length) return {};

  const excludedTerms = (excludedKeywords || []).map(b => b.trim()).filter(Boolean);

  // Build alias map early (needed for SQL pre-filter)
  const normalizedTargetMap = {};
  for (const b of targetBrands) {
    const bLower = b.toLowerCase();
    let familyMatch = null;
    for (const [displayName, aliases] of Object.entries(BRAND_FAMILIES)) {
      if (bLower === displayName.toLowerCase()) { familyMatch = aliases; break; }
    }
    if (familyMatch) {
      for (const alias of familyMatch) normalizedTargetMap[alias.toLowerCase().trim()] = b;
    } else {
      normalizedTargetMap[bLower] = b;
    }
  }

  const targetTerms = Object.keys(normalizedTargetMap);

  // SQL pre-filter using GIN full-text index (fast) — falls back to seq scan if index not built yet
  const brandParams = targetTerms.map(t => t);
  const searchConds = targetTerms.map((t, i) => {
    const p = i + 1;
    const fn = t.includes(' ') ? 'phraseto_tsquery' : 'plainto_tsquery';
    return `to_tsvector('simple', coalesce(full_body,'')) @@ ${fn}('simple', $${p})`;
  }).join(' OR ');

  // Sector filter via DB field (accurate — uses normalized sector column)
  const dbSector = topic && topic !== 'All' ? (SECTOR_TO_DB[topic.toUpperCase()] || null) : null;

  // Build dynamic extra clauses + params
  const extraParams = [];
  let extraClauses = '';
  if (dbSector) {
    extraParams.push(dbSector);
    extraClauses += ` AND sector = $${brandParams.length + extraParams.length}`;
  }
  if (startDate) {
    extraParams.push(startDate);
    extraClauses += ` AND published_at >= $${brandParams.length + extraParams.length}::date`;
  }
  if (endDate) {
    extraParams.push(endDate);
    extraClauses += ` AND published_at < ($${brandParams.length + extraParams.length}::date + INTERVAL '1 day')`;
  }
  const sqlParams = [...brandParams, ...extraParams];

  let articles = [];
  let othersCount = 0;
  let nexusTableExists = true;

  // Fetch matching articles from nexus
  try {
    const nexus = await db.query(`
      SELECT
        title                                             AS "Title",
        url                                               AS "Resolved URL",
        published_at                                      AS "Published At",
        agency                                            AS "Publisher/Agency",
        COALESCE(full_body, '')                           AS "Summary",
        COALESCE(full_body, '')                           AS "Full Body"
      FROM nexus_articles
      WHERE (${searchConds})${extraClauses}
      ORDER BY published_at DESC
      LIMIT 1000
    `, sqlParams);
    articles = nexus.rows;
  } catch (err) {
    console.error('[Analyzer] nexus SELECT failed:', err.message);
    nexusTableExists = false;
  }

  // Count non-matching articles: total_in_window - matched (avoids NOT on GIN index → seq scan)
  if (nexusTableExists) {
    try {
      const [matchedRes, totalRes] = await Promise.all([
        db.query(`SELECT COUNT(*) AS count FROM nexus_articles WHERE (${searchConds})${extraClauses}`, sqlParams),
        db.query(
          `SELECT COUNT(*) AS count FROM nexus_articles${extraClauses ? ` WHERE 1=1${extraClauses}` : ''}`,
          extraParams
        )
      ]);
      const matchedCount = parseInt(matchedRes.rows[0]?.count || 0, 10);
      const totalCount  = parseInt(totalRes.rows[0]?.count  || 0, 10);
      othersCount = Math.max(0, totalCount - matchedCount);
    } catch (err) {
      console.error('[Analyzer] others COUNT failed:', err.message);
    }
  }

  // Fallback to RSS articles table only if nexus table itself is unavailable (error, not empty)
  if (!nexusTableExists) {
    try {
      const rss = await db.query(`
        SELECT
          title        AS "Title",
          link         AS "Resolved URL",
          published_at AS "Published At",
          source       AS "Publisher/Agency",
          summary      AS "Summary",
          summary      AS "Full Body"
        FROM articles
      `);
      articles = rss.rows;
    } catch (err) {
      console.error('[Analyzer] RSS fallback failed:', err.message);
    }
  }

  const displayBrands = [...targetBrands, "Others"];
  const results = {};
  // Track which article URLs have already been added to any sentiment bucket per brand,
  // so the same article never appears in both Positive and Neutral (or any two buckets).
  const articleSeenPerBrand = {};
  for (const brand of displayBrands) {
    results[brand] = {
      mentions: 0,
      articles: 0,
      sources: {},
      timeline: {},
      sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      article_samples: { Positive: [], Neutral: [], Negative: [] }
    };
    articleSeenPerBrand[brand] = new Set();
  }

  let totalKeywordArticles = 0;

  // Compile regex patterns
  const compiledPatterns = {};
  for (const term of targetTerms) {
    const normTerm = normalizeText(term);
    const escapedParts = normTerm.split(/\s+/).map(escapeRegExp);
    compiledPatterns[term] = new RegExp('\\b' + escapedParts.join('\\s+') + '\\b', 'gi');
  }

  const compiledExcluded = excludedTerms.map(term => {
    const normTerm = normalizeText(term);
    const escapedParts = normTerm.split(/\s+/).map(escapeRegExp);
    return new RegExp('\\b' + escapedParts.join('\\s+') + '\\b', 'i');
  });

  for (const article of articles) {
    const title = article['Title'] || '';
    const summary = article['Summary'] || '';
    const fullBody = article['Full Body'] || '';
    const rawContent = [title, summary, fullBody].join(' ');
    const content = normalizeText(rawContent);

    if (!content.trim()) continue;

    let isExcluded = false;
    for (const regex of compiledExcluded) {
      regex.lastIndex = 0;
      if (regex.test(content)) { isExcluded = true; break; }
    }
    if (isExcluded) continue;

    const sourceRaw = article['Publisher/Agency'] || article['Publisher'] || article['Source Feed'] || 'Unknown';
    const source = normalizePublicationName(sourceRaw);

    let dateKey = '2026-06-01';
    const pubRaw = article['Published At'] || article['Timestamp'];
    if (pubRaw) {
      try {
        const dateObj = new Date(pubRaw);
        if (!isNaN(dateObj.getTime())) dateKey = dateObj.toISOString().split('T')[0];
      } catch (e) {}
    }

    let hasKeywordMatch = false;

    for (const term of targetTerms) {
      const regex = compiledPatterns[term];
      regex.lastIndex = 0;
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        hasKeywordMatch = true;
        const brandName = normalizedTargetMap[term];

        results[brandName].mentions += matches.length;
        results[brandName].articles += 1;
        results[brandName].sources[source] = (results[brandName].sources[source] || 0) + matches.length;
        results[brandName].timeline[dateKey] = (results[brandName].timeline[dateKey] || 0) + matches.length;

        const sentences = rawContent.split(/[.!?]+\s+/);
        for (const sentence of sentences) {
          const sentNorm = normalizeText(sentence);
          const sRegex = new RegExp('\\b' + escapeRegExp(term) + '\\b', 'i');
          if (sRegex.test(sentNorm)) {
            const res = sentiment.analyze(sentence);
            let sentCat = res.score > 1 ? "Positive" : res.score < -1 ? "Negative" : "Neutral";

            results[brandName].sentiment[sentCat] += 1;
            const url = article['Resolved URL'] || article['URL'] || article['link'] || '';
            const titleToCheck = title || 'No Title';
            const articleKey = (url && url !== '') ? url : titleToCheck;
            if (!articleSeenPerBrand[brandName].has(articleKey)) {
              articleSeenPerBrand[brandName].add(articleKey);
              results[brandName].article_samples[sentCat].push({ title: titleToCheck, source, url, published: dateKey });
            }
          }
        }
      }
    }

    if (hasKeywordMatch) totalKeywordArticles++;
  }

  // Populate Others from SQL COUNT (no JS loop needed)
  results["Others"].articles = othersCount;
  results["Others"].mentions = othersCount;

  const totalSectorArticles = totalKeywordArticles + othersCount;

  const indianSourceCounts = {};
  for (const [brand, data] of Object.entries(results)) {
    for (const [src, count] of Object.entries(data.sources)) {
      if (isIndianSource(src)) {
        indianSourceCounts[src] = (indianSourceCounts[src] || 0) + count;
      }
    }
  }
  const topIndianPublications = Object.entries(indianSourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  return {
    brands: results,
    topIndianPublications,
    totalSectorArticles,
    totalKeywordArticles
  };
}

module.exports = {
  analyzeSpecificBrands,
  isIndianSource,
  normalizePublicationName
};
