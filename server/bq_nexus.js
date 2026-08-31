/**
 * bq_nexus.js — BigQuery Nexus Query Helper for Cerebro
 *
 * All nexus_articles READ queries previously running against Cloud SQL
 * now run here against BigQuery `cerebro_dataset.articles`.
 *
 * Cloud SQL nexus_articles is now WRITE-ONLY staging:
 *   Nexus API → Cloud SQL (staging, 1-day) → BigQuery (permanent store)
 *
 * Key translation from PostgreSQL → BigQuery:
 *   to_tsvector() @@ plainto_tsquery()  →  SEARCH((title, full_body), @term)
 *   NOW() - INTERVAL '7 days'           →  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
 *   COUNT(*)::int                       →  CAST(COUNT(*) AS INT64)
 *   published_at::date                  →  DATE(published_at)
 *   $1, $2 positional params            →  @paramName named params
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bq = require('./bigquery');
const sentimentEngine = require('./sentiment_engine');

const TABLE_REF = () => `\`${bq.PROJECT_ID}.${bq.DATASET_ID}.${bq.TABLE_ID}\``;

const BRAND_FAMILIES = {
  "Qualcomm": ["Qualcomm", "Snapdragon"],
  "MediaTek": ["MediaTek", "Dimensity", "Helio"],
  "Intel": ["Intel", "Core i", "Xeon", "Arc GPU", "Lakefield"],
  "AMD": ["AMD", "Ryzen", "Radeon", "EPYC", "Threadripper"],
  "Nvidia": ["Nvidia", "GeForce", "RTX", "GTX", "H100", "A100", "B100", "Grace Hopper"]
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Expand a brand name into all its search aliases if applicable.
 */
function getBrandSearchTerms(keyword) {
  const kLower = (keyword || '').trim().toLowerCase();
  for (const [family, aliases] of Object.entries(BRAND_FAMILIES)) {
    if (kLower === family.toLowerCase()) {
      return aliases;
    }
  }
  return [(keyword || '').trim()].filter(Boolean);
}

/**
 * Build a BigQuery LIKE filter clause for a keyword across title only (headline search).
 * Returns { clause: string, params: object } where clause uses named params like @kw0, @kw1...
 * Case-insensitive: LOWER(title) LIKE '%term%'
 * Works on any BigQuery table without requiring a full-text search index.
 */
function buildLikeFilter(keyword, paramPrefix = 'kw') {
  const terms = getBrandSearchTerms(keyword);
  if (!terms.length) return { clause: 'FALSE', params: {} };
  const params = {};
  const clauses = terms.map((t, i) => {
    const p = `${paramPrefix}${i}`;
    params[p] = `%${t.toLowerCase()}%`;
    return `LOWER(COALESCE(title,'')) LIKE @${p}`;
  });
  return { clause: clauses.join(' OR '), params };
}

// Keep for backwards-compat (used in tests)
function toBQSearchQuery(keyword) {
  const terms = getBrandSearchTerms(keyword);
  if (!terms.length) return '';
  return terms.map(t => t.includes(' ') ? `"${t}"` : t).join(' OR ');
}

/**
 * Compute an ISO timestamp string for N days ago (used in WHERE clauses).
 */
function sinceTimestamp(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Extract hostname (no www.) from a URL string.
 */
function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return null; }
}

// ── Public query functions ────────────────────────────────────────────────────

/**
 * Count articles matching a keyword (title + full_body LIKE search — no index required).
 * @param {string} keyword
 * @param {{ sector?, startDate?, endDate? }} opts
 */
async function searchCount(keyword, { sector, startDate, endDate } = {}) {
  if (!bq.available()) return 0;
  const { clause, params } = buildLikeFilter(keyword);
  if (clause === 'FALSE') return 0;

  let filters = `(${clause})`;
  if (sector && sector !== 'All') {
    params.sector = sector;
    filters += ` AND LOWER(COALESCE(sector,'')) = LOWER(@sector)`;
  }
  if (startDate) { params.startDate = startDate; filters += ` AND DATE(published_at) >= @startDate`; }
  if (endDate)   { params.endDate   = endDate;   filters += ` AND DATE(published_at) <= @endDate`; }

  const sql = `SELECT CAST(COUNT(*) AS INT64) AS cnt FROM ${TABLE_REF()} WHERE ${filters}`;
  const rows = await bq.query(sql, params);
  return Number(rows[0]?.cnt || 0);
}

/**
 * Fetch articles matching a keyword with optional date/sector filters.
 * Returns rows with calculated sentiment: { title, url, agency, sentiment, published_at, region, sector, summary }
 */
async function searchArticles(keyword, { sector, startDate, endDate, limit = null } = {}) {
  if (!bq.available()) return [];
  const { clause, params } = buildLikeFilter(keyword);
  if (clause === 'FALSE') return [];

  let filters = `(${clause})`;

  if (sector && sector !== 'All') {
    params.sector = sector;
    filters += ` AND LOWER(COALESCE(sector,'')) = LOWER(@sector)`;
  }
  if (startDate) { params.startDate = startDate; filters += ` AND DATE(published_at) >= @startDate`; }
  if (endDate)   { params.endDate   = endDate;   filters += ` AND DATE(published_at) <= @endDate`; }

  let limitClause = '';
  if (limit) {
    params.lim = limit;
    limitClause = 'LIMIT @lim';
  }

  const sql = `
    SELECT title, url, agency, published_at, region, sector, summary, LEFT(COALESCE(full_body, ''), 1000) AS full_body
    FROM ${TABLE_REF()}
    WHERE ${filters}
    ORDER BY published_at DESC
    ${limitClause}
  `;
  const rawRows = await bq.query(sql, params);
  return rawRows.map(r => ({
    title:        r.title,
    url:          r.url,
    agency:       r.agency,
    published_at: r.published_at,
    region:       r.region,
    sector:       r.sector,
    summary:      r.summary,
    sentiment:    sentimentEngine.analyzeSentiment(r.title, r.summary, r.full_body),
  }));
}

/**
 * Brand daily mention counts for last N days.
 * Returns rows: { date, count }
 */
async function brandHistory(brandName, days = 60) {
  if (!bq.available()) return [];
  const { clause, params } = buildLikeFilter(brandName);
  params.since = sinceTimestamp(days);
  const sql = `
    SELECT DATE(published_at) AS date, CAST(COUNT(*) AS INT64) AS count
    FROM ${TABLE_REF()}
    WHERE (${clause})
      AND published_at >= @since
    GROUP BY date
    ORDER BY date ASC
  `;
  return bq.query(sql, params);
}

/**
 * Top N agencies/sources for a brand over last N days.
 * Returns rows: { source, count }
 */
async function brandTopSources(brandName, days = 60) {
  if (!bq.available()) return [];
  const { clause, params } = buildLikeFilter(brandName);
  params.since = sinceTimestamp(days);
  const sql = `
    SELECT agency AS source, CAST(COUNT(*) AS INT64) AS count
    FROM ${TABLE_REF()}
    WHERE (${clause})
      AND agency IS NOT NULL
      AND published_at >= @since
    GROUP BY agency
    ORDER BY count DESC
    LIMIT 8
  `;
  return bq.query(sql, params);
}

/**
 * Brand article pool — all articles mentioning the brand across full history.
 * Returns rows shaped like nexus_articles with real calculated sentiment.
 */
async function brandArticles(brandName, limit = 500) {
  if (!bq.available()) return [];
  const { clause, params } = buildLikeFilter(brandName);
  params.lim = limit;
  const sql = `
    SELECT
      CONCAT('nexus-', CAST(id AS STRING)) AS id,
      title,
      url                           AS link,
      published_at,
      agency                        AS source,
      COALESCE(summary, '')         AS summary,
      LEFT(COALESCE(full_body, ''), 1000) AS full_body,
      published_at                  AS created_at,
      CAST(NULL AS TIMESTAMP)       AS last_ping_time
    FROM ${TABLE_REF()}
    WHERE (${clause})
    ORDER BY published_at DESC
    LIMIT @lim
  `;
  const rows = await bq.query(sql, params);
  return rows.map(r => ({
    id:             r.id,
    title:          r.title,
    link:           r.link,
    published_at:   r.published_at,
    source:         r.source,
    summary:        r.summary,
    sentiment:      sentimentEngine.analyzeSentiment(r.title, r.summary, r.full_body),
    created_at:     r.created_at,
    last_ping_time: r.last_ping_time,
  }));
}

/**
 * Sector articles for AI assistant fallback when no pre-built summaries exist.
 * Returns rows: { title, agency, date, sentiment, summary, region }
 */
async function sectorArticles(sector, { startDate, endDate, days = 7, limit = 60 } = {}) {
  if (!bq.available()) return [];
  const sec1 = `%${sector}%`;
  const sec2 = `%${(sector || '').split(' ')[0]}%`;
  const params = { sec1, sec2, lim: limit };
  let dateFilter;

  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate   = endDate;
    dateFilter = `AND DATE(published_at) BETWEEN @startDate AND @endDate`;
  } else {
    params.since = sinceTimestamp(days);
    dateFilter = `AND published_at >= @since`;
  }

  const sql = `
    SELECT title, agency, DATE(published_at) AS date, sentiment, summary, region
    FROM ${TABLE_REF()}
    WHERE (LOWER(COALESCE(sector,'')) LIKE LOWER(@sec1)
        OR LOWER(COALESCE(sector,'')) LIKE LOWER(@sec2))
      ${dateFilter}
    ORDER BY published_at DESC
    LIMIT @lim
  `;
  return bq.query(sql, params);
}

/**
 * Total article count in BigQuery.
 */
async function totalCount() {
  if (!bq.available()) return 0;
  const sql = `SELECT CAST(COUNT(*) AS INT64) AS total FROM ${TABLE_REF()}`;
  const rows = await bq.query(sql, {});
  return Number(rows[0]?.total || 0);
}

/**
 * Region breakdown for last N days.
 * Returns rows: { region, cnt }
 */
async function regionBreakdown(days = 7) {
  if (!bq.available()) return [];
  const since = sinceTimestamp(days);
  const sql = `
    SELECT region, CAST(COUNT(*) AS INT64) AS cnt
    FROM ${TABLE_REF()}
    WHERE published_at >= @since
    GROUP BY region
    ORDER BY cnt DESC
  `;
  return bq.query(sql, { since });
}

/**
 * Region article sample for last N days.
 * Returns rows: { title, region, date }
 */
async function regionSample(days = 7) {
  if (!bq.available()) return [];
  const since = sinceTimestamp(days);
  const sql = `
    SELECT title, region, DATE(published_at) AS date
    FROM ${TABLE_REF()}
    WHERE published_at >= @since
    ORDER BY published_at DESC
    LIMIT 10
  `;
  return bq.query(sql, { since });
}

/**
 * Date-grouped article counts (last 90 published dates).
 * Returns rows: { date, count }
 */
async function dateBreakdown() {
  if (!bq.available()) return [];
  const sql = `
    SELECT DATE(published_at) AS date, CAST(COUNT(*) AS INT64) AS count
    FROM ${TABLE_REF()}
    WHERE published_at IS NOT NULL
    GROUP BY date
    ORDER BY date DESC
    LIMIT 90
  `;
  return bq.query(sql, {});
}

/**
 * Paginated keyword article list + total count (for /api/keyword-articles).
 * Returns { total, articles: [{ title, url, published, source }] }
 */
async function keywordArticlesPaginated(keyword, { sector, startDate, endDate, sentiment, limit = 15, offset = 0 } = {}) {
  if (!bq.available()) return { total: 0, articles: [] };
  const { clause, params: likeParams } = buildLikeFilter(keyword);
  if (clause === 'FALSE') return { total: 0, articles: [] };

  // Base params — shared for count + article queries
  const baseParams = { ...likeParams };
  let filters = `(${clause})`;

  if (sector && sector !== 'All') {
    baseParams.sector = sector;
    filters += ` AND LOWER(COALESCE(sector,'')) = LOWER(@sector)`;
  }
  if (startDate) { baseParams.startDate = startDate; filters += ` AND DATE(published_at) >= @startDate`; }
  if (endDate)   { baseParams.endDate   = endDate;   filters += ` AND DATE(published_at) <= @endDate`; }

  if (!sentiment || sentiment === 'All') {
    const countSql   = `SELECT CAST(COUNT(*) AS INT64) AS cnt FROM ${TABLE_REF()} WHERE ${filters}`;
    const articleSql = `
      SELECT title, url, published_at, agency, summary, LEFT(COALESCE(full_body, ''), 1000) AS full_body
      FROM ${TABLE_REF()}
      WHERE ${filters}
      ORDER BY published_at DESC
      LIMIT @lim OFFSET @off
    `;

    const [countRows, articleRows] = await Promise.all([
      bq.query(countSql, baseParams),
      bq.query(articleSql, { ...baseParams, lim: limit, off: offset }),
    ]);

    return {
      total: Number(countRows[0]?.cnt || 0),
      articles: articleRows.map(r => ({
        title:     r.title       || 'No Title',
        url:       r.url         || '',
        published: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : '',
        source:    r.agency      || 'Unknown',
        sentiment: sentimentEngine.analyzeSentiment(r.title, r.summary, r.full_body),
      })),
    };
  }

  // When sentiment filter is specified (Positive, Neutral, Negative):
  // Pull up to 2000 candidates, classify them in JS, then paginate
  const candidateSql = `
    SELECT title, url, published_at, agency, summary, LEFT(COALESCE(full_body, ''), 1000) AS full_body
    FROM ${TABLE_REF()}
    WHERE ${filters}
    ORDER BY published_at DESC
    LIMIT 2000
  `;
  const rawArticles = await bq.query(candidateSql, baseParams);
  const matching = [];

  for (const r of rawArticles) {
    const s = sentimentEngine.analyzeSentiment(r.title, r.summary, r.full_body);
    if (s.toLowerCase() === sentiment.toLowerCase()) {
      matching.push({
        title:     r.title       || 'No Title',
        url:       r.url         || '',
        published: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : '',
        source:    r.agency      || 'Unknown',
        sentiment: s,
      });
    }
  }

  const paginated = matching.slice(offset, offset + limit);
  return {
    total: matching.length,
    articles: paginated,
  };
}

/**
 * Full paginated export from BigQuery (for /api/nexus/articles).
 * Returns { rows, total }
 */
async function exportArticles(limit = 100, offset = 0) {
  if (!bq.available()) return { rows: [], total: 0 };
  const sql = `
    SELECT id, title, url, full_body, author, agency, published_at,
           sector, region, summary, sentiment, word_count, scraped_at
    FROM ${TABLE_REF()}
    ORDER BY id
    LIMIT @lim OFFSET @off
  `;
  const countSql = `SELECT CAST(COUNT(*) AS INT64) AS total FROM ${TABLE_REF()}`;

  const [rows, countRows] = await Promise.all([
    bq.query(sql, { lim: limit, off: offset }),
    bq.query(countSql, {}),
  ]);
  return { rows, total: Number(countRows[0]?.total || 0) };
}

/**
 * Batch domain authority lookup from Cloud SQL domain_authority_cache.
 * Returns a map: domain → { page_rank_decimal, rank }
 * Used by competitor-analysis after fetching articles from BQ.
 */
async function getDomainAuthority(urls) {
  const db = require('./db');
  const domains = [...new Set(urls.map(extractDomain).filter(Boolean))];
  if (!domains.length) return {};

  const placeholders = domains.map((_, i) => `$${i + 1}`).join(', ');
  try {
    const res = await db.query(
      `SELECT domain, page_rank_decimal, rank FROM domain_authority_cache WHERE domain IN (${placeholders})`,
      domains
    );
    const map = {};
    for (const row of res.rows) {
      map[row.domain] = { page_rank_decimal: row.page_rank_decimal, rank: row.rank };
    }
    return map;
  } catch (_) {
    return {};
  }
}

module.exports = {
  searchCount,
  searchArticles,
  brandHistory,
  brandTopSources,
  brandArticles,
  sectorArticles,
  totalCount,
  regionBreakdown,
  regionSample,
  dateBreakdown,
  keywordArticlesPaginated,
  exportArticles,
  getDomainAuthority,
  // expose helper for tests
  toBQSearchQuery,
  sinceTimestamp,
};
