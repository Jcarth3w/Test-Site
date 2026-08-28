/**
 * Split a postal address into street (line 1) and city/state/zip (line 2).
 * Handles "Street, City, ST ZIP" and missing-comma forms like "Street City, ST ZIP".
 */

const MULTI_CITY_START =
  /^(Ann|San|Los|Las|Des|Fort|Mt|Mount|New|North|South|East|West|Kansas|Salt|Saint|St\.?|El|La|Lake|Grand|Cedar|Green|Spring)$/i;

const SUITE_AND_CITY = /^(?:((?:Suite|Ste\.?|Unit|#)\s*\d+)\s+)(.+)$/i;

function splitStreetAndCity(before) {
  const lastComma = before.lastIndexOf(',');
  if (lastComma !== -1) {
    const head = before.slice(0, lastComma).trim();
    const after = before.slice(lastComma + 1).trim();
    const suiteCity = after.match(SUITE_AND_CITY);
    if (suiteCity) {
      return {
        street: `${head}, ${suiteCity[1]}`.trim(),
        city: suiteCity[2].trim(),
      };
    }
    return { street: head, city: after };
  }

  const words = before.split(/\s+/).filter(Boolean);
  if (words.length < 2) return { street: before, city: null };

  let cityWordCount = 1;
  if (words.length >= 3 && MULTI_CITY_START.test(words[words.length - 2])) {
    cityWordCount = 2;
  }

  return {
    street: words.slice(0, -cityWordCount).join(' '),
    city: words.slice(-cityWordCount).join(' '),
  };
}

export function formatOfficeAddressLines(address) {
  const raw = (address || '').trim();
  if (!raw) return null;

  const tail = raw.match(/^(.*),\s*([A-Za-z]{2})\s*,?\s*(\d{5}(?:-\d{4})?)\s*$/);
  if (!tail) {
    return { line1: raw, line2: null };
  }

  const { street, city } = splitStreetAndCity(tail[1].trim());
  if (!city) {
    return { line1: raw, line2: null };
  }

  return {
    line1: street,
    line2: `${city}, ${tail[2].toUpperCase()} ${tail[3]}`,
  };
}

export function OfficeAddress({ address, className }) {
  const lines = formatOfficeAddressLines(address);
  if (!lines) return null;

  return (
    <p className={className}>
      {lines.line1}
      {lines.line2 && (
        <>
          <br />
          {lines.line2}
        </>
      )}
    </p>
  );
}
