// Mirrors the fixed editorial categories defined on the backend
// (backend/server/articleCategories.js). Insights and News share the
// same listing page but tell different stories:
//   - insights: client-focused analysis — "what does this mean?"
//   - news:     firm-focused updates — "what happened?"

export const DEFAULT_ARTICLE_CATEGORY = 'insights';

export const ARTICLE_CATEGORIES = [
  {
    slug: 'insights',
    title: 'Insights',
    description: 'Client-focused analysis of what recent events mean for you.',
  },
  {
    slug: 'news',
    title: 'News',
    description: 'Firm updates and recent developments.',
  },
];

const CATEGORY_BY_SLUG = new Map(ARTICLE_CATEGORIES.map((category) => [category.slug, category]));

export function normalizeArticleCategory(value) {
  const slug = String(value || '').trim().toLowerCase();
  return CATEGORY_BY_SLUG.has(slug) ? slug : DEFAULT_ARTICLE_CATEGORY;
}

export function getArticleCategoryLabel(value) {
  const category = CATEGORY_BY_SLUG.get(normalizeArticleCategory(value));
  return category ? category.title : '';
}
