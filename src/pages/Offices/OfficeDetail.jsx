import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicOffices, fetchPublicOfficeBySlug } from '../../services/officesApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import './styles/Offices.css';

const OfficeDetail = () => {
  const { slug } = useParams();
  const [office, setOffice] = useState(null);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const officeData = await fetchPublicOfficeBySlug(slug);
        setOffice(officeData);
        
        const allOffices = await fetchPublicOffices();
        setOffices(allOffices);
      } catch {
        setOffice(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="offices-page">
        <section className="office-detail">
          <div className="container">
            <p>Loading office information...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="offices-page">
        <section className="office-detail">
          <div className="container">
            <h1>Office Not Found</h1>
            <p>The requested office is not available.</p>
            <Link className="office-link" to="/offices">Back to Offices</Link>
          </div>
        </section>
      </div>
    );
  }

  const otherOffices = offices.filter((o) => o.id !== office.id);

  return (
    <div className="offices-page">
      <section className="office-detail">
        <div className="container">
          <Link className="office-back" to="/offices" aria-label="Back to Offices">
            <span className="office-back-icon" aria-hidden="true"></span>
            <span>Back to Offices</span>
          </Link>

          <div className="office-detail-grid">
            {office.image_url && (
              <img
                className="office-detail-image"
                src={resolveMediaUrl(office.image_url)}
                alt={office.name}
              />
            )}

            <div className="office-detail-content">
              <h1>{office.name}</h1>
              {office.address && (
                <p className="office-detail-address">{office.address}</p>
              )}
              {office.phone && (
                <p className="office-detail-phone">
                  <strong>Phone:</strong> <a href={`tel:${office.phone}`}>{office.phone}</a>
                </p>
              )}
              {office.email && (
                <p className="office-detail-email">
                  <strong>Email:</strong> <a href={`mailto:${office.email}`}>{office.email}</a>
                </p>
              )}
              {office.description && (
                <div className="office-detail-description">
                  {office.description}
                </div>
              )}
            </div>
          </div>

          {otherOffices.length > 0 && (
            <div className="other-offices-section">
              <h2>Our Other Offices</h2>
              <div className="office-links-list">
                {otherOffices.map((o) => (
                  <Link key={o.id} to={`/offices/${o.slug}`} className="office-links-item">
                    {o.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>© 2013 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default OfficeDetail;
