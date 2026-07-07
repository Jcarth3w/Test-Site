export function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function parseJsonArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

export function practiceAreaLabel(area) {
  if (area == null) return '';
  if (typeof area === 'string') return area.trim();
  if (typeof area === 'object' && typeof area.title === 'string') return area.title.trim();
  return String(area).trim();
}

export function resolveAttorneyLevel(attorney = {}) {
  const stored = String(attorney.attorney_level || '').trim().toLowerCase();
  if (stored === 'partner' || stored === 'associate' || stored === 'of_counsel') {
    return stored;
  }

  const title = String(attorney.title || '').toLowerCase();
  if (/partner|founding|managing|principal/.test(title)) return 'partner';
  if (/of counsel/.test(title)) return 'of_counsel';
  return 'associate';
}

export function isSeniorAttorney(attorney) {
  const level = resolveAttorneyLevel(attorney);
  return level === 'partner' || level === 'of_counsel';
}

function normalizeComparableText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function getLastName(name = '') {
  const parts = String(name).trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : '';
}

function compareByLastName(left, right) {
  const lastA = getLastName(left?.name);
  const lastB = getLastName(right?.name);
  if (lastA.localeCompare(lastB) !== 0) return lastA.localeCompare(lastB);
  return String(left?.name || '').localeCompare(String(right?.name || ''));
}

function compareByDisplayOrder(left, right) {
  const leftOrder = Number(left?.display_order);
  const rightOrder = Number(right?.display_order);
  const leftFinite = Number.isFinite(leftOrder);
  const rightFinite = Number.isFinite(rightOrder);

  if (leftFinite && rightFinite && leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  if (leftFinite && !rightFinite) return -1;
  if (!leftFinite && rightFinite) return 1;
  return compareByLastName(left, right);
}

export function sortAttorneysByDisplayPriority(attorneys = []) {
  const partners = attorneys
    .filter((attorney) => resolveAttorneyLevel(attorney) === 'partner')
    .sort(compareByDisplayOrder);

  const priorityIds = new Set(partners.map((attorney) => attorney.id).filter(Boolean));
  const priorityNames = new Set(
    partners.map((attorney) => normalizeComparableText(attorney.name)).filter(Boolean)
  );

  const remaining = attorneys
    .filter((attorney) => {
      if (attorney.id && priorityIds.has(attorney.id)) return false;
      const normalizedName = normalizeComparableText(attorney.name);
      return !normalizedName || !priorityNames.has(normalizedName);
    })
    .sort(compareByDisplayOrder);

  return [...partners, ...remaining];
}

function escapeVCardValue(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { familyName: '', givenName: '', additionalName: '' };
  if (parts.length === 1) return { familyName: parts[0], givenName: '', additionalName: '' };

  const familyName = parts[parts.length - 1];
  const givenName = parts[0];
  const additionalName = parts.slice(1, -1).join(' ');
  return { familyName, givenName, additionalName };
}

export function downloadVCard(attorney) {
  if (!attorney || !attorney.name) return;

  const { familyName, givenName, additionalName } = splitName(attorney.name);
  const firmName = 'McCoy Leavitt Laskey LLC';
  const revisionDate = new Date().toISOString().replace(/\.\d{3}Z$/, ',000Z');

  const vcardLines = [
    'BEGIN:VCARD',
    'PROFILE:VCARD',
    'VERSION:3.0',
    'MAILER:Microsoft Exchange',
    'PRODID:Microsoft Exchange',
    `FN:${escapeVCardValue(attorney.name)}`,
    `N:${escapeVCardValue(familyName)};${escapeVCardValue(givenName)};${escapeVCardValue(additionalName)};;`,
    attorney.phone ? `TEL;TYPE=WORK,VOICE:${escapeVCardValue(attorney.phone)}` : '',
    attorney.email ? `EMAIL;TYPE=INTERNET:${escapeVCardValue(attorney.email)}` : '',
    'NOTE:\\n\\n',
    `ORG:${escapeVCardValue(firmName)};`,
    'CLASS:PUBLIC',
    attorney.title ? `TITLE:${escapeVCardValue(attorney.title)}` : '',
    'X-MS-IMADDRESS:',
    'URL;TYPE=WORK:https://mlllaw.com',
    `REV;VALUE=DATE-TIME:${revisionDate}`,
    'END:VCARD'
  ].filter(Boolean);

  const blob = new Blob([vcardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugifyName(attorney.name)}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
