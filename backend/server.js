const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

function getPort() {
  const portArg = process.argv.reduce((found, arg, index, arr) => {
    if (arg.startsWith('--port=')) return arg.split('=')[1];
    if ((arg === '--port' || arg === '-p') && arr[index + 1]) return arr[index + 1];
    return found;
  }, null);

  if (portArg) return Number(portArg);
  if (process.env.PORT) return Number(process.env.PORT);
  return 5000;
}

const PORT = getPort();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'jcarthew@mlllaw.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MLLlaw2026!';
const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, 'attorneys.db');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

function parseCsvEnv(value = '') {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const ALLOWED_ORIGINS = parseCsvEnv(process.env.ALLOWED_ORIGINS);

function corsOriginHandler(origin, callback) {
  // Allow non-browser requests (curl, health checks, same-origin server calls).
  if (!origin) return callback(null, true);

  if (ALLOWED_ORIGINS.length === 0) {
    // Keep local setup simple if no explicit allowlist is provided.
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin denied'));
  }

  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error('CORS origin denied'));
}

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const opsLogPath = path.join(logsDir, 'operations.log');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function logLine(line) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${line}`;
  console.log(entry);
  fs.appendFile(opsLogPath, `${entry}\n`, (err) => {
    if (err) {
      console.error('Failed to write log:', err.message);
    }
  });
}

function logOperation(action, details = {}) {
  logLine(`${action} ${JSON.stringify(details)}`);
}

function normalizeBoolean(value, defaultValue = 1) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === true || value === 'true' || value === 1 || value === '1') return 1;
  return 0;
}

const ATTORNEY_OFFICES = new Set([
  'Milwaukee, WI',
  'Portland, ME',
  'Albuqueque, NM',
  'Kansas City, KS',
  'San Antonio, TX',
  'Ann Arbor, MI',
  'Chicago, IL',
  'Jacksonville, FL',
  'San Diego, CA'
]);

const CANONICAL_OFFICE_BY_KEY = new Map(
  [...ATTORNEY_OFFICES].map((office) => [
    office
      .toLowerCase()
      .replace(/[.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
    office
  ])
);

function normalizeOfficeLocation(value) {
  const location = (value || '').trim();
  if (!location) return '';
  const normalizedKey = location
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return CANONICAL_OFFICE_BY_KEY.get(normalizedKey) || null;
}

function normalizeDisplayOrder(value, fallback = 100) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, parsed);
}

function normalizePracticeAreas(value) {
  let list = [];

  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) {
      list = [];
    } else {
      try {
        const parsed = JSON.parse(raw);
        list = Array.isArray(parsed) ? parsed : raw.split(',');
      } catch {
        list = raw.split(',');
      }
    }
  }

  const deduped = [];
  const seen = new Set();

  list.forEach((item) => {
    const text = String(item || '').trim();
    if (!text) return;

    const key = text.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    deduped.push(text);
  });

  return deduped;
}

function parseStoredPracticeAreas(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapAttorneyRow(row) {
  return {
    ...row,
    display_order: normalizeDisplayOrder(row.display_order, 100),
    practice_areas: parseStoredPracticeAreas(row.practice_areas)
  };
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

// Middleware
app.set('trust proxy', 1);
app.use(cors({
  origin: corsOriginHandler,
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logLine(`HTTP ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Database setup
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

// Initialize database tables
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

        // Upsert bootstrap admin user so credential changes are reflected in DB.
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

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      logOperation('LOGIN_DB_ERROR', { username, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      logOperation('LOGIN_FAILED', { username, reason: 'user_not_found' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
      logOperation('LOGIN_SUCCESS', { userId: user.id, username: user.username });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      logOperation('LOGIN_FAILED', { username, reason: 'invalid_password' });
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Public: get active attorneys
app.get('/api/public/attorneys', (req, res) => {
  db.all(
    'SELECT * FROM attorneys WHERE is_active = 1 ORDER BY display_order ASC, name ASC',
    [],
    (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows.map(mapAttorneyRow));
    }
  );
});

// Get all attorneys (including inactive for CMS)
app.get('/api/attorneys', authenticateToken, (req, res) => {
  db.all('SELECT * FROM attorneys ORDER BY display_order ASC, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(mapAttorneyRow));
  });
});

// Get single attorney
app.get('/api/attorneys/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM attorneys WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Attorney not found' });
    res.json(mapAttorneyRow(row));
  });
});

// Create attorney
app.post('/api/attorneys', authenticateToken, (req, res) => {
  const { name, title, bio, specialty, location, display_order, practice_areas, photo_url, is_active } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);
  const officeLocation = normalizeOfficeLocation(location);
  const displayOrder = normalizeDisplayOrder(display_order, 100);
  const practiceAreas = normalizePracticeAreas(practice_areas);
  const practiceAreasJson = JSON.stringify(practiceAreas);
  const normalizedPhotoUrl = (photo_url || '').trim();

  if (officeLocation === null) {
    return res.status(400).json({ error: 'Invalid office location' });
  }
  if (!normalizedPhotoUrl) {
    return res.status(400).json({ error: 'Photo is required for new attorney entries' });
  }

  db.run(`
    INSERT INTO attorneys (name, title, bio, specialty, location, display_order, practice_areas, photo_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, title, bio, specialty, officeLocation, displayOrder, practiceAreasJson, normalizedPhotoUrl, activeValue], function(err) {
    if (err) {
      logOperation('ATTORNEY_CREATE_ERROR', { error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    logOperation('ATTORNEY_CREATED', {
      id: this.lastID,
      name,
      location: officeLocation,
      display_order: displayOrder,
      practice_areas_count: practiceAreas.length,
      is_active: activeValue,
      by: req.user?.username
    });
    res.json({ id: this.lastID, message: 'Attorney created successfully' });
  });
});

// Update attorney
app.put('/api/attorneys/:id', authenticateToken, (req, res) => {
  const { name, title, bio, specialty, location, display_order, practice_areas, photo_url, is_active } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);
  const officeLocation = normalizeOfficeLocation(location);
  const displayOrder = normalizeDisplayOrder(display_order, 100);
  const practiceAreas = normalizePracticeAreas(practice_areas);
  const practiceAreasJson = JSON.stringify(practiceAreas);

  if (officeLocation === null) {
    return res.status(400).json({ error: 'Invalid office location' });
  }

  db.run(`
    UPDATE attorneys
    SET name = ?, title = ?, bio = ?, specialty = ?, location = ?, display_order = ?, practice_areas = ?, photo_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, title, bio, specialty, officeLocation, displayOrder, practiceAreasJson, photo_url, activeValue, req.params.id], function(err) {
    if (err) {
      logOperation('ATTORNEY_UPDATE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Attorney not found' });
    logOperation('ATTORNEY_UPDATED', {
      id: req.params.id,
      location: officeLocation,
      display_order: displayOrder,
      practice_areas_count: practiceAreas.length,
      is_active: activeValue,
      by: req.user?.username
    });
    res.json({ message: 'Attorney updated successfully' });
  });
});

// Toggle attorney active flag
app.patch('/api/attorneys/:id/status', authenticateToken, (req, res) => {
  const activeValue = normalizeBoolean(req.body.is_active, 1);

  db.run(
    'UPDATE attorneys SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [activeValue, req.params.id],
    function(err) {
      if (err) {
        logOperation('ATTORNEY_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Attorney not found' });
      logOperation('ATTORNEY_STATUS_UPDATED', { id: req.params.id, is_active: activeValue, by: req.user?.username });
      res.json({ message: `Attorney ${activeValue ? 'activated' : 'deactivated'} successfully` });
    }
  );
});

// Delete attorney
app.delete('/api/attorneys/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM attorneys WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      logOperation('ATTORNEY_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Attorney not found' });
    logOperation('ATTORNEY_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Attorney deleted successfully' });
  });
});

// Public: list active practice areas
app.get('/api/public/practices', (req, res) => {
  db.all('SELECT * FROM practices WHERE is_active = 1 ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Public: active practice area by slug
app.get('/api/public/practices/:slug', (req, res) => {
  db.get('SELECT * FROM practices WHERE slug = ? AND is_active = 1', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Practice area not found' });
    res.json(row);
  });
});

// CMS: all practice areas
app.get('/api/practices', authenticateToken, (req, res) => {
  db.all('SELECT * FROM practices ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// CMS: single practice area by id
app.get('/api/practices/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM practices WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Practice area not found' });
    res.json(row);
  });
});

// CMS: create practice area
app.post('/api/practices', authenticateToken, (req, res) => {
  const {
    slug,
    title,
    description,
    content,
    image_url,
    button_text,
    is_active
  } = req.body;

  const activeValue = normalizeBoolean(is_active, 1);

  db.run(
    `
      INSERT INTO practices (slug, title, description, content, image_url, button_text, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [slug, title, description, content, image_url, button_text || 'Free Case Review', activeValue],
    function(err) {
      if (err) {
        logOperation('PRACTICE_CREATE_ERROR', { slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('PRACTICE_CREATED', { id: this.lastID, slug, is_active: activeValue, by: req.user?.username });
      res.json({ id: this.lastID, message: 'Practice area created successfully' });
    }
  );
});

// CMS: update practice area
app.put('/api/practices/:id', authenticateToken, (req, res) => {
  const {
    slug,
    title,
    description,
    content,
    image_url,
    button_text,
    is_active
  } = req.body;

  const activeValue = normalizeBoolean(is_active, 1);

  db.run(
    `
      UPDATE practices
      SET slug = ?,
          title = ?,
          description = ?,
          content = ?,
          image_url = ?,
          button_text = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [slug, title, description, content, image_url, button_text || 'Free Case Review', activeValue, req.params.id],
    function(err) {
      if (err) {
        logOperation('PRACTICE_UPDATE_ERROR', { id: req.params.id, slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Practice area not found' });
      logOperation('PRACTICE_UPDATED', { id: req.params.id, slug, is_active: activeValue, by: req.user?.username });
      res.json({ message: 'Practice area updated successfully' });
    }
  );
});

// CMS: toggle practice area status
app.patch('/api/practices/:id/status', authenticateToken, (req, res) => {
  const activeValue = normalizeBoolean(req.body.is_active, 1);

  db.run(
    'UPDATE practices SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [activeValue, req.params.id],
    function(err) {
      if (err) {
        logOperation('PRACTICE_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Practice area not found' });
      logOperation('PRACTICE_STATUS_UPDATED', { id: req.params.id, is_active: activeValue, by: req.user?.username });
      res.json({ message: `Practice area ${activeValue ? 'activated' : 'deactivated'} successfully` });
    }
  );
});

// CMS: delete practice area
app.delete('/api/practices/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM practices WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      logOperation('PRACTICE_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Practice area not found' });
    logOperation('PRACTICE_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Practice area deleted successfully' });
  });
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload photo
app.post('/api/upload', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  logOperation('PHOTO_UPLOADED', { filename: req.file.filename, by: req.user?.username });
  res.json({ photo_url: `/uploads/${req.file.filename}` });
});

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve admin interface pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.get('/admin/attorneys', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'attorneys.html'));
});

app.get('/admin/attorneys/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'attorney-form.html'));
});

app.get('/admin/practices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'practices.html'));
});

app.get('/admin/practices/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'practice-form.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});