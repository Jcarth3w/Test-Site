export const ARTICLE_CATEGORIES = [
  {
    slug: 'article',
    label: 'Article',
    description:
      'In-depth firm perspectives and practical guidance — typically one primary author, with structured sections.',
  },
  {
    slug: 'insight',
    label: 'Insight',
    description:
      'Commentary on a case, ruling, or development — often shorter and commonly co-authored.',
  },
  {
    slug: 'news',
    label: 'News',
    description: 'Firm announcements, media coverage, speaking engagements, and honors.',
  },
];

const LEGACY_CATEGORY_ALIASES = { alert: 'insight' };

export function getArticleCategory(slug = '') {
  const normalized = String(slug || 'article').trim().toLowerCase();
  const resolved = LEGACY_CATEGORY_ALIASES[normalized] ?? normalized;
  return ARTICLE_CATEGORIES.find((category) => category.slug === resolved) ?? ARTICLE_CATEGORIES[0];
}

export function categoryClassName(slug = '') {
  return getArticleCategory(slug).slug;
}
