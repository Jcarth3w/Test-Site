/**
 * Embedded Google Map for a postal address (no API key; uses Google Maps query embed).
 */
export default function OfficeMapEmbed({ address, label, compact = false }) {
  const q = (address || '').trim();
  if (!q) return null;

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=en&z=15&ie=UTF8&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  return (
    <div className={`office-map-embed${compact ? ' office-map-embed--compact' : ''}`}>
      <iframe
        title={label ? `Map: ${label}` : 'Google Map'}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a className="office-map-external" href={external} target="_blank" rel="noreferrer">
        Open in Google Maps
      </a>
    </div>
  );
}
