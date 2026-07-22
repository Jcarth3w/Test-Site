/**
 * Split a postal address into street/city (line 1) and state/zip (line 2).
 * Expects addresses that end with a US state code and ZIP.
 */
export function formatOfficeAddressLines(address) {
  const raw = (address || '').trim();
  if (!raw) return null;

  const match = raw.match(/^(.*?),\s*([A-Za-z]{2})\s*,?\s*(\d{5}(?:-\d{4})?)\s*$/);
  if (!match) {
    return { line1: raw, line2: null };
  }

  return {
    line1: match[1].trim(),
    line2: `${match[2].toUpperCase()} ${match[3]}`,
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
