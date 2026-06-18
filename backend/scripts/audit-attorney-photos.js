const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');
const dbPath = path.join(__dirname, '..', 'attorneys.db');

function isSvgPlaceholder(filename) {
  const buffer = fs.readFileSync(path.join(uploadDir, filename));
  return buffer.slice(0, 4).toString() === '<svg';
}

const db = new sqlite3.Database(dbPath);
db.all('SELECT id, name, photo_url FROM attorneys WHERE is_active = 1 ORDER BY name', (err, rows) => {
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
  db.close();
});
