# 🧠 Cerebro — Media Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-CloudSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://cloud.google.com/sql)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Groq](https://img.shields.io/badge/Groq-llama--3.1--8b-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![TypeScript](https://img.shields.io/badge/Chart.js-v4-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)

An enterprise-grade media intelligence and brand monitoring platform that tracks press coverage, sentiment, competitor share-of-voice, and publication reach — all in real time. Cerebro ingests thousands of articles daily, processes them through a custom NLP pipeline, and surfaces interactive analytics through a rich reporting interface powered by AI-generated charts.

---

## 🌟 Key Features

- 📰 **Brand & Keyword Monitoring** — Track any brand, company, or keyword across a live corpus of Indian media publications. Filter by topic sector, date range, and sentiment.
- 📊 **Interactive Report Builder** — Create structured intelligence reports with sections, rich-text content (TipTap editor), and embeddable charts. Auto-save with full bookmark support.
- 🤖 **AI Chart Generation (Build with AI)** — Describe any chart in plain English and Groq's `llama-3.1-8b-instant` model generates it instantly using your real brand data — bar, line, area, scatter, bubble, radar, polar area, pie, doughnut, and more.
- 🏆 **Share of Voice Analysis** — Real-time SOV breakdown across primary brands and competitors with sentiment scoring per brand.
- 📅 **Publication Intelligence** — Automatically identifies top Indian media publications covering your brands, ranked by mention count.
- 📈 **Article Reach** — Full article browser showing every article that matched your brands, with source, date, URL, and sentiment.
- 🔍 **Keyword Search** — Free-form keyword search across the article corpus with sector and date filters.
- 🧩 **Brand Tracker** — Dedicated continuous monitoring view for watched brand sets.
- ⚔️ **Competitor Analysis** — Side-by-side share-of-voice and sentiment for primary vs. competitor brands.
- 🧠 **Cleo — AI Analyst** — Built-in AI assistant with full report context (brand names, chart names, section names) that answers questions about your data.
- 🛡️ **Admin Portal** — Full admin dashboard with user management, activity logs, support tickets, and system health monitoring.
- 🌙 **Light / Dark Mode** — Consistent theming throughout the full application.
- 📤 **Export to Docs** — Export charts and report content to structured documents.

---

## 🗺️ System Architecture & Flow

```mermaid
graph TD
    classDef clientStyle fill:#eff6ff,stroke:#2563eb,stroke-width:2px;
    classDef authStyle fill:#fdf2f8,stroke:#db2777,stroke-width:2px;
    classDef serverStyle fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    classDef dbStyle fill:#fafaf9,stroke:#78716c,stroke-width:2px;
    classDef extStyle fill:#fffbeb,stroke:#d97706,stroke-width:2px;

    subgraph ClientLayer ["Client (React + Vite SPA)"]
        UI_Login["Login (Google OAuth / Email+Key)"]:::clientStyle
        UI_Dashboard["Dashboard"]:::clientStyle
        UI_Report["Report Builder (TipTap + Charts)"]:::clientStyle
        UI_AI["Build with AI (Chart Generator)"]:::clientStyle
        UI_Reach["Article Reach"]:::clientStyle
        UI_Tracker["Brand Tracker"]:::clientStyle
        UI_Admin["Admin Portal"]:::clientStyle
        UI_Cleo["Cleo AI Assistant"]:::clientStyle
    end

    subgraph AuthLayer ["Auth Layer"]
        Google_OAuth["Google OAuth 2.0"]:::authStyle
        JWT["JWT Session Token"]:::authStyle
        AdminKey["Admin Key + Email Gate"]:::authStyle
    end

    subgraph ServerLayer ["Express API Server (Node.js)"]
        API_Auth["/api/auth — Google OAuth + Email Login"]:::serverStyle
        API_Search["/api/curated-search — Brand Analysis"]:::serverStyle
        API_Reports["/api/reports — CRUD + Auto-save"]:::serverStyle
        API_AI["/api/ai/chart-dynamic — Groq Chart Gen"]:::serverStyle
        API_Admin["/api/admin — Users / Logs / Tickets"]:::serverStyle
        API_Cleo["/api/cleo — AI Analyst"]:::serverStyle
        Analyzer["analyzer.js — NLP Pipeline"]:::serverStyle
    end

    subgraph StorageLayer ["Cloud SQL (PostgreSQL — GCP)"]
        DB_Users[("users")]:::dbStyle
        DB_Reports[("reports")]:::dbStyle
        DB_Articles[("nexus_articles")]:::dbStyle
        DB_Logs[("activity_logs")]:::dbStyle
        DB_Tickets[("support_tickets")]:::dbStyle
        DB_Settings[("system_settings")]:::dbStyle
    end

    subgraph ExtLayer ["External Services"]
        Groq["Groq API (llama-3.1-8b-instant)"]:::extStyle
        GCP["Google Cloud Run (Auto-deploy)"]:::extStyle
        GoogleOAuthExt["Google Identity Platform"]:::extStyle
    end

    UI_Login -->|"Google Sign-In"| Google_OAuth
    Google_OAuth -->|"Token"| GoogleOAuthExt
    GoogleOAuthExt -->|"Verified"| API_Auth
    UI_Login -->|"Email + Admin Key"| AdminKey
    AdminKey -->|"Validate"| API_Auth
    API_Auth -->|"Read/Create user"| DB_Users
    API_Auth -->|"Return JWT"| JWT
    JWT -->|"Authorization header on all requests"| API_Search

    UI_Dashboard -->|"Fetch reports list"| API_Reports
    UI_Report -->|"Auto-save sections/charts"| API_Reports
    API_Reports -->|"Read/Write"| DB_Reports

    UI_Dashboard -->|"Brand search + filters"| API_Search
    UI_Tracker -->|"Brand search"| API_Search
    UI_Reach -->|"Article fetch"| API_Search
    API_Search -->|"SQL ILIKE query"| DB_Articles
    API_Search -->|"NLP pipeline"| Analyzer
    Analyzer -->|"Returns brand metrics, sentiment, timeline, sources"| API_Search

    UI_AI -->|"Prompt + brand data"| API_AI
    API_AI -->|"Generate chart config"| Groq
    Groq -->|"Chart.js JSON"| API_AI
    API_AI -->|"Validated + normalized config"| UI_AI

    UI_Cleo -->|"Question + report context"| API_Cleo
    API_Cleo -->|"AI response"| UI_Cleo

    UI_Admin -->|"Users / logs / tickets"| API_Admin
    API_Admin -->|"Read/Write"| DB_Users
    API_Admin -->|"Read"| DB_Logs
    API_Admin -->|"Read/Write"| DB_Tickets
    API_Admin -->|"Read/Write"| DB_Settings

    API_Search -->|"Log activity"| DB_Logs
    API_Reports -->|"Log activity"| DB_Logs

    GCP -->|"Hosts & scales"| ServerLayer
```

---

## 📂 Project Structure

```text
Cerebro/
├── src/
│   ├── App.jsx                 # Main React application (~12,000+ lines)
│   └── main.jsx                # Vite entry point
├── server/
│   ├── index.js                # Express API server + all routes
│   ├── analyzer.js             # NLP brand analysis pipeline
│   └── db.js                   # PostgreSQL connection pool
├── public/                     # Static assets
├── package.json                # Dependencies (React 19, Chart.js v4, TipTap v3)
├── vite.config.js              # Vite + React plugin config
├── Dockerfile                  # GCP Cloud Run container
└── BACKLOG.md                  # Product backlog & known bugs
```

---

## 🔒 Access Tiers & Permissions

| Tier | Group | Access | Enforcement |
|:--|:--|:--|:--|
| **Super Admin** | `@themavericksindia.com` developers | All features + Admin Portal full access | `isDevAdmin` flag + email domain check |
| **Maverick** | `@themavericksindia.com` team | All intelligence features + Admin Portal (limited) | Email domain check on login |
| **Individual** | External / direct signup | Intelligence features only — no Admin Portal | Default role on signup |

Authentication supports two flows:
- **Google OAuth** — One-click sign-in via Google Identity Platform
- **Email + Admin Key** — For admin portal access (`admin@` accounts with system key)

---

## 🤖 AI Chart Generation Engine

The **Build with AI** panel lets users describe any chart in natural language. The pipeline:

1. **Frontend** collects the prompt + live brand data (`mentions`, `sentiment`, `timeline` — last 15 days per brand)
2. **Server** sends to Groq `llama-3.1-8b-instant` with a strict Chart.js v4 system prompt
3. **Robust JSON extractor** finds the outermost `{...}` in the response (handles markdown fences, extra text)
4. **Auto-retry** on parse failure with lower temperature
5. **Type normalizer** maps any model output variant → valid Chart.js v4 type:
   - `horizontalBar` / `hbar` → `bar` + `indexAxis: 'y'`
   - `area` / `areachart` → `line` + `fill: true`
   - `bubblechart` / `bubbles` → `bubble`
   - `piechart` / `pie_chart` → `pie`
   - 15+ other variants covered
6. **Scale safety** — forces `type: 'category'` on all bar/line x-axes (no time adapter installed)
7. **Non-cartesian cleanup** — strips `scales` from pie/doughnut/polarArea configs
8. **Frontend renders** via Chart.js v4 generic `<Chart>` component with all controllers registered and an error boundary that resets on each new generation

**Supported chart types:** bar, horizontal bar, stacked bar, line, area, pie, doughnut, scatter, bubble, radar, polar area

---

## 🧠 NLP Analysis Pipeline (`analyzer.js`)

The core brand intelligence engine:

- **SQL pre-filter** — ILIKE queries on `nexus_articles` for keyword matches (title + body), with optional sector and date filters
- **Brand family aliases** — e.g. `"Nvidia"` also matches `"GeForce"`, `"RTX"`, `"H100"` etc.
- **Sentence-level sentiment** — Uses `sentiment` npm package, scores each sentence containing a brand mention (`> 1` = Positive, `< -1` = Negative, else Neutral)
- **Daily timeline** — Counts per brand per date for trend charts
- **Source normalization** — Maps publication variants to canonical names (`"livemint"` → `"Mint"`, `"the times of india"` → `"Times of India"`, etc.)
- **Indian source detection** — Identifies 40+ Indian publications by keyword patterns
- **Share of Voice** — `Others` count from a separate SQL COUNT of non-matching articles in the same sector/date window
- **Excluded keywords** — Per-report exclusion list filters out unwanted brand co-occurrences

---

## 🗃️ Database Schema

```mermaid
erDiagram
    users {
        int id PK
        varchar name
        varchar email "UNIQUE"
        varchar password
        varchar google_id
        varchar role
        varchar phone
        timestamp created_at
    }
    reports {
        varchar id PK
        int user_id FK
        varchar name
        text brand_keywords
        text competitor_keywords
        jsonb sections
        jsonb bookmarks
        timestamp created_at
        timestamp updated_at
    }
    nexus_articles {
        int id PK
        text title
        text url
        timestamp published_at
        varchar agency
        text full_body
        text summary
        varchar sector
    }
    activity_logs {
        int id PK
        int user_id FK
        text action
        timestamp created_at
    }
    support_tickets {
        int id PK
        varchar ticket_id "UNIQUE"
        int user_id FK
        varchar category
        text subject
        varchar user_email
        text description
        varchar status
        text admin_reply
        timestamp replied_at
        timestamp created_at
    }
    system_settings {
        varchar key PK
        text value
        timestamp updated_at
    }

    users ||--o{ reports : "owns"
    users ||--o{ activity_logs : "generates"
    users ||--o{ support_tickets : "submits"
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
DATABASE_URL=postgresql://user:password@host/cerebro
GROQ_API_KEY=gsk_...
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
SESSION_SECRET=...
PORT=3001
```

### Client (`.env.local`)
```env
VITE_API_BASE=http://localhost:3001
```

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL (or Google Cloud SQL instance)
- Groq API key ([console.groq.com](https://console.groq.com))
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))

### 1. Install Dependencies
```bash
cd Cerebro
npm install
```

### 2. Start Backend
```bash
npm run server
# Express API starts on http://localhost:3001
# DB migrations run automatically on startup
```

### 3. Start Frontend
```bash
npm run dev
# Vite dev server starts on http://localhost:5173
```

---

## ☁️ Deployment (Google Cloud Run)

Cerebro is containerized and auto-deploys to Google Cloud Run on every push to the `satyam` branch:

```bash
# Build and push container
docker build -t gcr.io/cerebro-500508/cerebro .
docker push gcr.io/cerebro-500508/cerebro

# Or simply push to satyam — Cloud Run trigger handles the rest
git push origin satyam
```

**Live URL:** [cerebro-358839170188.asia-south1.run.app](https://cerebro-358839170188.asia-south1.run.app)  
**Region:** `asia-south1` (Mumbai)  
**Scaling:** Auto (Min: 0, Max: 10 instances)

---

## 📦 Tech Stack

| Layer | Technology |
|:--|:--|
| Frontend | React 19, Vite 6, Tailwind CSS 3 |
| Rich Text | TipTap v3 (with 20+ extensions) |
| Charts | Chart.js v4 + react-chartjs-2 |
| Backend | Node.js 18, Express |
| Database | PostgreSQL (Google Cloud SQL) |
| AI Charts | Groq API — `llama-3.1-8b-instant` |
| Auth | Google OAuth 2.0 + JWT |
| Deployment | Google Cloud Run (Docker) |
| CI/CD | GitHub → Cloud Run auto-deploy trigger |

---

## 🏆 Credits & Attribution

> [!NOTE]
> ### 💡 Developer Spotlight
> Cerebro is designed, architected, and developed by:
>
> **Satyam Kr. Singh**  
> 🏢 *The Mavericks Communication LLP*
>
> Built to power modern, data-driven media intelligence workflows for brands, agencies, and communications teams across India.
