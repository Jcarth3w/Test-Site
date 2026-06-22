const { CANONICAL_OFFICE_BY_KEY } = require('./config');

function normalizeBoolean(value, defaultValue = 1) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === true || value === 'true' || value === 1 || value === '1') return 1;
  return 0;
}

/** Legacy typo from attorney form / config; normalize to canonical office key. */
const LEGACY_OFFICE_LOCATION_ALIASES = new Map([['albuqueque nm', 'Albuquerque, NM']]);

function normalizeOfficeLocation(value) {
  const location = (value || '').trim();
  if (!location) return '';
  const normalizedKey = location
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    LEGACY_OFFICE_LOCATION_ALIASES.get(normalizedKey) ||
    CANONICAL_OFFICE_BY_KEY.get(normalizedKey) ||
    null
  );
}

function normalizeDisplayOrder(value, fallback = 100) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, parsed);
}

function normalizePracticeAreas(value) {
  let list = [];

  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) {
      list = [];
    } else {
      try {
        const parsed = JSON.parse(raw);
        list = Array.isArray(parsed) ? parsed : raw.split(',');
      } catch {
        list = raw.split(',');
      }
    }
  }

  const deduped = [];
  const seen = new Set();

  list.forEach((item) => {
    const text = String(item || '').trim();
    if (!text) return;

    const key = text.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    deduped.push(text);
  });

  return deduped;
}

function parseStoredPracticeAreas(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStoredJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function resolveAttorneyLevel(row) {
  const stored = String(row.attorney_level || '').trim().toLowerCase();
  if (stored === 'partner' || stored === 'associate' || stored === 'of_counsel') {
    return stored;
  }

  const title = String(row.title || '').toLowerCase();
  if (/partner|founding|managing|principal/.test(title)) return 'partner';
  if (/of counsel/.test(title)) return 'of_counsel';
  return 'associate';
}

function mapAttorneyRow(row) {
  const awards = parseStoredJsonArray(row.awards);
  const affiliations = parseStoredJsonArray(row.affiliations);
  const legacyHighlights = parseStoredJsonArray(row.highlights);
  const mergedAwards =
    awards.length || affiliations.length ? awards : legacyHighlights;

  return {
    ...row,
    display_order: normalizeDisplayOrder(row.display_order, 100),
    attorney_level: resolveAttorneyLevel(row),
    practice_areas: parseStoredPracticeAreas(row.practice_areas),
    education: parseStoredJsonArray(row.education),
    bar_admissions: parseStoredJsonArray(row.bar_admissions),
    awards: mergedAwards,
    affiliations,
    case_work: parseStoredJsonArray(row.case_work),
    highlights: []
  };
}

module.exports = {
  normalizeBoolean,
  normalizeOfficeLocation,
  normalizeDisplayOrder,
  normalizePracticeAreas,
  parseStoredPracticeAreas,
  parseStoredJsonArray,
  mapAttorneyRow,
};
