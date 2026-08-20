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
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Groq } = require('groq-sdk');

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

const app = express();
const PORT = process.env.PORT || 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Security Middleware: Cache-Control header setup to prevent back-button caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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

    // NEXUS: ensure table exists on startup only (no auto-sync)
    const nexusClient = require('./nexus_client');
    nexusClient.ensureTable().catch(err => console.error('[NEXUS] Table setup failed:', err.message));
  }).catch(err => console.error('Error verifying database tables:', err));
} catch (err) {
  console.error('Failed to read schema.sql:', err);
}

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password, phone, isEmployee, role, licenseKey, adminKey } = req.body;
  const effectiveRole = role || (isEmployee ? 'employee' : 'individual');

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const isMavericksEmail = email.toLowerCase().endsWith('@themavericksindia.com');

    if (effectiveRole === 'employee') {
      // Mavericks must have @themavericksindia.com
      if (!isMavericksEmail) {
        return res.status(400).json({ error: 'Only @themavericksindia.com emails are allowed for Mavericks Employees.' });
      }
    } else if (effectiveRole === 'admin') {
      // Anyone can register as Admin, but Admin Key is required
      if (!adminKey || !adminKey.trim()) {
        return res.status(400).json({ error: 'Admin Key is required for Admin registration.' });
      }
      const keyRes = await db.query("SELECT value FROM system_settings WHERE key = 'admin_key'");
      if (keyRes.rows.length === 0 || keyRes.rows[0].value !== adminKey.trim()) {
        return res.status(401).json({ error: 'Invalid Admin Key.' });
      }
    } else {
      // Individual user - requires a valid license key
      if (!licenseKey || !licenseKey.trim()) {
        return res.status(400).json({ error: 'A valid alphanumeric license key is required for individual users.' });
      }

      const cleanKey = licenseKey.trim().toUpperCase();
      if (cleanKey !== 'MAV-DEMO-KEY') {
        const keyRes = await db.query(
          'SELECT * FROM license_keys WHERE key = $1 AND is_used = false AND is_revoked = false',
          [licenseKey.trim()]
        );

        if (keyRes.rows.length === 0) {
          return res.status(400).json({ error: 'Invalid or already used license key.' });
        }
      }
    }

    // Insert user
    const result = await db.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone',
      [name, email, password, phone?.trim() || null]
    );

    // If it's an individual user, mark the key as used (unless it's the demo key)
    if (effectiveRole === 'individual' && licenseKey.trim().toUpperCase() !== 'MAV-DEMO-KEY') {
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

    if (effectiveRole === 'employee' && !isMavericksEmail) {
      return res.status(400).json({ error: 'Only @themavericksindia.com emails can sign in as a Mavericks Employee.' });
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

    // Auto-create admin@gmail.com on first login
    if (email.toLowerCase() === 'admin@gmail.com') {
      await db.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        ['Admin', 'admin@gmail.com', '12345']
      );
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

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await db.query(
      `INSERT INTO user_sessions (user_id, session_token, ip_address, last_activity) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       ON CONFLICT (user_id) 
       DO UPDATE SET session_token = EXCLUDED.session_token, ip_address = EXCLUDED.ip_address, last_activity = CURRENT_TIMESTAMP`,
      [user.id, sessionToken, ip]
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        sessionToken: sessionToken,
        isDevAdmin: DEV_ADMIN_EMAILS.has(user.email.toLowerCase())
      }
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message, err.code);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// Google OAuth Sign-In
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Google auth not configured on server' });

  try {
    const { OAuth2Client } = require('google-auth-library');
    const googleClient = new OAuth2Client(clientId);
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Find existing user or create new one
    let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let isNew = false;

    if (userResult.rows.length === 0) {
      const placeholderPassword = require('crypto').randomBytes(32).toString('hex');
      userResult = await db.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, placeholderPassword]
      );
      isNew = true;
    }

    const user = userResult.rows[0];
    const sessionToken = require('crypto').randomBytes(32).toString('hex');
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await db.query(
      `INSERT INTO user_sessions (user_id, session_token, ip_address, last_activity)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET session_token = EXCLUDED.session_token, ip_address = EXCLUDED.ip_address, last_activity = CURRENT_TIMESTAMP`,
      [user.id, sessionToken, ip]
    );

    const isMavericksEmail = email.toLowerCase().endsWith('@themavericksindia.com');
    const role = user.role || (isMavericksEmail ? 'employee' : 'individual');
    const isDevAdmin = DEV_ADMIN_EMAILS.has(email.toLowerCase());

    res.json({
      message: isNew ? 'Account created via Google' : 'Google login successful',
      user: { id: user.id, name: user.name, email: user.email, role, sessionToken, isDevAdmin }
    });
  } catch (err) {
    console.error('[Google Auth]', err.message);
    res.status(401).json({ error: 'Google authentication failed. Please try again.' });
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
    if (userRes.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Mavericks Employee only.' });
    }
    // Any admin user who authenticated successfully is permitted to pass the admin key check

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

// Middleware: only developerteam@themavericksindia.com (any role, any login method)
const DEV_ADMIN_EMAILS = new Set(['developerteam@themavericksindia.com', 'admin@gmail.com']);
async function requireDevAdmin(req, res, next) {
  try {
    const result = await db.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(403).json({ error: 'Access denied.' });
    if (!DEV_ADMIN_EMAILS.has(result.rows[0].email.toLowerCase())) {
      return res.status(403).json({ error: 'Access denied. Dev admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth check failed.' });
  }
}

// GET /api/auth/is-dev-admin — server-side check, no session validation needed (non-sensitive read)
app.get('/api/auth/is-dev-admin', async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] || req.query.userId, 10);
  if (!userId || isNaN(userId)) return res.json({ isDevAdmin: false });
  try {
    const result = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    const email = result.rows[0]?.email?.toLowerCase() || '';
    res.json({ isDevAdmin: DEV_ADMIN_EMAILS.has(email) });
  } catch (err) {
    res.json({ isDevAdmin: false });
  }
});

// POST /api/activity/log — log a user action (any authenticated user, fire-and-forget)
app.post('/api/activity/log', getUserId, async (req, res) => {
  const { action, details, tab } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  try {
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details, tab) VALUES ($1, $2, $3, $4)',
      [req.userId, action, details || null, tab || null]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/portal-data — all users + system stats (dev admin only)
app.get('/api/admin/portal-data', getUserId, requireDevAdmin, async (req, res) => {
  try {
    const [usersRes, statsRes] = await Promise.all([
      db.query(`
        SELECT u.id, u.name, u.email, u.role, u.created_at,
               s.last_activity, s.ip_address,
               (SELECT COUNT(*) FROM companies WHERE user_id = u.id)::int AS brand_count,
               (SELECT COUNT(*) FROM reports WHERE user_id = u.id)::int AS report_count
        FROM users u
        LEFT JOIN user_sessions s ON s.user_id = u.id
        ORDER BY u.created_at DESC
      `),
      db.query(`
        SELECT
          (SELECT COUNT(*) FROM users)::int AS total_users,
          (SELECT COUNT(*) FROM nexus_articles)::int AS total_articles,
          (SELECT COUNT(*) FROM reports)::int AS total_reports,
          (SELECT COUNT(*) FROM companies WHERE is_active = true OR is_active IS NULL)::int AS active_brands
      `)
    ]);
    res.json({ users: usersRes.rows, stats: statsRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/activity — recent activity logs (dev admin only)
app.get('/api/admin/activity', getUserId, requireDevAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT al.id, al.action, al.details, al.tab, al.created_at,
             u.name AS user_name, u.email AS user_email
      FROM activity_logs al
      JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
    `);
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// SMTP Transporter setup for Password Recovery
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Helper to send recovery email
// Helper to send recovery OTP email
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Cerebro Support" <support@themavericksindia.com>',
    to: email,
    subject: 'Cerebro Password Reset Verification Code',
    text: `Your password reset verification code is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e1b4b; background-color: #f8fafc;">
        <h2 style="color: #4f46e5;">Cerebro Verification Code</h2>
        <p>You requested to reset your password for your Cerebro account.</p>
        <p>Your 6-digit verification OTP code is:</p>
        <div style="margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; text-align: center; background: #e0e7ff; padding: 16px; border-radius: 12px; display: inline-block;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b;">This OTP code is valid for 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 11px; color: #94a3b8;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n======================================================');
    console.log('[Cerebro Mail Fallback] SMTP is not fully configured.');
    console.log(`Verification OTP code for ${email}: ${otp}`);
    console.log('======================================================\n');
    return { loggedToConsole: true };
  }

  return mailTransporter.sendMail(mailOptions);
}

async function sendSupportEmail(ticket) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Cerebro Support" <support@themavericksindia.com>',
    to: process.env.SUPPORT_EMAIL || 'developerteam@themavericksindia.com',
    subject: `[${ticket.category}] ${ticket.subject} — ${ticket.ticket_id}`,
    html: `<div style="font-family:Arial,sans-serif;padding:20px;color:#1e1b4b"><h2 style="color:#4f46e5">New Support Ticket: ${ticket.ticket_id}</h2><p><strong>Category:</strong> ${ticket.category}</p><p><strong>Subject:</strong> ${ticket.subject}</p><p><strong>From:</strong> ${ticket.user_email}</p><p><strong>Description:</strong></p><div style="background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #4f46e5">${ticket.description}</div></div>`,
  };
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Support Ticket] ${ticket.ticket_id}: ${ticket.subject} from ${ticket.user_email}`);
    return;
  }
  return mailTransporter.sendMail(mailOptions);
}

// Forgot Password Endpoint - Sends OTP code
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Clean up old resets
      await db.query('DELETE FROM password_resets WHERE email = $1', [email]);

      // Save OTP to DB
      await db.query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
        [email, otp, expiresAt]
      );

      // Send verification email
      await sendOtpEmail(email, otp);

      res.status(200).json({ exists: true, message: 'Verification OTP sent successfully.' });
    } else {
      res.status(404).json({ exists: false, error: 'This email address is not registered in our system.' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP Endpoint
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM password_resets WHERE email = $1 AND token = $2 AND expires_at > NOW()',
      [email, otp]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ valid: true, message: 'OTP verified successfully.' });
    } else {
      res.status(400).json({ valid: false, error: 'Invalid or expired verification code.' });
    }
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Backward compatible Check Email Endpoint
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.query('DELETE FROM password_resets WHERE email = $1', [email]);
      await db.query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
        [email, otp, expiresAt]
      );

      await sendOtpEmail(email, otp);
      res.status(200).json({ exists: true, message: 'Verification OTP code generated.' });
    } else {
      res.status(404).json({ exists: false, error: 'This email address is not registered in our system.' });
    }
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password Endpoint
app.post('/api/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json({ error: 'Email, reset token, and new password are required.' });
  }

  try {
    // Check if token exists, matches email, and is not expired
    const tokenRes = await db.query(
      'SELECT * FROM password_resets WHERE email = $1 AND token = $2 AND expires_at > NOW()',
      [email, token]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset link. Please request a new one.' });
    }

    // Update password
    await db.query('UPDATE users SET password = $1 WHERE email = $2', [password, email]);

    // Delete token so it cannot be used again
    await db.query('DELETE FROM password_resets WHERE email = $1', [email]);

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Session validation check endpoint
app.get('/api/session-check', getUserId, (req, res) => {
  res.status(200).json({ valid: true });
});

// Logout endpoint to remove session from database
app.post('/api/logout', getUserId, async (req, res) => {
  try {
    await db.query('DELETE FROM user_sessions WHERE user_id = $1', [req.userId]);
    res.status(200).json({ message: 'Session logged out successfully' });
  } catch (err) {
    console.error('Logout API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to extract and validate user ID and session token
async function getUserId(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const sessionToken = req.headers['x-session-token'] || req.query.sessionToken;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID required' });
  }
  req.userId = parseInt(userId, 10);
  if (isNaN(req.userId)) {
    return res.status(400).json({ error: 'Invalid User ID' });
  }

  // Enforce session validation
  try {
    const sessionRes = await db.query(
      'SELECT session_token FROM user_sessions WHERE user_id = $1',
      [req.userId]
    );
    if (sessionRes.rows.length > 0) {
      if (!sessionToken || sessionRes.rows[0].session_token !== sessionToken) {
        return res.status(401).json({ error: 'Session invalidated: Account logged in on another device or browser.' });
      }
      
      // Update last activity
      await db.query(
        'UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE user_id = $1',
        [req.userId]
      );
    }
  } catch (err) {
    console.error('Session validation error in getUserId:', err);
  }

  next();
}

// Get all tracked brands for the user
app.get('/api/brands', getUserId, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.region, c.last_status as status, c.last_viewed_at,
              COALESCE(c.is_active, true) as is_active,
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

// Get competitor mentions for two keywords globally
app.get('/api/competitor-mentions', getUserId, async (req, res) => {
  const { keyword1, keyword2 } = req.query;
  if (!keyword1 || !keyword2) {
    return res.status(400).json({ error: 'Two keywords are required' });
  }

  try {
    const getMentionsForKeyword = async (keyword) => {
      const cleanKeyword = keyword.trim();
      // First, check if there is a company matching this name globally
      const compRes = await db.query(
        'SELECT id, mentions FROM companies WHERE LOWER(name) = LOWER($1)',
        [cleanKeyword]
      );
      
      if (compRes.rows.length > 0) {
        let total = 0;
        for (const row of compRes.rows) {
          total += parseInt(row.mentions, 10) || 0;
        }
        return total;
      }

      // Fallback: full-body FTS search on nexus_articles using GIN index
      const articleRes = await db.query(
        `SELECT COUNT(*) as count
         FROM nexus_articles a
         WHERE to_tsvector('simple', coalesce(a.full_body,'')) @@ plainto_tsquery('simple', $1)`,
        [cleanKeyword]
      );
      return parseInt(articleRes.rows[0].count, 10) || 0;
    };

    const count1 = await getMentionsForKeyword(keyword1);
    const count2 = await getMentionsForKeyword(keyword2);

    res.status(200).json({
      comp1: { name: keyword1, mentions: count1 },
      comp2: { name: keyword2, mentions: count2 }
    });
  } catch (err) {
    console.error('Error in GET /api/competitor-mentions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Weighted sentiment scores: positive values = positive signal, negative = negative signal
const _SENT_SCORES = {
  // Strong positive (+2)
  'soars':2,'soar':2,'surges':2,'surge':2,'record':2,'breakthrough':2,'wins':2,'won':2,
  'profit':2,'profits':2,'beats':2,'beat':2,'outperforms':2,'milestone':2,'landmark':2,
  'revolutionary':2,'pioneer':2,'dominates':2,'awarded':2,'award':2,'historic':2,
  'booming':2,'boom':2,'jumps':2,'climbs':2,'skyrockets':2,'rallies':2,
  // Mild positive (+1)
  'launch':1,'launches':1,'launched':1,'launches':1,'growth':1,'grows':1,'grew':1,
  'innovation':1,'innovative':1,'expands':1,'expansion':1,'success':1,'successful':1,
  'leading':1,'leads':1,'lead':1,'partnership':1,'deal':1,'invest':1,'investment':1,
  'upgrade':1,'rise':1,'rising':1,'rises':1,'gain':1,'gains':1,'gained':1,
  'strong':1,'strengthen':1,'boost':1,'boosts':1,'boosted':1,'surpass':1,'surpasses':1,
  'top':1,'best':1,'first':1,'ahead':1,'dominant':1,'trusted':1,'recognized':1,'recognised':1,
  'revenue':1,'agreement':1,'approved':1,'approves':1,'new':1,'accelerates':1,'accelerate':1,
  'momentum':1,'opportunity':1,'opportunities':1,'expand':1,'grows':1,'positive':1,
  'confident':1,'strong':1,'healthy':1,'steady':1,'improved':1,'improves':1,'improve':1,
  'celebrates':1,'celebrate':1,'major':1,'key':1,'significant':1,'landmark':1,
  // Strong negative (-2)
  'lawsuit':-2,'sued':-2,'sues':-2,'suing':-2,'fined':-2,'penalty':-2,'penalties':-2,
  'antitrust':-2,'breach':-2,'hacked':-2,'hack':-2,'scandal':-2,'crisis':-2,'fraud':-2,
  'violation':-2,'layoffs':-2,'layoff':-2,'fired':-2,'resign':-2,'resigned':-2,
  'plunges':-2,'plunge':-2,'slumps':-2,'slump':-2,'crashes':-2,'crash':-2,
  'ban':-2,'banned':-2,'blocked':-2,'probed':-2,'indicted':-2,'charges':-2,'charged':-2,
  'monopoly':-2,'cartel':-2,'corruption':-2,'misconduct':-2,'outage':-2,'investigation':-2,
  'misleading':-2,'misinformation':-2,'disinformation':-2,'manipulated':-2,
  // Mild negative (-1)
  'fine':-1,'sue':-1,'probe':-1,'concern':-1,'concerns':-1,'decline':-1,'declines':-1,
  'falls':-1,'fall':-1,'falling':-1,'drop':-1,'drops':-1,'dropped':-1,'loss':-1,'losses':-1,
  'fail':-1,'fails':-1,'failure':-1,'failed':-1,'block':-1,'controversy':-1,'controversial':-1,
  'risk':-1,'risks':-1,'warning':-1,'warns':-1,'warn':-1,'problem':-1,'problems':-1,
  'trouble':-1,'troubled':-1,'cut':-1,'cuts':-1,'cutting':-1,'delay':-1,'delayed':-1,
  'cancel':-1,'cancelled':-1,'canceled':-1,'miss':-1,'misses':-1,'missed':-1,
  'disappoints':-1,'disappointing':-1,'hurt':-1,'hurts':-1,'threat':-1,'threats':-1,
  'criticized':-1,'criticised':-1,'accused':-1,'accuses':-1,'error':-1,'bug':-1,
  'recall':-1,'leak':-1,'leaked':-1,'exposed':-1,'attack':-1,'attacked':-1,
  'underperforms':-1,'underperform':-1,'struggles':-1,'struggle':-1,
};

function _inferSentiment(title, summary) {
  const text = ((title || '') + ' ' + (summary || '')).toLowerCase();
  const words = text.split(/\W+/);
  let score = 0;
  for (const w of words) {
    score += (_SENT_SCORES[w] || 0);
  }
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

// Get competitor analysis telemetry (mentions, sentiment, sources, trends, reach) for two keywords globally
app.get('/api/competitor-analysis', getUserId, async (req, res) => {
  const { keyword1, keyword2, startDate, endDate, sector } = req.query;
  if (!keyword1 || !keyword2) {
    return res.status(400).json({ error: 'Two keywords are required' });
  }

  const SECTOR_MAP = { AI:'AI', TECH:'Tech', FOODS_DRINKS:'Foods & Drinks', HEALTHCARE:'Healthcare',
    TRAVEL:'Travel', CONSULTANCY:'Consultancies', STARTUP:'Startups', LIFESTYLE:'Lifestyle',
    POLICIES:'Policies', STOCK_MARKET:'Stock Market', REAL_ESTATE:'Real Estate',
    GOOGLE:'Google', EDUCATION:'Education', FINTECH:'Fintech', AUTOMOBILE:'Automobile', MEDIA:'Media & Entertainment',
    SPORTS:'sports', CLIMATE:'climate and environment', CLIMATE_ENVIRONMENT:'climate and environment',
    GEOPOLITICS:'geopolitics', WORLD_NEWS:'world news', MONEY_BUSINESS:'money and business',
    SCIENCE_SPACE:'science and space', GAMING:'gaming', POP_CULTURE:'pop culture', CREATOR_ECONOMY:'creator economy' };

  try {
    // Build dynamic date range (default: last 30 days)
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    const start = startDate ? new Date(startDate + 'T00:00:00') : (() => { const d = new Date(end); d.setDate(d.getDate() - 29); return d; })();
    const diffDays = Math.max(1, Math.ceil((end - start) / 86400000));
    const step = diffDays <= 45 ? 1 : 7;

    const trendDates = [], trendLabels = [];
    for (let i = 0; i <= diffDays; i += step) {
      const d = new Date(start); d.setDate(d.getDate() + i);
      if (d > end) break;
      trendDates.push(d.toISOString().split('T')[0]);
      trendLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const dbSector = sector && sector !== 'All' ? (SECTOR_MAP[sector.toUpperCase()] || null) : null;

    const getAnalysisForKeyword = async (keyword) => {
      const cleanKeyword = keyword.trim();
      const fn = cleanKeyword.includes(' ') ? 'phraseto_tsquery' : 'plainto_tsquery';
      const params = [cleanKeyword];
      let extra = '';
      if (startDate) { params.push(startDate); extra += ` AND a.published_at >= $${params.length}::date`; }
      if (endDate)   { params.push(endDate);   extra += ` AND a.published_at < ($${params.length}::date + INTERVAL '1 day')`; }
      if (dbSector)  { params.push(dbSector);  extra += ` AND a.sector = $${params.length}`; }

      // Always use nexus_articles for consistent cross-brand comparisons
      const queryText = `
        SELECT DISTINCT ON (LOWER(a.title))
               a.title, a.url AS link, a.agency AS source, a.sentiment, a.published_at AS created_at,
               a.region, a.sector,
               d.page_rank_decimal, d.rank
        FROM nexus_articles a
        LEFT JOIN domain_authority_cache d
          ON d.domain = regexp_replace(substring(a.url from 'https?://([^/]+)'), '^www\\.', '')
        WHERE to_tsvector('simple', coalesce(a.full_body,'')) @@ ${fn}('simple', $1)${extra}
        ORDER BY LOWER(a.title), a.published_at DESC
      `;

      const articleRes = await db.query(queryText, params);
      const rows = articleRes.rows;
      const mentionsCount = rows.length;

      const sentiment = { positive: 0, negative: 0, neutral: 0, unknown: 0 };
      const sourceMap = {};
      const trendMap = {};
      const regionMap = {};
      const sectorMap = {};
      trendDates.forEach(d => { trendMap[d] = 0; });

      let totalReach = 0, totalAgeDays = 0, ageCount = 0;
      const authorityTiers = { high: 0, mid: 0, low: 0 };
      const articleReaches = [];

      rows.forEach(row => {
        const sent = (row.sentiment || '').toLowerCase().trim();
        if (sent === 'positive') sentiment.positive++;
        else if (sent === 'negative') sentiment.negative++;
        else if (sent === 'neutral') sentiment.neutral++;
        else {
          const inferred = _inferSentiment(row.title, row.summary);
          sentiment[inferred]++;
        }

        const src = row.source || 'Unknown Source';
        sourceMap[src] = (sourceMap[src] || 0) + 1;

        const reg = (row.region || 'unknown').toLowerCase();
        regionMap[reg] = (regionMap[reg] || 0) + 1;

        const sec = row.sector || 'Other';
        sectorMap[sec] = (sectorMap[sec] || 0) + 1;

        if (row.created_at) {
          const rowDate = new Date(row.created_at);
          // Map to nearest trend bucket (step-aware)
          const rowDateStr = rowDate.toISOString().split('T')[0];
          let bucket = trendDates[0];
          for (let i = trendDates.length - 1; i >= 0; i--) {
            if (rowDateStr >= trendDates[i]) { bucket = trendDates[i]; break; }
          }
          if (bucket in trendMap) trendMap[bucket]++;
          const ageDays = (Date.now() - rowDate.getTime()) / (1000 * 60 * 60 * 24);
          totalAgeDays += ageDays; ageCount++;
        }

        let reach = 5000;
        let hostname = '';
        try { if (row.link) hostname = new URL(row.link).hostname.toLowerCase().replace('www.', ''); } catch(e) {}

        const pr = row.page_rank_decimal ? parseFloat(row.page_rank_decimal) : null;
        if (pr !== null) {
          reach = Math.floor(pr * 100000 + 5000);
          if (pr >= 5) authorityTiers.high++;
          else if (pr >= 2) authorityTiers.mid++;
          else authorityTiers.low++;
        } else {
          authorityTiers.low++;
          if (hostname && (hostname.includes('news') || hostname.includes('times') || hostname.includes('post') || hostname.includes('reuters') || hostname.includes('bloomberg'))) reach = 50000;
        }

        const sentLow = sent;
        if (sentLow === 'positive') reach = Math.floor(reach * 1.2);
        else if (sentLow === 'negative') reach = Math.floor(reach * 1.5);

        totalReach += reach;
        articleReaches.push({ title: row.title, link: row.link, source: src, sentiment: row.sentiment || 'Neutral', reach });
      });

      const sortedSources = Object.entries(sourceMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 5);
      const trendValues = trendDates.map(d => trendMap[d]);
      const avgArticleAgeDays = ageCount > 0 ? parseFloat((totalAgeDays / ageCount).toFixed(1)) : null;
      const topArticles = articleReaches.sort((a, b) => b.reach - a.reach).slice(0, 3);
      const coverageIntensityScore = Math.floor((totalReach / Math.max(mentionsCount, 1)) * (mentionsCount / Math.max(diffDays, 1)));
      const coverageVelocity = parseFloat((mentionsCount / Math.max(diffDays, 1)).toFixed(1));

      const regionBreakdown = {
        india: regionMap['india'] || 0,
        global: regionMap['global'] || 0,
        other: Object.entries(regionMap).filter(([k]) => k !== 'india' && k !== 'global' && k !== 'unknown').reduce((s, [, v]) => s + v, 0)
      };
      const topSectors = Object.entries(sectorMap)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      return { name: keyword, mentions: mentionsCount, sentiment, sources: sortedSources, trends: trendValues,
        avgArticleAgeDays, topArticles, sourceAuthorityTiers: authorityTiers, coverageIntensityScore,
        coverageVelocity, regionBreakdown, topSectors };
    };

    const [comp1Data, comp2Data] = await Promise.all([getAnalysisForKeyword(keyword1), getAnalysisForKeyword(keyword2)]);

    res.status(200).json({ comp1: comp1Data, comp2: comp2Data, trendLabels });
  } catch (err) {
    console.error('Error in GET /api/competitor-analysis:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System diagnostics endpoint for architecture / system flow visualization
app.get('/api/diagnostics', async (req, res) => {
  const start = Date.now();
  const diag = {
    database: { status: 'offline', latency: 0, rows: {} },
    scraper: { status: 'online', version: 'Stealth-v5', engine: 'Puppeteer/RSS-Parser' },
    system: {
      uptime: process.uptime(),
      platform: process.platform,
      memory: process.memoryUsage(),
      nodeVersion: process.version
    }
  };

  try {
    const dbRes = await db.query('SELECT NOW()');
    diag.database.status = 'online';
    diag.database.latency = Date.now() - start;

    // Get count statistics for key tables
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const companyCount = await db.query('SELECT COUNT(*) FROM companies');
    const articleCount = await db.query('SELECT COUNT(*) FROM articles');
    const reportCount = await db.query('SELECT COUNT(*) FROM reports');
    let licenseCountVal = 0;
    try {
      const licenseCount = await db.query('SELECT COUNT(*) FROM license_keys');
      licenseCountVal = parseInt(licenseCount.rows[0].count);
    } catch (e) {}

    diag.database.rows = {
      users: parseInt(userCount.rows[0].count),
      companies: parseInt(companyCount.rows[0].count),
      articles: parseInt(articleCount.rows[0].count),
      reports: parseInt(reportCount.rows[0].count),
      license_keys: licenseCountVal
    };
  } catch (err) {
    console.error('Diagnostics DB check failed:', err);
    diag.database.status = 'error';
    diag.database.error = err.message;
  }

  res.status(200).json(diag);
});

// Get all unique company names tracked globally in the system
app.get('/api/global-company-names', async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT name FROM companies ORDER BY name');
    const names = result.rows.map(r => r.name);
    res.status(200).json(names);
  } catch (err) {
    console.error('Error in GET /api/global-company-names:', err);
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

// Stop or resume tracking a brand (toggle is_active)
app.patch('/api/brands/:id/active', getUserId, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }
  try {
    const check = await db.query('SELECT id FROM companies WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Brand not found' });
    await db.query('UPDATE companies SET is_active = $1 WHERE id = $2', [is_active, id]);
    res.status(200).json({ message: is_active ? 'Tracking resumed' : 'Tracking stopped' });
  } catch (err) {
    console.error('Error in PATCH /api/brands/:id/active:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Brand mention history — daily counts for last 60 days
app.get('/api/brands/:id/history', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const brandRes = await db.query('SELECT name FROM companies WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (brandRes.rows.length === 0) return res.status(404).json({ error: 'Brand not found' });

    const brandName = brandRes.rows[0].name;

    const history = await db.query(
      `SELECT DATE(published_at) as date, COUNT(*)::int as count
       FROM nexus_articles
       WHERE to_tsvector('simple', coalesce(full_body,'') || ' ' || coalesce(title,'')) @@ plainto_tsquery('simple', $1)
         AND published_at >= NOW() - INTERVAL '60 days'
       GROUP BY DATE(published_at)
       ORDER BY date ASC`,
      [brandName]
    );

    const topSources = await db.query(
      `SELECT agency AS source, COUNT(*)::int as count
       FROM nexus_articles
       WHERE to_tsvector('simple', coalesce(full_body,'') || ' ' || coalesce(title,'')) @@ plainto_tsquery('simple', $1)
         AND agency IS NOT NULL
         AND published_at >= NOW() - INTERVAL '60 days'
       GROUP BY agency
       ORDER BY count DESC
       LIMIT 8`,
      [brandName]
    );

    res.status(200).json({
      name: brandName,
      timeline: history.rows,
      topSources: topSources.rows
    });
  } catch (err) {
    console.error('Error in GET /api/brands/:id/history:', err);
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

// Get articles for a brand — merges tracked RSS feed + full NEXUS pool (no date cap)
app.get('/api/brands/:id/articles', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const brandRes = await db.query('SELECT name FROM companies WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (brandRes.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    const brandName = brandRes.rows[0].name;

    // Tracked RSS articles (full history)
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
       ORDER BY a.published_at DESC`,
      [id]
    );

    // Full NEXUS pool — all articles mentioning this brand, no date cap, no row limit
    let nexusRows = [];
    try {
      const nexusRes = await db.query(
        `SELECT
           'nexus-' || id::text AS id,
           title,
           url AS link,
           published_at,
           agency AS source,
           COALESCE(summary, '') AS summary,
           'Neutral' AS sentiment,
           published_at AS created_at,
           NULL::timestamptz AS last_ping_time
         FROM nexus_articles
         WHERE to_tsvector('simple', coalesce(full_body,'') || ' ' || coalesce(title,'')) @@ plainto_tsquery('simple', $1)
         ORDER BY published_at DESC
         LIMIT 500`,
        [brandName]
      );
      nexusRows = nexusRes.rows;
    } catch (nexusErr) {
      console.error('[brands/:id/articles] nexus query failed:', nexusErr.message);
    }

    // Merge & deduplicate by lowercased title
    const seen = new Set();
    const merged = [];
    for (const a of articlesRes.rows) {
      const key = (a.title || '').toLowerCase().trim();
      if (!seen.has(key)) { seen.add(key); merged.push(a); }
    }
    for (const a of nexusRows) {
      const key = (a.title || '').toLowerCase().trim();
      if (!seen.has(key)) { seen.add(key); merged.push(a); }
    }
    merged.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    res.status(200).json(merged);
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
  const { targetKeywords, excludedKeywords, topic, startDate, endDate } = req.body;
  try {
    const analyzer = require('./analyzer');
    const results = await analyzer.analyzeSpecificBrands({ targetKeywords, excludedKeywords, topic, startDate, endDate });
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

// --- Cleo Sector Intent Helpers ---
function detectSectorIntent(msg) {
  const m = ' ' + msg.toLowerCase() + ' ';

  // Time range
  let days = 7;
  if (/today|24 hour/.test(m))                                           days = 1;
  else if (/yesterday/.test(m))                                          days = 2;
  else if (/3 days|three days/.test(m))                                  days = 3;
  else if (/last\s*14|two weeks|14 days/.test(m))                        days = 14;
  else if (/last\s*month|this month|30 days|one month/.test(m))          days = 30;
  else if (/week|7 days|seven days/.test(m))                             days = 7;

  // Specific date range: "from july 21 to july 27" or "21 july to 27 july"
  const monthMap = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
  const dateRangeMatch = m.match(/(?:from\s+)?(\d{1,2})\s*(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(?:to|till|until|-)\s*(\d{1,2})\s*(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/i)
                    || m.match(/(?:from\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})\s*(?:to|till|until|-)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/i);

  let startDate = null, endDate = null;
  if (dateRangeMatch) {
    try {
      const year = new Date().getFullYear();
      const d1 = parseInt(dateRangeMatch[1]), m1 = monthMap[dateRangeMatch[2].toLowerCase().slice(0,3)];
      const d2 = parseInt(dateRangeMatch[3]), m2 = monthMap[dateRangeMatch[4].toLowerCase().slice(0,3)];
      startDate = `${year}-${String(m1).padStart(2,'0')}-${String(d1).padStart(2,'0')}`;
      endDate   = `${year}-${String(m2).padStart(2,'0')}-${String(d2).padStart(2,'0')}`;
    } catch(_) {}
  }

  // Single date: "31 july", "july 31", "31st july", "aug 4", "4 august 2026", etc.
  if (!startDate) {
    const singleDate = m.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/i)
                    || m.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if (singleDate) {
      try {
        let day, mon;
        if (/^\d/.test(singleDate[1])) { day = parseInt(singleDate[1]); mon = monthMap[singleDate[2].toLowerCase().slice(0,3)]; }
        else { mon = monthMap[singleDate[1].toLowerCase().slice(0,3)]; day = parseInt(singleDate[2]); }
        const year = new Date().getFullYear();
        const dateStr = `${year}-${String(mon).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        startDate = dateStr; endDate = dateStr; days = 1;
      } catch(_) {}
    }
  }

  // Sector detection
  const sectorMap = [
    { keys: [' tech ',' technology ',' software ',' it sector '],                  sector: 'Tech' },
    { keys: [' ai ',' artificial intelligence ',' machine learning ',' llm '],      sector: 'AI' },
    { keys: [' fintech ',' fin tech ',' financial tech ',' banking ',' payment '],  sector: 'Fintech' },
    { keys: [' health ',' medical ',' pharma ',' hospital ',' healthcare '],        sector: 'Healthcare' },
    { keys: [' travel ',' tourism ',' airline ',' hotel '],                         sector: 'Travel' },
    { keys: [' food ',' drink ',' restaurant ',' beverage ',' fmcg '],             sector: 'Foods & Drinks' },
    { keys: [' lifestyle ',' fashion ',' beauty ',' wellness '],                    sector: 'Lifestyle' },
    { keys: [' polic ',' regulation ',' government ',' ministry '],                sector: 'Policies' },
    { keys: [' startup ',' venture ',' seed round ',' funding '],                  sector: 'Startups' },
    { keys: [' consult ',' advisory '],                                             sector: 'Consultancies' },
    { keys: [' real estate ',' property ',' realty ',' housing '],                 sector: 'Real Estate' },
    { keys: [' stock market ',' sensex ',' nifty ',' share market ',' equity '],   sector: 'Stock Market' },
    { keys: [' education ',' edtech ',' learning ',' university ',' school '],     sector: 'Education' },
    { keys: [' automobile ',' automotive ',' ev ',' electric vehicle ',' car '],   sector: 'Automobile' },
    { keys: [' media ',' entertainment ',' ott ',' streaming ',' cinema '],        sector: 'Media & Entertainment' },
  ];

  for (const { keys, sector } of sectorMap) {
    if (keys.some(k => m.includes(k))) return { sector, days, startDate, endDate };
  }
  return null;
}

async function fetchSectorSummariesForCleo(sector, days, region, startDate, endDate) {
  try {
    // Try preferred region first, then fall back to 'overall', then any region
    const regionFallbacks = region === 'overall'
      ? ['overall', 'india', 'global']
      : [region, 'overall', 'india', 'global'];

    for (const r of regionFallbacks) {
      let query, params;
      if (startDate && endDate) {
        query = `SELECT date, summary_text, top_topics, headline_count, publication_region
                 FROM nexus_sector_summaries
                 WHERE sector ILIKE $1 AND publication_region = $2
                   AND date BETWEEN $3 AND $4
                 ORDER BY date DESC LIMIT 30`;
        params = [sector, r, startDate, endDate];
      } else {
        query = `SELECT date, summary_text, top_topics, headline_count, publication_region
                 FROM nexus_sector_summaries
                 WHERE sector ILIKE $1 AND publication_region = $2
                   AND date >= CURRENT_DATE - ($3 || ' days')::INTERVAL
                 ORDER BY date DESC LIMIT 30`;
        params = [sector, r, String(days)];
      }
      const result = await db.query(query, params);
      if (result.rows.length > 0) return result.rows;
    }

    // Last resort: any region, broader sector match (e.g. 'AI' also matches 'Artificial Intelligence')
    const broadQuery = startDate && endDate
      ? `SELECT date, summary_text, top_topics, headline_count, publication_region
         FROM nexus_sector_summaries
         WHERE (sector ILIKE $1 OR sector ILIKE $2) AND date BETWEEN $3 AND $4
         ORDER BY date DESC LIMIT 30`
      : `SELECT date, summary_text, top_topics, headline_count, publication_region
         FROM nexus_sector_summaries
         WHERE (sector ILIKE $1 OR sector ILIKE $2)
           AND date >= CURRENT_DATE - ($3 || ' days')::INTERVAL
         ORDER BY date DESC LIMIT 30`;
    const broadParams = startDate && endDate
      ? [`%${sector}%`, `%${sector.split(' ')[0]}%`, startDate, endDate]
      : [`%${sector}%`, `%${sector.split(' ')[0]}%`, String(days)];
    const broadResult = await db.query(broadQuery, broadParams);
    return broadResult.rows;
  } catch (_) {
    return [];
  }
}

// --- Cleo AI Chatbot Endpoint ---
app.post('/api/cleo/chat', getUserId, async (req, res) => {
  const { message, history, dashboardStats, activeTab, keywordContext, competitorContext, reportContext, brandContext } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    // 1. Fetch all tracked brands with sentiment breakdown
    const companiesRes = await db.query(
      'SELECT id, name, region, mentions, last_status, is_active FROM companies WHERE user_id = $1 ORDER BY mentions DESC',
      [req.userId]
    );
    const companies = companiesRes.rows;

    // 2. Fetch recent articles per brand with sentiment
    const articlesRes = await db.query(
      `SELECT a.title, a.source, a.sentiment, a.published_at, c.name as company_name
       FROM articles a
       JOIN companies c ON a.company_id = c.id
       WHERE c.user_id = $1
       ORDER BY a.created_at DESC LIMIT 30`,
      [req.userId]
    );
    const articles = articlesRes.rows;

    // 3. Fetch all reports with full content
    const reportsRes = await db.query(
      'SELECT id, title, type, status, topic, keywords, brand_keywords, competitor_keywords, summary, sections, created_at FROM reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.userId]
    );
    const reports = reportsRes.rows;

    // 4. Sentiment breakdown per brand from articles
    const brandSentiment = {};
    for (const a of articles) {
      if (!brandSentiment[a.company_name]) brandSentiment[a.company_name] = { Positive: 0, Neutral: 0, Negative: 0 };
      if (a.sentiment) brandSentiment[a.company_name][a.sentiment] = (brandSentiment[a.company_name][a.sentiment] || 0) + 1;
    }

    // 5. Build tab context description
    const tabDescriptions = {
      'dashboard': 'Dashboard — overview of all metrics and activity',
      'keyword-search': 'Keyword Analysis — searching and analyzing keyword exposure across news corpus',
      'brand-tracker': 'Brand Tracker — monitoring tracked brands for mentions and sentiment',
      'competitor-analysis': 'Competitor Analysis — comparing two brands head-to-head',
      'report-analysis': 'Report Analysis — viewing and editing intelligence reports',
      'article-reach': 'Article Reach — analyzing publication authority and reach scores',
      'settings': 'Settings — account and platform configuration',
      'help': 'Help — documentation and platform guide'
    };
    const currentTabDesc = activeTab ? (tabDescriptions[activeTab] || activeTab) : 'Unknown tab';

    // 6. Build keyword analysis section
    let keywordSection = 'No keyword analysis has been run in this session.';
    if (keywordContext) {
      keywordSection = `Last keyword search: Brands/Keywords="${keywordContext.query}", Sector=${keywordContext.sector}, Date Range=${keywordContext.dateRange}, Total Sector Articles=${keywordContext.totalSectorArticles}
Results: ${keywordContext.brandsSummary}
Top Indian Publications: ${keywordContext.topIndianPublications || 'None'}`;
    }

    // 7. Build competitor analysis section
    let competitorSection = 'No competitor analysis has been run in this session.';
    if (competitorContext) {
      competitorSection = `Comparing: "${competitorContext.comp1}" vs "${competitorContext.comp2}"
${competitorContext.comp1}: ${competitorContext.comp1Mentions} mentions
${competitorContext.comp2}: ${competitorContext.comp2Mentions} mentions
${competitorContext.shareOfVoice ? `Share of Voice: ${JSON.stringify(competitorContext.shareOfVoice)}` : ''}`;
    }

    // 8. Build current report section
    let reportSection = 'No report is currently open.';
    if (reportContext) {
      reportSection = `Currently viewing report: "${reportContext.title}" (Type: ${reportContext.type}, Status: ${reportContext.status})
Brand Keywords: ${reportContext.brandKeywords || 'N/A'} | Competitor Keywords: ${reportContext.competitorKeywords || 'N/A'}
Sections: ${reportContext.sections?.length > 0 ? reportContext.sections.join(' | ') : 'No sections'}
Charts in this report (${reportContext.charts?.length || 0}): ${reportContext.charts?.length > 0 ? reportContext.charts.join('; ') : 'None'}`;
    }

    // 9. Build brand detail section
    let brandDetailSection = 'No brand is currently selected in Brand Tracker.';
    if (brandContext) {
      const sent = brandSentiment[brandContext.name];
      brandDetailSection = `Currently viewing brand: "${brandContext.name}" (Region: ${brandContext.region}, Total Mentions: ${brandContext.mentions}, Status: ${brandContext.status}, Tracking: ${brandContext.isActive ? 'Active' : 'Paused'})
Sentiment from recent articles: Positive=${sent?.Positive||0}, Neutral=${sent?.Neutral||0}, Negative=${sent?.Negative||0}`;
    }

    // 10. All reports summary (with sections + charts)
    const reportsSummary = reports.length > 0
      ? reports.map((r, i) => {
          const sections = Array.isArray(r.sections) ? r.sections : (typeof r.sections === 'string' ? JSON.parse(r.sections || '[]') : []);
          const allCharts = sections.flatMap(s => (s.charts || []).map(c => `${c.type || 'Chart'}${c.field ? ' of ' + c.field : ''}${c.label ? ' ("' + c.label + '")' : ''} in "${s.title || 'Section'}"`));
          const chartsLine = allCharts.length > 0 ? `\n     Charts (${allCharts.length}): ${allCharts.join('; ')}` : '\n     No charts yet.';
          return `${i + 1}. "${r.title}" (${r.type}, ${r.status}, Keywords: ${r.brand_keywords || r.keywords || 'N/A'}, ${sections.length} sections)${chartsLine}`;
        }).join('\n  ')
      : 'No reports created yet.';

    // 11. All brands summary
    const brandsSummary = companies.length > 0
      ? companies.map(c => {
          const sent = brandSentiment[c.name];
          return `${c.name} (${c.region}, Mentions: ${c.mentions||0}, ${c.is_active !== false ? 'Active' : 'Paused'}, Pos=${sent?.Positive||0}/Neu=${sent?.Neutral||0}/Neg=${sent?.Negative||0})`;
        }).join('\n  ')
      : 'No brands tracked yet.';

    // 12. Detect sector intent and fetch live summaries
    let sectorSummarySection = '';
    const intent = detectSectorIntent(message);
    if (intent) {
      const msgLower = message.toLowerCase();
      const region = msgLower.includes('india') || msgLower.includes('indian') ? 'india'
                   : (msgLower.includes('global') || msgLower.includes('world') || msgLower.includes('international')) ? 'global'
                   : 'overall';
      const rows = await fetchSectorSummariesForCleo(intent.sector, intent.days, region, intent.startDate, intent.endDate);
      if (rows.length > 0) {
        const rangeLabel = intent.startDate && intent.endDate
          ? `${intent.startDate} to ${intent.endDate}`
          : `last ${intent.days} day(s)`;

        let summaryText = '';

        if (intent.days <= 7) {
          // Daily view for short ranges
          summaryText = rows.map(r => {
            const topics = Array.isArray(r.top_topics)
              ? r.top_topics.slice(0, 5).map(([t, c]) => `${t}(${c})`).join(', ')
              : '';
            return `[${r.date}] ${(r.summary_text || '').slice(0, 400)}${topics ? '\nTop topics: ' + topics : ''}`;
          }).join('\n\n');
        } else {
          // Week-grouped view for longer ranges (14, 30 days)
          const weeks = {};
          for (const r of rows) {
            const d = new Date(r.date);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const key = weekStart.toISOString().split('T')[0];
            if (!weeks[key]) weeks[key] = { headlines: 0, topics: {}, snippet: '' };
            weeks[key].headlines += r.headline_count || 0;
            if (!weeks[key].snippet && r.summary_text) weeks[key].snippet = r.summary_text.slice(0, 300);
            if (Array.isArray(r.top_topics)) {
              for (const [topic, count] of r.top_topics) {
                weeks[key].topics[topic] = (weeks[key].topics[topic] || 0) + count;
              }
            }
          }
          summaryText = Object.entries(weeks)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([weekStart, data]) => {
              const topTopics = Object.entries(data.topics)
                .sort((a, b) => b[1] - a[1]).slice(0, 5)
                .map(([t, c]) => `${t}(${c})`).join(', ');
              return `[Week of ${weekStart}] Total headlines: ${data.headlines}\nTop topics: ${topTopics}\nHighlight: ${data.snippet}`;
            }).join('\n\n');
        }

        sectorSummarySection = `\n\n=== LIVE ${intent.sector.toUpperCase()} NEWS SUMMARIES (${rangeLabel}, region: ${region}) ===\n${summaryText}\n(Answer using ONLY the above data — do not guess or use training knowledge for current events.)`;
      } else {
        // No pre-built summaries — fall back to querying nexus_articles directly
        try {
          let articleQuery, articleParams;
          if (intent.startDate && intent.endDate) {
            articleQuery = `
              SELECT title, agency, published_at::date AS date, sentiment, summary, region
              FROM nexus_articles
              WHERE (sector ILIKE $1 OR sector ILIKE $2)
                AND published_at::date BETWEEN $3 AND $4
              ORDER BY published_at DESC LIMIT 60`;
            articleParams = [`%${intent.sector}%`, `%${intent.sector.split(' ')[0]}%`, intent.startDate, intent.endDate];
          } else {
            articleQuery = `
              SELECT title, agency, published_at::date AS date, sentiment, summary, region
              FROM nexus_articles
              WHERE (sector ILIKE $1 OR sector ILIKE $2)
                AND published_at >= CURRENT_DATE - ($3 || ' days')::INTERVAL
              ORDER BY published_at DESC LIMIT 60`;
            articleParams = [`%${intent.sector}%`, `%${intent.sector.split(' ')[0]}%`, String(intent.days)];
          }
          const artResult = await db.query(articleQuery, articleParams);
          if (artResult.rows.length > 0) {
            const rangeLabel2 = intent.startDate && intent.endDate
              ? `${intent.startDate} to ${intent.endDate}`
              : `last ${intent.days} day(s)`;
            const sentCount = { positive: 0, negative: 0, neutral: 0 };
            const sourceCount = {};
            for (const r of artResult.rows) {
              const s = (r.sentiment || '').toLowerCase();
              if (s === 'positive') sentCount.positive++;
              else if (s === 'negative') sentCount.negative++;
              else sentCount.neutral++;
              const src = r.agency || 'Unknown';
              sourceCount[src] = (sourceCount[src] || 0) + 1;
            }
            const topSources = Object.entries(sourceCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([s,c])=>`${s}(${c})`).join(', ');
            const headlines = artResult.rows.slice(0, 15).map(r => `- "${r.title}" [${r.agency||'Unknown'}, ${r.date}]`).join('\n');
            sectorSummarySection = `\n\n=== LIVE ${intent.sector.toUpperCase()} ARTICLES (${rangeLabel2}, ${artResult.rows.length} articles) ===
Total: ${artResult.rows.length} articles | Positive: ${sentCount.positive} | Neutral: ${sentCount.neutral} | Negative: ${sentCount.negative}
Top Sources: ${topSources}
Headlines:
${headlines}
(Answer using ONLY the above data. These are real articles from the database for this sector and date range.)`;
          }
        } catch (_) {}
      }
    }

    // 13. Construct full system prompt
    const systemMessage = {
      role: 'system',
      content: `You are Cleo, an autonomous PR and brand intelligence assistant for the Cerebro platform. You have full visibility into the user's workspace and can answer any question about their data, activity, and platform features.

=== USER'S CURRENT LOCATION ===
Active Tab: ${currentTabDesc}

=== DASHBOARD STATS ===
- Keywords Tracked: ${dashboardStats?.totalKeywords ?? 0}
- Reports Created: ${dashboardStats?.totalReports ?? 0}
- Active Brands: ${dashboardStats?.activeBrands ?? 0}

=== ALL TRACKED BRANDS ===
  ${brandsSummary}

=== CURRENT BRAND DETAIL VIEW ===
${brandDetailSection}

=== KEYWORD ANALYSIS (current session) ===
${keywordSection}

=== COMPETITOR ANALYSIS (current session) ===
${competitorSection}

=== CURRENT OPEN REPORT ===
${reportSection}

=== ALL REPORTS (latest 10) ===
  ${reportsSummary}

=== RECENT BRAND ARTICLES (last 30) ===
${articles.length > 0 ? articles.slice(0,20).map(a => `- "${a.title}" | Source: ${a.source} | Sentiment: ${a.sentiment} | Brand: ${a.company_name} | Date: ${a.published_at||'N/A'}`).join('\n') : 'No articles found.'}

${sectorSummarySection}
=== INSTRUCTIONS ===
1. Answer any question about the user's workspace using the data above — brands, articles, reports, keyword analysis, competitor analysis, or platform navigation.
1a. If LIVE SECTOR NEWS SUMMARIES are provided above, use them to answer sector/industry questions accurately with real recent data.
2. Be concise, direct, and professional. Use bullet points for data-heavy answers.
3. If asked about current tab activity, reference the Active Tab above.
4. If asked how to do something in the app, give clear step-by-step guidance (e.g. "Go to Brand Tracker tab → click Add Brand").
5. If asked about sentiment, mention counts, or coverage — pull from the live data above.
6. Keep tone slightly witty, highly competent, and encouraging.
7. If data is missing or empty, tell the user how to generate it (run a keyword search, add a brand, create a report).`
    };

    // 13. Build messages array
    const messages = [systemMessage];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const h of recentHistory) {
        if (h.isTyping) continue;
        messages.push({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text });
      }
    }
    messages.push({ role: 'user', content: message.trim() });

    // 14. Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 700
    });

    const reply = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    res.json({ reply });
  } catch (err) {
    console.error('[Cleo Chat Error]:', err);
    res.status(500).json({ error: 'Failed to communicate with Cleo AI: ' + err.message });
  }
});

// Dynamic Chart Generation — Groq generates full Chart.js config with real brand data
app.post('/api/ai/chart-dynamic', getUserId, async (req, res) => {
  const { prompt, brandData } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const brandSummary = brandData
    ? Object.entries(brandData).map(([name, d]) => {
        const s = d.sentiment || {};
        return `${name}: mentions=${d.mentions || 0}, articles=${d.articles || 0}, positive=${s.Positive || 0}, neutral=${s.Neutral || 0}, negative=${s.Negative || 0}`;
      }).join('\n')
    : 'No brand data provided';

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a Chart.js v4 config generator. Return ONLY a raw JSON object — no markdown, no text, no code fences.

Required JSON structure:
{ "type": "...", "data": { "labels": [...], "datasets": [...] }, "options": { "responsive": true, "maintainAspectRatio": false, "plugins": { "legend": { "position": "bottom" }, "title": { "display": true, "text": "..." } } } }

STRICT RULES — read carefully:
1. "type" must be exactly one of: bar, line, pie, doughnut, radar, scatter, bubble, polarArea
2. Horizontal bar → type "bar", add "indexAxis": "y" in options
3. Stacked bar → type "bar", add options.scales = { "x": { "stacked": true }, "y": { "stacked": true } }
4. Area chart → type "line", set "fill": true on EACH dataset
5. For ANY chart with date/time labels (bar or line) → ALWAYS use "category" axis: options.scales.x = { "type": "category" }. NEVER set type:"time" on any axis — no time adapter is installed.
6. scatter and bubble → create ONE dataset PER BRAND (each brand = separate dataset with its own "label" and "backgroundColor" string), each dataset has ONE data point: { "x": <actual_count>, "y": <actual_count>, "r": 8 }. NEVER put all brands in one dataset for scatter/bubble.
7. All numbers must be ACTUAL counts from brand data — never use ratios, percentages, or values between 0 and 1 unless the metric is a ratio
8. backgroundColor for scatter/bubble must be a single color STRING per dataset, not an array
9. Never use null, undefined, or empty arrays for data

Brand data (use these exact numbers):
${brandSummary}`
        },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.3,
      max_tokens: 1200
    });

    const parseGroqJson = (content) => {
      const raw = (content || '').trim();
      // Try to find outermost { } in case model wraps with text/code fences
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON object found in response');
      return JSON.parse(raw.slice(start, end + 1));
    };

    let config;
    try {
      config = parseGroqJson(completion.choices[0]?.message?.content);
    } catch {
      // One retry on parse failure
      const retry = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: `Return ONLY raw JSON with keys: type, data, options. No markdown, no text. Chart.js v4 format. Brand data:\n${brandSummary}` },
          { role: 'user', content: prompt }
        ],
        model: 'openai/gpt-oss-120b',
        temperature: 0.1,
        max_tokens: 1200
      });
      config = parseGroqJson(retry.choices[0]?.message?.content);
    }

    if (!config.type || !config.data || !Array.isArray(config.data.datasets)) {
      return res.status(500).json({ error: 'AI returned invalid chart config' });
    }

    // Normalize type — model outputs many variants, map all to valid Chart.js v4 types
    const VALID_TYPES = ['bar', 'line', 'pie', 'doughnut', 'radar', 'scatter', 'bubble', 'polarArea'];
    const rawType = (config.type || '').toString().trim();
    const t = rawType.toLowerCase().replace(/[\s_-]/g, '');
    config.options = config.options || {};
    config.options.scales = config.options.scales || {};

    if (t.includes('horizontal') || t === 'hbar') {
      config.type = 'bar';
      config.options.indexAxis = 'y';
    } else if (t.includes('stacked')) {
      config.type = 'bar';
      config.options.scales = { x: { stacked: true }, y: { stacked: true } };
    } else if (t === 'area' || t === 'areachart') {
      config.type = 'line';
      config.data.datasets.forEach(ds => { ds.fill = true; });
    } else if (['bubblechart','bubbleplot','bubbles'].includes(t)) config.type = 'bubble';
    else if (['linechart','linegraph'].includes(t)) config.type = 'line';
    else if (['barchart','columnchart','column','bargraph'].includes(t)) config.type = 'bar';
    else if (['piechart','pie_chart'].includes(t)) config.type = 'pie';
    else if (['donut','doughnutchart','donutchart'].includes(t)) config.type = 'doughnut';
    else if (['radarchart','spider','spiderchart','webchart'].includes(t)) config.type = 'radar';
    else if (['scatterchart','scatterplot','scattergraph'].includes(t)) config.type = 'scatter';
    else if (['polararea','polarchart','polarareal','polar'].includes(t)) config.type = 'polarArea';
    else if (!VALID_TYPES.includes(rawType)) config.type = 'bar';

    // Bar and line/area charts with date labels: force category scale.
    // Also nuke any explicit type:'time' on any axis — no time adapter is installed.
    if (config.options.scales) {
      for (const axisKey of Object.keys(config.options.scales)) {
        const axis = config.options.scales[axisKey];
        if (axis && axis.type === 'time') axis.type = 'category';
      }
    }
    if (config.type === 'line' || config.type === 'bar') {
      const existing = config.options.scales.x || {};
      config.options.scales.x = { ...existing, type: 'category' };
    }

    // Non-cartesian charts don't use scales — strip them to avoid Chart.js warnings/crashes
    if (['pie', 'doughnut', 'polarArea'].includes(config.type)) {
      delete config.options.scales;
    }

    // Scatter/bubble: fix common issue where model uses ratio values (0-1) instead of counts
    // Also ensure each dataset has proper backgroundColor string (not array)
    if (config.type === 'scatter' || config.type === 'bubble') {
      config.data.datasets = config.data.datasets.map(ds => ({
        ...ds,
        backgroundColor: Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : (ds.backgroundColor || '#6366f1'),
        data: Array.isArray(ds.data) ? ds.data.map(pt => {
          if (typeof pt === 'object' && pt !== null && 'x' in pt && 'y' in pt) return { x: pt.x, y: pt.y, r: pt.r || 8 };
          return pt;
        }) : [],
      }));
    }

    // Ensure every dataset.data is an array
    config.data.datasets = config.data.datasets.map(ds => ({
      ...ds,
      data: Array.isArray(ds.data) ? ds.data : [],
    }));
    res.json({ config });
  } catch (err) {
    console.error('[Dynamic Chart Error]:', err);
    res.status(500).json({ error: 'Failed to generate dynamic chart: ' + err.message });
  }
});

// AI Chart Generation — Groq GPT-OSS 120B
app.post('/api/ai/chart', getUserId, async (req, res) => {
  const { prompts } = req.body;
  if (!Array.isArray(prompts) || prompts.length === 0) {
    return res.status(400).json({ error: 'prompts array is required' });
  }

  const VALID_TYPES = ['Bar Chart', 'Pie Chart', 'Donut Chart', 'Area Chart', 'Trend Chart', 'Radar Chart', 'Scatter Plot', 'KPI Card'];
  const VALID_FIELDS = ['Total Mentions', 'Total Articles', 'Share of Voice', 'Sentiment', 'Publication', 'Media Diversity Count', 'Net Sentiment Index'];

  try {
    const results = await Promise.all(prompts.map(async (prompt) => {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a data visualization expert for a media intelligence platform called Cerebro. Given a user's chart description, return a JSON object — raw JSON only, no markdown, no code fences — with exactly these fields:
- "type": one of: ${VALID_TYPES.join(', ')}
- "field": one of: ${VALID_FIELDS.join(', ')}
- "reasoning": one concise sentence explaining your choice

Pick the chart type and data field that best matches the user's intent. Return ONLY valid JSON, nothing else.`
          },
          { role: 'user', content: prompt }
        ],
        model: 'openai/gpt-oss-120b',
        temperature: 0.2,
        max_tokens: 150
      });

      const content = completion.choices[0]?.message?.content || '';
      const s = content.indexOf('{'), e = content.lastIndexOf('}');
      try {
        const parsed = s !== -1 && e !== -1 ? JSON.parse(content.slice(s, e + 1)) : {};
        return {
          type: VALID_TYPES.includes(parsed.type) ? parsed.type : 'Bar Chart',
          field: VALID_FIELDS.includes(parsed.field) ? parsed.field : 'Total Mentions',
          reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : `A ${parsed.type || 'Bar Chart'} best represents this metric.`
        };
      } catch {
        return { type: 'Bar Chart', field: 'Total Mentions', reasoning: 'Default chart for media intelligence data.' };
      }
    }));

    res.json({ charts: results });
  } catch (err) {
    console.error('[AI Chart Error]:', err);
    res.status(500).json({ error: 'Failed to generate chart config: ' + err.message });
  }
});

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

// Get all reports for user
app.get('/api/reports', getUserId, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, type, status, date, author, priority, topic, keywords,
              brand_keywords as "brandKeywords", competitor_keywords as "competitorKeywords",
              summary, tags, metrics, sections, bookmarks
       FROM reports
       WHERE user_id = $1 AND id NOT LIKE 'predefined-%'
       ORDER BY created_at DESC`,
      [req.userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upsert a report for user
app.post('/api/reports', getUserId, async (req, res) => {
  const {
    id, title, type, status, date, author, priority, topic, keywords,
    brandKeywords, competitorKeywords, summary, tags, metrics, sections, bookmarks
  } = req.body;

  if (!id || !title || !type) {
    return res.status(400).json({ error: 'ID, title, and type are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO reports (
        id, user_id, title, type, status, date, author, priority, topic, keywords,
        brand_keywords, competitor_keywords, summary, tags, metrics, sections, bookmarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        date = EXCLUDED.date,
        author = EXCLUDED.author,
        priority = EXCLUDED.priority,
        topic = EXCLUDED.topic,
        keywords = EXCLUDED.keywords,
        brand_keywords = EXCLUDED.brand_keywords,
        competitor_keywords = EXCLUDED.competitor_keywords,
        summary = EXCLUDED.summary,
        tags = EXCLUDED.tags,
        metrics = EXCLUDED.metrics,
        sections = EXCLUDED.sections,
        bookmarks = EXCLUDED.bookmarks
      RETURNING id, title, type, status, date, author, priority, topic, keywords,
                brand_keywords as "brandKeywords", competitor_keywords as "competitorKeywords",
                summary, tags, metrics, sections, bookmarks`,
      [
        id,
        req.userId,
        title,
        type,
        status || 'Generated',
        date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author || 'Cerebro Autonomous AI',
        priority || 'High',
        topic || 'All',
        keywords || '',
        brandKeywords || '',
        competitorKeywords || '',
        summary || '',
        tags || [],
        metrics ? JSON.stringify(metrics) : null,
        sections ? JSON.stringify(sections) : null,
        bookmarks ? JSON.stringify(bookmarks) : null
      ]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific report (shared or owned)
app.get('/api/reports/:id', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT id, title, type, status, date, author, priority, topic, keywords,
              brand_keywords as "brandKeywords", competitor_keywords as "competitorKeywords",
              summary, tags, metrics, sections, bookmarks
       FROM reports
       WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error in GET /api/reports/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a report for user
app.delete('/api/reports/:id', getUserId, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM reports WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or unauthorized' });
    }
    res.status(200).json({ message: 'Report deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error in DELETE /api/reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEXUS cron endpoint — called by Cloud Scheduler at 10:30 AM IST daily
let nexusSyncRunning = false;

app.post('/api/nexus/cron', async (req, res) => {
  const secret = req.headers['x-cron-secret'] || req.body.secret;
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (nexusSyncRunning) {
    return res.json({ success: false, message: 'Sync already running, skipped' });
  }
  const days = Math.min(parseInt(req.body.days) || 1, 7);
  nexusSyncRunning = true;
  // Sync synchronously so Cloud Run keeps CPU active during the request (avoids CPU throttle killing background tasks)
  const nexusClient = require('./nexus_client');
  try {
    const result = await nexusClient.syncDateRange(days);
    console.log(`[NEXUS] Cron sync complete, synced: ${result?.synced}`);
    res.json({ success: true, message: `Sync complete for last ${days} day(s)`, synced: result?.synced });
  } catch (err) {
    console.error('[NEXUS] Cron sync error:', err.message);
    res.json({ success: false, message: err.message });
  } finally {
    nexusSyncRunning = false;
  }
});

// NEXUS sync — manually trigger article import
app.post('/api/nexus/sync', async (req, res) => {
  const days = Math.min(parseInt(req.body?.days) || 7, 30);
  res.json({ success: true, message: `Sync started for ${days} days — check server logs for progress` });
  const nexusClient = require('./nexus_client');
  nexusClient.syncDateRange(days).catch(err => console.error('[NEXUS] Manual sync error:', err));
});

// NEXUS status — how many articles are in the local cache
app.get('/api/nexus/status', getUserId, async (req, res) => {
  try {
    const count = await db.query('SELECT COUNT(*) AS total FROM nexus_articles');
    const range = await db.query('SELECT MAX(published_at) AS latest, MIN(published_at) AS oldest FROM nexus_articles');
    res.json({
      total: parseInt(count.rows[0].total),
      latest: range.rows[0].latest,
      oldest: range.rows[0].oldest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/nexus/region-check', async (req, res) => {
  const secret = req.headers['x-cron-secret'] || req.query.secret;
  if (!secret || secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const days = parseInt(req.query.days) || 7;
    const breakdown = await db.query(`
      SELECT region, COUNT(*) AS cnt
      FROM nexus_articles
      WHERE published_at >= NOW() - INTERVAL '${days} days'
      GROUP BY region ORDER BY cnt DESC
    `);
    const sample = await db.query(`
      SELECT title, region, published_at::date AS date
      FROM nexus_articles
      WHERE published_at >= NOW() - INTERVAL '${days} days'
      ORDER BY published_at DESC LIMIT 10
    `);
    res.json({ breakdown: breakdown.rows, sample: sample.rows, days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/nexus/dates', async (req, res) => {
  const secret = req.headers['x-cron-secret'] || req.query.secret;
  if (!secret || secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await db.query(`
      SELECT DATE(published_at) AS date, COUNT(*) AS count
      FROM nexus_articles
      WHERE published_at IS NOT NULL
      GROUP BY DATE(published_at)
      ORDER BY date DESC
      LIMIT 90
    `);
    res.json(result.rows.map(r => ({ date: r.date.toISOString().split('T')[0], count: parseInt(r.count) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User profile update
app.put('/api/users/profile', getUserId, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id, name, email, phone, role',
      [name?.trim() || null, phone?.trim() || null, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Support tickets — create
app.post('/api/support/tickets', getUserId, async (req, res) => {
  const { category, subject, email, description } = req.body;
  if (!subject?.trim() || !description?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const result = await db.query(
      `INSERT INTO support_tickets (ticket_id, user_id, category, subject, user_email, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ticketId, req.userId, category || 'General Inquiry', subject.trim(), email.trim(), description.trim()]
    );
    const ticket = result.rows[0];
    sendSupportEmail(ticket).catch(e => console.error('[Support] Email failed:', e.message));
    res.json({ ticket: { ...ticket, id: ticket.ticket_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Support tickets — user's own
app.get('/api/support/tickets', getUserId, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ticket_id as id, category, subject, user_email as email, description, status, admin_reply, replied_at, created_at
       FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Support tickets — admin: all tickets
app.get('/api/support/tickets/all', getUserId, async (req, res) => {
  const userRes = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (!userRes.rows[0] || userRes.rows[0].role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const result = await db.query(
      `SELECT st.ticket_id as id, st.category, st.subject, st.user_email as email, st.description,
              st.status, st.admin_reply, st.replied_at, st.created_at, u.name as user_name
       FROM support_tickets st LEFT JOIN users u ON st.user_id = u.id
       ORDER BY st.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Support tickets — admin: reply
app.put('/api/support/tickets/:id/reply', getUserId, async (req, res) => {
  const userRes = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (!userRes.rows[0] || userRes.rows[0].role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { reply, status } = req.body;
  try {
    const result = await db.query(
      `UPDATE support_tickets SET admin_reply = $1, status = $2, replied_at = NOW()
       WHERE ticket_id = $3 RETURNING *`,
      [reply, status || 'Resolved', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paginated article list for keyword drill-down
app.get('/api/keyword-articles', async (req, res) => {
  const { keyword, page = '1', limit = '15', startDate, endDate, sector } = req.query;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  const SECTOR_MAP = { AI:'AI', TECH:'Tech', FOODS_DRINKS:'Foods & Drinks', HEALTHCARE:'Healthcare',
    TRAVEL:'Travel', CONSULTANCY:'Consultancies', STARTUP:'Startups', LIFESTYLE:'Lifestyle',
    POLICIES:'Policies', STOCK_MARKET:'Stock Market', REAL_ESTATE:'Real Estate',
    GOOGLE:'Google', EDUCATION:'Education', FINTECH:'Fintech', AUTOMOBILE:'Automobile', MEDIA:'Media & Entertainment',
    SPORTS:'sports', CLIMATE:'climate and environment', CLIMATE_ENVIRONMENT:'climate and environment',
    GEOPOLITICS:'geopolitics', WORLD_NEWS:'world news', MONEY_BUSINESS:'money and business',
    SCIENCE_SPACE:'science and space', GAMING:'gaming', POP_CULTURE:'pop culture', CREATOR_ECONOMY:'creator economy' };

  const cleanKeyword = keyword.trim();
  const pageNum  = Math.max(1, parseInt(page)  || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 15));
  const offset   = (pageNum - 1) * limitNum;

  const fn = cleanKeyword.includes(' ') ? 'phraseto_tsquery' : 'plainto_tsquery';
  const params = [cleanKeyword];
  let extra = '';

  const dbSector = sector && sector !== 'All' ? (SECTOR_MAP[sector.toUpperCase()] || null) : null;
  if (dbSector)   { params.push(dbSector);   extra += ` AND sector = $${params.length}`; }
  if (startDate)  { params.push(startDate);  extra += ` AND published_at >= $${params.length}::date`; }
  if (endDate)    { params.push(endDate);     extra += ` AND published_at < ($${params.length}::date + INTERVAL '1 day')`; }

  const ftsCond = `to_tsvector('simple', coalesce(full_body,'') || ' ' || coalesce(title,'')) @@ ${fn}('simple', $1)`;

  try {
    const [countRes, articlesRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM (SELECT DISTINCT ON (LOWER(title)) title FROM nexus_articles WHERE (${ftsCond})${extra} ORDER BY LOWER(title)) deduped`, params),
      db.query(`SELECT title, url, published_at, agency FROM (SELECT DISTINCT ON (LOWER(title)) title, url, published_at, agency FROM nexus_articles WHERE (${ftsCond})${extra} ORDER BY LOWER(title), published_at DESC) deduped ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset])
    ]);

    const total = parseInt(countRes.rows[0]?.count || 0);
    res.json({
      articles: articlesRes.rows.map(r => ({
        title:     r.title       || 'No Title',
        url:       r.url         || '',
        published: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : '',
        source:    r.agency      || 'Unknown'
      })),
      total,
      page:       pageNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum))
    });
  } catch (err) {
    console.error('[keyword-articles]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.get('/config.js', (_req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, '../dist/config.js'));
  });
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// DB migrations — run at startup
(async () => {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
    await db.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS brand_keywords TEXT DEFAULT ''`);
    await db.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS competitor_keywords TEXT DEFAULT ''`);
    await db.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'`);
    await db.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS bookmarks JSONB DEFAULT '[]'`);
    await db.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        category VARCHAR(100) DEFAULT 'General Inquiry',
        subject TEXT NOT NULL,
        user_email VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        admin_reply TEXT,
        replied_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Ensure system_settings table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Ensure users table has role column
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'individual'`);
    // Seed admin user and admin key
    await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin'`,
      ['Developer Team', 'developerteam@themavericksindia.com', 'mavs12345']
    );
    await db.query(
      `INSERT INTO system_settings (key, value) VALUES ('admin_key', 'mavs12345')
       ON CONFLICT (key) DO UPDATE SET value = 'mavs12345'`
    );
    console.log('[DB] Migrations applied');
  } catch (err) {
    console.error('[DB] Migration error:', err.message);
  }
})();

// Background index creation — run after startup, non-blocking
(async () => {
  try {
    await db.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    // Scalar indexes (fast to create)
    const fastIndexes = [
      `CREATE INDEX IF NOT EXISTS idx_nexus_published_at ON nexus_articles (published_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_nexus_sector ON nexus_articles (sector)`,
      `CREATE INDEX IF NOT EXISTS idx_nexus_region ON nexus_articles (region)`,
      `CREATE INDEX IF NOT EXISTS idx_nexus_sentiment ON nexus_articles (sentiment)`,
      `CREATE INDEX IF NOT EXISTS idx_nexus_sector_published ON nexus_articles (sector, published_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_nexus_region_published ON nexus_articles (region, published_at DESC)`,
    ];
    for (const sql of fastIndexes) {
      await db.query(sql);
    }
    console.log('[DB] Nexus indexes ensured');
  } catch (err) {
    console.error('[DB] Index error:', err.message);
  }
})();

// One-time admin endpoint: creates the large FTS GIN index on full_body + title trigram
// Call once: POST /api/admin/create-fts-index  (takes 20-40 min, runs in background)
app.post('/api/admin/create-fts-index', async (req, res) => {
  const key = req.headers['x-admin-key'] || req.body?.admin_key;
  if (key !== 'mavs12345') return res.status(401).json({ error: 'Unauthorized' });
  res.json({ message: 'FTS index creation started in background — check server logs' });
  (async () => {
    console.log('[DB] Creating FTS index on full_body (this takes 20-40 min)...');
    const t1 = Date.now();
    try {
      await db.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nexus_body_fts ON nexus_articles USING gin (to_tsvector('simple', coalesce(full_body,'') || ' ' || coalesce(title,'')))`);
      console.log(`[DB] idx_nexus_body_fts created in ${Math.round((Date.now()-t1)/60000)} min`);
    } catch (e) { console.error('[DB] FTS index error:', e.message); }
    const t2 = Date.now();
    try {
      await db.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nexus_title_trgm ON nexus_articles USING gin (title gin_trgm_ops)`);
      console.log(`[DB] idx_nexus_title_trgm created in ${Math.round((Date.now()-t2)/1000)}s`);
    } catch (e) { console.error('[DB] Trigram index error:', e.message); }
    console.log('[DB] All FTS indexes done');
  })();
});

// Admin backfill: sync missing articles for a date range (runs in background on Cloud Run)
// POST /api/admin/backfill-range  body: { admin_key, fromDay, toDay }
// e.g. fromDay=7 toDay=14 syncs Aug 12 → Aug 5 (days 7-14 ago from today)
app.post('/api/admin/backfill-range', async (req, res) => {
  const key = req.headers['x-admin-key'] || req.body?.admin_key;
  if (key !== 'mavs12345') return res.status(401).json({ error: 'Unauthorized' });
  const fromDay = parseInt(req.body?.fromDay) || 7;
  const toDay   = parseInt(req.body?.toDay)   || 14;
  if (fromDay < 1 || toDay > 60 || fromDay > toDay) return res.status(400).json({ error: 'Invalid fromDay/toDay' });
  res.json({ message: `Backfill started for days ${fromDay}-${toDay} in background — check server logs` });

  (async () => {
    const axios = require('axios');
    const BASE = process.env.NEXUS_BASE_URL;
    const KEY  = process.env.NEXUS_SERVICE_KEY;

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
    const normSector = (raw) => { if (!raw) return null; const s = raw.trim(); if (JUNK.has(s.toLowerCase())) return 'Other'; return _sl[s.toLowerCase()] || s; };

    async function batchInsert(articles) {
      if (!articles.length) return 0;
      const vals = [], params = [];
      let p = 1;
      for (const a of articles) {
        vals.push(`($${p},$${p+1},$${p+2},$${p+3},$${p+4},$${p+5},$${p+6},$${p+7},$${p+8},$${p+9},$${p+10},$${p+11},$${p+12},$${p+13})`);
        params.push(a.id,a.title,a.url,a.full_body,a.author,a.agency,
          a.published_at?new Date(a.published_at):null,normSector(a.sector),
          a.publication_region||a.region,a.summary,a.sentiment,
          Array.isArray(a.tags)?a.tags.join(', '):a.tags,a.word_count,
          a.scraped_at?new Date(a.scraped_at):null);
        p += 14;
      }
      try {
        const r = await db.query(`INSERT INTO nexus_articles (id,title,url,full_body,author,agency,published_at,sector,region,summary,sentiment,tags,word_count,scraped_at) VALUES ${vals.join(',')} ON CONFLICT (url) DO NOTHING`,params);
        return r.rowCount;
      } catch(e) {
        let cnt=0;
        for (const a of articles) {
          try { const r=await db.query(`INSERT INTO nexus_articles (id,title,url,full_body,author,agency,published_at,sector,region,summary,sentiment,tags,word_count,scraped_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (url) DO NOTHING`,[a.id,a.title,a.url,a.full_body,a.author,a.agency,a.published_at?new Date(a.published_at):null,normSector(a.sector),a.publication_region||a.region,a.summary,a.sentiment,Array.isArray(a.tags)?a.tags.join(', '):a.tags,a.word_count,a.scraped_at?new Date(a.scraped_at):null]); cnt+=r.rowCount; } catch(_) {}
        }
        return cnt;
      }
    }

    let grandTotal = 0;
    const today = new Date();
    console.log(`[BACKFILL] Starting days ${fromDay}-${toDay}`);
    for (let i = fromDay; i <= toDay; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      try {
        const existing = await db.query(`SELECT COUNT(*) as cnt FROM nexus_articles WHERE published_at::date = $1`, [dateStr]);
        const dbCount = parseInt(existing.rows[0].cnt);
        const { data: fp } = await axios.get(`${BASE}/api/feed`, { params: { api_key: KEY, date: dateStr, page: 1, page_size: 100 }, timeout: 20000 });
        const nexusTotal = (fp.total_pages||1)*100;
        if (nexusTotal - dbCount <= 50) { console.log(`[BACKFILL] ${dateStr} SKIP (DB:${dbCount} ~= Nexus:${nexusTotal})`); continue; }
        console.log(`[BACKFILL] ${dateStr} DB:${dbCount} Nexus:~${nexusTotal} syncing...`);
        let inserted = await batchInsert(fp.articles||[]);
        for (let page=2; page<=(fp.total_pages||1); page++) {
          try {
            const { data } = await axios.get(`${BASE}/api/feed`, { params: { api_key: KEY, date: dateStr, page, page_size: 100 }, timeout: 60000, maxContentLength: 50*1024*1024 });
            if (!(data.articles||[]).length) break;
            inserted += await batchInsert(data.articles);
          } catch(e) { console.error(`[BACKFILL] ${dateStr} page ${page} err: ${e.message}`); }
          await new Promise(r => setTimeout(r, 80));
        }
        grandTotal += inserted;
        console.log(`[BACKFILL] ${dateStr} DONE +${inserted} (total so far: ${grandTotal})`);
      } catch(e) { console.error(`[BACKFILL] ${dateStr} error: ${e.message}`); }
    }
    console.log(`[BACKFILL] COMPLETE — days ${fromDay}-${toDay} done, ${grandTotal} new articles`);
  })();
});

// ── Nexus Articles Export Endpoint ──────────────────────────────────────────
app.get('/api/nexus/articles', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.NEXUS_EXPORT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing x-api-key header' });
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
  const offset = (page - 1) * limit;

  try {
    const [dataRes, countRes] = await Promise.all([
      db.query(
        `SELECT id, title, url, full_body, author, agency, published_at,
                sector, region, summary, sentiment, tags, word_count,
                scraped_at, imported_at
         FROM nexus_articles
         ORDER BY id
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      db.query('SELECT COUNT(*) AS total FROM nexus_articles'),
    ]);

    const total      = parseInt(countRes.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      articles: dataRes.rows,
    });
  } catch (err) {
    console.error('[nexus/articles]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Nodemon trigger reload

