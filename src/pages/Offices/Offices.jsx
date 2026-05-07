import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicOffices } from '../../services/officesApi';
import { getApiBaseUrl } from '../../services/apiBaseUrl';
import './styles/Offices.css';

const API_BASE_URL = getApiBaseUrl();

function resolveImageUrl(imageUrl = '') {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

const OfficeIntro = () => {
  return (
    <section className="office-intro">
      <div className="container">
        <p className="office-kicker">Our Offices</p>
        <h1>Serving Clients Nationwide</h1>
        <p>Visit us at one of our conveniently located offices.</p>
      </div>
    </section>
  );
};

const OfficeList = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffices = async () => {
      try {
        const items = await fetchPublicOffices();
        setOffices(items);
      } catch {
        setOffices([]);
      } finally {
        setLoading(false);
      }
    };

    loadOffices();
  }, []);

  if (loading) {
    return (
      <section className="office-list-section">
        <div className="container">
          <p>Loading offices...</p>
        </div>
      </section>
    );
  }

  if (offices.length === 0) {
    return (
      <section className="office-list-section">
        <div className="container">
          <p>No offices available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="office-list-section">
      <div className="container">
        <div className="office-list">
          {offices.map((office) => (
            <Link
              key={office.id}
              to={`/offices/${office.slug}`}
              className="office-card"
            >
              {office.image_url && (
                <div className="office-card-image">
                  <img
                    src={resolveImageUrl(office.image_url)}
                    alt={office.name}
                  />
                </div>
              )}
              <div className="office-card-content">
                <h2>{office.name}</h2>
                {office.address && <p className="office-address">{office.address}</p>}
                {office.phone && <p className="office-phone">{office.phone}</p>}
                <span className="office-link-arrow">Learn More →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Offices = () => {
  return (
    <div className="offices-page">
      <OfficeIntro />
      <OfficeList />
      <footer className="footer">
        <div className="container">
          <p>© 2012 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Offices;
