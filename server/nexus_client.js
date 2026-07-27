const axios = require('axios');
const db = require('./db');

const BASE = () => process.env.NEXUS_BASE_URL || 'http://35.240.197.209';
const KEY = () => process.env.NEXUS_SERVICE_KEY || '';

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS nexus_articles (
      id INTEGER PRIMARY KEY,
      title TEXT,
      url TEXT UNIQUE NOT NULL,
      full_body TEXT,
      author TEXT,
      agency TEXT,
      published_at TIMESTAMP,
      sector VARCHAR(100),
      region VARCHAR(100),
      summary TEXT,
      sentiment VARCHAR(50),
      tags TEXT,
      word_count INTEGER,
      scraped_at TIMESTAMP,
      imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function fetchPage(params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await axios.get(`${BASE()}/api/feed`, {
        params: { api_key: KEY(), ...params },
        timeout: 60000,
        maxContentLength: 50 * 1024 * 1024
      });
      return resp.data;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[NEXUS] Retry ${attempt}/${retries} for page ${params.page}: ${err.message}`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// Canonical sector names used throughout the app
const SECTOR_VARIANTS = {
  'Tech':                  ['tech', 'TECH', 'Techhh'],
  'AI':                    ['ai', 'Ai'],
  'Healthcare':            ['healthcare', 'HealthCare', 'HEALTHCARE', 'Health'],
  'Stock Market':          ['stock market'],
  'Real Estate':           ['real estate'],
  'Lifestyle':             ['lifestyle', 'LifeStyle'],
  'Foods & Drinks':        ['foods and drinks', 'Foods and Drinks', 'FOODS AND DRINKS', 'Foods'],
  'Travel':                ['travel', 'Travell'],
  'Policies':              ['policies'],
  'Startups':              ['startups', 'StartUp'],
  'Consultancies':         ['consultancies'],
  'Google':                ['google', 'google 2', 'Google3'],
  'Education':             ['education', 'Education', 'EDUCATION'],
  'Fintech':               ['fintech', 'FinTech', 'FINTECH', 'fin tech', 'financial technology', 'Financial Technology'],
  'Automobile':            ['automobile', 'Automobile', 'AUTOMOBILE', 'automotive', 'Automotive', 'AUTOMOTIVE', 'auto'],
  'Media & Entertainment': ['media and entertainment', 'Media and Entertainment', 'media & entertainment', 'Media & Entertainment', 'media', 'Media', 'MEDIA', 'entertainment', 'Entertainment'],
};
// Reverse map: variant (lowercased) → canonical
const _sectorLookup = {};
for (const [canonical, variants] of Object.entries(SECTOR_VARIANTS)) {
  _sectorLookup[canonical.toLowerCase()] = canonical;
  for (const v of variants) _sectorLookup[v.toLowerCase()] = canonical;
}
const JUNK_SECTORS = new Set(['test56', 'test545', 'testing', 'scapia']);

function normalizeSector(raw) {
  if (!raw) return null;
  const s = raw.trim();
  const key = s.toLowerCase();
  if (JUNK_SECTORS.has(key)) return 'Other';
  return _sectorLookup[key] || s;
}

async function insertArticles(articles) {
  if (!articles || articles.length === 0) return 0;
  let inserted = 0;
  for (const a of articles) {
    try {
      const result = await db.query(`
        INSERT INTO nexus_articles
          (id, title, url, full_body, author, agency, published_at, sector, region, summary, sentiment, tags, word_count, scraped_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        ON CONFLICT (url) DO NOTHING
      `, [
        a.id, a.title, a.url, a.full_body, a.author, a.agency,
        a.published_at ? new Date(a.published_at) : null,
        normalizeSector(a.sector), a.region, a.summary, a.sentiment,
        Array.isArray(a.tags) ? a.tags.join(', ') : a.tags,
        a.word_count,
        a.scraped_at ? new Date(a.scraped_at) : null
      ]);
      if (result.rowCount > 0) inserted++;
    } catch (_) {}
  }
  return inserted;
}

async function ensureSummaryTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS nexus_sector_summaries (
      id INTEGER,
      date DATE NOT NULL,
      sector VARCHAR(100) NOT NULL,
      publication_region VARCHAR(50) NOT NULL DEFAULT 'overall',
      summary_text TEXT,
      top_topics JSONB,
      headline_count INTEGER,
      generated_at TIMESTAMP,
      imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (date, sector, publication_region)
    )
  `);
}

async function fetchSummaryPage(endpoint, params) {
  const token = process.env.NEXUS_SUMMARY_TOKEN || '';
  const resp = await axios.get(`${BASE()}${endpoint}`, {
    params,
    headers: { 'Authorization': `Bearer ${token}` },
    timeout: 30000,
    maxContentLength: 10 * 1024 * 1024,
  });
  return resp.data;
}

async function insertSummaries(summaries, isRegionEndpoint) {
  let upserted = 0;
  for (const s of summaries) {
    try {
      const region = isRegionEndpoint ? (s.publication_region || 'overall') : 'overall';
      await db.query(`
        INSERT INTO nexus_sector_summaries
          (id, date, sector, publication_region, summary_text, top_topics, headline_count, generated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (date, sector, publication_region) DO UPDATE SET
          summary_text  = EXCLUDED.summary_text,
          top_topics    = EXCLUDED.top_topics,
          headline_count = EXCLUDED.headline_count,
          generated_at  = EXCLUDED.generated_at
      `, [
        s.id,
        s.date,
        s.sector,
        region,
        s.summary_text,
        s.top_topics ? JSON.stringify(s.top_topics) : null,
        s.headline_count,
        s.generated_at ? new Date(s.generated_at) : null,
      ]);
      upserted++;
    } catch (err) {
      console.error('[NEXUS] Summary insert failed:', err.message);
    }
  }
  return upserted;
}

async function syncSectorSummariesForDate(dateStr) {
  const endpoints = [
    { path: '/api/sector-summaries/',       isRegion: false },
    { path: '/api/sector-summaries/region', isRegion: true  },
  ];
  let total = 0;
  for (const { path, isRegion } of endpoints) {
    let page = 1;
    let totalPages = 1;
    do {
      try {
        const data = await fetchSummaryPage(path, { date: dateStr, page, page_size: 50 });
        totalPages = data.total_pages || 1;
        total += await insertSummaries(data.summaries || [], isRegion);
        page++;
        if (page <= totalPages) await new Promise(r => setTimeout(r, 150));
      } catch (err) {
        console.error(`[NEXUS] Summary fetch failed (${path} ${dateStr}):`, err.message);
        break;
      }
    } while (page <= totalPages);
  }
  return total;
}

async function syncDate(dateStr) {
  let page = 1;
  let totalPages = 1;
  let inserted = 0;
  do {
    const data = await fetchPage({ date: dateStr, page, page_size: 50 });
    totalPages = Math.ceil((data.total_pages || 1));
    inserted += await insertArticles(data.articles || []);
    page++;
    if (page <= totalPages) await new Promise(r => setTimeout(r, 150));
  } while (page <= totalPages);
  return inserted;
}

async function syncDateRange(days = 7) {
  await ensureTable();
  await ensureSummaryTable();
  if (!KEY()) {
    console.warn('[NEXUS] NEXUS_SERVICE_KEY not set — skipping sync');
    return { synced: 0, summaries: 0, days };
  }

  let totalInserted = 0;
  let totalSummaries = 0;
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    try {
      const count = await syncDate(dateStr);
      totalInserted += count;
      console.log(`[NEXUS] Articles ${dateStr}: +${count}`);
    } catch (err) {
      console.error(`[NEXUS] Error syncing ${dateStr}:`, err.message);
    }
    try {
      const summaryCount = await syncSectorSummariesForDate(dateStr);
      totalSummaries += summaryCount;
      console.log(`[NEXUS] Summaries ${dateStr}: +${summaryCount}`);
    } catch (err) {
      console.error(`[NEXUS] Summary sync error ${dateStr}:`, err.message);
    }
  }

  console.log(`[NEXUS] Sync complete — ${totalInserted} articles, ${totalSummaries} summaries`);
  return { synced: totalInserted, summaries: totalSummaries, days };
}

module.exports = { syncDateRange, syncDate, ensureTable, syncSectorSummariesForDate };
