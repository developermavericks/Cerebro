/**
 * BigQuery Client Module for Cerebro
 * 
 * Initializes a singleton BigQuery client and exports helper functions
 * for querying the cerebro_dataset.articles table.
 * 
 * Environment variables:
 *   BQ_PROJECT_ID  — GCP project ID (default: 'cerebro-500508')
 *   BQ_DATASET     — BigQuery dataset name (default: 'cerebro_dataset')
 *   GOOGLE_APPLICATION_CREDENTIALS — Path to service account JSON key (optional on GCP)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

let BigQueryClient;
let bigquery;
let isAvailable = false;

try {
  const { BigQuery } = require('@google-cloud/bigquery');
  BigQueryClient = BigQuery;
} catch (err) {
  console.warn('[BigQuery] @google-cloud/bigquery not installed. BigQuery features disabled.');
}

const PROJECT_ID = process.env.BQ_PROJECT_ID || 'cerebro-500508';
const DATASET_ID = process.env.BQ_DATASET || 'cerebro_dataset';
const TABLE_ID = 'articles';

/**
 * Initialize the BigQuery client.
 * Returns true if successful, false otherwise.
 */
function init() {
  if (!BigQueryClient) {
    console.warn('[BigQuery] Client library not available.');
    return false;
  }

  try {
    const options = { projectId: PROJECT_ID };

    // If GOOGLE_APPLICATION_CREDENTIALS is set, the client picks it up automatically.
    // If running on GCP (Cloud Run, GCE, etc.), ADC works automatically.
    bigquery = new BigQueryClient(options);
    isAvailable = true;
    console.log(`[BigQuery] Initialized — project: ${PROJECT_ID}, dataset: ${DATASET_ID}`);
    return true;
  } catch (err) {
    console.error('[BigQuery] Failed to initialize:', err.message);
    isAvailable = false;
    return false;
  }
}

/**
 * Run a parameterized BigQuery SQL query.
 * 
 * @param {string} sql - The SQL query string with @param placeholders.
 * @param {Object} params - Named parameters for the query.
 * @returns {Promise<Array>} Array of result row objects.
 */
async function query(sql, params = {}) {
  if (!isAvailable || !bigquery) {
    throw new Error('BigQuery client is not initialized. Call init() first or check credentials.');
  }

  const options = {
    query: sql,
    params: params,
    location: 'asia-south1', // Mumbai region, matching your Cloud Run deployment
  };

  const [rows] = await bigquery.query(options);
  return rows;
}

/**
 * Get the fully qualified table reference string.
 * @returns {string} e.g. 'cerebro-500508.cerebro_dataset.articles'
 */
function getTableRef() {
  return `\`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\``;
}

/**
 * Check if BigQuery is available and properly configured.
 * @returns {boolean}
 */
function available() {
  return isAvailable;
}

/**
 * Get the raw BigQuery client instance (for advanced operations like load jobs).
 * @returns {BigQuery|null}
 */
function getClient() {
  return bigquery || null;
}

/**
 * Get the dataset reference.
 * @returns {{ projectId: string, datasetId: string, tableId: string }}
 */
function getConfig() {
  return { projectId: PROJECT_ID, datasetId: DATASET_ID, tableId: TABLE_ID };
}

// Auto-initialize on require
init();

module.exports = {
  init,
  query,
  getTableRef,
  available,
  getClient,
  getConfig,
  PROJECT_ID,
  DATASET_ID,
  TABLE_ID,
};
