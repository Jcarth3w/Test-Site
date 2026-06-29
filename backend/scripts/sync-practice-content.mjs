import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPracticeContent } from '../../src/data/practiceContent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'attorneys.db');
const sqlPath = path.join(__dirname, 'update-practice-descriptions.sql');

const slugs = [
  'admiralty-marine',
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
  const { execSync } = await import('node:child_process');
  execSync(`sqlite3 "${dbPath}" < "${sqlPath}"`, { stdio: 'inherit' });
  console.log('Applied updates to attorneys.db');
}
