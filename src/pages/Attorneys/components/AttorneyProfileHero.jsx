import { Link } from 'react-router-dom';
import AttorneyPhoto from './AttorneyPhoto';
import { downloadVCard } from '../utils/attorneyUtils';

const VCardIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2.25" />
    <path d="M5.5 17c.8-2 2.4-3 3.5-3s2.7 1 3.5 3" strokeLinecap="round" />
    <path d="M14 9h5M14 12h5M14 15h3" strokeLinecap="round" />
  </svg>
);

const AttorneyProfileHero = ({ attorney, photoOnRight = false }) => {
  const headerClass = photoOnRight
    ? 'attorney-detail-header-layout attorney-detail-header-layout--photo-right'
    : 'attorney-detail-header-layout';

  return (
    <header className="attorney-detail-header-band" aria-label="Attorney profile">
      <div className="attorney-detail-header-topbar">
        <div className="attorney-detail-header-topbar-inner">
          <Link className="attorney-detail-back-link" to="/attorneys">
            <span className="attorney-detail-back-arrow" aria-hidden="true">←</span>
            <span>All Attorneys</span>
          </Link>
        </div>
      </div>

      <div className="attorney-detail-header-inner">
        <div className={headerClass}>
          {attorney.photo_url && (
            <div className="attorney-detail-header-photo">
              <AttorneyPhoto
                photoUrl={attorney.photo_url}
                alt={`${attorney.name || 'Attorney'} portrait`}
                className="attorney-detail-photo"
                placeholderClassName="attorney-photo-placeholder attorney-detail-photo"
                loading="eager"
              />
            </div>
          )}
          <div className="attorney-detail-header-copy">
            <div className="attorney-detail-header-identity">
              <h1>{attorney.name}</h1>
              {attorney.title && <p className="attorney-detail-title">{attorney.title}</p>}
            </div>

            <div className="attorney-detail-contact-block">
              {attorney.location && (
                <p className="attorney-detail-location">{attorney.location}</p>
              )}
              {attorney.email && (
                <a className="attorney-detail-contact-link-item" href={`mailto:${attorney.email}`}>
                  {attorney.email}
                </a>
              )}
              {attorney.phone && (
                <p className="attorney-detail-contact-link-item">
                  <span className="attorney-detail-phone-label">Direct line:</span>{' '}
                  <a className="attorney-detail-contact-link" href={`tel:${attorney.phone}`}>
                    {attorney.phone}
                  </a>
                </p>
              )}
              <button
                type="button"
                className="download-vcard-btn"
                onClick={() => downloadVCard(attorney)}
              >
                <VCardIcon />
                Download vCard
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AttorneyProfileHero;
