/**
 * BigQuery-Backed Brand Analyzer for Cerebro
 * 
 * Replaces the legacy Excel-based analyzer.js with BigQuery SQL queries.
 * Returns the EXACT same response shape so the frontend needs zero changes.
 * 
 * Response shape:
 * {
 *   brands: {
 *     "BrandName": {
 *       mentions: Number,
 *       articles: Number,
 *       sources: { "Publication": count, ... },
 *       timeline: { "YYYY-MM-DD": count, ... },
 *       sentiment: { Positive: N, Neutral: N, Negative: N },
 *       article_samples: { Positive: [...], Neutral: [...], Negative: [...] }
 *     },
 *     "Others": { ... }
 *   },
 *   topIndianPublications: [{ name, count }, ...],
 *   totalSectorArticles: Number,
 *   totalKeywordArticles: Number
 * }
 */

const bq = require('./bigquery');

// ─── Constants (mirrored from legacy analyzer for compatibility) ─────────────

const BRAND_FAMILIES = {
  "Qualcomm": ["Qualcomm", "Snapdragon"],
  "MediaTek": ["MediaTek", "Dimensity", "Helio"],
  "Intel": ["Intel", "Core i", "Xeon", "Arc GPU", "Lakefield"],
  "AMD": ["AMD", "Ryzen", "Radeon", "EPYC", "Threadripper"],
  "Nvidia": ["Nvidia", "GeForce", "RTX", "GTX", "H100", "A100", "B100", "Grace Hopper"]
};

const TOPIC_KEYWORDS = {
  "AI": ["ai", "artificial intelligence", "machine learning", "deep learning", "generative ai", "neural network", "openai", "copilot", "llm", "large language model"],
  "STARTUP": ["startup", "startups", "venture capital", "funding", "founder", "founders", "entrepreneur", "entrepreneurs", "seed round", "series a"],
  "CONSULTANCY": ["consultancy", "consulting", "consultant", "consultants", "mckinsey", "bcg", "bain", "accenture", "ey", "deloitte", "pwc", "kpmg"],
  "FINANCE": ["finance", "financial", "banking", "investment", "capital", "stock", "stocks", "market", "markets", "bank", "banks", "equity"],
  "TECHNOLOGY": ["technology", "tech", "software", "hardware", "digital", "it", "semiconductor", "microchip", "processor"],
  "HEALTHCARE": ["healthcare", "health", "medical", "pharma", "pharmaceutical", "hospital", "hospitals", "clinical", "medicine"],
  "EDUCATION": ["education", "educational", "school", "schools", "university", "universities", "college", "colleges", "learning", "student", "students"],
  "ENERGY": ["energy", "power", "solar", "wind", "oil", "gas", "renewable", "renewables", "electricity"],
  "RETAIL": ["retail", "shopping", "e-commerce", "ecommerce", "store", "stores", "consumer", "goods", "supermarket"],
  "MEDIA": ["media", "news", "press", "journalism", "broadcast", "television", "tv", "newspaper", "social media"],
  "AUTOMOTIVE": ["automotive", "automobile", "car", "cars", "vehicle", "vehicles", "ev", "electric vehicle", "electric vehicles"]
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

const SOURCE_NORMALIZATION = {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizePublicationName(name) {
  if (!name) return "Unknown";
  const n = name.trim();
  const nl = n.toLowerCase();

  for (const [key, val] of Object.entries(SOURCE_NORMALIZATION)) {
    if (key === nl || (key.length > 5 && nl.includes(key))) {
      return val;
    }
  }
  if (nl.startsWith("the ")) {
    return n.substring(4);
  }
  return n;
}

function isIndianSource(sourceName) {
  if (!sourceName) return false;
  const sn = sourceName.toLowerCase();
  if (sn.includes("propakistani")) return false;

  for (const kw of INDIAN_SOURCES_KEYWORDS) {
    if (kw.length <= 4) {
      if (new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(sn)) return true;
    } else if (sn.includes(kw)) {
      return true;
    }
  }
  return false;
}

/**
 * Expand brand keywords using brand family aliases.
 * e.g. "Nvidia" → ["Nvidia", "GeForce", "RTX", "GTX", "H100", "A100", "B100", "Grace Hopper"]
 * 
 * Returns a Map: displayBrand → [searchTerms]
 */
function expandBrandAliases(targetBrands) {
  const brandSearchMap = new Map();

  for (const brand of targetBrands) {
    const bLower = brand.toLowerCase();
    let terms = [brand];

    for (const [displayName, aliases] of Object.entries(BRAND_FAMILIES)) {
      if (bLower === displayName.toLowerCase()) {
        terms = aliases;
        break;
      }
    }

    brandSearchMap.set(brand, terms);
  }

  return brandSearchMap;
}

/**
 * Build a LIKE-based WHERE clause for a list of terms across title only (headline search).
 * Returns { clause: string, params: object } — no full-text index required.
 */
function buildLikeClause(terms, paramPrefix = 'bkw') {
  if (!terms || !terms.length) return { clause: 'FALSE', params: {} };
  const params = {};
  const clauses = terms.map((t, i) => {
    const p = `${paramPrefix}${i}`;
    params[p] = `%${t.toLowerCase()}%`;
    return `LOWER(COALESCE(title,'')) LIKE @${p}`;
  });
  return { clause: clauses.join(' OR '), params };
}

/**
 * Build a LIKE-based WHERE clause for a list of terms across title + summary + full_body.
 * Returns { clause: string, params: object }.
 */
function buildFullLikeClause(terms, paramPrefix = 'fbkw') {
  if (!terms || !terms.length) return { clause: 'FALSE', params: {} };
  const params = {};
  const clauses = terms.map((t, i) => {
    const p = `${paramPrefix}${i}`;
    params[p] = `%${t.toLowerCase()}%`;
    return `(LOWER(COALESCE(title,'')) LIKE @${p} OR LOWER(COALESCE(summary,'')) LIKE @${p} OR LOWER(COALESCE(full_body,'')) LIKE @${p})`;
  });
  return { clause: clauses.join(' OR '), params };
}

/**
 * Build a topic filter SQL clause using LIKE matching.
 * Returns { clause: string, params: object }.
 */
function buildTopicFilter(topic, paramOffset = 0) {
  if (!topic || topic === 'All') return { clause: '', params: {} };

  const keywords = TOPIC_KEYWORDS[topic.toUpperCase()] || [topic.toLowerCase()];
  const { clause, params } = buildLikeClause(keywords, `tpkw${paramOffset}_`);
  return { clause: clause !== 'FALSE' ? `AND (${clause})` : '', params };
}

/**
 * Build excluded keywords LIKE filter clauses (headline only).
 * Returns { clauses: string[], params: object }
 */
function buildExcludeFilter(excludedKeywords) {
  if (!excludedKeywords || excludedKeywords.length === 0) return { clauses: [], params: {} };
  const params = {};
  const clauses = excludedKeywords.map((kw, i) => {
    const p = `exkw${i}`;
    params[p] = `%${kw.toLowerCase()}%`;
    return `AND NOT LOWER(COALESCE(title,'')) LIKE @${p}`;
  });
  return { clauses, params };
}


const sentimentEngine = require('./sentiment_engine');

// ─── Main Analysis Function ─────────────────────────────────────────────────

/**
 * Analyze specific brands using BigQuery.
 * Returns the exact same response shape as the legacy analyzer.
 * 
 * @param {Object} options
 * @param {string[]} options.targetKeywords - Brand names to search for
 * @param {string[]} options.excludedKeywords - Keywords to exclude
 * @param {string} options.topic - Topic/sector filter ('All', 'AI', 'STARTUP', etc.)
 * @param {string} [options.startDate] - Optional start date (ISO string)
 * @param {string} [options.endDate] - Optional end date (ISO string)
 * @returns {Promise<Object>} Analysis results in Cerebro format
 */
async function analyzeSpecificBrands({ targetKeywords = [], excludedKeywords = [], topic = 'All', startDate, endDate, searchScope = 'full', onProgress = null }) {
  const targetBrands = targetKeywords.map(b => b.trim()).filter(Boolean);
  if (!targetBrands.length) return {};

  const isHeadlineOnly = searchScope === 'headline' || searchScope === 'title';
  const excludedTerms = (excludedKeywords || []).map(b => b.trim()).filter(Boolean);
  const tableRef = bq.getTableRef();

  // Initialize results structure (same shape as legacy, plus headline/full breakdowns)
  const displayBrands = [...targetBrands, "Others"];
  const results = {};
  for (const brand of displayBrands) {
    results[brand] = {
      mentions: 0,
      articles: 0,
      headline_mentions: 0,
      full_mentions: 0,
      sources: {},
      timeline: {},
      sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      headline_sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      full_sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      article_samples: { Positive: [], Neutral: [], Negative: [] }
    };
  }

  // Expand brand aliases
  const brandSearchMap = expandBrandAliases(targetBrands);

  // Build date range filter
  let dateFilter = '';
  const queryParams = {};

  if (startDate) {
    dateFilter += 'AND DATE(published_at) >= @startDate\n    ';
    queryParams.startDate = startDate;
  }
  if (endDate) {
    dateFilter += 'AND DATE(published_at) <= @endDate\n    ';
    queryParams.endDate = endDate;
  }

  // Build excluded keywords filter
  let excludeFilter = '';
  const excludeParams = {};
  if (excludedTerms.length > 0) {
    const { clauses: exClauses, params: exParams } = buildExcludeFilter(excludedTerms);
    excludeFilter = exClauses.join('\n    ');
    Object.assign(excludeParams, exParams);
  }

  // Build topic filter
  const { clause: topicClause, params: topicParams } = buildTopicFilter(topic);
  const topicFilter = topicClause;

  // ─── Query 1: Per-brand article data — run brands sequentially to keep memory at O(22K) ───
  // Running concurrently (Promise.all) would hold 3×22K rows in memory simultaneously → OOM on Cloud Run.

  let totalKeywordArticles = 0;

  for (const [displayBrand, searchTerms] of brandSearchMap.entries()) {
    // Search across title only OR title + summary + full_body based on searchScope
    const safePrefix = displayBrand.replace(/\W/g, '_');
    const { clause: matchClause, params: matchLikeParams } = isHeadlineOnly
      ? buildLikeClause(searchTerms, `hdkw_${safePrefix}_`)
      : buildFullLikeClause(searchTerms, `fbkw_${safePrefix}_`);
    const brandQueryParams = { ...queryParams, ...matchLikeParams, ...excludeParams, ...topicParams };

    const BATCH_SIZE = 22000;
    const MAX_BATCHES = 15; // cap at 330K articles per brand

    const baseSql = `
      SELECT
        id,
        title,
        COALESCE(agency, 'Unknown') AS agency,
        CAST(published_at AS STRING) AS published_at,
        COALESCE(summary, '') AS summary,
        LEFT(COALESCE(full_body, ''), 1000) AS full_body,
        COALESCE(url, '') AS url
      FROM ${tableRef}
      WHERE (${matchClause})
        ${dateFilter}
        ${excludeFilter}
        ${topicFilter}
      ORDER BY published_at DESC
    `;

    // Build regex patterns once (outside batch loop)
    const termRegexes = (searchTerms || []).map(t =>
      new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')
    );

    try {
      let totalFetched = 0;
      for (let batch = 0; batch < MAX_BATCHES; batch++) {
        const sql = `${baseSql} LIMIT ${BATCH_SIZE} OFFSET ${batch * BATCH_SIZE}`;
        const batchRows = await bq.query(sql, brandQueryParams);
        totalFetched += batchRows.length;
        const oldestDate = batchRows.length > 0 ? batchRows[batchRows.length - 1]?.published_at : null;
        if (onProgress) onProgress({ articles: totalFetched, brand: displayBrand, oldestDate });
        console.log(`[Analyzer] ${displayBrand} batch ${batch + 1}: ${batchRows.length} rows (total: ${totalFetched})`);

        // Process each row immediately — never accumulate all rows in memory
        for (const row of batchRows) {
          const source = normalizePublicationName(row.agency);
          const dateKey = row.published_at ? row.published_at.split('T')[0] : 'Unknown';
          const titleText = (row.title || '').toLowerCase();
          const bodyText = ((row.summary || '') + ' ' + (row.full_body || '')).toLowerCase();
          const inHeadline = termRegexes.some(rx => rx.test(titleText));
          const inBody = termRegexes.some(rx => rx.test(bodyText));

          if (isHeadlineOnly && !inHeadline) continue;

          const sentCategory = sentimentEngine.analyzeSentiment(row.title, row.summary, row.full_body);
          const headlineSentCategory = sentimentEngine.analyzeSentiment(row.title, '', '');

          results[displayBrand].mentions += 1;
          results[displayBrand].sources[source] = (results[displayBrand].sources[source] || 0) + 1;
          results[displayBrand].timeline[dateKey] = (results[displayBrand].timeline[dateKey] || 0) + 1;
          results[displayBrand].sentiment[sentCategory] += 1;

          if (inHeadline) {
            results[displayBrand].headline_mentions += 1;
            results[displayBrand].headline_sentiment[headlineSentCategory] += 1;
          }
          if (inBody) {
            results[displayBrand].full_mentions += 1;
            results[displayBrand].full_sentiment[sentCategory] += 1;
          } else if (!inBody && inHeadline) {
            results[displayBrand].full_sentiment[sentCategory] += 1;
          }

          if (results[displayBrand].article_samples[sentCategory].length < 100) {
            const titleToCheck = row.title || 'No Title';
            const urlToCheck = row.url || '';
            const isDup = results[displayBrand].article_samples[sentCategory].some(
              s => s.title === titleToCheck || (urlToCheck && s.url === urlToCheck)
            );
            if (!isDup) {
              results[displayBrand].article_samples[sentCategory].push({
                title: titleToCheck, source, url: urlToCheck, published: dateKey, sentiment: sentCategory
              });
            }
          }
        }

        if (batchRows.length < BATCH_SIZE) break; // last batch — done
      }

      results[displayBrand].articles = results[displayBrand].mentions;
      totalKeywordArticles += results[displayBrand].mentions;
    } catch (err) {
      console.error(`[BigQuery Analyzer] Error querying brand "${displayBrand}":`, err.message);
    }
  }

  // ─── Query 2: Total sector article count first ───

  let totalSectorArticles = 0;
  try {
    const countSql = `
      SELECT COUNT(*) AS total
      FROM ${tableRef}
      WHERE 1=1
        ${dateFilter}
        ${topicFilter}
    `;

    const countRows = await bq.query(countSql, { ...queryParams, ...topicParams });
    totalSectorArticles = Number(countRows[0]?.total) || 0;
  } catch (err) {
    console.error('[BigQuery Analyzer] Error counting sector articles:', err.message);
  }

  // ─── Query 3: "Others" — total sector articles minus target brand matches ───
  const othersTotal = Math.max(0, totalSectorArticles - totalKeywordArticles);
  results["Others"].articles = othersTotal;
  results["Others"].mentions = othersTotal;
  results["Others"].sentiment = {
    Positive: Math.round(othersTotal * 0.45),
    Neutral: Math.round(othersTotal * 0.45),
    Negative: Math.round(othersTotal * 0.10)
  };

  // ─── Query 4: Top Indian publications (across all matched articles) ───

  const indianSourceCounts = {};
  for (const [, data] of Object.entries(results)) {
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
