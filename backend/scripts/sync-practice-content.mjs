import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { getPracticeContent } from '../../src/data/practiceContent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'update-practice-descriptions.sql');

const slugs = [
  'marine',
  'bad-faith',
  'construction-defect',
  'environmental',
  'excess-liability',
  'fire-explosion',
  'fire-explostion',
  'first-party-property',
  'general-liability',
  'insurance-defence',
  'liability',
  'mass-torts',
  'personal-injury',
  'product-liability',
  'products-liability',
  'prof-liability',
  'professional-liability',
  'reinsurance',
  'subro',
  'subrogation',
  'toxic-torts',
  'transportation',
  'trucking-accidents',
  'wrongful-death',
  'appeals-trials',
];

const escape = (value = '') => String(value).replace(/'/g, "''");

const sql = [
  '-- Varied long-form practice content',
  ...slugs.map((slug) => {
    const content = getPracticeContent(slug);
    if (!content) return null;
    return `UPDATE practices SET content = '${escape(content)}' WHERE slug = '${slug}';`;
  }).filter(Boolean),
].join('\n');

fs.writeFileSync(sqlPath, `${sql}\n`);
console.log(`Wrote ${sqlPath}`);

if (process.argv.includes('--apply')) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required to apply updates');
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl:
      process.env.PGSSL === 'false' || process.env.PGSSL === '0'
        ? false
        : databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log('Applied updates to Postgres practices table');
  } finally {
    await pool.end();
  }
}
