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
        sessionToken: sessionToken
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

    res.json({
      message: isNew ? 'Account created via Google' : 'Google login successful',
      user: { id: user.id, name: user.name, email: user.email, role, sessionToken }
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
const DEV_ADMIN_EMAIL = 'developerteam@themavericksindia.com';
async function requireDevAdmin(req, res, next) {
  try {
    const result = await db.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(403).json({ error: 'Access denied.' });
    if (result.rows[0].email.toLowerCase() !== DEV_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied. Dev admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth check failed.' });
  }
}

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
      LIMIT 200
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

      // Fallback: search the articles table globally for occurrences of the keyword in title or summary
      const articleRes = await db.query(
        `SELECT COUNT(DISTINCT a.title) as count 
         FROM articles a 
         WHERE a.title ILIKE $1 OR a.summary ILIKE $1`,
        [`%${cleanKeyword}%`]
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

// Get competitor analysis telemetry (mentions, sentiment, sources, trends, reach) for two keywords globally
app.get('/api/competitor-analysis', getUserId, async (req, res) => {
  const { keyword1, keyword2 } = req.query;
  if (!keyword1 || !keyword2) {
    return res.status(400).json({ error: 'Two keywords are required' });
  }

  try {
    const getLast7DaysLabels = () => {
      const labels = [];
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(label);
        dates.push(d.toISOString().split('T')[0]);
      }
      return { labels, dates };
    };

    const { labels: trendLabels, dates: trendDates } = getLast7DaysLabels();

    const getAnalysisForKeyword = async (keyword) => {
      const cleanKeyword = keyword.trim();
      
      // Check if there is a company matching this name globally
      const compRes = await db.query(
        'SELECT id FROM companies WHERE LOWER(name) = LOWER($1)',
        [cleanKeyword]
      );
      
      let queryText = '';
      let params = [];
      
      if (compRes.rows.length > 0) {
        const companyIds = compRes.rows.map(r => r.id);
        queryText = `
          SELECT DISTINCT ON (LOWER(a.title))
                 a.title, a.link, a.source, a.sentiment, a.created_at, 
                 d.page_rank_decimal, d.rank
          FROM articles a
          LEFT JOIN domain_authority_cache d 
            ON d.domain = regexp_replace(substring(a.link from 'https?://([^/]+)'), '^www\\\\.', '')
          WHERE a.company_id = ANY($1)
          ORDER BY LOWER(a.title), a.created_at DESC
        `;
        params = [companyIds];
      } else {
        queryText = `
          SELECT DISTINCT ON (LOWER(a.title))
                 a.title, a.link, a.source, a.sentiment, a.created_at, 
                 d.page_rank_decimal, d.rank
          FROM articles a
          LEFT JOIN domain_authority_cache d 
            ON d.domain = regexp_replace(substring(a.link from 'https?://([^/]+)'), '^www\\\\.', '')
          WHERE a.title ILIKE $1 OR a.summary ILIKE $1
          ORDER BY LOWER(a.title), a.created_at DESC
        `;
        params = [`%${cleanKeyword}%`];
      }

      const articleRes = await db.query(queryText, params);
      const rows = articleRes.rows;

      // 1. Mentions
      const mentionsCount = rows.length;

      // 2. Sentiment Breakdown
      const sentiment = { positive: 0, negative: 0, neutral: 0 };

      // 3. Top Sources Count
      const sourceMap = {};

      // 4. Trend counts for last 7 days
      const trendMap = {};
      trendDates.forEach(dateStr => { trendMap[dateStr] = 0; });

      // 5. Reach + extras
      let totalReach = 0;
      let totalAgeDays = 0;
      let ageCount = 0;
      const authorityTiers = { high: 0, mid: 0, low: 0 };
      const articleReaches = [];

      rows.forEach(row => {
        const sent = (row.sentiment || '').toLowerCase();
        if (sent === 'positive') sentiment.positive++;
        else if (sent === 'negative') sentiment.negative++;
        else sentiment.neutral++;

        const src = row.source || 'Unknown Source';
        sourceMap[src] = (sourceMap[src] || 0) + 1;

        if (row.created_at) {
          const rowDateStr = new Date(row.created_at).toISOString().split('T')[0];
          if (rowDateStr in trendMap) trendMap[rowDateStr]++;
          const ageDays = (Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24);
          totalAgeDays += ageDays;
          ageCount++;
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
          if (hostname && (hostname.includes('news') || hostname.includes('times') || hostname.includes('post') || hostname.includes('reuters') || hostname.includes('bloomberg'))) {
            reach = 50000;
          }
        }

        if (sent === 'positive') reach = Math.floor(reach * 1.2);
        else if (sent === 'negative') reach = Math.floor(reach * 1.5);

        totalReach += reach;
        articleReaches.push({ title: row.title, link: row.link, source: src, sentiment: row.sentiment || 'Neutral', reach });
      });

      const sortedSources = Object.keys(sourceMap)
        .map(src => ({ source: src, count: sourceMap[src] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const trendValues = trendDates.map(dateStr => trendMap[dateStr]);
      const avgArticleAgeDays = ageCount > 0 ? parseFloat((totalAgeDays / ageCount).toFixed(1)) : null;
      const topArticles = articleReaches.sort((a, b) => b.reach - a.reach).slice(0, 3);
      const coverageIntensityScore = Math.floor((totalReach / Math.max(mentionsCount, 1)) * (mentionsCount / 7));

      return {
        name: keyword,
        mentions: mentionsCount,
        sentiment,
        sources: sortedSources,
        trends: trendValues,
        estimatedReach: totalReach,
        avgArticleAgeDays,
        topArticles,
        sourceAuthorityTiers: authorityTiers,
        coverageIntensityScore
      };
    };

    const comp1Data = await getAnalysisForKeyword(keyword1);
    const comp2Data = await getAnalysisForKeyword(keyword2);

    res.status(200).json({
      comp1: comp1Data,
      comp2: comp2Data,
      trendLabels
    });
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

    const history = await db.query(
      `SELECT DATE(created_at) as date, COUNT(DISTINCT title)::int as count
       FROM articles
       WHERE company_id = $1 AND created_at >= NOW() - INTERVAL '60 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [id]
    );

    const topSources = await db.query(
      `SELECT source, COUNT(DISTINCT title)::int as count
       FROM articles
       WHERE company_id = $1 AND source IS NOT NULL
       GROUP BY source
       ORDER BY count DESC
       LIMIT 8`,
      [id]
    );

    res.status(200).json({
      name: brandRes.rows[0].name,
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
      const brandPattern = `%${brandName}%`;
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
         WHERE (title ILIKE $1 OR COALESCE(summary, '') ILIKE $1)
         ORDER BY published_at DESC`,
        [brandPattern]
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
      reportSection = `Currently viewing report: "${reportContext.title}" (Type: ${reportContext.type}, Status: ${reportContext.status}, Topic: ${reportContext.topic || 'N/A'})
Brand Keywords: ${reportContext.brandKeywords || 'N/A'} | Competitor Keywords: ${reportContext.competitorKeywords || 'N/A'}
Sections: ${reportContext.sections?.length > 0 ? reportContext.sections.join(' | ') : 'No sections'}`;
    }

    // 9. Build brand detail section
    let brandDetailSection = 'No brand is currently selected in Brand Tracker.';
    if (brandContext) {
      const sent = brandSentiment[brandContext.name];
      brandDetailSection = `Currently viewing brand: "${brandContext.name}" (Region: ${brandContext.region}, Total Mentions: ${brandContext.mentions}, Status: ${brandContext.status}, Tracking: ${brandContext.isActive ? 'Active' : 'Paused'})
Sentiment from recent articles: Positive=${sent?.Positive||0}, Neutral=${sent?.Neutral||0}, Negative=${sent?.Negative||0}`;
    }

    // 10. All reports summary
    const reportsSummary = reports.length > 0
      ? reports.map(r => `"${r.title}" (${r.type}, ${r.status}, Topic: ${r.topic || 'N/A'}, Keywords: ${r.brand_keywords || r.keywords || 'N/A'})`).join('\n  ')
      : 'No reports created yet.';

    // 11. All brands summary
    const brandsSummary = companies.length > 0
      ? companies.map(c => {
          const sent = brandSentiment[c.name];
          return `${c.name} (${c.region}, Mentions: ${c.mentions||0}, ${c.is_active !== false ? 'Active' : 'Paused'}, Pos=${sent?.Positive||0}/Neu=${sent?.Neutral||0}/Neg=${sent?.Negative||0})`;
        }).join('\n  ')
      : 'No brands tracked yet.';

    // 12. Construct full system prompt
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

=== INSTRUCTIONS ===
1. Answer any question about the user's workspace using the data above — brands, articles, reports, keyword analysis, competitor analysis, or platform navigation.
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
      model: 'llama-3.1-8b-instant',
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
       WHERE user_id = $1
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
  // Respond immediately — sync runs in background to avoid Cloud Run request timeout
  res.json({ success: true, message: `Sync started for last ${days} day(s)` });
  const nexusClient = require('./nexus_client');
  nexusClient.syncDateRange(days)
    .then(result => console.log(`[NEXUS] Cron sync complete, synced: ${result?.synced}`))
    .catch(err => console.error('[NEXUS] Cron sync error:', err.message))
    .finally(() => { nexusSyncRunning = false; });
});

// NEXUS sync — manually trigger article import
app.post('/api/nexus/sync', getUserId, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.body.days) || 7, 30);
    const nexusClient = require('./nexus_client');
    const result = await nexusClient.syncDateRange(days);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[NEXUS] Manual sync error:', err);
    res.status(500).json({ error: err.message });
  }
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
    console.log('[DB] Migrations applied');
  } catch (err) {
    console.error('[DB] Migration error:', err.message);
  }
})();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Nodemon trigger reload

