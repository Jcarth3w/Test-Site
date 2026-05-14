const fs = require('fs');
const path = require('path');

/**
 * Copies files from backend/uploads (shipped with the deploy) into UPLOAD_DIR
 * when the destination file is missing. On Render, UPLOAD_DIR is usually a
 * persistent disk path while the repo still carries seeded/committed uploads.
 */
function syncBundledUploadsIfMissing(uploadRoot) {
  const resolvedRoot = path.resolve(uploadRoot);
  const bundledDir = path.resolve(path.join(__dirname, '..', 'uploads'));

  if (bundledDir === resolvedRoot) return;
  if (!fs.existsSync(bundledDir)) return;

  if (!fs.existsSync(resolvedRoot)) {
    fs.mkdirSync(resolvedRoot, { recursive: true });
  }

  let copied = 0;
  for (const name of fs.readdirSync(bundledDir)) {
    const src = path.join(bundledDir, name);
    let stat;
    try {
      stat = fs.statSync(src);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    const dest = path.join(resolvedRoot, name);
    if (fs.existsSync(dest)) continue;

    try {
      fs.copyFileSync(src, dest);
      copied += 1;
    } catch (err) {
      console.warn(`syncBundledUploads: could not copy ${name}:`, err.message);
    }
  }

  if (copied > 0) {
    console.log(`Synced ${copied} bundled upload(s) into ${resolvedRoot}`);
  }
}

module.exports = { syncBundledUploadsIfMissing };
