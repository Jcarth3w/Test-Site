const path = require('path');
const fs = require('fs');

/**
 * Serves files from uploadRoot for GET /uploads/:filename.
 * Missing files return 404 so clients can fall back gracefully.
 */
function serveUploads(uploadRoot) {
  const resolvedRoot = path.resolve(uploadRoot);

  return function serveUploadsMiddleware(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.sendStatus(405);
      return;
    }

    const name = path.basename(String(req.path || '').split('?')[0] || '');
    if (!name || name === '.' || name === '..') {
      res.sendStatus(400);
      return;
    }

    const absolute = path.resolve(path.join(resolvedRoot, name));
    if (absolute !== resolvedRoot && !absolute.startsWith(resolvedRoot + path.sep)) {
      res.sendStatus(400);
      return;
    }

    try {
      if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
        res.sendFile(absolute);
        return;
      }
    } catch {
      res.sendStatus(500);
      return;
    }

    res.sendStatus(404);
  };
}

module.exports = { serveUploads };
