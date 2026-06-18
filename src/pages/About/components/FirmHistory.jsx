import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../../../hooks/useInView';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { resolveMediaUrl } from '../../../services/apiBaseUrl';
import { firmHistory } from '../content/aboutContent';

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const Chevron = ({ open }) => (
  <svg
    className={`firm-history-chevron${open ? ' is-open' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FirmHistory = () => {
  const [ref, isInView] = useInView();
  const [expanded, setExpanded] = useState(false);
  const [attorneys, setAttorneys] = useState([]);

  const [previewParagraph, ...expandedParagraphs] = firmHistory.paragraphs;
  const hasMore = expandedParagraphs.length > 0;

  useEffect(() => {
    let cancelled = false;

    const loadAttorneys = async () => {
      try {
        const items = await fetchPublicAttorneys();
        if (!cancelled) setAttorneys(items);
      } catch {
        if (!cancelled) setAttorneys([]);
      }
    };

    loadAttorneys();
    return () => {
      cancelled = true;
    };
  }, []);

  const partners = useMemo(() => {
    return firmHistory.partners.map((partner) => {
      const attorney = attorneys.find((item) => slugifyName(item.name) === partner.slug);

      return {
        ...partner,
        photoUrl: attorney?.photo_url ? resolveMediaUrl(attorney.photo_url) : null,
      };
    });
  }, [attorneys]);

  return (
    <section
      ref={ref}
      className={`firm-history${isInView ? ' is-in-view' : ''}`}
      aria-labelledby="firm-history-heading"
    >
      <div className="about-wide-inner firm-history-inner">
        <h2 id="firm-history-heading" className="firm-history-title about-reveal about-reveal--title">
          {firmHistory.title}
        </h2>

        {firmHistory.image ? (
          <figure className="firm-history-visual about-reveal about-reveal--image">
            <img src={firmHistory.image} alt={firmHistory.imageAlt || ''} loading="lazy" />
          </figure>
        ) : null}

        <div className="firm-history-layout about-reveal about-reveal--body">
          <div className="firm-history-main">
            <p className="firm-history-preview">{previewParagraph}</p>

            {expanded &&
              expandedParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="firm-history-more">
                  {paragraph}
                </p>
              ))}

            {hasMore && (
              <button
                type="button"
                className="firm-history-toggle"
                aria-expanded={expanded}
                onClick={() => setExpanded((open) => !open)}
              >
                <span>{expanded ? firmHistory.collapseLabel : firmHistory.expandLabel}</span>
                <Chevron open={expanded} />
              </button>
            )}
          </div>

          <aside className="firm-history-partners" aria-label={firmHistory.partnersLabel}>
            <p className="firm-history-partners-label">{firmHistory.partnersLabel}</p>
            <ul className="firm-history-partners-list">
              {partners.map((partner) => (
                <li key={partner.slug}>
                  <Link to={`/attorneys/${partner.slug}`} className="firm-history-partner-link">
                    {partner.photoUrl ? (
                      <img src={partner.photoUrl} alt="" className="firm-history-partner-photo" />
                    ) : (
                      <span className="firm-history-partner-photo firm-history-partner-photo--placeholder" aria-hidden="true" />
                    )}
                    <span className="firm-history-partner-name">{partner.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default FirmHistory;
