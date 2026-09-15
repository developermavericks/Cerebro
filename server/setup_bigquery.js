/**
 * BigQuery Schema Setup Script for Cerebro
 * 
 * Creates the dataset, partitioned table, and search index.
 * Run once: node server/setup_bigquery.js
 * 
 * Flags:
 *   --dry-run    Only verify credentials and connectivity, don't create anything.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  let BigQuery;
  try {
    ({ BigQuery } = require('@google-cloud/bigquery'));
  } catch (err) {
    console.error('ERROR: @google-cloud/bigquery is not installed.');
    console.error('Run: cd server && npm install @google-cloud/bigquery');
    process.exit(1);
  }

  const PROJECT_ID = process.env.BQ_PROJECT_ID || 'cerebro-500508';
  const DATASET_ID = process.env.BQ_DATASET || 'cerebro_dataset';
  const TABLE_ID = 'articles';
  const LOCATION = 'asia-south1'; // Mumbai

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Cerebro — BigQuery Schema Setup');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Project:   ${PROJECT_ID}`);
  console.log(`  Dataset:   ${DATASET_ID}`);
  console.log(`  Table:     ${TABLE_ID}`);
  console.log(`  Location:  ${LOCATION}`);
  console.log(`  Dry Run:   ${DRY_RUN}`);
  console.log('───────────────────────────────────────────────────────────────');

  const bigquery = new BigQuery({ projectId: PROJECT_ID });

  // Step 1: Verify credentials
  console.log('\n[1/4] Verifying GCP credentials...');
  try {
    const [datasets] = await bigquery.getDatasets({ maxResults: 1 });
    console.log(`  ✓ Authenticated successfully. Found ${datasets.length} dataset(s) in project.`);
  } catch (err) {
    console.error('  ✗ Authentication failed:', err.message);
    console.error('\n  Ensure GOOGLE_APPLICATION_CREDENTIALS is set or you are running on GCP.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Credentials verified. Exiting without creating resources.');
    process.exit(0);
  }

  // Step 2: Create dataset
  console.log('\n[2/4] Creating dataset...');
  try {
    const [dataset] = await bigquery.createDataset(DATASET_ID, {
      location: LOCATION,
    });
    console.log(`  ✓ Dataset "${dataset.id}" created.`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`  ✓ Dataset "${DATASET_ID}" already exists. Skipping.`);
    } else {
      console.error('  ✗ Error creating dataset:', err.message);
      process.exit(1);
    }
  }

  // Step 3: Create partitioned & clustered table
  console.log('\n[3/4] Creating articles table...');

  const schema = [
    { name: 'id', type: 'INT64', mode: 'NULLABLE' },
    { name: 'title', type: 'STRING', mode: 'NULLABLE' },
    { name: 'url', type: 'STRING', mode: 'NULLABLE' },
    { name: 'full_body', type: 'STRING', mode: 'NULLABLE' },
    { name: 'author', type: 'STRING', mode: 'NULLABLE' },
    { name: 'agency', type: 'STRING', mode: 'NULLABLE' },
    { name: 'published_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'sector', type: 'STRING', mode: 'NULLABLE' },
    { name: 'region', type: 'STRING', mode: 'NULLABLE' },
    { name: 'summary', type: 'STRING', mode: 'NULLABLE' },
    { name: 'sentiment', type: 'STRING', mode: 'NULLABLE' },
    { name: 'word_count', type: 'INT64', mode: 'NULLABLE' },
    { name: 'scraped_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
  ];

  const tableOptions = {
    schema: schema,
    timePartitioning: {
      type: 'DAY',
      field: 'published_at',
    },
    clustering: {
      fields: ['agency', 'sector'],
    },
  };

  try {
    const dataset = bigquery.dataset(DATASET_ID);
    const [table] = await dataset.createTable(TABLE_ID, tableOptions);
    console.log(`  ✓ Table "${table.id}" created with:`);
    console.log(`    - Partitioned by DAY on "published_at"`);
    console.log(`    - Clustered by ["agency", "sector"]`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`  ✓ Table "${TABLE_ID}" already exists. Skipping.`);
    } else {
      console.error('  ✗ Error creating table:', err.message);
      process.exit(1);
    }
  }

  // Step 4: Create search index
  console.log('\n[4/4] Creating search index on (title, full_body)...');

  const indexSql = `
    CREATE SEARCH INDEX IF NOT EXISTS articles_search_idx
    ON \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`(title, full_body)
  `;

  try {
    await bigquery.query({ query: indexSql, location: LOCATION });
    console.log('  ✓ Search index "articles_search_idx" created (or already exists).');
  } catch (err) {
    if (err.message && err.message.includes('already exists')) {
      console.log('  ✓ Search index already exists. Skipping.');
    } else {
      console.error('  ⚠ Warning: Could not create search index:', err.message);
      console.error('    Search indexes require BigQuery Enterprise or on-demand pricing.');
      console.error('    Queries will still work but without index acceleration.');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✓ Setup complete! Your BigQuery backend is ready.');
  console.log('');
  console.log('  Next steps:');
  console.log('    1. Ingest data:  node server/ingest_gcs.js <path-or-gcs-uri>');
  console.log('    2. Start server: npm run server');
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
