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

function ensureAttorneyAwardsAffiliationsColumns() {
  db.all('PRAGMA table_info(attorneys)', [], (err, rows) => {
    if (err) {
      console.error('Error reading attorneys schema:', err.message);
      logOperation('DB_SCHEMA_READ_ERROR', { table: 'attorneys', error: err.message });
      return;
    }

    const names = new Set(rows.map((r) => r.name));

    const addColumn = (column, definition, onAdded) => {
      if (names.has(column)) {
        onAdded();
        return;
      }
      db.run(`ALTER TABLE attorneys ADD COLUMN ${column} ${definition}`, (alterErr) => {
        if (alterErr) {
          console.error(`Error adding ${column} to attorneys:`, alterErr.message);
          logOperation('DB_MIGRATION_ERROR', { table: 'attorneys', column, error: alterErr.message });
        } else {
          console.log(`Added ${column} column to attorneys.`);
          logOperation('DB_MIGRATION_COLUMN_ADDED', { table: 'attorneys', column });
          names.add(column);
        }
        onAdded();
      });
    };

    addColumn('awards', "TEXT DEFAULT '[]'", () => {
      addColumn('affiliations', "TEXT DEFAULT '[]'", () => {
        db.run(
          `UPDATE attorneys
           SET awards = highlights, highlights = '[]'
           WHERE highlights IS NOT NULL
             AND TRIM(highlights) NOT IN ('', '[]')
             AND (awards IS NULL OR TRIM(awards) IN ('', '[]'))`,
          (migrateErr) => {
            if (migrateErr) {
              console.error('Error migrating highlights to awards:', migrateErr.message);
              logOperation('DB_MIGRATE_HIGHLIGHTS_ERROR', { error: migrateErr.message });
            }
          }
        );
      });
    });
  });
}

function fixAlbuquerqueLocationTypo() {
  db.run(
    `UPDATE attorneys
     SET location = 'Albuquerque, NM', updated_at = CURRENT_TIMESTAMP
     WHERE INSTR(LOWER(COALESCE(location, '')), 'albuqueque') > 0`,
    (err) => {
      if (err) {
        console.error('Error correcting Albuquerque office location typo:', err.message);
        logOperation('DB_FIX_ALBUQUERQUE_TYPO_ERROR', { error: err.message });
      }
    }
  );
}

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
        email TEXT,
        phone TEXT,
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
        category TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS offices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        name TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        description TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        title TEXT,
        summary TEXT,
        issue_date DATETIME,
        pdf_url TEXT,
        cover_image_url TEXT,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        title TEXT,
        summary TEXT,
        content TEXT,
        author_id INTEGER,
        publication_date DATETIME,
        image_url TEXT,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES attorneys(id)
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
        ensureColumn('attorneys', 'email', "TEXT DEFAULT ''");
        ensureColumn('attorneys', 'phone', "TEXT DEFAULT ''");
        ensureColumn('attorneys', 'education', "TEXT DEFAULT '[]'");
        ensureColumn('attorneys', 'bar_admissions', "TEXT DEFAULT '[]'");
        ensureColumn('attorneys', 'highlights', "TEXT DEFAULT '[]'");
        ensureAttorneyAwardsAffiliationsColumns();
        ensureColumn('attorneys', 'publications', "TEXT DEFAULT '[]'");
        ensureColumn('attorneys', 'attorney_level', "TEXT DEFAULT ''");
        ensureColumn('attorneys', 'case_work', "TEXT DEFAULT '[]'");
        ensureColumn('practices', 'is_active', 'INTEGER DEFAULT 1');
        ensureColumn('practices', 'category', "TEXT DEFAULT ''");
        ensureColumn('articles', 'source_url', "TEXT DEFAULT ''");
        ensureColumn('articles', 'category', "TEXT DEFAULT 'article'");
        ensureColumn('articles', 'author_ids', "TEXT DEFAULT '[]'");

        db.run(
          "UPDATE articles SET category = 'article' WHERE category IS NULL OR category = ''",
          (migrateErr) => {
            if (migrateErr) {
              console.error('Error migrating article categories:', migrateErr.message);
            }
          }
        );

        db.run(
          "UPDATE articles SET category = 'alert' WHERE category IN ('insight', 'alert')",
          (migrateErr) => {
            if (migrateErr) {
              console.error('Error migrating insight categories:', migrateErr.message);
            }
          }
        );

        db.run(
          "UPDATE articles SET category = 'announcement' WHERE category = 'news'",
          (migrateErr) => {
            if (migrateErr) {
              console.error('Error migrating news categories:', migrateErr.message);
            }
          }
        );

        fixAlbuquerqueLocationTypo();

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
