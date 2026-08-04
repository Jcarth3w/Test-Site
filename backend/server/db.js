const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = require('./config');
const { logOperation } = require('./logger');
const { PgDb } = require('./pgDb');

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required. Set it to your Postgres connection string.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Render Postgres and many hosted providers need SSL; local Docker usually does not.
  ssl: process.env.PGSSL === 'false' || process.env.PGSSL === '0'
    ? false
    : DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
});

const db = new PgDb(pool);

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin'
  )`,
  `CREATE TABLE IF NOT EXISTS attorneys (
    id SERIAL PRIMARY KEY,
    name TEXT,
    title TEXT,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    bio TEXT,
    specialty TEXT,
    location TEXT DEFAULT '',
    display_order INTEGER DEFAULT 100,
    practice_areas TEXT DEFAULT '[]',
    education TEXT DEFAULT '[]',
    bar_admissions TEXT DEFAULT '[]',
    highlights TEXT DEFAULT '[]',
    awards TEXT DEFAULT '[]',
    affiliations TEXT DEFAULT '[]',
    publications TEXT DEFAULT '[]',
    attorney_level TEXT DEFAULT '',
    case_work TEXT DEFAULT '[]',
    photo_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS practices (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    button_text TEXT DEFAULT 'Free Case Review',
    category TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    description TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS newsletters (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    summary TEXT,
    issue_date TIMESTAMPTZ,
    pdf_url TEXT,
    cover_image_url TEXT,
    is_published INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    summary TEXT,
    content TEXT,
    author_id INTEGER REFERENCES attorneys(id),
    author_ids TEXT DEFAULT '[]',
    publication_date TIMESTAMPTZ,
    image_url TEXT,
    source_url TEXT DEFAULT '',
    category TEXT DEFAULT 'article',
    is_published INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
];

function runSql(sql, params = []) {
  return db.query(sql, params);
}

async function fixAlbuquerqueLocationTypo() {
  try {
    await runSql(
      `UPDATE attorneys
       SET location = 'Albuquerque, NM', updated_at = CURRENT_TIMESTAMP
       WHERE POSITION('albuqueque' IN LOWER(COALESCE(location, ''))) > 0`
    );
  } catch (err) {
    console.error('Error correcting Albuquerque office location typo:', err.message);
    logOperation('DB_FIX_ALBUQUERQUE_TYPO_ERROR', { error: err.message });
  }
}

async function migrateLegacyArticleCategories() {
  await runSql(
    "UPDATE articles SET category = 'article' WHERE category IS NULL OR category = ''"
  );
  await runSql(
    "UPDATE articles SET category = 'alert' WHERE category IN ('insight', 'alert')"
  );
  await runSql(
    "UPDATE articles SET category = 'announcement' WHERE category = 'news'"
  );
}

async function migrateHighlightsToAwards() {
  await runSql(
    `UPDATE attorneys
     SET awards = highlights, highlights = '[]'
     WHERE highlights IS NOT NULL
       AND TRIM(highlights) NOT IN ('', '[]')
       AND (awards IS NULL OR TRIM(awards) IN ('', '[]'))`
  );
}

async function bootstrapAdminUser() {
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  await runSql(
    `INSERT INTO users (username, password, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (username) DO UPDATE SET
       password = EXCLUDED.password,
       role = 'admin'`,
    [ADMIN_USERNAME, hashedPassword]
  );

  if (ADMIN_USERNAME !== 'admin') {
    await runSql("DELETE FROM users WHERE username = 'admin'");
  }

  logOperation('BOOTSTRAP_ADMIN_READY', { username: ADMIN_USERNAME });
}

async function initDatabase() {
  for (const statement of SCHEMA_STATEMENTS) {
    await runSql(statement);
  }
  await migrateHighlightsToAwards();
  await migrateLegacyArticleCategories();
  await fixAlbuquerqueLocationTypo();
  await bootstrapAdminUser();
  console.log('Database initialized successfully.');
  logOperation('DB_INITIALIZED');
}

const ready = pool
  .query('SELECT 1')
  .then(() => {
    console.log('Connected to PostgreSQL database.');
    logOperation('DB_CONNECTED');
    return initDatabase();
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL:', err.message);
    logOperation('DB_CONNECT_ERROR', { error: err.message });
    throw err;
  });

module.exports = { db, pool, ready };
