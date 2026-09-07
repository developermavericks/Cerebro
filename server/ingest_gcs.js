/**
 * GCS-to-BigQuery Ingestion Pipeline for Cerebro
 * 
 * Reads compressed (.gz) or plain (.json) news data files, extracts the
 * articles array from the JSON envelope, converts to NDJSON, and loads
 * into BigQuery using a load job.
 * 
 * Usage:
 *   # From a local file:
 *   node server/ingest_gcs.js ./data/news_2026-08-20.json.gz
 * 
 *   # From a GCS URI:
 *   node server/ingest_gcs.js gs://your-bucket/news_2026-08-20.json.gz
 * 
 *   # From a local JSON (uncompressed):
 *   node server/ingest_gcs.js ./data/news.json
 * 
 * This script can also be deployed as a Cloud Function triggered by
 * GCS object creation events. See the `gcsTriggerHandler` export.
 */

const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const { Readable } = require('stream');

require('dotenv').config({ path: path.join(__dirname, '.env') });

let BigQuery, Storage;
try {
  ({ BigQuery } = require('@google-cloud/bigquery'));
} catch (err) {
  console.error('ERROR: @google-cloud/bigquery not installed. Run: npm install @google-cloud/bigquery');
  process.exit(1);
}

try {
  ({ Storage } = require('@google-cloud/storage'));
} catch (err) {
  // Storage is optional — only needed for GCS URIs
  Storage = null;
}

const PROJECT_ID = process.env.BQ_PROJECT_ID || 'cerebro-500508';
const DATASET_ID = process.env.BQ_DATASET || 'cerebro_dataset';
const TABLE_ID = 'articles';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

/**
 * Parse and normalize an article record to match the BigQuery schema.
 */
function normalizeArticle(article) {
  return {
    id: article.id || null,
    title: article.title || null,
    url: article.url || article.link || null,
    full_body: article.full_body || article.body || article.content || null,
    author: article.author || null,
    agency: article.agency || article['Publisher/Agency'] || article.Publisher || article['Source Feed'] || null,
    published_at: article.published_at || article['Published At'] || article.Timestamp || null,
    sector: article.sector || null,
    region: article.region || null,
    summary: article.summary || article.Summary || null,
    sentiment: article.sentiment || null,
    word_count: article.word_count || null,
    scraped_at: article.scraped_at || new Date().toISOString(),
  };
}

/**
 * Read file contents from a local path or GCS URI.
 * Returns a Buffer.
 */
async function readSource(source) {
  if (source.startsWith('gs://')) {
    // GCS path
    if (!Storage) {
      throw new Error('@google-cloud/storage is not installed. Run: npm install @google-cloud/storage');
    }
    const storage = new Storage();
    const match = source.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid GCS URI: ${source}`);
    }
    const [, bucketName, fileName] = match;
    const [contents] = await storage.bucket(bucketName).file(fileName).download();
    return contents;
  } else {
    // Local file
    const absPath = path.resolve(source);
    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found: ${absPath}`);
    }
    return fs.readFileSync(absPath);
  }
}

/**
 * Decompress and parse the JSON data.
 * Handles both .gz compressed and plain JSON files.
 */
function parseData(buffer, sourcePath) {
  let jsonString;

  if (sourcePath.endsWith('.gz')) {
    const decompressed = zlib.gunzipSync(buffer);
    jsonString = decompressed.toString('utf-8');
  } else {
    jsonString = buffer.toString('utf-8');
  }

  const parsed = JSON.parse(jsonString);

  // Handle JSON envelope format: { "total": N, "articles": [...] }
  if (parsed.articles && Array.isArray(parsed.articles)) {
    return parsed.articles;
  }

  // Handle direct array format: [{ ... }, { ... }]
  if (Array.isArray(parsed)) {
    return parsed;
  }

  throw new Error('Unrecognized JSON format. Expected { "articles": [...] } or a plain array.');
}

/**
 * Convert articles to NDJSON and load into BigQuery.
 */
async function loadToBigQuery(articles) {
  if (articles.length === 0) {
    console.log('  No articles to load.');
    return 0;
  }

  // Convert to NDJSON
  const ndjsonLines = articles.map(article => {
    const normalized = normalizeArticle(article);
    return JSON.stringify(normalized);
  });
  const ndjsonContent = ndjsonLines.join('\n');

  // Create a readable stream from the NDJSON content
  const ndjsonBuffer = Buffer.from(ndjsonContent, 'utf-8');
  const readableStream = new Readable({
    read() {
      this.push(ndjsonBuffer);
      this.push(null);
    }
  });

  // Configure the load job
  const dataset = bigquery.dataset(DATASET_ID);
  const table = dataset.table(TABLE_ID);

  const metadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    writeDisposition: 'WRITE_APPEND', // Append to existing data
    ignoreUnknownValues: true,
    maxBadRecords: 10, // Allow up to 10 bad records before failing
  };

  console.log(`  Loading ${articles.length} articles into ${DATASET_ID}.${TABLE_ID}...`);

  return new Promise((resolve, reject) => {
    readableStream
      .pipe(table.createWriteStream(metadata))
      .on('complete', (job) => {
        console.log(`  ✓ Load job completed. Job ID: ${job.id || 'N/A'}`);
        resolve(articles.length);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Main ingestion function.
 * @param {string} source - Local file path or GCS URI (gs://bucket/file.gz)
 */
async function ingest(source) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Cerebro — BigQuery Data Ingestion');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Source:    ${source}`);
  console.log(`  Target:    ${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}`);
  console.log('───────────────────────────────────────────────────────────────');

  // Step 1: Read source
  console.log('\n[1/3] Reading source data...');
  const buffer = await readSource(source);
  console.log(`  ✓ Read ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  // Step 2: Parse and extract articles
  console.log('\n[2/3] Parsing JSON and extracting articles...');
  const articles = parseData(buffer, source);
  console.log(`  ✓ Found ${articles.length} articles`);

  // Step 3: Load into BigQuery
  console.log('\n[3/3] Loading into BigQuery...');
  const loadedCount = await loadToBigQuery(articles);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✓ Ingestion complete! ${loadedCount} articles loaded.`);
  console.log('═══════════════════════════════════════════════════════════════');

  return loadedCount;
}

/**
 * Cloud Function trigger handler.
 * Deploy this as a GCS-triggered Cloud Function for automated ingestion.
 * 
 * @param {Object} event - GCS event object
 * @param {Object} context - Cloud Function context
 */
async function gcsTriggerHandler(event, context) {
  const bucketName = event.bucket;
  const fileName = event.name;

  // Only process .gz or .json files
  if (!fileName.endsWith('.gz') && !fileName.endsWith('.json')) {
    console.log(`Skipping non-data file: ${fileName}`);
    return;
  }

  const gcsUri = `gs://${bucketName}/${fileName}`;
  console.log(`[Cloud Function] Triggered by: ${gcsUri}`);

  try {
    const count = await ingest(gcsUri);
    console.log(`[Cloud Function] Successfully ingested ${count} articles from ${fileName}`);
  } catch (err) {
    console.error(`[Cloud Function] Ingestion failed for ${fileName}:`, err);
    throw err; // Re-throw to mark the function execution as failed
  }
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const source = process.argv[2];

  if (!source) {
    console.log('Usage: node server/ingest_gcs.js <source>');
    console.log('');
    console.log('  <source> can be:');
    console.log('    - A local file path:  ./data/news_2026-08-20.json.gz');
    console.log('    - A GCS URI:          gs://your-bucket/news_2026-08-20.json.gz');
    console.log('');
    console.log('  Supported formats: .json, .json.gz, .gz');
    process.exit(1);
  }

  ingest(source)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = {
  ingest,
  gcsTriggerHandler,
  normalizeArticle,
  loadToBigQuery,
};
