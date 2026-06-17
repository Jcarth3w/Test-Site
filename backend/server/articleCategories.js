// Single source of truth for the editorial categories that can be
// assigned to an article in the CMS. These are intentionally fixed:
// only the slugs in this list are valid `category` values.
//
// The two categories share one public listing page but tell different
// stories:
//   - insights: client-focused analysis — "what does this mean?"
//   - news:     firm-focused updates — "what happened?"

const ARTICLE_CATEGORIES = [
  {
    slug: 'insights',
    title: 'Insights',
    subtitle: 'Client-focused analysis',
    description: 'Analysis of events and what they mean for our clients and the industry.'
  },
  {
    slug: 'news',
    title: 'News',
    subtitle: 'Firm updates',
    description: 'Firm announcements, recent developments, and what happened.'
  }
];

const DEFAULT_ARTICLE_CATEGORY = 'insights';

const VALID_CATEGORY_SLUGS = new Set(ARTICLE_CATEGORIES.map((category) => category.slug));

function isValidArticleCategory(value) {
  if (value === undefined || value === null || value === '') return true;
  return VALID_CATEGORY_SLUGS.has(String(value).trim().toLowerCase());
}

function normalizeArticleCategory(value) {
  const slug = String(value || '').trim().toLowerCase();
  if (!slug) return DEFAULT_ARTICLE_CATEGORY;
  return VALID_CATEGORY_SLUGS.has(slug) ? slug : DEFAULT_ARTICLE_CATEGORY;
}

module.exports = {
  ARTICLE_CATEGORIES,
  DEFAULT_ARTICLE_CATEGORY,
  isValidArticleCategory,
  normalizeArticleCategory
};
