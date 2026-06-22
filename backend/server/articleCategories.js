// Content types for Insights & News.

const ARTICLE_CATEGORIES = [
  {
    slug: 'article',
    label: 'Article',
    description:
      'In-depth firm perspectives and practical guidance — typically one primary author, with structured sections.',
    summaryHint: 'Lead with the practical takeaway readers should remember.',
    contentHint: 'Full article body. Use headings for sections. HTML is supported.',
  },
  {
    slug: 'insight',
    label: 'Insight',
    description:
      'Commentary on a case, ruling, or development — often shorter and commonly co-authored.',
    summaryHint: 'Summarize the ruling or development and why it matters to your audience.',
    contentHint: 'Analysis of the decision or trend. Cite the court or source when possible.',
  },
  {
    slug: 'news',
    label: 'News',
    description: 'Firm announcements, media coverage, speaking engagements, and honors.',
    summaryHint: 'Brief announcement text for listings.',
    contentHint: 'Event details, quote, or press release body. Use Source URL for external coverage.',
  },
];

const VALID_CATEGORY_SLUGS = new Set(ARTICLE_CATEGORIES.map((category) => category.slug));
const LEGACY_CATEGORY_ALIASES = new Map([['alert', 'insight']]);

function isValidArticleCategory(value) {
  if (value === undefined || value === null || value === '') return true;
  const slug = String(value).trim().toLowerCase();
  if (LEGACY_CATEGORY_ALIASES.has(slug)) return true;
  return VALID_CATEGORY_SLUGS.has(slug);
}

function normalizeArticleCategory(value) {
  const slug = String(value || '').trim().toLowerCase();
  if (!slug) return 'article';
  if (LEGACY_CATEGORY_ALIASES.has(slug)) return LEGACY_CATEGORY_ALIASES.get(slug);
  return VALID_CATEGORY_SLUGS.has(slug) ? slug : 'article';
}

function getArticleCategory(value) {
  const slug = normalizeArticleCategory(value);
  return ARTICLE_CATEGORIES.find((category) => category.slug === slug) ?? ARTICLE_CATEGORIES[0];
}

module.exports = {
  ARTICLE_CATEGORIES,
  isValidArticleCategory,
  normalizeArticleCategory,
  getArticleCategory,
};
