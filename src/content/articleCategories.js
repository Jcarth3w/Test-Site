export const CONTENT_GROUPS = [
  {
    slug: 'insights',
    label: 'Insights',
    description:
      'Thought leadership, analysis, and practical guidance from our attorneys.',
    subcategories: [
      {
        slug: 'article',
        label: 'Article',
        description:
          'In-depth firm perspectives — typically one primary author, with structured sections.',
      },
      {
        slug: 'alert',
        label: 'Alert',
        description:
          'Timely commentary on a ruling, development, or trend — often shorter and co-authored.',
      },
    ],
  },
  {
    slug: 'news',
    label: 'News',
    description: 'Firm announcements, honors, hires, speaking engagements, and media coverage.',
    subcategories: [
      {
        slug: 'award',
        label: 'Award',
        description: 'Honors, rankings, and recognition received by the firm or its attorneys.',
      },
      {
        slug: 'new-hire',
        label: 'New Hire',
        description: 'Welcome announcements for attorneys and staff joining the firm.',
      },
      {
        slug: 'speaking',
        label: 'Speaking',
        description: 'Conferences, panels, CLE programs, and other speaking engagements.',
      },
      {
        slug: 'media',
        label: 'Media Coverage',
        description: 'Press mentions, interviews, and external coverage of the firm.',
      },
      {
        slug: 'announcement',
        label: 'Announcement',
        description: 'General firm news, office updates, and other announcements.',
      },
    ],
  },
];

const LEGACY_CATEGORY_ALIASES = {
  insight: 'alert',
  news: 'announcement',
};

export const ARTICLE_SUBCATEGORIES = CONTENT_GROUPS.flatMap((group) =>
  group.subcategories.map((subcategory) => ({
    ...subcategory,
    group: group.slug,
    groupLabel: group.label,
  }))
);

/** @deprecated Use ARTICLE_SUBCATEGORIES or getArticleCategory instead */
export const ARTICLE_CATEGORIES = ARTICLE_SUBCATEGORIES;

const SUBCATEGORY_BY_SLUG = new Map(
  ARTICLE_SUBCATEGORIES.map((subcategory) => [subcategory.slug, subcategory])
);

const GROUP_BY_SLUG = new Map(CONTENT_GROUPS.map((group) => [group.slug, group]));

export function normalizeArticleCategory(slug = '') {
  const normalized = String(slug || 'article').trim().toLowerCase();
  if (!normalized) return 'article';
  const resolved = LEGACY_CATEGORY_ALIASES[normalized] ?? normalized;
  return SUBCATEGORY_BY_SLUG.has(resolved) ? resolved : 'article';
}

export function getArticleCategory(slug = '') {
  const resolved = normalizeArticleCategory(slug);
  return SUBCATEGORY_BY_SLUG.get(resolved) ?? ARTICLE_SUBCATEGORIES[0];
}

export function getContentGroup(slug = '') {
  const subcategory = getArticleCategory(slug);
  return GROUP_BY_SLUG.get(subcategory.group) ?? CONTENT_GROUPS[0];
}

export function isGroupSlug(slug = '') {
  return GROUP_BY_SLUG.has(String(slug).trim().toLowerCase());
}

export function getSubcategoriesForGroup(groupSlug = '') {
  const group = GROUP_BY_SLUG.get(String(groupSlug).trim().toLowerCase());
  return group?.subcategories ?? [];
}

export function getActiveGroupSlug(filterSlug = 'all') {
  if (filterSlug === 'all') return null;
  if (isGroupSlug(filterSlug)) return filterSlug;
  return getArticleCategory(filterSlug).group;
}

export function matchesContentFilter(articleCategory, filterSlug = 'all') {
  if (filterSlug === 'all') return true;
  const normalized = normalizeArticleCategory(articleCategory);
  if (isGroupSlug(filterSlug)) {
    return getArticleCategory(normalized).group === filterSlug;
  }
  return normalized === normalizeArticleCategory(filterSlug);
}

export function getFilterMeta(filterSlug = 'all') {
  if (filterSlug === 'all') return null;
  if (isGroupSlug(filterSlug)) {
    return GROUP_BY_SLUG.get(filterSlug) ?? null;
  }
  return getArticleCategory(filterSlug);
}

export function categoryClassName(slug = '') {
  return getArticleCategory(slug).slug;
}
