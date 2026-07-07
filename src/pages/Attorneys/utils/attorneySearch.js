import { parseJsonArray, practiceAreaLabel } from './attorneyUtils';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by',
  'for', 'from', 'had', 'has', 'have', 'he', 'her', 'his', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'of', 'on', 'or', 'she', 'that', 'the', 'their',
  'them', 'there', 'these', 'they', 'this', 'to', 'was', 'we', 'were', 'will',
  'with', 'you',
]);

function normalizeText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectTitleDescriptionText(items = []) {
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    return [item.title, item.description].filter(Boolean);
  });
}

export function tokenizeSearchQuery(query = '') {
  return normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
}

export function buildAttorneySearchText(attorney = {}) {
  const practiceAreas = parseJsonArray(attorney.practice_areas)
    .map(practiceAreaLabel)
    .filter(Boolean);

  const education = parseJsonArray(attorney.education);
  const educationText = education.flatMap((item) =>
    item && typeof item === 'object' ? [item.school, item.degree] : []
  );

  const barAdmissions = parseJsonArray(attorney.bar_admissions);
  const barText = barAdmissions.flatMap((item) =>
    item && typeof item === 'object' ? [item.state] : []
  );

  const awards = collectTitleDescriptionText(parseJsonArray(attorney.awards));
  const affiliations = collectTitleDescriptionText(parseJsonArray(attorney.affiliations));
  const caseWork = collectTitleDescriptionText(parseJsonArray(attorney.case_work));

  return [
    attorney.name,
    attorney.title,
    attorney.specialty,
    attorney.location,
    attorney.bio,
    ...practiceAreas,
    ...educationText,
    ...barText,
    ...awards,
    ...affiliations,
    ...caseWork,
  ]
    .filter(Boolean)
    .join(' ');
}

function textContainsKeyword(text, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, 'i');
  return pattern.test(normalizeText(text));
}

export function attorneyMatchesSearchQuery(attorney, query = '') {
  const keywords = tokenizeSearchQuery(query);
  if (!keywords.length) return true;

  const searchableText = buildAttorneySearchText(attorney);
  return keywords.every((keyword) => textContainsKeyword(searchableText, keyword));
}
