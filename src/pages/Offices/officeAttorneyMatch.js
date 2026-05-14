/** Normalize office / attorney location strings for comparison (matches backend attorney office keys). */
export function normalizeLocationKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Whether an attorney's `location` field corresponds to this office's display name.
 * Supports attorney values like "Milwaukee, WI" and office names like "Milwaukee" or "Milwaukee Office".
 */
export function attorneyMatchesOffice(attorneyLocation, officeName) {
  const raw = String(attorneyLocation || '').trim();
  const o = normalizeLocationKey(officeName);
  if (!raw || !o) return false;

  const fullKey = normalizeLocationKey(raw);
  if (fullKey === o) return true;

  const cityPart = raw.split(',')[0].trim();
  const cityKey = normalizeLocationKey(cityPart);
  if (!cityKey) return false;
  if (o === cityKey) return true;

  const minOverlap = 5;
  if (cityKey.length >= minOverlap && o.includes(cityKey)) return true;
  if (o.length >= minOverlap && cityKey.includes(o)) return true;

  if (fullKey.length >= minOverlap && o.includes(fullKey)) return true;
  if (o.length >= minOverlap && fullKey.includes(o)) return true;

  return false;
}

export function slugifyAttorneyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function attorneysForOffice(allAttorneys, office) {
  if (!office?.name || !Array.isArray(allAttorneys)) return [];
  const matched = allAttorneys.filter((attorney) => attorneyMatchesOffice(attorney.location, office.name));
  return [...matched].sort((a, b) => {
    const da = Number(a.display_order);
    const db = Number(b.display_order);
    if (Number.isFinite(da) && Number.isFinite(db) && da !== db) return da - db;
    return (a.name || '').localeCompare(b.name || '');
  });
}
