const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

const OTHER_BRANDS_POOL = [
  "TCS", "Infosys", "Wipro", "HCLTech", "IBM", "Deloitte", "PwC", "EY", "KPMG", 
  "LTIMindtree", "Persistent Systems", "Zensar Technologies", "Happiest Minds", "Mu Sigma", 
  "DataRobot", "C3.ai", "Palantir Technologies", "Scale AI", "LeewayHertz", "Elysium Technologies", 
  "Ksolves", "Innowise Group", "ScienceSoft", "Addepto", "Markovate", "Sarvika Technologies", 
  "Intellectyx", "Millipixels Interactive", "InnovationM", "Sigmoid", "Google DeepMind", 
  "Meta AI", "Mistral AI", "Cohere", "xAI", "Perplexity AI", "DeepSeek", "Stability AI", 
  "Inflection AI", "Hugging Face", "Character.ai", "Adept AI", "Reka AI", "01.AI", 
  "LightOn", "Aleph Alpha", "AI21 Labs", "Kyutai", "Suno", "ElevenLabs", "AMD", "Intel", 
  "TSMC", "Broadcom", "Qualcomm", "Arm Holdings", "Groq", "Cerebras Systems", "SambaNova Systems", 
  "Graphcore", "Tenstorrent", "Lightmatter", "CoreWeave", "Lambda Labs", "ASML", 
  "Marvell Technology", "Micron Technology", "SK Hynix", "Supermicro", "SiliconFlow", 
  "Databricks", "Snowflake", "Runway", "Pika Labs", "Luma AI", "Sora", "Cursor", 
  "Cognition AI", "Harvey", "Abnormal Security", "Glean", "Shield AI", "Anduril Industries", 
  "Waymo", "Tesla", "Canva", "Adobe", "Notion", "Jasper", "Copy.ai", "Synthesia", 
  "Midjourney", "Haptik", "Uniphore", "Arya.ai", "Mad Street Den", "Locus.sh", "SigTuple", 
  "Ambience Healthcare", "Safe Superintelligence", "Sarvam AI", "Krutrim", "Tata Elxsi", 
  "Netweb Technologies", "E2E Networks", "Reliance Jio", "Qure.ai", "Yellow.ai", 
  "GreyOrange", "Cropin", "Bhashini", "BharatGen", "CoRover", "Gnani.ai", "Entropik", 
  "Skit.ai", "Niramai", "Intello Labs", "Myelin Foundry", "Rephrase.ai", "Observe.AI", 
  "LogiNext", "Assert AI", "Kore.ai", "Active.ai", "Vernacular.ai", "Staqu", 
  "AIndra Systems", "Soket AI Labs"
];

const TOPIC_KEYWORDS = {
  "AI": ["ai", "artificial intelligence", "machine learning", "deep learning", "generative ai", "neural network", "openai", "copilot", "llm", "large language model"],
  "STARTUP": ["startup", "startups", "venture capital", "funding", "founder", "founders", "entrepreneur", "entrepreneurs", "seed round", "series a"],
  "CONSULTANCY": ["consultancy", "consulting", "consultant", "consultants", "mckinsey", "bcg", "bain", "accenture", "ey", "deloitte", "pwc", "kpmg"],
  "FINANCE": ["finance", "financial", "banking", "investment", "capital", "stock", "stocks", "market", "markets", "bank", "banks", "equity"],
  "TECHNOLOGY": ["technology", "tech", "software", "hardware", "digital", "it", "semiconductor", "microchip", "processor"],
  "HEALTHCARE": ["healthcare", "health", "medical", "pharma", "pharmaceutical", "hospital", "hospitals", "clinical", "medicine"],
  "EDUCATION": ["education", "educational", "school", "schools", "university", "universities", "college", "colleges", "learning", "student", "students"],
  "ENERGY": ["energy", "power", "solar", "wind", "oil", "gas", "renewable", "renewables", "electricity"],
  "RETAIL": ["retail", "shopping", "e-commerce", "ecommerce", "store", "stores", "consumer", "goods", "supermarket"],
  "MEDIA": ["media", "news", "press", "journalism", "broadcast", "television", "tv", "newspaper", "social media"],
  "AUTOMOTIVE": ["automotive", "automobile", "car", "cars", "vehicle", "vehicles", "ev", "electric vehicle", "electric vehicles"]
};

const BRAND_FAMILIES = {
  "Qualcomm": ["Qualcomm", "Snapdragon"],
  "MediaTek": ["MediaTek", "Dimensity", "Helio"],
  "Intel": ["Intel", "Core i", "Xeon", "Arc GPU", "Lakefield"],
  "AMD": ["AMD", "Ryzen", "Radeon", "EPYC", "Threadripper"],
  "Nvidia": ["Nvidia", "GeForce", "RTX", "GTX", "H100", "A100", "B100", "Grace Hopper"]
};

const INDIAN_SOURCES_KEYWORDS = [
  "economic times", "times of india", "the times of india", "toi", "timesofindia", 
  "the hindu", "hindustantimes", "hindustan times", "the hindustan times",
  "business standard", "livemint", "mint", "ndtv", "india today", "firstpost",
  "indian express", "financial express", "moneycontrol", "yourstory", "inc42",
  "business today", "zee news", "news18", "deccan herald", "outlook india",
  "the week", "businessworld", "forbes india", "fortune india", "vccircle",
  "techcircle", "entrackr", "trak.in", "techgig", "analytics india", "cnbc tv18",
  "pti", "ians", "ani", "deccan chronicle", "pib", "dainik", "jagran", "amar ujala",
  "bhaskar", "lokmat", "malayala", "mathrubhumi", "enadu", "sakshi", "dinakaran",
  "the pioneer", "tribune india", "new indian express", "telangana today",
  "kashmir reader", "greater kashmir", "assam tribune", "sentinel assam"
];

function isIndianSource(sourceName) {
  if (!sourceName) return false;
  const sn = sourceName.toLowerCase();
  if (sn.includes("propakistani")) return false;

  for (const kw of INDIAN_SOURCES_KEYWORDS) {
    if (kw.length <= 4) {
      if (new RegExp('\\b' + escapeRegExp(kw) + '\\b', 'i').test(sn)) return true;
    } else if (sn.includes(kw)) {
      return true;
    }
  }
  return false;
}

function normalizePublicationName(name) {
  if (!name) return "Unknown";
  const n = name.trim();
  const nl = n.toLowerCase();

  const mapping = {
    "the times of india": "Times of India",
    "times of india": "Times of India",
    "toi": "Times of India",
    "the economic times": "Economic Times",
    "economic times": "Economic Times",
    "the indian express": "Indian Express",
    "indian express": "Indian Express",
    "the new indian express": "New Indian Express",
    "new indian express": "New Indian Express",
    "the hindu": "The Hindu",
    "hindu": "The Hindu",
    "hindustantimes": "Hindustan Times",
    "hindustan times": "Hindustan Times",
    "the hindustan times": "Hindustan Times",
    "livemint": "Mint",
    "mint": "Mint",
    "moneycontrol": "Moneycontrol",
    "business standard": "Business Standard",
    "cnbc tv18": "CNBC TV18",
    "india today": "India Today",
    "financial express": "Financial Express",
    "deccan herald": "Deccan Herald",
    "the pioneer": "The Pioneer",
    "outlook india": "Outlook India"
  };

  for (const [key, val] of Object.entries(mapping)) {
    if (key === nl || (key.length > 5 && nl.includes(key))) {
      return val;
    }
  }
  if (nl.startsWith("the ")) {
    return n.substring(4);
  }
  return n;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text) {
  if (!text) return "";
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function analyzeSpecificBrands({ targetKeywords = [], excludedKeywords = [], topic = 'All' }) {
  const rootDir = path.resolve(__dirname, '..');
  const excelFiles = fs.readdirSync(rootDir).filter(f => f.startsWith('NEXUS_') && f.endsWith('.xlsx'));
  let articles = [];

  for (const file of excelFiles) {
    try {
      const excelPath = path.resolve(rootDir, file);
      const wb = xlsx.readFile(excelPath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      articles = articles.concat(data);
    } catch (err) {
      console.error(`Error loading Excel file ${file}:`, err.message);
    }
  }

  const targetBrands = (targetKeywords || []).map(b => b.trim()).filter(Boolean);
  if (!targetBrands.length) return {};

  const excludedTerms = (excludedKeywords || []).map(b => b.trim()).filter(Boolean);

  const displayBrands = [...targetBrands, "Others"];

  const results = {};
  for (const brand of displayBrands) {
    results[brand] = {
      mentions: 0,
      articles: 0,
      headline_mentions: 0,
      full_mentions: 0,
      sources: {},
      timeline: {},
      sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      headline_sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      full_sentiment: { Positive: 0, Neutral: 0, Negative: 0 },
      article_samples: { Positive: [], Neutral: [], Negative: [] }
    };
  }

  let totalSectorArticles = 0;
  let totalKeywordArticles = 0;

  // Target aliases map: search term lowercase -> Brand display name
  const normalizedTargetMap = {};
  for (const b of targetBrands) {
    const bLower = b.toLowerCase();
    let familyMatch = null;
    for (const [displayName, aliases] of Object.entries(BRAND_FAMILIES)) {
      if (bLower === displayName.toLowerCase()) {
        familyMatch = aliases;
        break;
      }
    }
    if (familyMatch) {
      for (const alias of familyMatch) {
        normalizedTargetMap[alias.toLowerCase().trim()] = b;
      }
    } else {
      normalizedTargetMap[bLower] = b;
    }
  }

  const targetTerms = Object.keys(normalizedTargetMap);

  // Compile regex patterns for target, excluded, and topic keywords
  const compiledPatterns = {};
  for (const term of targetTerms) {
    const normTerm = normalizeText(term);
    const escapedParts = normTerm.split(/\s+/).map(escapeRegExp);
    compiledPatterns[term] = new RegExp('\\b' + escapedParts.join('\\s+') + '\\b', 'gi');
  }

  const compiledExcluded = excludedTerms.map(term => {
    const normTerm = normalizeText(term);
    const escapedParts = normTerm.split(/\s+/).map(escapeRegExp);
    return new RegExp('\\b' + escapedParts.join('\\s+') + '\\b', 'i');
  });

  // Compile topic regex if not 'All'
  let topicRegex = null;
  if (topic && topic !== 'All') {
    const keywords = TOPIC_KEYWORDS[topic.toUpperCase()] || [topic];
    const escaped = keywords.map(k => escapeRegExp(normalizeText(k)));
    topicRegex = new RegExp('\\b(' + escaped.join('|') + ')\\b', 'i');
  }

  // Pre-compiled regex for others pool to speed up matching
  const otherBrandsRegex = new RegExp('\\b(' + OTHER_BRANDS_POOL.map(escapeRegExp).join('|') + ')\\b', 'gi');

  for (const article of articles) {
    const title = article['Title'] || '';
    const summary = article['Summary'] || '';
    const fullBody = article['Full Body'] || '';
    const rawContent = [title, summary, fullBody].join(' ');
    const content = normalizeText(rawContent);

    if (!content.trim()) continue;

    // Filter by topic if active
    if (topicRegex) {
      topicRegex.lastIndex = 0;
      if (!topicRegex.test(content)) {
        continue;
      }
    }

    let isExcluded = false;
    for (const regex of compiledExcluded) {
      regex.lastIndex = 0;
      if (regex.test(content)) {
        isExcluded = true;
        break;
      }
    }
    if (isExcluded) continue;

    totalSectorArticles++;

    const sourceRaw = article['Publisher/Agency'] || article['Publisher'] || article['Source Feed'] || 'Unknown';
    const source = normalizePublicationName(sourceRaw);

    let dateKey = '2026-05-18';
    const pubRaw = article['Published At'] || article['Timestamp'];
    if (pubRaw) {
      try {
        const dateObj = new Date(pubRaw);
        if (!isNaN(dateObj.getTime())) {
          dateKey = dateObj.toISOString().split('T')[0];
        }
      } catch (e) {}
    }

    const articleMatches = new Set();
    let hasKeywordMatch = false;

    // 1. Target Brands
    for (const term of targetTerms) {
      const regex = compiledPatterns[term];
      regex.lastIndex = 0;
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        hasKeywordMatch = true;
        const brandName = normalizedTargetMap[term];
        articleMatches.add(brandName);

        results[brandName].mentions += matches.length;
        results[brandName].articles += 1;
        results[brandName].sources[source] = (results[brandName].sources[source] || 0) + matches.length;
        results[brandName].timeline[dateKey] = (results[brandName].timeline[dateKey] || 0) + matches.length;

        // Classify headline vs body
        const normalizedTitle = normalizeText(title);
        const normalizedBody = normalizeText(summary + ' ' + fullBody);
        const termRegex = new RegExp('\\b' + escapeRegExp(term) + '\\b', 'i');
        const inHeadline = termRegex.test(normalizedTitle);
        const inBody = termRegex.test(normalizedBody);

        if (inHeadline) {
          results[brandName].headline_mentions += 1;
        }
        if (inBody) {
          results[brandName].full_mentions += 1;
        } else if (!inHeadline) {
          results[brandName].full_mentions += 1; // fallback
        }

        // Sentiment analysis on matching sentences
        const sentences = rawContent.split(/[.!?]+\s+/);
        for (const sentence of sentences) {
          const sentNorm = normalizeText(sentence);
          const sRegex = new RegExp('\\b' + escapeRegExp(term) + '\\b', 'i');
          if (sRegex.test(sentNorm)) {
            const res = sentiment.analyze(sentence);
            let sentCat = "Neutral";
            if (res.score > 1) sentCat = "Positive";
            else if (res.score < -1) sentCat = "Negative";

            results[brandName].sentiment[sentCat] += 1;

            // Headline sentiment
            if (inHeadline) {
              const titleRes = sentiment.analyze(title);
              const titleSentCat = titleRes.score > 1 ? 'Positive' : titleRes.score < -1 ? 'Negative' : 'Neutral';
              results[brandName].headline_sentiment[titleSentCat] += 1;
            }
            // Full/body sentiment
            results[brandName].full_sentiment[sentCat] += 1;

            if (results[brandName].article_samples[sentCat].length < 20) {
              const url = article['Resolved URL'] || article['URL'] || article['link'] || '';
              const titleToCheck = title || 'No Title';
              if (!results[brandName].article_samples[sentCat].some(s => s.title === titleToCheck || (url && s.url === url))) {
                results[brandName].article_samples[sentCat].push({
                  title: titleToCheck,
                  source: source,
                  url: url,
                  published: dateKey
                });
              }
            }
          }
        }
      }
    }

    // 2. All remaining articles go into "Others"
    if (!hasKeywordMatch) {
      const brandName = "Others";
      results[brandName].articles += 1;

      // Count mentions of other brands from the pool, or default to 1 exposure mention
      let mentionsCount = 0;
      otherBrandsRegex.lastIndex = 0;
      const otherMatches = content.match(otherBrandsRegex);
      if (otherMatches && otherMatches.length > 0) {
        mentionsCount = otherMatches.length;
      } else {
        mentionsCount = 1;
      }

      results[brandName].mentions += mentionsCount;
      results[brandName].sources[source] = (results[brandName].sources[source] || 0) + mentionsCount;
      results[brandName].timeline[dateKey] = (results[brandName].timeline[dateKey] || 0) + mentionsCount;

      // Sentiment analysis on title/summary of this other article
      const resS = sentiment.analyze(title + " " + summary);
      let sentCat = "Neutral";
      if (resS.score > 1) sentCat = "Positive";
      else if (resS.score < -1) sentCat = "Negative";

      results[brandName].sentiment[sentCat] += 1;
      if (results[brandName].article_samples[sentCat].length < 20) {
        const url = article['Resolved URL'] || article['URL'] || article['link'] || '';
        const titleToCheck = title || 'No Title';
        if (!results[brandName].article_samples[sentCat].some(s => s.title === titleToCheck || (url && s.url === url))) {
          results[brandName].article_samples[sentCat].push({
            title: titleToCheck,
            source: source,
            url: url,
            published: dateKey
          });
        }
      }
    }

    if (hasKeywordMatch) {
      totalKeywordArticles++;
    }
  }

  const indianSourceCounts = {};
  for (const [brand, data] of Object.entries(results)) {
    for (const [src, count] of Object.entries(data.sources)) {
      if (isIndianSource(src)) {
        indianSourceCounts[src] = (indianSourceCounts[src] || 0) + count;
      }
    }
  }
  const topIndianPublications = Object.entries(indianSourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  return {
    brands: results,
    topIndianPublications,
    totalSectorArticles,
    totalKeywordArticles
  };
}

module.exports = {
  analyzeSpecificBrands,
  isIndianSource,
  normalizePublicationName
};
