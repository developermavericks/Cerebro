# Cerebro Nexus Articles API — Developer Guide

This document gives you everything you need to access all 12,47,557+ news articles from the Cerebro Nexus database.

---

## What You Get

- **12,47,557+ full news articles** from India-origin publications
- Full article body text, author, publication, sector, region, sentiment, tags and more
- ~50,000 new articles added every day
- Data primarily covers **July 2026 onwards**

---

## Quick Start (3 Steps)

### Step 1 — Base URL

Replace `cerebro-358839170188.asia-south1.run.app` with the actual Cerebro server URL (ask the Cerebro team for this):

```
https://cerebro-358839170188.asia-south1.run.app/api/nexus/articles
```

### Step 2 — API Key

Add this header to every request:

```
x-api-key: cerebro-nexus-export-2026
```

Without this header, you will get a `401 Unauthorized` error.

### Step 3 — Make Your First Request

```
GET https://cerebro-358839170188.asia-south1.run.app/api/nexus/articles?page=1&limit=500
```

That's it. You will receive 500 articles in JSON format.

---

## How Pagination Works

The database has 12,47,557 articles. You cannot get all of them in one request. You must fetch them **page by page**.

- Each request gives you up to **500 articles**
- To get the next 500, increase the page number by 1
- Keep going until `hasNextPage` is `false`
- Total requests needed to get everything: **~2,496 requests**

```
Page 1 → articles 1 to 500
Page 2 → articles 501 to 1000
Page 3 → articles 1001 to 1500
... and so on
```

---

## Request Parameters

| Parameter | Required | Default | Maximum | Description |
|-----------|----------|---------|---------|-------------|
| `page`    | No       | 1       | —       | Which page to fetch (starts at 1) |
| `limit`   | No       | 100     | 500     | How many articles per request |

**Tip:** Always use `limit=500` to fetch data as fast as possible.

---

## Request Headers

| Header      | Required | Value |
|-------------|----------|-------|
| `x-api-key` | Yes      | `cerebro-nexus-export-2026` |

---

## Example Request

```
GET https://cerebro-358839170188.asia-south1.run.app/api/nexus/articles?page=1&limit=500
x-api-key: cerebro-nexus-export-2026
```

---

## Response Structure

```json
{
  "page": 1,
  "limit": 500,
  "total": 1247557,
  "totalPages": 2496,
  "hasNextPage": true,
  "articles": [
    {
      "id": 1,
      "title": "Google launches new AI model in India",
      "url": "https://timesofindia.com/article/...",
      "full_body": "Full article text goes here...",
      "author": "Rajesh Kumar",
      "agency": "Times of India",
      "published_at": "2026-07-01T10:30:00.000Z",
      "sector": "Technology",
      "region": "India",
      "summary": "",
      "sentiment": "positive",
      "tags": "AI, Google, India",
      "word_count": 842,
      "scraped_at": "2026-07-01T11:00:00.000Z",
      "imported_at": "2026-07-01T11:05:00.000Z"
    }
  ]
}
```

### Response Fields Explained

| Field          | What it means |
|----------------|---------------|
| `page`         | Current page number |
| `limit`        | Articles per page |
| `total`        | Total articles in database |
| `totalPages`   | Total number of pages |
| `hasNextPage`  | `true` = more pages exist, `false` = you have reached the last page |
| `articles`     | Array of article objects |

### Article Fields Explained

| Field          | Type      | What it means |
|----------------|-----------|---------------|
| `id`           | number    | Unique article ID |
| `title`        | text      | Article headline |
| `url`          | text      | Link to original article |
| `full_body`    | text      | Complete article text content (use this for analysis) |
| `author`       | text      | Writer's name |
| `agency`       | text      | Publication name (e.g. Times of India, Economic Times) |
| `published_at` | timestamp | When article was published (UTC) |
| `sector`       | text      | News category (e.g. Technology, Finance, Health) |
| `region`       | text      | Geographic region (mostly India) |
| `summary`      | text      | Short summary (currently empty — use `full_body` instead) |
| `sentiment`    | text      | Tone of article: `positive`, `negative`, or `neutral` |
| `tags`         | text      | Comma-separated topic tags |
| `word_count`   | number    | Number of words in `full_body` |
| `scraped_at`   | timestamp | When article was collected |
| `imported_at`  | timestamp | When article was added to DB |

---

## Code to Fetch All Articles

### JavaScript / Node.js

```javascript
const API_BASE = 'https://cerebro-358839170188.asia-south1.run.app/api/nexus/articles';
const API_KEY  = 'cerebro-nexus-export-2026';

async function fetchAllArticles() {
  let page = 1;
  let allArticles = [];

  while (true) {
    console.log(`Fetching page ${page}...`);

    const response = await fetch(`${API_BASE}?page=${page}&limit=500`, {
      headers: { 'x-api-key': API_KEY }
    });

    if (!response.ok) {
      console.error('Error:', response.status, await response.text());
      break;
    }

    const data = await response.json();
    allArticles = allArticles.concat(data.articles);

    console.log(`Page ${data.page}/${data.totalPages} — Total fetched: ${allArticles.length}`);

    if (!data.hasNextPage) break;
    page++;
  }

  console.log(`Done! Total articles: ${allArticles.length}`);
  return allArticles;
}

fetchAllArticles();
```

### Python

```python
import requests

API_BASE = 'https://cerebro-358839170188.asia-south1.run.app/api/nexus/articles'
API_KEY  = 'cerebro-nexus-export-2026'

def fetch_all_articles():
    page = 1
    all_articles = []

    while True:
        print(f'Fetching page {page}...')

        response = requests.get(
            API_BASE,
            params={'page': page, 'limit': 500},
            headers={'x-api-key': API_KEY}
        )

        if response.status_code != 200:
            print(f'Error: {response.status_code} — {response.text}')
            break

        data = response.json()
        all_articles.extend(data['articles'])

        print(f"Page {data['page']}/{data['totalPages']} — Total fetched: {len(all_articles)}")

        if not data['hasNextPage']:
            break

        page += 1

    print(f'Done! Total articles: {len(all_articles)}')
    return all_articles

articles = fetch_all_articles()
```

### cURL (single page test)

```bash
curl -H "x-api-key: cerebro-nexus-export-2026" \
  "https://cerebro-358839170188.asia-south1.run.app/api/nexus/articles?page=1&limit=10"
```

---

## Error Responses

| HTTP Status | Meaning | Fix |
|-------------|---------|-----|
| `401 Unauthorized` | API key missing or wrong | Check the `x-api-key` header |
| `500 Internal Server Error` | Server issue | Try again after a few seconds |

---

## Important Notes

- `summary` field is **empty** for all articles — use `full_body` for the actual article content
- All timestamps are in **UTC**
- Articles are ordered by `id` (oldest first)
- The database grows by ~50,000 articles per day
- Replace `cerebro-358839170188.asia-south1.run.app` with the real server URL before using

---

## Database Stats

| Metric           | Value             |
|------------------|-------------------|
| Total Articles   | ~12,47,557        |
| Last Synced      | 2 August 2026     |
| Daily New Data   | ~50,000 articles  |
| Primary Region   | India             |
| Data Source      | Nexus Scraper     |
