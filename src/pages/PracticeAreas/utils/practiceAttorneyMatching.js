import {
  parseJsonArray,
  practiceAreaLabel,
  resolveAttorneyLevel,
  slugifyName,
} from '../../Attorneys/utils/attorneyUtils';

const MAX_RELATED_PARTNERS = 5;

const PRACTICE_MATCH_CONFIG = {
  'admiralty-marine': {
    tags: ['admiralty & marine', 'admiralty', 'marine'],
    bio: ['admiralty', 'maritime'],
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
  'fire-explostion': {
    tags: ['fire & explosion', 'explosions'],
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

function normalizeText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
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
  const slug = normalizeText(practice.slug).replace(/\s+/g, '-');
  const title = normalizeText(practice.title);
  const config = PRACTICE_MATCH_CONFIG[slug] || { tags: [title], bio: [title] };

  return {
    tags: [...new Set([title, ...config.tags.map(normalizeText)].filter(Boolean))],
    bio: [...new Set(config.bio.map(normalizeText).filter(Boolean))],
  };
}

function attorneyMatchesPractice(attorney, matchTerms) {
  const practiceAreas = getAttorneyPracticeAreas(attorney);
  const searchableText = [attorney.bio, attorney.specialty, attorney.title].filter(Boolean).join(' ');

  if (matchTerms.tags.some((phrase) => practiceAreas.some((area) => areaMatchesPhrase(area, phrase)))) {
    return true;
  }

  return matchTerms.bio.some((phrase) => textContainsPhrase(searchableText, phrase));
}

export function getRelatedPartnersForPractice(practice, attorneys = []) {
  const matchTerms = getPracticeMatchTerms(practice);

  return attorneys
    .filter((attorney) => resolveAttorneyLevel(attorney) === 'partner')
    .filter((attorney) => attorneyMatchesPractice(attorney, matchTerms))
    .sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')))
    .slice(0, MAX_RELATED_PARTNERS);
}

export function getAttorneyProfilePath(attorney) {
  return `/attorneys/${slugifyName(attorney.name)}`;
}
