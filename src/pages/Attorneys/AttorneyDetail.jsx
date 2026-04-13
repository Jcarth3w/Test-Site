import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { getApiBaseUrl } from '../../services/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function resolvePhotoUrl(photoUrl = '') {
  if (!photoUrl) return '';
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return `${API_BASE_URL}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
}

const AttorneyDetail = () => {
  const { slug } = useParams();
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const items = await fetchPublicAttorneys();
        setAttorneys(items);
      } catch {
        setAttorneys([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const attorney = useMemo(
    () => attorneys.find((item) => slugifyName(item.name) === slug),
    [attorneys, slug]
  );

  if (loading) {
    return (
      <div className="attorneys-page">
        <section className="attorney-detail">
          <div className="container">
            <p>Loading attorney profile...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!attorney) {
    return (
      <div className="attorneys-page">
        <section className="attorney-detail">
          <div className="container">
            <h1>Attorney Not Found</h1>
            <p>The requested attorney profile is not available.</p>
            <Link className="attorney-link" to="/attorneys">Back to Attorneys</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="attorneys-page">
      <section className="attorney-detail">
        <div className="container">
          <Link className="attorney-back" to="/attorneys" aria-label="Back to Attorneys">
            <span className="attorney-back-icon" aria-hidden="true"></span>
            <span>Back to Attorneys</span>
          </Link>

          <div className="attorney-detail-grid">
            {attorney.photo_url && (
              <img
                className="attorney-detail-photo"
                src={resolvePhotoUrl(attorney.photo_url)}
                alt={`${attorney.name || 'Attorney'} portrait`}
              />
            )}

            <div className="attorney-detail-content">
              <h1>{attorney.name}</h1>
              <p className="attorney-detail-title">{attorney.title}</p>
              <p className="attorney-detail-location">{attorney.location || attorney.specialty}</p>
              {attorney.specialty && <p className="attorney-detail-specialty">{attorney.specialty}</p>}
              {attorney.bio && <p className="attorney-detail-bio">{attorney.bio}</p>}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 MLL Law. All rights reserved.</p>
          <p>Contact us to schedule an attorney consultation.</p>
        </div>
      </footer>
    </div>
  );
};

export default AttorneyDetail;
