const path = require('path');

function getPort() {
  const portArg = process.argv.reduce((found, arg, index, arr) => {
    if (arg.startsWith('--port=')) return arg.split('=')[1];
    if ((arg === '--port' || arg === '-p') && arr[index + 1]) return arr[index + 1];
    return found;
  }, null);

  if (portArg) return Number(portArg);
  if (process.env.PORT) return Number(process.env.PORT);
  return 5001;
}

function parseCsvEnv(value = '') {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const PORT = getPort();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'jcarthew@mlllaw.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MLLlaw2026!';
const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'attorneys.db');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

const ALLOWED_ORIGINS = parseCsvEnv(process.env.ALLOWED_ORIGINS);
const SERVICE_ORIGINS = parseCsvEnv(
  [process.env.PUBLIC_BASE_URL, process.env.RENDER_EXTERNAL_URL].filter(Boolean).join(',')
);
const EFFECTIVE_ALLOWED_ORIGINS = [...new Set([...ALLOWED_ORIGINS, ...SERVICE_ORIGINS])];

const ATTORNEY_OFFICES = new Set([
  'Milwaukee, WI',
  'Portland, ME',
  'Albuquerque, NM',
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

module.exports = {
  PORT,
  JWT_SECRET,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  DB_PATH,
  UPLOAD_DIR,
  EFFECTIVE_ALLOWED_ORIGINS,
  ATTORNEY_OFFICES,
  CANONICAL_OFFICE_BY_KEY,
};
