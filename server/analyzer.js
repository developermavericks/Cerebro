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
  'SPORTS':               'sports',
  'CLIMATE':              'climate and environment',
  'CLIMATE_ENVIRONMENT':  'climate and environment',
  'GEOPOLITICS':          'geopolitics',
  'WORLD_NEWS':           'world news',
  'MONEY_BUSINESS':       'money and business',
  'SCIENCE_SPACE':        'science and space',
  'GAMING':               'gaming',
  'POP_CULTURE':          'pop culture',
  'CREATOR_ECONOMY':      'creator economy',
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
    return `to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'')) @@ ${fn}('simple', $${p})`;
  }).join(' OR ');

  // Sector filter via DB field (accurate — uses normalized sector column)
  const dbSector = topic && topic !== 'All' ? (SECTOR_TO_DB[topic.toUpperCase()] || null) : null;

  // Build dynamic extra clauses + params
  // extraClauses uses $-indices offset by brandParams.length (for sqlParams)
  // totalClauses uses $-indices starting at $1 (for extraParams-only queries)
  const extraParams = [];
  let extraClauses = '';
  let totalClauses = '';
  if (dbSector) {
    extraParams.push(dbSector);
    const ep = extraParams.length;
    extraClauses += ` AND sector = $${brandParams.length + ep}`;
    totalClauses += ` AND sector = $${ep}`;
  }
  if (startDate) {
    extraParams.push(startDate);
    const ep = extraParams.length;
    extraClauses += ` AND published_at >= $${brandParams.length + ep}::date`;
    totalClauses += ` AND published_at >= $${ep}::date`;
  }
  if (endDate) {
    extraParams.push(endDate);
    const ep = extraParams.length;
    extraClauses += ` AND published_at < ($${brandParams.length + ep}::date + INTERVAL '1 day')`;
    totalClauses += ` AND published_at < ($${ep}::date + INTERVAL '1 day')`;
  }
  const sqlParams = [...brandParams, ...extraParams];

  const displayBrands = [...targetBrands, "Others"];
  const results = {};
  const articleSeenPerBrand = {};
  for (const brand of displayBrands) {
    results[brand] = {
      mentions: 0, articles: 0,
      headline_mentions: 0, full_mentions: 0,
      sources: {}, timeline: {},
      sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      headline_sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      full_sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      article_samples: { Positive: [], Neutral: [], Negative: [] }
    };
    articleSeenPerBrand[brand] = new Set();
  }

  let totalKeywordArticles = 0;
  let othersCount = 0;

  // ── Per-brand DB aggregations (no large data transfer) ──────────────────────
  // Run all queries for all brands in parallel then collect
  const perTermFn = (t) => {
    const fn = t.includes(' ') ? 'phraseto_tsquery' : 'plainto_tsquery';
    return `to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'')) @@ ${fn}('simple', $1)`;
  };

  try {
    // Build per-term queries so each brand gets its own accurate count/timeline/sources
    const perTermQueries = targetTerms.map((term) => {
      const cond = perTermFn(term);
      const p = [term, ...extraParams];
      // shift extraClauses indices by 1 (term is $1, extras start at $2)
      const termExtra = extraClauses.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) - brandParams.length + 1}`);
      return { term, cond, p, termExtra };
    });

    const queryResults = await Promise.all(perTermQueries.map(({ cond, p, termExtra }) =>
      Promise.all([
        db.query(`SELECT COUNT(*) AS count FROM nexus_articles WHERE (${cond})${termExtra}`, p),
        db.query(`SELECT DATE(published_at) AS date, COUNT(*) AS count FROM nexus_articles WHERE (${cond})${termExtra} GROUP BY DATE(published_at) ORDER BY date ASC`, p),
        db.query(`SELECT COALESCE(agency,'Unknown') AS source, COUNT(*) AS count FROM nexus_articles WHERE (${cond})${termExtra} AND agency IS NOT NULL GROUP BY agency ORDER BY count DESC LIMIT 15`, p),
      ])
    ));

    queryResults.forEach(([countRes, timelineRes, sourcesRes], i) => {
      const term = targetTerms[i];
      const brandName = normalizedTargetMap[term];
      const cnt = parseInt(countRes.rows[0]?.count || 0, 10);
      results[brandName].articles += cnt;
      results[brandName].mentions += cnt;
      totalKeywordArticles += cnt;
      for (const row of timelineRes.rows) {
        const dk = new Date(row.date).toISOString().split('T')[0];
        results[brandName].timeline[dk] = (results[brandName].timeline[dk] || 0) + parseInt(row.count, 10);
      }
      for (const row of sourcesRes.rows) {
        const src = normalizePublicationName(row.source);
        results[brandName].sources[src] = (results[brandName].sources[src] || 0) + parseInt(row.count, 10);
      }
    });

    // Others count: total in window minus all matched brands
    const [totalRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS count FROM nexus_articles${totalClauses ? ` WHERE 1=1${totalClauses}` : ''}`,
        extraParams
      )
    ]);
    const totalCount = parseInt(totalRes.rows[0]?.count || 0, 10);
    othersCount = Math.max(0, totalCount - totalKeywordArticles);

    // Sample up to 25000 deduplicated articles for sentiment (dedup by title to avoid sector overlap dupes)
    const sampleRes = await db.query(`
      SELECT "Title", "Resolved URL", "Published At", "Publisher/Agency", "Summary", "Full Body"
      FROM (
        SELECT DISTINCT ON (LOWER(title))
          title                                         AS "Title",
          url                                           AS "Resolved URL",
          published_at                                  AS "Published At",
          agency                                        AS "Publisher/Agency",
          LEFT(COALESCE(full_body, summary, ''), 800)   AS "Summary",
          LEFT(COALESCE(full_body, summary, ''), 800)   AS "Full Body"
        FROM (
          SELECT title, url, published_at, agency, summary, full_body
          FROM nexus_articles
          WHERE (${searchConds})${extraClauses}
          ORDER BY published_at DESC
          LIMIT 25000
        ) candidates
        ORDER BY LOWER(title), published_at DESC
      ) deduped
      ORDER BY "Published At" DESC
    `, sqlParams);

    const compiledPatterns = {};
    for (const term of targetTerms) {
      const normTerm = normalizeText(term);
      compiledPatterns[term] = new RegExp('\\b' + normTerm.split(/\s+/).map(escapeRegExp).join('\\s+') + '\\b', 'gi');
    }
    const compiledExcluded = excludedTerms.map(term =>
      new RegExp('\\b' + normalizeText(term).split(/\s+/).map(escapeRegExp).join('\\s+') + '\\b', 'i')
    );
    const sRegexCache = {};

    for (const article of sampleRes.rows) {
      const title = article['Title'] || '';
      const rawContent = [title, article['Summary'] || '', article['Full Body'] || ''].join(' ');
      const content = normalizeText(rawContent);
      if (!content.trim()) continue;
      if (compiledExcluded.some(rx => { rx.lastIndex = 0; return rx.test(content); })) continue;

      const source = normalizePublicationName(article['Publisher/Agency'] || 'Unknown');
      let dateKey = '2026-01-01';
      try { if (article['Published At']) dateKey = new Date(article['Published At']).toISOString().split('T')[0]; } catch(e){}

      const normalizedTitle = normalizeText(title);
      const normalizedBody = normalizeText((article['Summary'] || '') + ' ' + (article['Full Body'] || ''));

      for (const term of targetTerms) {
        const regex = compiledPatterns[term];
        regex.lastIndex = 0;
        if (!regex.test(content)) continue;
        const brandName = normalizedTargetMap[term];

        // Classify headline vs body
        const sKey = term;
        if (!sRegexCache[sKey]) sRegexCache[sKey] = new RegExp('\\b' + escapeRegExp(term) + '\\b', 'i');
        const sr = sRegexCache[sKey];
        const inHeadline = sr.test(normalizedTitle);
        const inBody = sr.test(normalizedBody);

        // Track headline vs full mentions
        if (inHeadline) results[brandName].headline_mentions += 1;
        if (inBody) results[brandName].full_mentions += 1;
        if (!inBody && !inHeadline) results[brandName].full_mentions += 1; // fallback

        const sentences = rawContent.split(/[.!?]+\s+/);
        for (const sentence of sentences) {
          if (!sr.test(normalizeText(sentence))) continue;
          const sc = sentiment.analyze(sentence);
          const sentCat = sc.score > 1 ? 'Positive' : sc.score < -1 ? 'Negative' : 'Neutral';
          results[brandName].sentiment[sentCat] += 1;

          // Headline-only sentiment from title sentences
          if (inHeadline) {
            const titleSc = sentiment.analyze(title);
            const titleSentCat = titleSc.score > 1 ? 'Positive' : titleSc.score < -1 ? 'Negative' : 'Neutral';
            results[brandName].headline_sentiment[titleSentCat] += 1;
          }
          // Full/body sentiment
          results[brandName].full_sentiment[sentCat] += 1;

          const url = article['Resolved URL'] || '';
          const articleKey = title.toLowerCase().trim() || url;
          if (!articleSeenPerBrand[brandName].has(articleKey)) {
            articleSeenPerBrand[brandName].add(articleKey);
            if (results[brandName].article_samples[sentCat].length < 50)
              results[brandName].article_samples[sentCat].push({ title: title || 'No Title', source, url, published: dateKey });
          }
        }
      }
    }

  } catch (err) {
    console.error('[Analyzer] DB queries failed:', err.message);
  }

  results["Others"].articles = othersCount;
  results["Others"].mentions = othersCount;

  const totalSectorArticles = totalKeywordArticles + othersCount;

  const indianSourceCounts = {};
  for (const [, data] of Object.entries(results)) {
    for (const [src, count] of Object.entries(data.sources)) {
      if (isIndianSource(src)) indianSourceCounts[src] = (indianSourceCounts[src] || 0) + count;
    }
  }
  const topIndianPublications = Object.entries(indianSourceCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  return { brands: results, topIndianPublications, totalSectorArticles, totalKeywordArticles };
}

module.exports = {
  analyzeSpecificBrands,
  isIndianSource,
  normalizePublicationName
};
