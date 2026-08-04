/**
 * Download missing /uploads/* files referenced in the database from a
 * remote backend (production by default). Skips SVG "image unavailable"
 * placeholders that the API returns when a file is missing on the server.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npm run sync-uploads
 *   REMOTE_API_BASE_URL=https://example.com npm run sync-uploads
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const backendRoot = path.join(__dirname, '..');
const DATABASE_URL = process.env.DATABASE_URL;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(backendRoot, 'uploads');
const REMOTE_BASE = String(process.env.REMOTE_API_BASE_URL || 'https://mll-backend.onrender.com').replace(
  /\/+$/,
  ''
);

const UPLOAD_PATH_RE = /\/uploads\/([^/?#]+)/i;

function extractUploadFilename(value = '') {
  const match = String(value).match(UPLOAD_PATH_RE);
  return match ? match[1] : null;
}

function isValidRasterImage(buffer) {
  if (!buffer || buffer.length < 4) return false;

  const head = buffer.slice(0, 12);
  const text = head.toString('utf8').toLowerCase();

  if (text.startsWith('<svg') || text.startsWith('<?xml')) return false;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return true;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  if (head.slice(0, 4).toString() === 'RIFF' && head.slice(8, 12).toString() === 'WEBP') return true;

  return false;
}

function purgeInvalidUploads() {
  if (!fs.existsSync(UPLOAD_DIR)) return 0;

  let removed = 0;
  for (const name of fs.readdirSync(UPLOAD_DIR)) {
    const filePath = path.join(UPLOAD_DIR, name);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    const buffer = fs.readFileSync(filePath);
    if (!isValidRasterImage(buffer)) {
      fs.unlinkSync(filePath);
      removed += 1;
      console.log(`Removed invalid upload: ${name}`);
    }
  }

  return removed;
}

async function collectReferencedFilenames(pool) {
  const queries = [
    "SELECT photo_url AS url FROM attorneys WHERE photo_url IS NOT NULL AND photo_url != ''",
    "SELECT image_url AS url FROM offices WHERE image_url IS NOT NULL AND image_url != ''",
    "SELECT image_url AS url FROM practices WHERE image_url IS NOT NULL AND image_url != ''",
    "SELECT image_url AS url FROM articles WHERE image_url IS NOT NULL AND image_url != ''",
  ];

  const filenames = new Set();

  for (const sql of queries) {
    const { rows } = await pool.query(sql);
    for (const row of rows) {
      const filename = extractUploadFilename(row.url);
      if (filename) filenames.add(filename);
    }
  }

  return filenames;
}

async function downloadFile(filename) {
  const url = `${REMOTE_BASE}/uploads/${encodeURIComponent(filename)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!isValidRasterImage(buffer)) {
    throw new Error('remote returned placeholder or non-image content');
  }

  const dest = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(dest, buffer);
}

async function main() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const removed = purgeInvalidUploads();
  if (removed > 0) {
    console.log(`Purged ${removed} invalid local upload(s).`);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl:
      process.env.PGSSL === 'false' || process.env.PGSSL === '0'
        ? false
        : DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false },
  });

  try {
    const referenced = await collectReferencedFilenames(pool);
    const missing = [...referenced].filter((filename) => !fs.existsSync(path.join(UPLOAD_DIR, filename)));

    console.log(`Remote source: ${REMOTE_BASE}`);
    console.log(`Upload dir:    ${path.resolve(UPLOAD_DIR)}`);
    console.log(`Referenced:    ${referenced.size} file(s)`);
    console.log(`Missing:       ${missing.length} file(s)`);

    if (missing.length === 0) {
      console.log('Nothing to download.');
      return;
    }

    let downloaded = 0;
    let failed = 0;

    for (const filename of missing.sort()) {
      process.stdout.write(`Downloading ${filename}... `);
      try {
        await downloadFile(filename);
        downloaded += 1;
        console.log('ok');
      } catch (err) {
        failed += 1;
        console.log(`failed (${err.message})`);
      }
    }

    console.log(`Done. Downloaded ${downloaded}, failed ${failed}.`);
    if (failed > 0) {
      console.log('Some files are still missing on the remote server and must be re-uploaded in the CMS.');
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
