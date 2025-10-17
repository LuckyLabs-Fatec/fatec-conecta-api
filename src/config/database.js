const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL CHECK(length(username) >= 3 AND length(username) <= 50),
      email TEXT UNIQUE NOT NULL CHECK(length(email) <= 255),
      password TEXT NOT NULL CHECK(length(password) <= 255),
      role TEXT NOT NULL CHECK(role IN ('Student', 'Community', 'Staff-Admin', 'Staff-Supervisor')),
      failed_login_attempts INTEGER DEFAULT 0 CHECK(failed_login_attempts >= 0),
      account_locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ideas table
  db.run(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK(length(title) >= 3 AND length(title) <= 200),
      description TEXT NOT NULL CHECK(length(description) >= 10),
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK(length(title) >= 3 AND length(title) <= 200),
      description TEXT NOT NULL CHECK(length(description) >= 10),
      user_id INTEGER NOT NULL,
      idea_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (idea_id) REFERENCES ideas (id)
    )
  `);
});

module.exports = db;
