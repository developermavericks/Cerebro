process.noDeprecation = true;
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');
const { fetchAllCompanies } = require('./fetcher');
const xlsx = require('xlsx');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB schema on startup
const schemaPath = path.join(__dirname, 'schema.sql');
try {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  db.query(sql).then(async () => {
    console.log('Database tables verified successfully.');
    try {
      await db.query('DELETE FROM articles a USING articles b WHERE a.id < b.id AND a.company_id = b.company_id AND a.title = b.title');
      console.log('Cleaned up duplicate articles from database.');
    } catch (dupErr) {
      console.error('Error cleaning up duplicate articles:', dupErr);
    }
    
    // Initialize global rankings list for SiteRank fallback
    const SiteRank = require('./reach_lens/SiteRankService');
    SiteRank.initRankings();

    // Start background fetcher
    setTimeout(() => fetchAllCompanies(), 2000);
    setInterval(() => fetchAllCompanies(), 5 * 60 * 1000);
  }).catch(err => console.error('Error verifying database tables:', err));
} catch (err) {
  console.error('Failed to read schema.sql:', err);
}

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password, isEmployee, role, licenseKey } = req.body;
  const isEmployeeUser = isEmployee || role === 'employee' || role === 'admin';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const isMavericksEmail = email.toLowerCase().endsWith('@themavericksindia.com');

    if (isEmployeeUser) {
      if (!isMavericksEmail) {
        return res.status(400).json({ error: 'Only @themavericksindia.com emails are allowed for Mavericks Employees.' });
      }
    } else {
      // Individual user - requires a valid license key
      if (!licenseKey || !licenseKey.trim()) {
        return res.status(400).json({ error: 'A valid alphanumeric license key is required for individual users.' });
      }

      const keyRes = await db.query(
        'SELECT * FROM license_keys WHERE key = $1 AND is_used = false AND is_revoked = false',
        [licenseKey.trim()]
      );

      if (keyRes.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or already used license key.' });
      }
    }

    // Insert user
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );

    // If it's an individual user, mark the key as used
    if (!isEmployeeUser) {
      await db.query(
        'UPDATE license_keys SET is_used = true, assigned_to_email = $1 WHERE key = $2',
        [email, licenseKey.trim()]
      );
    }

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password, role, isEmployee, adminKey } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let effectiveRole = role;
  if (!effectiveRole) {
    effectiveRole = isEmployee ? 'employee' : 'individual';
  }

  try {
    const isMavericksEmail = email.toLowerCase().endsWith('@themavericksindia.com');

    if ((effectiveRole === 'employee' || effectiveRole === 'admin') && !isMavericksEmail) {
      return res.status(400).json({ error: 'Only @themavericksindia.com emails can sign in as a Mavericks Employee/Admin.' });
    }

    if (effectiveRole === 'individual' && isMavericksEmail) {
      return res.status(400).json({ error: 'Please use the Mavericks Employee/Admin login option.' });
    }

    if (effectiveRole === 'admin') {
      if (!adminKey || !adminKey.trim()) {
        return res.status(400).json({ error: 'Admin Key is required for Admin login.' });
      }

      // Verify Admin Key
      const keyRes = await db.query("SELECT value FROM system_settings WHERE key = 'admin_key'");
      if (keyRes.rows.length === 0 || keyRes.rows[0].value !== adminKey.trim()) {
        return res.status(401).json({ error: 'Invalid Admin Key.' });
      }
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account does not exist. Please create a new account.' });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!isMavericksEmail || effectiveRole === 'individual') {
      const licenseCheck = await db.query(
        'SELECT * FROM license_keys WHERE assigned_to_email = $1 AND is_revoked = true',
        [email]
      );
      if (licenseCheck.rows.length > 0) {
        return res.status(403).json({ error: 'Your account has been deactivated because your license key has been revoked.' });
      }
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify Admin Key
async function verifyAdminKey(req, res, next) {
  const adminKeyHeader = req.headers['x-admin-key'];
  if (!adminKeyHeader) {
    return res.status(403).json({ error: 'Access denied. Admin Key required.' });
  }

  try {
    const userRes = await db.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0 || !userRes.rows[0].email.toLowerCase().endsWith('@themavericksindia.com')) {
      return res.status(403).json({ error: 'Access denied. Mavericks Employee only.' });
    }

    const settingsRes = await db.query("SELECT value FROM system_settings WHERE key = 'admin_key'");
    if (settingsRes.rows.length === 0 || settingsRes.rows[0].value !== adminKeyHeader.trim()) {
      return res.status(403).json({ error: 'Access denied. Invalid Admin Key.' });
    }

    next();
  } catch (err) {
    console.error('Error verifying admin key:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all license keys (Admin only)
app.get('/api/admin/license-keys', getUserId, verifyAdminKey, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM license_keys ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching license keys:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate a new license key (Admin only)
app.post('/api/admin/license-keys/generate', getUserId, verifyAdminKey, async (req, res) => {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newKey = `MAV-${part1}-${part2}`;

    await db.query('INSERT INTO license_keys (key) VALUES ($1)', [newKey]);

    res.status(201).json({ message: 'License key generated successfully', key: newKey });
  } catch (err) {
    console.error('Error generating license key:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});// Revoke a license key (Admin only)
app.post('/api/admin/license-keys/revoke', getUserId, verifyAdminKey, async (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'License key is required' });
  }

  try {
    const result = await db.query(
      'UPDATE license_keys SET is_revoked = true WHERE key = $1 RETURNING *',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'License key not found' });
    }

    res.status(200).json({ message: 'License key revoked successfully', licenseKey: result.rows[0] });
  } catch (err) {
    console.error('Error revoking license key:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Admin Key (Admin only)
app.post('/api/admin/update-key', getUserId, verifyAdminKey, async (req, res) => {
  const { newAdminKey } = req.body;
  if (!newAdminKey || !newAdminKey.trim()) {
    return res.status(400).json({ error: 'New admin key cannot be empty.' });
  }

  try {
    await db.query(
      "INSERT INTO system_settings (key, value) VALUES ('admin_key', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [newAdminKey.trim()]
    );
    res.status(200).json({ message: 'Admin key updated successfully.' });
  } catch (err) {
    console.error('Error updating admin key:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check Email Endpoint
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to extract user ID from headers or query
function getUserId(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID required' });
  }
  req.userId = parseInt(userId, 10);
  if (isNaN(req.userId)) {
    return res.status(400).json({ error: 'Invalid User ID' });
  }
  next();
}

// Get all tracked brands for the user
app.get('/api/brands', getUserId, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.region, c.last_status as status, c.last_viewed_at,
              COALESCE((SELECT COUNT(DISTINCT title) FROM articles a WHERE a.company_id = c.id)::int, 0) as mentions,
              COALESCE((SELECT COUNT(DISTINCT title) FROM articles a WHERE a.company_id = c.id AND (c.last_viewed_at IS NULL OR a.created_at > c.last_viewed_at))::int, 0) as new_mentions
       FROM companies c
       WHERE c.user_id = $1
       ORDER BY c.name`,
      [req.userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/brands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a brand
app.post('/api/brands', getUserId, async (req, res) => {
  const { name, region = 'Global' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Brand name is required' });
  }
  const cleanName = name.trim();
  try {
    const result = await db.query(
      'INSERT INTO companies (user_id, name, region, last_status) VALUES ($1, $2, $3, $4) RETURNING id, name, region, last_status as status, mentions, 0 as new_mentions',
      [req.userId, cleanName, region, 'Pending first fetch']
    );
    // Run fetch in background (non-blocking) so first ping is done automatically
    const { fetchRssForCompany } = require('./fetcher');
    fetchRssForCompany(result.rows[0]).catch(e => {
      console.error('Initial fetch failed for new brand:', e);
    });

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      region: result.rows[0].region,
      status: 'Pending first fetch',
      mentions: 0,
      new_mentions: 0
    });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Brand already tracked' });
    }
    console.error('Error in POST /api/brands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a brand
app.delete('/api/brands/:id', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM companies WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/brands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a brand as viewed (reset new mentions)
app.post('/api/brands/:id/viewed', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const checkRes = await db.query('SELECT id FROM companies WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    await db.query('UPDATE companies SET last_viewed_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.status(200).json({ message: 'Brand marked as viewed' });
  } catch (err) {
    console.error('Error in POST /api/brands/:id/viewed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get articles for a brand
app.get('/api/brands/:id/articles', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const brandRes = await db.query('SELECT name FROM companies WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (brandRes.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    const articlesRes = await db.query(
      `SELECT a.id, a.title, a.link, a.published_at, a.source, a.summary, a.sentiment, a.created_at,
              c.last_ping_at as last_ping_time
       FROM (
         SELECT DISTINCT ON (title) id, title, link, published_at, source, summary, sentiment, created_at, company_id
         FROM articles
         WHERE company_id = $1
         ORDER BY title, published_at DESC
       ) a
       JOIN companies c ON a.company_id = c.id
       ORDER BY a.published_at DESC
       LIMIT 200`,
      [id]
    );
    res.status(200).json(articlesRes.rows);
  } catch (err) {
    console.error('Error in GET /api/brands/:id/articles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark brand as viewed
app.post('/api/brands/:id/viewed', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE companies SET last_viewed_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/brands/:id/viewed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get or scrape full content for an article
app.get('/api/articles/:id/content', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const artRes = await db.query(
      'SELECT a.id, a.link, a.summary, a.title, c.user_id FROM articles a JOIN companies c ON a.company_id = c.id WHERE a.id = $1',
      [id]
    );

    if (artRes.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = artRes.rows[0];

    // Check ownership
    if (article.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to article' });
    }

    // If summary is already long (more than 500 characters) and doesn't equal title, just return it
    if (article.summary && article.summary.length > 500 && article.summary.toLowerCase() !== article.title.toLowerCase()) {
      return res.status(200).json({ content: article.summary });
    }

    const cheerio = require('cheerio');
    const axios = require('axios');
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const { GoogleDecoder } = require('google-news-url-decoder');
    const decoder = new GoogleDecoder();

    // Configure Proxy Agent
    let agent = null;
    if (process.env.DATAIMPULSE_PROXY_URL) {
      try {
        agent = new HttpsProxyAgent(process.env.DATAIMPULSE_PROXY_URL);
        console.log(`[ContentScraper] Proxy agent initialized.`);
      } catch (err) {
        console.error(`[ContentScraper] Error initializing HttpsProxyAgent:`, err.message);
      }
    }

    let targetUrl = article.link;
    if (article.link.includes('news.google.com')) {
      // Decode using direct IP (unproxied) to avoid anti-bot/consent walls on proxies
      try {
        console.log(`[ContentScraper] Decoding Google News URL directly (unproxied)...`);
        const decoded = await decoder.decode(article.link);
        if (decoded && decoded.decoded_url) {
          targetUrl = decoded.decoded_url;
          console.log(`[ContentScraper] Successfully decoded via local decoder: ${targetUrl}`);
        }
      } catch (decErr) {
        console.warn(`[ContentScraper] Decode error for article ${id} (direct): ${decErr.message}`);
      }

      // Fallback: If still unresolved, fetch redirection headers directly (unproxied) in a loop
      if (targetUrl.includes('news.google.com')) {
        try {
          console.log(`[ContentScraper] Running fallback unproxied redirect loop resolver...`);
          let currentUrl = targetUrl;
          let resolveCount = 0;
          while (currentUrl.includes('news.google.com') && resolveCount < 5) {
            resolveCount++;
            const redirectRes = await axios.get(currentUrl, {
              maxRedirects: 0,
              timeout: 8000,
              validateStatus: (status) => status >= 300 && status < 400,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            if (redirectRes.headers.location) {
              currentUrl = redirectRes.headers.location;
            } else {
              break;
            }
          }
          if (!currentUrl.includes('news.google.com')) {
            targetUrl = currentUrl;
            console.log(`[ContentScraper] Successfully resolved direct redirect URL: ${targetUrl}`);
          } else {
            console.warn(`[ContentScraper] Unresolved google news URL after redirect loop: ${currentUrl}`);
          }
        } catch (redirErr) {
          console.warn(`[ContentScraper] Fallback direct redirect loop resolver failed: ${redirErr.message}`);
        }
      }
    }

    // Extraction helper
    function extractTextFromHtml(html) {
      const $ = cheerio.load(html);
      $('script, style, nav, header, footer, iframe, noscript, .ad, .ads, .comment, .social-share, svg, form').remove();
      
      const selectors = [
        'article',
        '.caas-body', // Yahoo
        '.article-body',
        '.story-body',
        '.entry-content',
        '.post-content',
        'main'
      ];

      let bodyText = '';
      for (const selector of selectors) {
        const el = $(selector);
        if (el.length > 0) {
          const paragraphs = [];
          el.find('p').each((i, pEl) => {
            const txt = $(pEl).text().trim();
            if (txt.length > 20) paragraphs.push(txt);
          });
          if (paragraphs.length > 0) {
            bodyText = paragraphs.join('\n\n');
            break;
          }
        }
      }

      if (!bodyText) {
        const paragraphs = [];
        $('p').each((i, pEl) => {
          const txt = $(pEl).text().trim();
          if (txt.length > 40) paragraphs.push(txt);
        });
        bodyText = paragraphs.join('\n\n');
      }

      const resultText = bodyText.trim().slice(0, 8000);
      const lower = resultText.toLowerCase();
      const isConsentWall = 
        (lower.includes('accept all') && lower.includes('reject all')) ||
        (lower.includes('accept cookie') || lower.includes('reject cookie')) ||
        lower.includes('cookie consent') ||
        lower.includes('choose to accept all') ||
        lower.includes('managing your privacy settings') ||
        lower.includes('utiliser des cookies') ||
        lower.includes('non-personalized content');

      if (isConsentWall) {
        throw new Error('Parsed text is a Cookie Consent/Privacy Wall');
      }
      return resultText;
    }

    let bodyText = '';

    // Attempt 1: Direct Axios with Proxy
    try {
      console.log(`[ContentScraper] Attempt 1: Direct Axios fetch for ${targetUrl}`);
      const axiosConfig = {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      };
      if (agent) {
        axiosConfig.httpAgent = agent;
        axiosConfig.httpsAgent = agent;
      }

      const response = await axios.get(targetUrl, axiosConfig);
      if (response.status === 200 && response.data) {
        bodyText = extractTextFromHtml(response.data);
      }
    } catch (scrapeErr) {
      console.warn(`[ContentScraper] Attempt 1 failed for ${targetUrl}: ${scrapeErr.message}`);
    }

    // Attempt 2: Google Cache Axios with Proxy
    if (!bodyText || bodyText.length < 100) {
      try {
        if (targetUrl.includes('news.google.com')) {
          throw new Error('Skipping Google Cache for undecoded Google News link');
        }

        const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(targetUrl)}`;
        console.log(`[ContentScraper] Attempt 2: Google Cache Axios fetch for ${cacheUrl}`);
        const axiosConfig = {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        };
        if (agent) {
          axiosConfig.httpAgent = agent;
          axiosConfig.httpsAgent = agent;
        }

        const response = await axios.get(cacheUrl, axiosConfig);
        if (response.status === 200 && response.data) {
          const htmlText = response.data.toLowerCase();
          const isGoogleError = 
            htmlText.includes('aucun document ne correspond') || 
            htmlText.includes('did not match any documents') ||
            htmlText.includes('error 404');
          
          if (isGoogleError) {
            throw new Error('Google Cache search returned no results / error page');
          }
          
          bodyText = extractTextFromHtml(response.data);
        }
      } catch (cacheErr) {
        console.warn(`[ContentScraper] Attempt 2 Google Cache failed: ${cacheErr.message}`);
      }
    }

    // Attempt 3: Puppeteer Stealth Fallback with Proxy
    if (!bodyText || bodyText.length < 100) {
      let browser;
      try {
        console.log(`[ContentScraper] Attempt 3: Puppeteer Stealth fallback for ${targetUrl}`);
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        const puppeteerExtra = puppeteer.default || puppeteer;
        
        // Only add plugins if not already added in registry
        try {
          puppeteerExtra.use(StealthPlugin());
        } catch (e) {}

        const puppeteerOptions = {
          headless: true,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
          ]
        };

        if (process.env.DATAIMPULSE_PROXY_URL) {
          const parsed = new URL(process.env.DATAIMPULSE_PROXY_URL);
          puppeteerOptions.args.push(`--proxy-server=${parsed.host}`);
        }

        browser = await puppeteerExtra.launch(puppeteerOptions);
        const page = await browser.newPage();
        
        // Intelligent request interception to speed up loads
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          if (['image', 'font', 'stylesheet', 'media'].includes(req.resourceType())) {
            req.abort();
          } else {
            req.continue();
          }
        });

        if (process.env.DATAIMPULSE_PROXY_URL) {
          const parsed = new URL(process.env.DATAIMPULSE_PROXY_URL);
          if (parsed.username && parsed.password) {
            await page.authenticate({
              username: decodeURIComponent(parsed.username),
              password: decodeURIComponent(parsed.password)
            });
          }
        }

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        try {
          await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (navErr) {
          console.warn(`[ContentScraper] Puppeteer navigation timeout/warning (continuing): ${navErr.message}`);
        }

        const html = await page.content();
        bodyText = extractTextFromHtml(html);

      } catch (pupErr) {
        console.warn(`[ContentScraper] Attempt 3 Puppeteer failed: ${pupErr.message}`);
      } finally {
        if (browser) await browser.close();
      }
    }

    if (bodyText && bodyText.length > 100) {
      await db.query('UPDATE articles SET summary = $1 WHERE id = $2', [bodyText, id]);
      return res.status(200).json({ content: bodyText });
    }

    return res.status(200).json({ content: article.summary || 'No content available.' });
  } catch (err) {
    console.error('Error in GET /api/articles/:id/content:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual fetch for user's brands
app.post('/api/brands/fetch-now', getUserId, async (req, res) => {
  try {
    const { fetchRssForCompany } = require('./fetcher');
    const companiesRes = await db.query('SELECT * FROM companies WHERE user_id = $1', [req.userId]);
    
    // Wait for all brand fetches to complete
    const results = await Promise.all(
      companiesRes.rows.map(comp => 
        fetchRssForCompany(comp).catch(e => {
          console.error(`Manual fetch failed for brand ${comp.name}:`, e);
          return 0;
        })
      )
    );
    
    const totalNew = results.reduce((sum, count) => sum + count, 0);
    res.status(200).json({ message: `Fetch completed. Found ${totalNew} new articles.` });
  } catch (err) {
    console.error('Error in POST /api/brands/fetch-now:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download Excel report
app.get('/api/brands/:id/report', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID required' });
  }
  try {
    const brandRes = await db.query('SELECT name FROM companies WHERE id = $1 AND user_id = $2', [id, userId]);
    if (brandRes.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    const brandName = brandRes.rows[0].name;
    const articlesRes = await db.query(
      'SELECT title, link, source, published_at FROM articles WHERE company_id = $1 ORDER BY published_at DESC',
      [id]
    );

    const data = articlesRes.rows.map(a => ({
      URL: a.link,
      Title: a.title,
      Agency: a.source,
      'Time of Publishing': new Date(a.published_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }));

    if (data.length === 0) {
      data.push({ URL: 'N/A', Title: 'No articles found', Agency: 'N/A', 'Time of Publishing': 'N/A' });
    }

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'News Articles');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', `attachment; filename="${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error in Excel export:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Curated Query Search & Brand Analysis endpoint
app.post('/api/curated-search', async (req, res) => {
  console.log('POST /api/curated-search hit with body:', req.body);
  const { targetKeywords, excludedKeywords, topic } = req.body;
  try {
    const analyzer = require('./analyzer');
    const results = analyzer.analyzeSpecificBrands({ targetKeywords, excludedKeywords, topic });
    console.log('Analysis results keys:', Object.keys(results.brands || {}));
    res.status(200).json(results);
  } catch (err) {
    console.error('Error in POST /api/curated-search:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- ReachLens Endpoints ---
const { analyzeUrl } = require('./reach_lens/AnalysisController');
const BatchProcessor = require('./reach_lens/BatchProcessor');

app.post('/api/analyze', analyzeUrl);

app.post('/api/upload-sheet', upload.single('sheet'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const version = req.body.version || 'v5';
  const jobId = uuidv4();

  try {
    await db.query('INSERT INTO batch_jobs (id, status) VALUES ($1, $2)', [jobId, 'pending']);

    // Process in background
    BatchProcessor.processJob(jobId, req.file.path, version);

    res.json({ jobId });
  } catch (err) {
    console.error('Failed to create batch job:', err);
    res.status(500).json({ error: 'Failed to create batch job' });
  }
});

app.get('/api/latest-batch-job', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM batch_jobs ORDER BY created_at DESC LIMIT 1');
    if (result.rows.length === 0) {
      return res.json(null);
    }
    const job = result.rows[0];
    if (job.results) {
      try {
        job.results = JSON.parse(job.results);
      } catch (parseErr) {
        console.error('Failed to parse results JSON:', parseErr);
        job.results = [];
      }
    } else {
      job.results = [];
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/batch-status/:jobId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM batch_jobs WHERE id = $1', [req.params.jobId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = result.rows[0];
    if (job.results) {
      try {
        job.results = JSON.parse(job.results);
      } catch (parseErr) {
        console.error('Failed to parse results JSON:', parseErr);
        job.results = [];
      }
    } else {
      job.results = [];
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/download-result/:jobId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM batch_jobs WHERE id = $1', [req.params.jobId]);
    if (result.rows.length === 0 || !result.rows[0].result_file) {
      return res.status(404).json({ error: 'Result not ready' });
    }
    const filePath = path.resolve(__dirname, 'uploads', result.rows[0].result_file);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
