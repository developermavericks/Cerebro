require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');
const { Pool } = require('pg');

const BASE = process.env.NEXUS_BASE_URL;
const KEY  = process.env.NEXUS_SERVICE_KEY;
const pool = new Pool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT || 5432, max: 5 });

const SECTOR_VARIANTS = {
  'Tech':['tech','TECH','Techhh'],'AI':['ai','Ai'],'Healthcare':['healthcare','HealthCare','HEALTHCARE','Health'],
  'Stock Market':['stock market'],'Real Estate':['real estate'],'Lifestyle':['lifestyle','LifeStyle'],
  'Foods & Drinks':['foods and drinks','Foods and Drinks','FOODS AND DRINKS','Foods'],'Travel':['travel','Travell'],
  'Policies':['policies'],'Startups':['startups','StartUp'],'Consultancies':['consultancies'],
  'Education':['education','Education','EDUCATION'],'Fintech':['fintech','FinTech','FINTECH','fin tech'],
  'Automobile':['automobile','Automobile','AUTOMOBILE','automotive','Automotive','auto'],
  'Media & Entertainment':['media and entertainment','media & entertainment','media','Media','MEDIA','entertainment'],
};
const _sl = {};
for (const [c, vs] of Object.entries(SECTOR_VARIANTS)) { _sl[c.toLowerCase()] = c; for (const v of vs) _sl[v.toLowerCase()] = c; }
const JUNK = new Set(['test56','test545','testing','scapia']);
function normSector(raw) { if (!raw) return null; const s = raw.trim(); if (JUNK.has(s.toLowerCase())) return 'Other'; return _sl[s.toLowerCase()] || s; }

async function batchInsert(articles) {
  if (!articles.length) return 0;
  const vals = [], params = [];
  let p = 1;
  for (const a of articles) {
    vals.push(`($${p},$${p+1},$${p+2},$${p+3},$${p+4},$${p+5},$${p+6},$${p+7},$${p+8},$${p+9},$${p+10},$${p+11},$${p+12},$${p+13})`);
    params.push(
      a.id, a.title, a.url, a.full_body, a.author, a.agency,
      a.published_at ? new Date(a.published_at) : null,
      normSector(a.sector), a.publication_region || a.region, a.summary, a.sentiment,
      Array.isArray(a.tags) ? a.tags.join(', ') : a.tags,
      a.word_count, a.scraped_at ? new Date(a.scraped_at) : null
    );
    p += 14;
  }
  try {
    // DO NOTHING = skip URLs already in DB, only insert truly new ones
    const res = await pool.query(
      `INSERT INTO nexus_articles (id,title,url,full_body,author,agency,published_at,sector,region,summary,sentiment,tags,word_count,scraped_at)
       VALUES ${vals.join(',')}
       ON CONFLICT (url) DO NOTHING`,
      params
    );
    return res.rowCount; // only counts genuinely new inserts
  } catch (e) {
    let cnt = 0;
    for (const a of articles) {
      try {
        const r = await pool.query(
          `INSERT INTO nexus_articles (id,title,url,full_body,author,agency,published_at,sector,region,summary,sentiment,tags,word_count,scraped_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           ON CONFLICT (url) DO NOTHING`,
          [a.id,a.title,a.url,a.full_body,a.author,a.agency,
           a.published_at?new Date(a.published_at):null,
           normSector(a.sector),a.publication_region||a.region,a.summary,a.sentiment,
           Array.isArray(a.tags)?a.tags.join(', '):a.tags,a.word_count,
           a.scraped_at?new Date(a.scraped_at):null]
        );
        cnt += r.rowCount;
      } catch (_) {}
    }
    return cnt;
  }
}

async function syncDateMissingOnly(dateStr) {
  // 1. Check how many we already have for this date
  const existing = await pool.query(
    `SELECT COUNT(*) as cnt FROM nexus_articles WHERE published_at::date = $1`, [dateStr]
  );
  const dbCount = parseInt(existing.rows[0].cnt);

  // 2. Check Nexus total for this date
  const { data: firstPage } = await axios.get(`${BASE}/api/feed`, {
    params: { api_key: KEY, date: dateStr, page: 1, page_size: 100 }, timeout: 15000
  });
  const nexusTotal = (firstPage.total_pages || 1) * 100;
  const missing = nexusTotal - dbCount;

  if (missing <= 50) {
    console.log(`  [${dateStr}] SKIP — DB has ${dbCount}, Nexus ~${nexusTotal} (diff ${missing} < 50)`);
    return 0;
  }

  console.log(`  [${dateStr}] DB: ${dbCount} | Nexus: ~${nexusTotal} | Missing: ~${missing} → syncing...`);

  // 3. Sync all pages, DO NOTHING skips existing URLs automatically
  let page = 1, newInserted = 0;
  const totalPages = firstPage.total_pages || 1;

  // Insert first page we already fetched
  newInserted += await batchInsert(firstPage.articles || []);
  page = 2;

  while (page <= totalPages) {
    try {
      const { data } = await axios.get(`${BASE}/api/feed`, {
        params: { api_key: KEY, date: dateStr, page, page_size: 100 }, timeout: 60000, maxContentLength: 50*1024*1024
      });
      const arts = data.articles || [];
      if (!arts.length) break;
      newInserted += await batchInsert(arts);
      process.stdout.write(`\r    page ${page}/${totalPages} | +${newInserted} new articles`);
    } catch (e) {
      console.error(`\n    page ${page} error: ${e.message}`);
    }
    page++;
    if (page <= totalPages) await new Promise(r => setTimeout(r, 80));
  }
  console.log(`\n  [${dateStr}] DONE — inserted ${newInserted} NEW articles`);
  return newInserted;
}

(async () => {
  const START = Date.now();
  let grandTotal = 0;
  const today = new Date();
  console.log('=== CEREBRO BACKFILL — MISSING ARTICLES ONLY ===\n');

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    console.log(`[Day ${i}/30] ${dateStr}`);
    try {
      const n = await syncDateMissingOnly(dateStr);
      grandTotal += n;
      const elapsed = (Date.now() - START) / 1000 / 60;
      const perDay  = elapsed / i;
      const eta     = perDay * (30 - i);
      if (n > 0) console.log(`  Elapsed: ${elapsed.toFixed(1)}m | ETA: ~${eta.toFixed(0)}m remaining`);
    } catch (e) {
      console.error(`  [Day ${i}] Error: ${e.message}`);
    }
  }

  const mins = ((Date.now()-START)/1000/60).toFixed(1);
  console.log(`\n=== DONE: ${grandTotal} NEW articles added in ${mins} minutes ===`);
  await pool.end();
})().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
