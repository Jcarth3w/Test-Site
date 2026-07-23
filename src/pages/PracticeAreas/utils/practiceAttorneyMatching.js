import {
  parseJsonArray,
  practiceAreaLabel,
  slugifyName,
  sortAttorneysByDisplayPriority,
} from '../../Attorneys/utils/attorneyUtils';

export const FIRE_EXPLOSION_SLUGS = new Set(['fire-explosion', 'fire-explostion']);

const PRACTICE_MATCH_CONFIG = {
  marine: {
    tags: ['marine', 'maritime'],
    bio: ['marine', 'maritime'],
  },
  'admiralty-marine': {
    tags: ['marine', 'maritime'],
    bio: ['marine', 'maritime'],
  },
  'bad-faith': {
    tags: ['bad faith'],
    bio: ['bad faith'],
  },
  'trucking-accidents': {
    tags: ['trucking', 'commercial trucking accidents'],
    bio: ['trucking', 'commercial trucking', 'motor carrier'],
  },
  'construction-defect': {
    tags: ['construction defect'],
    bio: ['construction defect'],
  },
  environmental: {
    tags: ['environmental'],
    bio: ['environmental'],
  },
  'excess-liability': {
    tags: ['excess liability'],
    bio: ['excess liability'],
  },
  'fire-explosion': {
    tags: ['fire & explosion', 'fire & explosions', 'explosions'],
    bio: ['fire & explosion', 'fire and explosion', 'fire and explosion cases'],
  },
  'fire-explostion': {
    tags: ['fire & explosion', 'fire & explosions', 'explosions'],
    bio: ['fire & explosion', 'fire and explosion', 'fire and explosion cases'],
  },
  'first-party-property': {
    tags: ['first-party property'],
    bio: ['first-party property', 'first party property'],
  },
  'general-liability': {
    tags: ['liability', 'general liability'],
    bio: ['general liability'],
  },
  'insurance-defence': {
    tags: ['insurance defense', 'insurance defence'],
    bio: ['insurance defense', 'insurance defence'],
  },
  subro: {
    tags: ['insurance subrogation', 'subrogation'],
    bio: ['subrogation', 'insurance subrogation'],
  },
  'mass-torts': {
    tags: ['toxic torts', 'mass torts'],
    bio: ['mass tort', 'toxic tort', 'toxic torts'],
  },
  'personal-injury': {
    tags: ['personal injury'],
    bio: ['personal injury defense', 'personal injury and property damage'],
  },
  'product-liability': {
    tags: ['product liability'],
    bio: ['product liability', 'products liability'],
  },
  'prof-liability': {
    tags: ['professional liability'],
    bio: ['professional liability', 'professional malpractice'],
  },
  reinsurance: {
    tags: ['reinsurance'],
    bio: ['reinsurance'],
  },
  transportation: {
    tags: ['transportation'],
    bio: ['transportation'],
  },
  'wrongful-death': {
    tags: ['wrongful death', 'casualty'],
    bio: ['wrongful death'],
  },
};

const PRACTICE_LABEL_ALIASES = {
  'bad faith litigation': 'bad-faith',
  'bad faith defense': 'bad-faith',
  'breach of contract': 'liability',
  'construction defect litigation': 'construction-defect',
  'construction litigation': 'construction',
  'architects & engineers liability': 'architects-engineers',
  'environmental and toxic tort defense': 'environmental',
  'product defect and failure claims': 'product-liability',
  'excess and umbrella coverage litigation': 'excess-liability',
  'fire & explosions': 'fire-explosion',
  'fire and casualty claims': 'casualty',
  'first-party property defense': 'first-party-property',
  'general liability defense': 'liability',
  'insurance coverage disputes': 'liability',
  'insurance defense': 'insurance-defence',
  'maritime insurance defense': 'marine',
  'maritime and admiralty insurance defense': 'marine',
  'admiralty & marine': 'marine',
  admiralty: 'marine',
  'medical malpractice defense': 'medical-malpractice',
  'personal injury defense': 'personal-injury',
  'premises liability': 'premises-liability',
  'product liability': 'product-liability',
  'products liability': 'product-liability',
  'professional liability defense': 'professional-liability',
  'reinsurance disputes': 'reinsurance',
  'subrogation defense': 'subrogation',
  'toxic tort defense': 'toxic-torts',
  'trucking and transportation defense': 'transportation',
};

function normalizeText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeSlug(value = '') {
  return normalizeText(value).replace(/\s+/g, '-');
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getAttorneyPracticeAreas(attorney) {
  return parseJsonArray(attorney.practice_areas)
    .map(practiceAreaLabel)
    .map(normalizeText)
    .filter(Boolean);
}

function textContainsPhrase(text, phrase) {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(normalizedPhrase)}\\b`, 'i');
  return pattern.test(normalizeText(text));
}

function areaMatchesPhrase(area, phrase) {
  const normalizedArea = normalizeText(area);
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedArea || !normalizedPhrase) return false;
  if (normalizedArea === normalizedPhrase) return true;
  if (normalizedArea.includes(normalizedPhrase) || normalizedPhrase.includes(normalizedArea)) {
    const shorter = Math.min(normalizedArea.length, normalizedPhrase.length);
    return shorter >= 8;
  }
  return false;
}

export function getPracticeMatchTerms(practice = {}) {
  const slug = normalizeSlug(practice.slug);
  const title = normalizeText(practice.title);
  const config = PRACTICE_MATCH_CONFIG[slug] || { tags: [title], bio: [title] };

  return {
    tags: [...new Set([title, ...config.tags.map(normalizeText)].filter(Boolean))],
    bio: [...new Set(config.bio.map(normalizeText).filter(Boolean))],
  };
}

export function attorneyMatchesPractice(attorney, practiceOrMatchTerms) {
  const matchTerms = Array.isArray(practiceOrMatchTerms?.tags)
    ? practiceOrMatchTerms
    : getPracticeMatchTerms(practiceOrMatchTerms);

  const practiceAreas = getAttorneyPracticeAreas(attorney);
  const searchableText = [attorney.bio, attorney.specialty, attorney.title].filter(Boolean).join(' ');

  if (matchTerms.tags.some((phrase) => practiceAreas.some((area) => areaMatchesPhrase(area, phrase)))) {
    return true;
  }

  return matchTerms.bio.some((phrase) => textContainsPhrase(searchableText, phrase));
}

export function sortAttorneysForPracticeResults(_practice, attorneys = []) {
  return sortAttorneysByDisplayPriority(attorneys);
}

export function getAttorneysForPractice(practice, attorneys = []) {
  return sortAttorneysForPracticeResults(
    practice,
    attorneys.filter((attorney) => attorneyMatchesPractice(attorney, practice))
  );
}

const PRACTICE_SLUG_ALIASES = {
  'fire-explostion': 'fire-explosion',
  'products-liability': 'product-liability',
  'product-liability': 'products-liability',
  'admiralty-marine': 'marine',
  'admirality-marine': 'marine',
};

function practiceSlugsMatch(left = '', right = '') {
  const leftSlug = normalizeSlug(left);
  const rightSlug = normalizeSlug(right);
  if (!leftSlug || !rightSlug) return false;
  if (leftSlug === rightSlug) return true;

  const leftAlias = PRACTICE_SLUG_ALIASES[leftSlug] || leftSlug;
  const rightAlias = PRACTICE_SLUG_ALIASES[rightSlug] || rightSlug;
  return leftAlias === rightSlug || leftSlug === rightAlias || leftAlias === rightAlias;
}

function normalizePracticeWords(value = '') {
  return normalizeText(value).replace(/&/g, 'and');
}

function findCatalogPracticeForLabel(label = '', catalog = []) {
  const raw = String(label || '').trim();
  if (!raw || !catalog.length) return null;

  const normalizedLabel = normalizePracticeWords(raw);

  const byExactTitle = catalog.find(
    (practice) => normalizePracticeWords(practice.title) === normalizedLabel
  );
  if (byExactTitle) return byExactTitle;

  const aliasSlug = PRACTICE_LABEL_ALIASES[normalizedLabel] || PRACTICE_LABEL_ALIASES[normalizeText(raw)];
  if (aliasSlug) {
    const byAlias = catalog.find((practice) => practiceSlugsMatch(practice.slug, aliasSlug));
    if (byAlias) return byAlias;
  }

  if (normalizedLabel.startsWith('fire and explosion')) {
    const firePractice = catalog.find((practice) => practiceSlugsMatch(practice.slug, 'fire-explosion'));
    if (firePractice) return firePractice;
  }

  const byPartialTitle = catalog.find((practice) => {
    const title = normalizePracticeWords(practice.title);
    if (!title || title.length < 8) return false;
    return normalizedLabel.startsWith(title);
  });
  if (byPartialTitle) return byPartialTitle;

  return null;
}

function slugToDisplayTitle(slug = '') {
  const knownTitles = {
    'fire-explosion': 'Fire & Explosion',
    'first-party-property': 'First-Party Property',
    marine: 'Marine',
    'admiralty-marine': 'Marine',
    'construction-defect': 'Construction Defect',
    'excess-liability': 'Excess Liability',
    'general-liability': 'Liability',
    'professional-liability': 'Professional Liability',
    'products-liability': 'Products Liability',
    'personal-injury': 'Personal Injury',
    'premises-liability': 'Premises Liability',
    'medical-malpractice': 'Medical Malpractice',
    'architects-engineers': 'Architects & Engineers',
    'appeals-trials': 'Appeals & Trials',
    'insurance-defence': 'Insurance Defence',
    'mass-torts': 'Toxic Torts',
    'prof-liability': 'Professional Liability',
    'product-liability': 'Products Liability',
    'trucking-accidents': 'Transportation',
    'wrongful-death': 'Wrongful Death',
  };

  const normalized = normalizeSlug(slug);
  if (knownTitles[normalized]) return knownTitles[normalized];

  return normalized
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isSlugLikeTitle(value = '') {
  const text = String(value || '').trim();
  return /^[a-z0-9]+(-[a-z0-9]+)+$/i.test(text);
}

export function getPracticeDisplayTitle(practice = {}, catalog = []) {
  if (!practice) return '';

  const slug = normalizeSlug(practice.slug || (isSlugLikeTitle(practice.title) ? practice.title : ''));
  const aliasedSlug = PRACTICE_SLUG_ALIASES[slug] || slug;

  const fromCatalog = catalog.find((item) => {
    const itemSlug = normalizeSlug(item.slug);
    return itemSlug === slug || itemSlug === aliasedSlug;
  });
  if (fromCatalog?.title) return fromCatalog.title;

  const title = String(practice.title || '').trim();
  if (title && !isSlugLikeTitle(title)) return title;

  return slugToDisplayTitle(aliasedSlug || slug);
}

export function resolvePracticeFromParam(param = '', catalog = []) {
  const raw = String(param || '').trim();
  if (!raw) return null;

  const normalizedParam = normalizeSlug(raw);
  const aliasedParam = PRACTICE_SLUG_ALIASES[normalizedParam] || normalizedParam;

  const bySlug = catalog.find((practice) => {
    const practiceSlug = normalizeSlug(practice.slug);
    return practiceSlugsMatch(practiceSlug, normalizedParam) || practiceSlugsMatch(practiceSlug, aliasedParam);
  });
  if (bySlug) return bySlug;

  const normalizedTitle = normalizeText(raw);
  const byTitle = catalog.find((practice) => normalizeText(practice.title) === normalizedTitle);
  if (byTitle) return byTitle;

  const aliasSlug = PRACTICE_LABEL_ALIASES[normalizedTitle];
  if (aliasSlug) {
    const byAlias = catalog.find((practice) => practiceSlugsMatch(practice.slug, aliasSlug));
    if (byAlias) return byAlias;
  }

  return {
    slug: aliasedParam,
    title: slugToDisplayTitle(aliasedParam),
  };
}

export function resolvePracticeSlugFromLabel(label = '', catalog = []) {
  const raw = String(label || '').trim();
  if (!raw) return '';

  const catalogMatch = findCatalogPracticeForLabel(raw, catalog);
  if (catalogMatch?.slug) return catalogMatch.slug;

  const normalizedLabel = normalizeText(raw);
  const aliasSlug = PRACTICE_LABEL_ALIASES[normalizedLabel];
  if (aliasSlug) return aliasSlug;

  if (normalizePracticeWords(raw).startsWith('fire and explosion')) return 'fire-explosion';

  const byPartialTitle = catalog.find((practice) => {
    const title = normalizePracticeWords(practice.title);
    const labelText = normalizePracticeWords(raw);
    if (!title || title.length < 8) return false;
    return labelText.startsWith(title);
  });
  if (byPartialTitle?.slug) return byPartialTitle.slug;

  return normalizeSlug(raw);
}

export function getAttorneySearchPathForPractice(practice = {}) {
  const slug = normalizeSlug(practice.slug || practice.title);
  return `/attorneys?practice=${encodeURIComponent(slug)}`;
}

export function getAttorneySearchPathForLabel(label = '', catalog = []) {
  const slug = resolvePracticeSlugFromLabel(label, catalog);
  return slug ? `/attorneys?practice=${encodeURIComponent(slug)}` : '/attorneys';
}

export function getPracticeLinkPathForLabel(label = '', catalog = []) {
  const catalogMatch = findCatalogPracticeForLabel(label, catalog);
  if (catalogMatch?.slug) {
    return `/practice/${catalogMatch.slug}`;
  }

  return getAttorneySearchPathForLabel(label, catalog);
}

export function getAttorneyProfilePath(attorney) {
  return `/attorneys/${slugifyName(attorney.name)}`;
}
