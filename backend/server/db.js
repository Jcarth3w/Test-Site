const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { DB_PATH, ADMIN_USERNAME, ADMIN_PASSWORD } = require('./config');
const { logOperation } = require('./logger');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    logOperation('DB_CONNECT_ERROR', { error: err.message });
  } else {
    console.log('Connected to SQLite database.');
    logOperation('DB_CONNECTED');
    initDatabase();
  }
});

function ensureColumn(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
    if (err) {
      console.error(`Error reading schema for ${table}:`, err.message);
      logOperation('DB_SCHEMA_READ_ERROR', { table, error: err.message });
      return;
    }

    const exists = rows.some((r) => r.name === column);
    if (exists) return;

    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
      if (alterErr) {
        console.error(`Error adding ${column} to ${table}:`, alterErr.message);
        logOperation('DB_MIGRATION_ERROR', { table, column, error: alterErr.message });
      } else {
        console.log(`Added ${column} column to ${table}.`);
        logOperation('DB_MIGRATION_COLUMN_ADDED', { table, column });
      }
    });
  });
}

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'admin'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS attorneys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        title TEXT,
        bio TEXT,
        specialty TEXT,
        location TEXT,
        display_order INTEGER DEFAULT 100,
        practice_areas TEXT DEFAULT '[]',
        photo_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS practices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        title TEXT,
        description TEXT,
        content TEXT,
        image_url TEXT,
        button_text TEXT DEFAULT 'Free Case Review',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating database tables:', err.message);
        logOperation('DB_TABLE_CREATE_ERROR', { error: err.message });
      } else {
        ensureColumn('attorneys', 'is_active', 'INTEGER DEFAULT 1');
        ensureColumn('attorneys', 'location', "TEXT DEFAULT ''");
        ensureColumn('attorneys', 'display_order', 'INTEGER DEFAULT 100');
        ensureColumn('attorneys', 'practice_areas', "TEXT DEFAULT '[]'");
        ensureColumn('practices', 'is_active', 'INTEGER DEFAULT 1');

        const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
        db.run(
          `
            INSERT INTO users (username, password, role)
            VALUES (?, ?, 'admin')
            ON CONFLICT(username) DO UPDATE SET
              password = excluded.password,
              role = 'admin'
          `,
          [ADMIN_USERNAME, hashedPassword],
          (upsertErr) => {
            if (upsertErr) {
              console.error('Error creating/updating bootstrap admin user:', upsertErr.message);
              logOperation('BOOTSTRAP_ADMIN_ERROR', { username: ADMIN_USERNAME, error: upsertErr.message });
              return;
            }

            if (ADMIN_USERNAME !== 'admin') {
              db.run(
                "DELETE FROM users WHERE username = 'admin'",
                (cleanupErr) => {
                  if (cleanupErr) {
                    console.error('Error cleaning up legacy admin user:', cleanupErr.message);
                    logOperation('BOOTSTRAP_ADMIN_CLEANUP_ERROR', { error: cleanupErr.message });
                  } else {
                    logOperation('BOOTSTRAP_ADMIN_READY', { username: ADMIN_USERNAME });
                    console.log('Database initialized successfully.');
                    logOperation('DB_INITIALIZED');
                  }
                }
              );
              return;
            }

            logOperation('BOOTSTRAP_ADMIN_READY', { username: ADMIN_USERNAME });
            console.log('Database initialized successfully.');
            logOperation('DB_INITIALIZED');
          }
        );
      }
    });
  });
}

module.exports = { db };
