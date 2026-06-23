// Content groups and subcategories for Insights & News.

const CONTENT_GROUPS = [
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
        summaryHint: 'Lead with the practical takeaway readers should remember.',
        contentHint: 'Full article body. Use headings for sections. HTML is supported.',
      },
      {
        slug: 'alert',
        label: 'Alert',
        description:
          'Timely commentary on a ruling, development, or trend — often shorter and co-authored.',
        summaryHint: 'Summarize the ruling or development and why it matters to your audience.',
        contentHint: 'Analysis of the decision or trend. Cite the court or source when possible.',
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
        summaryHint: 'Name the honor and who received it.',
        contentHint: 'Details of the award, selection criteria, and any relevant quote.',
      },
      {
        slug: 'new-hire',
        label: 'New Hire',
        description: 'Welcome announcements for attorneys and staff joining the firm.',
        summaryHint: 'Introduce the new team member and their role.',
        contentHint: 'Background, practice focus, and prior experience.',
      },
      {
        slug: 'speaking',
        label: 'Speaking',
        description: 'Conferences, panels, CLE programs, and other speaking engagements.',
        summaryHint: 'Event name, date, and topic.',
        contentHint: 'Event details, session title, and registration link if applicable.',
      },
      {
        slug: 'media',
        label: 'Media Coverage',
        description: 'Press mentions, interviews, and external coverage of the firm.',
        summaryHint: 'Outlet and headline angle.',
        contentHint: 'Brief context and link to the original coverage via Source URL.',
      },
      {
        slug: 'announcement',
        label: 'Announcement',
        description: 'General firm news, office updates, and other announcements.',
        summaryHint: 'Brief announcement text for listings.',
        contentHint: 'Event details, quote, or press release body. Use Source URL for external coverage.',
      },
    ],
  },
];

const LEGACY_CATEGORY_ALIASES = new Map([
  ['insight', 'alert'],
  ['news', 'announcement'],
]);

const LEGACY_DB_VALUES = new Map([
  ['alert', ['insight']],
  ['announcement', ['news']],
  ['article', ['']],
]);

const ARTICLE_SUBCATEGORIES = CONTENT_GROUPS.flatMap((group) =>
  group.subcategories.map((subcategory) => ({
    ...subcategory,
    group: group.slug,
    groupLabel: group.label,
  }))
);

const VALID_SUBCATEGORY_SLUGS = new Set(ARTICLE_SUBCATEGORIES.map((subcategory) => subcategory.slug));
const VALID_GROUP_SLUGS = new Set(CONTENT_GROUPS.map((group) => group.slug));
const SUBCATEGORY_BY_SLUG = new Map(
  ARTICLE_SUBCATEGORIES.map((subcategory) => [subcategory.slug, subcategory])
);

function normalizeArticleCategory(value) {
  const slug = String(value || '').trim().toLowerCase();
  if (!slug) return 'article';
  const resolved = LEGACY_CATEGORY_ALIASES.get(slug) ?? slug;
  return VALID_SUBCATEGORY_SLUGS.has(resolved) ? resolved : 'article';
}

function isValidArticleCategory(value) {
  if (value === undefined || value === null || value === '') return true;
  const slug = String(value).trim().toLowerCase();
  if (LEGACY_CATEGORY_ALIASES.has(slug)) return true;
  return VALID_SUBCATEGORY_SLUGS.has(slug) || VALID_GROUP_SLUGS.has(slug);
}

function getArticleCategory(value) {
  const slug = normalizeArticleCategory(value);
  return SUBCATEGORY_BY_SLUG.get(slug) ?? ARTICLE_SUBCATEGORIES[0];
}

function getSubcategorySlugsForGroup(groupSlug) {
  const group = CONTENT_GROUPS.find((item) => item.slug === groupSlug);
  if (!group) return null;
  return group.subcategories.map((subcategory) => subcategory.slug);
}

function getCategoryFilterValues(filterSlug) {
  const slug = String(filterSlug || '').trim().toLowerCase();
  if (!slug || slug === 'all') return null;

  const groupSlugs = getSubcategorySlugsForGroup(slug);
  if (groupSlugs) {
    const values = new Set(groupSlugs);
    if (slug === 'insights') values.add('insight');
    if (slug === 'news') values.add('news');
    return [...values];
  }

  const normalized = normalizeArticleCategory(slug);
  const values = new Set([normalized]);
  (LEGACY_DB_VALUES.get(normalized) ?? []).forEach((legacy) => values.add(legacy));
  return [...values];
}

module.exports = {
  CONTENT_GROUPS,
  ARTICLE_SUBCATEGORIES,
  ARTICLE_CATEGORIES: ARTICLE_SUBCATEGORIES,
  isValidArticleCategory,
  normalizeArticleCategory,
  getArticleCategory,
  getCategoryFilterValues,
};
