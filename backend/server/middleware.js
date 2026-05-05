const jwt = require('jsonwebtoken');
const { JWT_SECRET, EFFECTIVE_ALLOWED_ORIGINS } = require('./config');
const { logOperation, logLine } = require('./logger');

function corsOriginHandler(origin, callback) {
  if (!origin) return callback(null, true);

  if (EFFECTIVE_ALLOWED_ORIGINS.length === 0) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    logOperation('CORS_ORIGIN_DENIED', { origin, reason: 'no_allowlist_match_local_only' });
    return callback(new Error('CORS origin denied'));
  }

  if (EFFECTIVE_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  logOperation('CORS_ORIGIN_DENIED', { origin, allowed: EFFECTIVE_ALLOWED_ORIGINS });
  return callback(new Error('CORS origin denied'));
}

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

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logLine(`HTTP ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
}

module.exports = { corsOriginHandler, authenticateToken, requestLogger };
