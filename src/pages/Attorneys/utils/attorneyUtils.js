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
