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
 * Build BigQuery SEARCH expression for a list of terms.
 * Uses OR-combined terms for the SEARCH() function.
 */
function buildSearchTerms(terms) {
  // BigQuery SEARCH() accepts space-separated terms for OR matching
  // For multi-word terms, wrap in backticks
  return terms.map(t => {
    if (t.includes(' ')) {
      return `\`${t}\``;
    }
    return t;
  }).join(' ');
}

/**
 * Build a topic filter SQL clause.
 * Returns empty string if topic is 'All'.
 */
function buildTopicFilter(topic) {
  if (!topic || topic === 'All') return '';

  const keywords = TOPIC_KEYWORDS[topic.toUpperCase()] || [topic.toLowerCase()];
  const searchTerms = buildSearchTerms(keywords);
  return `AND SEARCH((title, full_body), '${searchTerms.replace(/'/g, "\\'")}')`;
}

/**
 * Build excluded keywords filter SQL clause.
 */
function buildExcludeFilter(excludedKeywords) {
  if (!excludedKeywords || excludedKeywords.length === 0) return '';

  // For each excluded keyword, ensure the article does NOT contain it
  const clauses = excludedKeywords.map((kw, i) => {
    return `AND NOT SEARCH((title, full_body), @excludedKw${i})`;
  });
  return clauses.join('\n    ');
}


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
async function analyzeSpecificBrands({ targetKeywords = [], excludedKeywords = [], topic = 'All', startDate, endDate }) {
  const targetBrands = targetKeywords.map(b => b.trim()).filter(Boolean);
  if (!targetBrands.length) return {};

  const excludedTerms = (excludedKeywords || []).map(b => b.trim()).filter(Boolean);
  const tableRef = bq.getTableRef();

  // Initialize results structure (same shape as legacy)
  const displayBrands = [...targetBrands, "Others"];
  const results = {};
  for (const brand of displayBrands) {
    results[brand] = {
      mentions: 0,
      articles: 0,
      sources: {},
      timeline: {},
      sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      article_samples: { Positive: [], Neutral: [], Negative: [] }
    };
  }

  // Expand brand aliases
  const brandSearchMap = expandBrandAliases(targetBrands);

  // Build date range filter
  let dateFilter = '';
  const queryParams = {};

  if (startDate) {
    dateFilter += 'AND published_at >= @startDate\n    ';
    queryParams.startDate = startDate;
  }
  if (endDate) {
    dateFilter += 'AND published_at <= @endDate\n    ';
    queryParams.endDate = endDate;
  }

  // Build excluded keywords filter and params
  let excludeFilter = '';
  if (excludedTerms.length > 0) {
    const excludeClauses = [];
    for (let i = 0; i < excludedTerms.length; i++) {
      excludeClauses.push(`AND NOT SEARCH((title, full_body), @excludedKw${i})`);
      queryParams[`excludedKw${i}`] = excludedTerms[i];
    }
    excludeFilter = excludeClauses.join('\n    ');
  }

  // Build topic filter (uses literal SQL since SEARCH terms are from our constants, not user input)
  const topicFilter = buildTopicFilter(topic);

  // ─── Query 1: Per-brand article data (mentions, sources, timeline, sentiment, samples) ───

  let totalKeywordArticles = 0;

  for (const [displayBrand, searchTerms] of brandSearchMap) {
    const brandSearchQuery = buildSearchTerms(searchTerms);

    // Main query: get articles matching this brand
    const sql = `
      SELECT
        id,
        title,
        COALESCE(agency, 'Unknown') AS agency,
        CAST(published_at AS STRING) AS published_at,
        COALESCE(sentiment, 'Neutral') AS sentiment,
        COALESCE(url, '') AS url
      FROM ${tableRef}
      WHERE SEARCH((title, full_body), @brandSearch)
        ${dateFilter}
        ${excludeFilter}
        ${topicFilter}
      ORDER BY published_at DESC
      LIMIT 10000
    `;

    queryParams.brandSearch = brandSearchQuery;

    try {
      const rows = await bq.query(sql, queryParams);

      results[displayBrand].articles = rows.length;
      totalKeywordArticles += rows.length;

      // Aggregate metrics from rows
      const uniqueArticles = new Set();

      for (const row of rows) {
        const source = normalizePublicationName(row.agency);
        const dateKey = row.published_at ? row.published_at.split('T')[0] : 'Unknown';
        const sentimentLabel = row.sentiment || 'Neutral';
        const sentCategory = sentimentLabel === 'Positive' ? 'Positive'
          : sentimentLabel === 'Negative' ? 'Negative'
          : 'Neutral';

        // Count unique articles
        const articleKey = row.title || row.id;
        if (!uniqueArticles.has(articleKey)) {
          uniqueArticles.add(articleKey);
        }

        // Mentions: count each article as 1 mention (BigQuery SEARCH is binary per row)
        results[displayBrand].mentions += 1;

        // Sources
        results[displayBrand].sources[source] = (results[displayBrand].sources[source] || 0) + 1;

        // Timeline
        results[displayBrand].timeline[dateKey] = (results[displayBrand].timeline[dateKey] || 0) + 1;

        // Sentiment
        results[displayBrand].sentiment[sentCategory] += 1;

        // Article samples (up to 20 per sentiment category)
        if (results[displayBrand].article_samples[sentCategory].length < 20) {
          const titleToCheck = row.title || 'No Title';
          const urlToCheck = row.url || '';
          const isDuplicate = results[displayBrand].article_samples[sentCategory].some(
            s => s.title === titleToCheck || (urlToCheck && s.url === urlToCheck)
          );
          if (!isDuplicate) {
            results[displayBrand].article_samples[sentCategory].push({
              title: titleToCheck,
              source: source,
              url: urlToCheck,
              published: dateKey
            });
          }
        }
      }
    } catch (err) {
      console.error(`[BigQuery Analyzer] Error querying brand "${displayBrand}":`, err.message);
    }

    // Remove brandSearch from params before next iteration
    delete queryParams.brandSearch;
  }

  // ─── Query 2: "Others" — total sector articles not matching any target brand ───

  try {
    // Build a combined search for all target brands (to EXCLUDE them)
    const allBrandTerms = [];
    for (const [, terms] of brandSearchMap) {
      allBrandTerms.push(...terms);
    }
    const allBrandsSearch = buildSearchTerms(allBrandTerms);

    const othersSql = `
      SELECT
        COUNT(*) AS total_count,
        COALESCE(sentiment, 'Neutral') AS sentiment_group,
        COUNT(*) AS sent_count
      FROM ${tableRef}
      WHERE NOT SEARCH((title, full_body), @allBrandsSearch)
        ${dateFilter}
        ${excludeFilter}
        ${topicFilter}
      GROUP BY sentiment_group
    `;

    queryParams.allBrandsSearch = allBrandsSearch;

    const othersRows = await bq.query(othersSql, queryParams);

    let othersTotal = 0;
    for (const row of othersRows) {
      const count = Number(row.sent_count) || 0;
      othersTotal += count;

      const sentCategory = row.sentiment_group === 'Positive' ? 'Positive'
        : row.sentiment_group === 'Negative' ? 'Negative'
        : 'Neutral';

      results["Others"].sentiment[sentCategory] += count;
    }

    results["Others"].articles = othersTotal;
    results["Others"].mentions = othersTotal;

    delete queryParams.allBrandsSearch;
  } catch (err) {
    console.error('[BigQuery Analyzer] Error querying "Others":', err.message);
  }

  // ─── Query 3: Total sector article count ───

  let totalSectorArticles = 0;
  try {
    const countSql = `
      SELECT COUNT(*) AS total
      FROM ${tableRef}
      WHERE 1=1
        ${dateFilter}
        ${topicFilter}
    `;

    const countRows = await bq.query(countSql, queryParams);
    totalSectorArticles = Number(countRows[0]?.total) || 0;
  } catch (err) {
    console.error('[BigQuery Analyzer] Error counting sector articles:', err.message);
  }

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
