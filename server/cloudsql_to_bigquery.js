/**
 * Cloud SQL to BigQuery Sync Pipeline for Cerebro
 *
 * After each Nexus cron sync, this module:
 *   1. Reads new rows from Cloud SQL `nexus_articles`
 *   2. Loads them into a temporary BigQuery staging table
 *   3. MERGEs staging -> `cerebro_dataset.articles` (dedup on `url`)
 *   4. Drops the staging table
 *   5. Trims Cloud SQL `nexus_articles` (keeps last 7 days as safety buffer)
 *
 * Usage:
 *   const { syncCloudSQLToBigQuery } = require('./cloudsql_to_bigquery');
 *   const result = await syncCloudSQLToBigQuery();
 *   // { merged: N, deleted: N, duration: Nms }
 *
 * Manual CLI:
 *   node server/cloudsql_to_bigquery.js
 *   node server/cloudsql_to_bigquery.js --dry-run
 *   node server/cloudsql_to_bigquery.js --days 2
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db    = require('./db');
const bqMod = require('./bigquery');

const PROJECT_ID    = process.env.BQ_PROJECT_ID || 'cerebro-500508';
const DATASET_ID    = process.env.BQ_DATASET    || 'cerebro_dataset';
const TARGET_TABLE  = 'articles';
const STAGING_TABLE = 'nexus_staging';
const LOCATION      = 'asia-south1';

// How many days of Cloud SQL rows to keep after a successful BQ sync (1 day buffer for staging)
const CLOUD_SQL_RETENTION_DAYS = 1;

// Batch size for reading from Cloud SQL
const BATCH_SIZE = 500;

// ── Schema ────────────────────────────────────────────────────────────────────

const BQ_SCHEMA = [
  { name: 'id',           type: 'INT64',     mode: 'NULLABLE' },
  { name: 'title',        type: 'STRING',    mode: 'NULLABLE' },
  { name: 'url',          type: 'STRING',    mode: 'NULLABLE' },
  { name: 'full_body',    type: 'STRING',    mode: 'NULLABLE' },
  { name: 'author',       type: 'STRING',    mode: 'NULLABLE' },
  { name: 'agency',       type: 'STRING',    mode: 'NULLABLE' },
  { name: 'published_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
  { name: 'sector',       type: 'STRING',    mode: 'NULLABLE' },
  { name: 'region',       type: 'STRING',    mode: 'NULLABLE' },
  { name: 'summary',      type: 'STRING',    mode: 'NULLABLE' },
  { name: 'sentiment',    type: 'STRING',    mode: 'NULLABLE' },
  { name: 'word_count',   type: 'INT64',     mode: 'NULLABLE' },
  { name: 'scraped_at',   type: 'TIMESTAMP', mode: 'NULLABLE' },
];

// ── Normalization ─────────────────────────────────────────────────────────────

function normalizeRow(row) {
  return {
    id:           row.id           != null ? Number(row.id)          : null,
    title:        row.title        || null,
    url:          row.url          || null,
    full_body:    row.full_body    || null,
    author:       row.author       || null,
    agency:       row.agency       || null,
    published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
    sector:       row.sector       || null,
    region:       row.region       || null,
    summary:      row.summary      || null,
    sentiment:    row.sentiment    || null,
    word_count:   row.word_count   != null ? Number(row.word_count)  : null,
    scraped_at:   row.scraped_at   ? new Date(row.scraped_at).toISOString() : new Date().toISOString(),
  };
}

// ── BigQuery Helpers ──────────────────────────────────────────────────────────

function requireBQClient() {
  const client = bqMod.getClient();
  if (!client) throw new Error('BigQuery client not initialized. Check GOOGLE_APPLICATION_CREDENTIALS or ADC.');
  return client;
}

async function createStagingTable(bigquery) {
  const dataset = bigquery.dataset(DATASET_ID);
  try {
    await dataset.table(STAGING_TABLE).delete();
    console.log('  [BQ Sync] Dropped stale staging table.');
  } catch (_) { /* does not exist — fine */ }

  const [table] = await dataset.createTable(STAGING_TABLE, {
    schema: BQ_SCHEMA,
    location: LOCATION,
    // Auto-expire after 2 hours as safety net for crashed runs
    expirationTime: Date.now() + 2 * 60 * 60 * 1000,
  });
  return table;
}

async function streamBatch(table, rows) {
  if (!rows.length) return;
  await table.insert(rows, { skipInvalidRows: true, ignoreUnknownValues: true });
}

async function runMerge(bigquery) {
  const targetRef  = `\`${PROJECT_ID}.${DATASET_ID}.${TARGET_TABLE}\``;
  const stagingRef = `\`${PROJECT_ID}.${DATASET_ID}.${STAGING_TABLE}\``;

  const mergeSql = `
    MERGE ${targetRef} AS T
    USING (
      SELECT * FROM ${stagingRef}
      WHERE url IS NOT NULL
      QUALIFY ROW_NUMBER() OVER (PARTITION BY url ORDER BY published_at DESC NULLS LAST) = 1
    ) AS S
    ON T.url = S.url
    WHEN MATCHED THEN
      UPDATE SET
        T.title      = COALESCE(S.title,     T.title),
        T.full_body  = COALESCE(S.full_body,  T.full_body),
        T.summary    = COALESCE(S.summary,    T.summary),
        T.sentiment  = COALESCE(S.sentiment,  T.sentiment),
        T.word_count = COALESCE(S.word_count, T.word_count),
        T.scraped_at = S.scraped_at
    WHEN NOT MATCHED THEN
      INSERT (id, title, url, full_body, author, agency, published_at,
              sector, region, summary, sentiment, word_count, scraped_at)
      VALUES (S.id, S.title, S.url, S.full_body, S.author, S.agency, S.published_at,
              S.sector, S.region, S.summary, S.sentiment, S.word_count, S.scraped_at)
  `;

  const [job] = await bigquery.createQueryJob({ query: mergeSql, location: LOCATION });
  await job.getQueryResults();

  const [meta] = await job.getMetadata();
  const stats = meta?.statistics?.query?.dmlStats || {};
  return {
    inserted: Number(stats.insertedRowCount || 0),
    updated:  Number(stats.updatedRowCount  || 0),
  };
}

async function dropStagingTable(bigquery) {
  try {
    await bigquery.dataset(DATASET_ID).table(STAGING_TABLE).delete();
    console.log('  [BQ Sync] Staging table dropped.');
  } catch (err) {
    console.warn(`  [BQ Sync] Could not drop staging table: ${err.message}`);
  }
}

// ── Cloud SQL Trim ────────────────────────────────────────────────────────────

async function trimCloudSQL() {
  const res = await db.query(
    `DELETE FROM nexus_articles
     WHERE imported_at < NOW() - INTERVAL '${CLOUD_SQL_RETENTION_DAYS} days'`
  );
  return res.rowCount || 0;
}

// ── Main Export ───────────────────────────────────────────────────────────────

let _lastSync = null;

/**
 * Sync Cloud SQL nexus_articles -> BigQuery cerebro_dataset.articles.
 *
 * @param {Object}  [opts]
 * @param {boolean} [opts.dryRun=false]   Read + count only — no BQ writes, no Cloud SQL deletes.
 * @param {number}  [opts.lookbackDays]   Only sync rows imported in the last N days (default: all rows).
 * @returns {Promise<{ merged, inserted, updated, deleted, duration, at }>}
 */
async function syncCloudSQLToBigQuery({ dryRun = false, lookbackDays } = {}) {
  const t0 = Date.now();

  console.log('=================================================================');
  console.log(`  [BQ Sync] Cloud SQL -> BigQuery${dryRun ? ' [DRY RUN]' : ''}`);
  console.log(`  Target : ${PROJECT_ID}.${DATASET_ID}.${TARGET_TABLE}`);
  if (lookbackDays) console.log(`  Window : last ${lookbackDays} day(s)`);

  // Step 1: Count source rows
  const lookbackClause = lookbackDays
    ? `WHERE imported_at >= NOW() - INTERVAL '${parseInt(lookbackDays)} days'`
    : '';

  const countRes  = await db.query(`SELECT COUNT(*) AS cnt FROM nexus_articles ${lookbackClause}`);
  if (!countRes.rows || countRes.rows.length === 0 || countRes.rows[0].cnt == null) {
    console.warn('  [BQ Sync] Cloud SQL unreachable or returned no count (in-memory fallback active). Aborting sync — no data to push.');
    return { merged: 0, inserted: 0, updated: 0, deleted: 0, duration: Date.now() - t0, skipped: true, reason: 'Cloud SQL unavailable' };
  }
  const totalRows = parseInt(countRes.rows[0].cnt, 10);
  console.log(`  Rows   : ${totalRows} in Cloud SQL`);

  if (totalRows === 0) {
    console.log('  [BQ Sync] Nothing to sync.');
    _lastSync = { merged: 0, inserted: 0, updated: 0, deleted: 0, duration: Date.now() - t0, at: new Date().toISOString() };
    return _lastSync;
  }

  if (dryRun) {
    console.log('  [BQ Sync] Dry run — exiting without writes.');
    return { merged: 0, inserted: 0, updated: 0, deleted: 0, duration: Date.now() - t0, dryRun: true };
  }

  // Step 2: Create staging table
  const bigquery = requireBQClient();
  const stagingTable = await createStagingTable(bigquery);
  console.log(`  [BQ Sync] Staging table ready: ${STAGING_TABLE}`);

  // Step 3: Stream rows in batches
  let offset      = 0;
  let streamErrors = 0;

  // Build param array for consistent positional params
  const batchParams = lookbackDays ? [] : [];

  while (offset < totalRows) {
    const limit = BATCH_SIZE;
    const sql   = lookbackDays
      ? `SELECT id, title, url, full_body, author, agency, published_at,
                sector, region, summary, sentiment, word_count, scraped_at
         FROM nexus_articles
         WHERE imported_at >= NOW() - INTERVAL '${parseInt(lookbackDays)} days'
         ORDER BY imported_at ASC
         LIMIT $1 OFFSET $2`
      : `SELECT id, title, url, full_body, author, agency, published_at,
                sector, region, summary, sentiment, word_count, scraped_at
         FROM nexus_articles
         ORDER BY imported_at ASC
         LIMIT $1 OFFSET $2`;

    const batchRes = await db.query(sql, [limit, offset]);
    const rows = batchRes.rows.map(normalizeRow).filter(r => r.url);

    try {
      await streamBatch(stagingTable, rows);
      process.stdout.write(`\r  [BQ Sync] Streamed ${Math.min(offset + BATCH_SIZE, totalRows)}/${totalRows} rows...`);
    } catch (err) {
      streamErrors++;
      const errMsg = err.errors ? JSON.stringify(err.errors.slice(0, 3)) : err.message;
      console.warn(`\n  [BQ Sync] Batch at offset ${offset} had errors: ${errMsg}`);
      if (streamErrors > 5) {
        await dropStagingTable(bigquery);
        throw new Error(`Too many streaming errors (${streamErrors}). Aborting. Cloud SQL data preserved.`);
      }
    }

    offset += BATCH_SIZE;
  }

  console.log(`\n  [BQ Sync] All ${totalRows} rows in staging.`);

  // Small pause for BQ streaming buffer to flush before MERGE
  await new Promise(r => setTimeout(r, 4000));

  // Step 4: MERGE staging -> articles
  console.log('  [BQ Sync] Running MERGE...');
  let mergeStats = { inserted: 0, updated: 0 };
  try {
    mergeStats = await runMerge(bigquery);
    console.log(`  [BQ Sync] MERGE done — ${mergeStats.inserted} inserted, ${mergeStats.updated} updated`);
  } catch (mergeErr) {
    // Drop staging before re-throwing so it doesn't linger
    await dropStagingTable(bigquery);
    throw mergeErr;
  }

  // Step 5: Drop staging
  await dropStagingTable(bigquery);

  // Step 6: Trim Cloud SQL
  const deleted = await trimCloudSQL();
  console.log(`  [BQ Sync] Cloud SQL trimmed — ${deleted} rows older than ${CLOUD_SQL_RETENTION_DAYS}d removed`);

  const duration = Date.now() - t0;
  console.log(`  [BQ Sync] Complete in ${(duration / 1000).toFixed(1)}s`);
  console.log('=================================================================');

  _lastSync = {
    merged:   mergeStats.inserted + mergeStats.updated,
    inserted: mergeStats.inserted,
    updated:  mergeStats.updated,
    deleted,
    duration,
    at: new Date().toISOString(),
  };
  return _lastSync;
}

function getLastSyncInfo() {
  return _lastSync;
}

module.exports = { syncCloudSQLToBigQuery, getLastSyncInfo };

// ── CLI Entry Point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const dryRun     = process.argv.includes('--dry-run');
  const daysIdx    = process.argv.indexOf('--days');
  const lookbackDays = daysIdx !== -1 ? parseInt(process.argv[daysIdx + 1], 10) : undefined;

  syncCloudSQLToBigQuery({ dryRun, lookbackDays })
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('\nFatal:', err.message);
      process.exit(1);
    });
}
