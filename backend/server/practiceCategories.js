// Single source of truth for the practice-area categories that
// can be assigned to a practice in the CMS. These are intentionally
// fixed: only the slugs in this list are valid `category` values.

const PRACTICE_CATEGORIES = [
  {
    slug: 'coverage',
    title: 'Coverage',
    subtitle: 'First-Party Property & Third-Party Liability',
    description: 'Policy interpretation, indemnity disputes, and complex coverage litigation.'
  },
  {
    slug: 'defense',
    title: 'Defense',
    subtitle: 'Trial-ready counsel across catastrophic and complex claims',
    description: 'Strategic defense from investigation through trial in high-exposure matters.'
  },
  {
    slug: 'subrogation',
    title: 'Subrogation',
    subtitle: 'Recovery actions for carriers and self-insured entities',
    description: 'Efficient recovery strategy, liability analysis, and coordinated litigation.'
  },
  {
    slug: 'appeals-trials',
    title: 'Appeals & Trials',
    subtitle: 'Appellate advocacy and courtroom execution',
    description: 'Preservation of key issues, appellate briefing, and trial support.'
  }
];

const VALID_CATEGORY_SLUGS = new Set(PRACTICE_CATEGORIES.map((category) => category.slug));

function isValidPracticeCategory(value) {
  if (value === undefined || value === null || value === '') return true;
  return VALID_CATEGORY_SLUGS.has(String(value).trim().toLowerCase());
}

function normalizePracticeCategory(value) {
  const slug = String(value || '').trim().toLowerCase();
  if (!slug) return '';
  return VALID_CATEGORY_SLUGS.has(slug) ? slug : '';
}

module.exports = {
  PRACTICE_CATEGORIES,
  isValidPracticeCategory,
  normalizePracticeCategory
};
