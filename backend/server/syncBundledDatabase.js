const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./config');

/**
 * Copies backend/attorneys.db (shipped with the deploy) into SQLITE_PATH when
 * SYNC_BUNDLED_DB is enabled. On Render, SQLITE_PATH is usually a persistent
 * disk path, so git pushes to attorneys.db do not update production otherwise.
 */
function syncBundledDatabaseIfConfigured() {
  const mode = String(process.env.SYNC_BUNDLED_DB || '').trim().toLowerCase();
  if (!mode || mode === '0' || mode === 'false' || mode === 'off') return;

  const bundledPath = path.resolve(path.join(__dirname, '..', 'attorneys.db'));
  const targetPath = path.resolve(DB_PATH);

  if (bundledPath === targetPath) return;
  if (!fs.existsSync(bundledPath)) {
    console.warn(`syncBundledDatabase: bundled database not found at ${bundledPath}`);
    return;
  }

  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const shouldCopy =
    mode === 'always' ||
    mode === 'true' ||
    !fs.existsSync(targetPath) ||
    fs.statSync(bundledPath).mtimeMs >= fs.statSync(targetPath).mtimeMs;

  if (!shouldCopy) {
    console.log(`syncBundledDatabase: keeping existing database at ${targetPath}`);
    return;
  }

  fs.copyFileSync(bundledPath, targetPath);
  console.log(`syncBundledDatabase: synced bundled database to ${targetPath}`);
}

module.exports = { syncBundledDatabaseIfConfigured };
