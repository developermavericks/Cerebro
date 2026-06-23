const db = require('../server/db');

async function run() {
  try {
    try {
      const settings = await db.query("SELECT * FROM system_settings");
      console.log("System Settings:", settings.rows);
    } catch (e) {
      console.log("No system_settings table or error:", e.message);
    }

    try {
      const status = await db.query("SELECT * FROM status");
      console.log("Status Settings:", status.rows);
    } catch (e) {
      console.log("No status table or error:", e.message);
    }

    try {
      const users = await db.query("SELECT * FROM users WHERE email LIKE '%admin%'");
      console.log("Admin Users:", users.rows);
    } catch (e) {
      console.log("No users table or error:", e.message);
    }

    try {
      const allUsers = await db.query("SELECT id, name, email, password FROM users LIMIT 10");
      console.log("All Users:", allUsers.rows);
    } catch (e) {
      console.log("No users table or error:", e.message);
    }
  } catch (err) {
    console.error("General error:", err);
  } finally {
    process.exit(0);
  }
}

run();
