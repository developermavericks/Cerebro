const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max:      3,
});

const BRANDS = ['Google', 'OpenAI', 'Microsoft', 'Meta', 'Amazon', 'Anthropic', 'Perplexity'];
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7'];
// text color on each segment (white on dark fills, dark on light/yellow/pink)
const LABEL_COLORS = ['#fff', '#fff', '#fff', '#222', '#222', '#fff', '#fff'];


// Mentions = full article body (full_body FTS index)
// Headlines = title only (ILIKE)
async function fetchAll() {
  console.log('  Fetching all 3 metrics…');

  const mentionQ = b => pool.query(
    `SELECT COUNT(*) AS n FROM nexus_articles
     WHERE to_tsvector('simple', coalesce(full_body,'')) @@ plainto_tsquery('simple', $1)
       AND published_at >= '2026-07-01' AND published_at < '2026-08-01'`,
    [b]
  );
  const coverQ = b => pool.query(
    `SELECT COALESCE(SUM(word_count),0) AS n FROM nexus_articles
     WHERE to_tsvector('simple', coalesce(full_body,'')) @@ plainto_tsquery('simple', $1)
       AND published_at >= '2026-07-01' AND published_at < '2026-08-01'`,
    [b]
  );
  const headlineQ = b => pool.query(
    `SELECT COUNT(*) AS n FROM nexus_articles
     WHERE title ILIKE $1
       AND published_at >= '2026-07-01' AND published_at < '2026-08-01'`,
    [`%${b}%`]
  );

  const mentions  = [];
  const coverage  = [];
  const headlines = [];

  // 3 queries per brand (pool max=3), sequential across brands → max 3 connections at a time
  for (const b of BRANDS) {
    process.stdout.write(`  ${b}…`);
    const [m, c, h] = await Promise.all([mentionQ(b), coverQ(b), headlineQ(b)]);
    mentions.push( parseInt(m.rows[0].n || 0));
    coverage.push( parseInt(c.rows[0].n || 0));
    headlines.push(parseInt(h.rows[0].n || 0));
    console.log(` mentions=${m.rows[0].n}  headlines=${h.rows[0].n}`);
  }
  return { mentions, coverage, headlines };
}

function buildHTML({ mentions, coverage, headlines }) {
  const j = v => JSON.stringify(v);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Brand SOV — July 2026 · Cerebro</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"><\/script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f0f0ee;min-height:100vh;padding:28px 20px}
.page{max-width:1260px;margin:0 auto}
.top-bar{display:flex;height:8px;border-radius:6px 6px 0 0;overflow:hidden}
.top-bar span{flex:1}
.card{background:#fff;border-radius:0 0 14px 14px;padding:32px 36px 28px}
.header-row{display:flex;align-items:center;gap:14px;margin-bottom:6px}
.header-pill{border:2.5px solid #4f46e5;border-radius:50px;padding:11px 28px;display:inline-flex;align-items:center;gap:10px}
.header-pill svg{flex-shrink:0}
.header-pill h1{font-size:19px;font-weight:700;color:#4f46e5;letter-spacing:-0.3px;line-height:1.2}
.subtitle{color:#898781;font-size:12.5px;margin-bottom:30px;padding-left:2px}
.subtitle b{color:#52514e}
.charts-row{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.chart-col{}
.col-title{font-size:13.5px;font-weight:600;color:#0b0b0b;text-align:center;margin-bottom:14px;line-height:1.35}
.chart-wrap{position:relative;height:230px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:12.5px}
thead tr{border-bottom:1.5px solid #e1e0d9}
th{padding:5px 7px;color:#898781;font-weight:500;font-size:11.5px;text-align:left}
td{padding:5.5px 7px;color:#0b0b0b;vertical-align:middle}
tbody tr{border-bottom:1px solid #f0f0ee}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:#f9f9f7}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;flex-shrink:0;vertical-align:middle}
.rank-num{color:#898781;font-variant-numeric:tabular-nums;width:22px;display:inline-block}
.count-cell{font-variant-numeric:tabular-nums;font-weight:500;text-align:right}
.note{margin-top:20px;font-size:11px;color:#c3c2b7;text-align:center;line-height:1.6}
.footer{text-align:center;font-size:11px;color:#c3c2b7;margin-top:18px}
</style>
</head>
<body>
<div class="page">
  <div class="top-bar">
    <span style="background:#4f46e5"></span>
    <span style="background:#7c3aed"></span>
    <span style="background:#ec4899"></span>
    <span style="background:#0ea5e9"></span>
  </div>
  <div class="card">
    <div class="header-row">
      <div class="header-pill">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h1>Cerebro Analysis &nbsp;|&nbsp; Brand SOV &middot; AI Sector</h1>
      </div>
    </div>
    <p class="subtitle">Source: <b>Nexus Article Database</b> &nbsp;&middot;&nbsp; Period: <b>July 1–29, 2026</b> &nbsp;&middot;&nbsp; Brands: Google, OpenAI, Microsoft, Meta, Amazon, Anthropic, Perplexity</p>

    <div class="charts-row">
      <div class="chart-col">
        <p class="col-title">Brand SOV<br>by Mentions</p>
        <div class="chart-wrap"><canvas id="c1"></canvas></div>
        <table><thead><tr><th>Rank</th><th>Brand</th><th style="text-align:right">Articles</th></tr></thead><tbody id="t1"></tbody></table>
      </div>
      <div class="chart-col">
        <p class="col-title">Brand SOV<br>by Reach</p>
        <div class="chart-wrap"><canvas id="c2"></canvas></div>
        <table><thead><tr><th>Rank</th><th>Brand</th><th style="text-align:right">Est. Reach</th></tr></thead><tbody id="t2"></tbody></table>
      </div>
      <div class="chart-col">
        <p class="col-title">Headline Mentions<br>by Brand</p>
        <div class="chart-wrap"><canvas id="c3"></canvas></div>
        <table><thead><tr><th>Rank</th><th>Brand</th><th style="text-align:right">Headlines</th></tr></thead><tbody id="t3"></tbody></table>
      </div>
    </div>

    <p class="note">* Reach estimated by total editorial word volume across articles mentioning each brand &nbsp;&middot;&nbsp; Methodology: Nexus Article Database &nbsp;&middot;&nbsp; July 1–29, 2026</p>
  </div>
  <p class="footer">Generated by Cerebro &nbsp;&middot;&nbsp; ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
</div>

<script>
const BRANDS = ${j(BRANDS)};
const COLORS = ${j(COLORS)};
const LABEL_COLORS = ${j(LABEL_COLORS)};
const mentions  = ${j(mentions)};
const coverage  = ${j(coverage)};
const headlines = ${j(headlines)};

Chart.register(ChartDataLabels);

function toPercents(arr) {
  const sum = arr.reduce((a,b)=>a+b,0);
  if (!sum) return arr.map(()=>0);
  return arr.map(v=>Math.round(v/sum*1000)/10);
}
function fmtNum(n) {
  if (n>=1e6) return (n/1e6).toFixed(1)+'M';
  if (n>=1e3) return (n/1e3).toFixed(1)+'k';
  return String(n);
}
function buildChart(id, values) {
  // Sort descending so largest segment (Google) starts at 12 o'clock
  const order = values.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v).map(x=>x.i);
  const sv = order.map(i=>values[i]);
  const sc = order.map(i=>COLORS[i]);
  const slc = order.map(i=>LABEL_COLORS[i]);
  const sl = order.map(i=>BRANDS[i]);
  const pcts = toPercents(sv);

  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    plugins: [ChartDataLabels],
    data: {
      labels: sl,
      datasets: [{
        data: sv,
        backgroundColor: sc,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const p = pcts[ctx.dataIndex];
              return '  ' + ctx.label + ':  ' + fmtNum(ctx.raw) + '  (' + p + '%)';
            }
          },
          padding: 10,
          boxPadding: 4,
        },
        datalabels: {
          display: ctx => pcts[ctx.dataIndex] >= 5,
          color: ctx => slc[ctx.dataIndex],
          font: { weight: '700', size: 11 },
          formatter: (val, ctx) => pcts[ctx.dataIndex] + '%',
        }
      }
    }
  });
}
function buildTable(tbodyId, values) {
  const pcts = toPercents(values);
  const sorted = values.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v);
  const tbody = document.getElementById(tbodyId);
  sorted.forEach(({i,v}, rank) => {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="rank-num">' + (rank+1) + '</span></td>' +
      '<td><span class="dot" style="background:' + COLORS[i] + '"></span>' + BRANDS[i] + '</td>' +
      '<td class="count-cell">' + fmtNum(v) + '</td>';
    tbody.appendChild(tr);
  });
}

buildChart('c1', mentions);
buildChart('c2', coverage);
buildChart('c3', headlines);
buildTable('t1', mentions);
buildTable('t2', coverage);
buildTable('t3', headlines);
<\/script>
</body>
</html>`;
}

async function main() {
  console.log('\n=== Cerebro SOV Report Generator ===');
  console.log('Period: July 1–29, 2026');
  console.log('Brands:', BRANDS.join(', '));
  console.log('\nRunning 3 queries in parallel (should complete in ~30 seconds)…\n');

  console.log('Checking full_body GIN index…');
  const idxCheck = await pool.query(`
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_nexus_articles_fullbody_fts'
  `);
  if (idxCheck.rowCount === 0) {
    console.log('Building full_body GIN index — this runs ONCE and takes 10–15 min. Please wait…');
    await pool.query(`
      CREATE INDEX idx_nexus_articles_fullbody_fts
      ON nexus_articles USING gin(to_tsvector('simple', coalesce(full_body,'')))
    `);
    console.log('✓ Index built.\n');
  } else {
    console.log('✓ Index already exists.\n');
  }

  const data = await fetchAll();

  console.log('\nResults:');
  BRANDS.forEach((b, i) => {
    console.log(`  ${b.padEnd(12)} mentions=${data.mentions[i].toLocaleString().padStart(7)}  coverage=${String(data.coverage[i]).padStart(10)} words  headlines=${String(data.headlines[i]).padStart(5)}`);
  });

  const html = buildHTML(data);
  const outPath = path.join(__dirname, '..', 'sov_report.html');
  fs.writeFileSync(outPath, html, 'utf8');

  console.log('\n✓ Report written to:', outPath);
  console.log('\nOpen it in your browser:');
  console.log('  File → Open File → sov_report.html');
  console.log('  OR: start "" "' + outPath + '"\n');

  await pool.end();
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
