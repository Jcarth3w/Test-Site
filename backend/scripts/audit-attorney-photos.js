const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const uploadDir = path.join(__dirname, '..', 'uploads');
const DATABASE_URL = process.env.DATABASE_URL;

function isSvgPlaceholder(filename) {
  const buffer = fs.readFileSync(path.join(uploadDir, filename));
  return buffer.slice(0, 4).toString() === '<svg';
}

async function main() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
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
    const { rows } = await pool.query(
      'SELECT id, name, photo_url FROM attorneys WHERE is_active = 1 ORDER BY name'
    );

    const good = [];
    const bad = [];

    for (const row of rows) {
      const match = String(row.photo_url || '').match(/\/uploads\/([^/?#]+)/i);
      if (!match) {
        bad.push(`${row.name} (no url)`);
        continue;
      }

      const file = match[1];
      const filePath = path.join(uploadDir, file);
      if (!fs.existsSync(filePath)) {
        bad.push(`${row.name} (file missing)`);
      } else if (isSvgPlaceholder(file)) {
        bad.push(row.name);
      } else {
        good.push(row.name);
      }
    }

    console.log(`Real photos: ${good.length}`);
    console.log(`Broken/missing: ${bad.length}`);
    bad.forEach((name) => console.log(`  - ${name}`));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
