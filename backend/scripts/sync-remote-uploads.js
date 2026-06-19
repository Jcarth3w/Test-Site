#!/usr/bin/env node
/**
 * One-time sync: copy local backend/uploads files to production when they are
 * missing on the server (preserves filenames so DB photo_url values stay valid).
 *
 * Usage:
 *   ADMIN_USERNAME=you@example.com ADMIN_PASSWORD=secret \
 *     node scripts/sync-remote-uploads.js
 *
 * Optional:
 *   API_BASE_URL=https://mll-backend.onrender.com
 */

const fs = require('fs');
const path = require('path');

const API_BASE = (process.env.API_BASE_URL || 'https://mll-backend.onrender.com').replace(/\/+$/, '');
const USERNAME = process.env.ADMIN_USERNAME || '';
const PASSWORD = process.env.ADMIN_PASSWORD || '';
const LOCAL_DIR = path.join(__dirname, '..', 'uploads');

async function login() {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Login failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  if (!data.token) throw new Error('Login response did not include a token');
  return data.token;
}

async function existsOnRemote(filename) {
  const res = await fetch(`${API_BASE}/uploads/${encodeURIComponent(filename)}`, { method: 'HEAD' });
  if (res.status === 404) return false;
  const type = res.headers.get('content-type') || '';
  return res.ok && type.includes('image');
}

async function syncFile(token, filename) {
  const filePath = path.join(LOCAL_DIR, filename);
  const blob = new Blob([fs.readFileSync(filePath)]);
  const form = new FormData();
  form.append('filename', filename);
  form.append('photo', blob, filename);

  const res = await fetch(`${API_BASE}/api/admin/sync-upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${filename}: ${res.status} ${body}`);
  }
}

async function main() {
  if (!USERNAME || !PASSWORD) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD env vars.');
    process.exit(1);
  }
  if (!fs.existsSync(LOCAL_DIR)) {
    console.error(`Local uploads folder not found: ${LOCAL_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(LOCAL_DIR).filter((name) => {
    try {
      return fs.statSync(path.join(LOCAL_DIR, name)).isFile();
    } catch {
      return false;
    }
  });

  console.log(`Checking ${files.length} local file(s) against ${API_BASE} ...`);
  const token = await login();

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of files) {
    try {
      if (await existsOnRemote(filename)) {
        skipped += 1;
        continue;
      }
      await syncFile(token, filename);
      uploaded += 1;
      process.stdout.write(`Uploaded ${filename}\n`);
    } catch (err) {
      failed += 1;
      process.stderr.write(`${err.message}\n`);
    }
  }

  console.log(`Done. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
