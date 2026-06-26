import { Link } from 'react-router-dom';
import AttorneyPhoto from '../../Attorneys/components/AttorneyPhoto';
import { getAttorneyProfilePath } from '../utils/practiceAttorneyMatching';

const PracticeRelatedPartners = ({ partners = [] }) => {
  if (!partners.length) {
    return (
      <section className="practice-related-partners" aria-label="Related partners">
        <h3>Related Partners</h3>
        <p className="practice-related-partners-empty">
          Contact our office to connect with an attorney experienced in this practice area.
        </p>
        <Link to="/attorneys" className="practice-related-partners-link">
          View all attorneys
        </Link>
      </section>
    );
  }

  return (
    <section className="practice-related-partners" aria-label="Related partners">
      <h3>Related Partners</h3>
      <ul className="practice-related-partners-list">
        {partners.map((attorney) => (
          <li key={attorney.id || attorney.name}>
            <Link
              to={getAttorneyProfilePath(attorney)}
              className="practice-related-partner-card"
            >
              <AttorneyPhoto
                photoUrl={attorney.photo_url}
                alt={`${attorney.name || 'Attorney'} portrait`}
                className="practice-related-partner-photo"
                placeholderClassName="practice-related-partner-photo practice-related-partner-photo--placeholder"
              />
              <span className="practice-related-partner-copy">
                <span className="practice-related-partner-name">{attorney.name}</span>
                {attorney.title && (
                  <span className="practice-related-partner-title">{attorney.title}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PracticeRelatedPartners;
