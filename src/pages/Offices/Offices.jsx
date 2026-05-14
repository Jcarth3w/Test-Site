import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPublicOffices } from '../../services/officesApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import OfficeMapEmbed from './components/OfficeMapEmbed';
import { attorneysForOffice, slugifyAttorneyName } from './officeAttorneyMatch';
import './styles/Offices.css';

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
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffices = async () => {
      try {
        const [officeItems, attorneyItems] = await Promise.all([
          fetchPublicOffices(),
          fetchPublicAttorneys().catch(() => [])
        ]);
        setOffices(officeItems);
        setAttorneys(Array.isArray(attorneyItems) ? attorneyItems : []);
      } catch {
        setOffices([]);
        setAttorneys([]);
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
          {offices.map((office) => {
            const officeAttorneys = attorneysForOffice(attorneys, office);
            return (
              <article key={office.id} className="office-card">
                <Link to={`/offices/${office.slug}`} className="office-card-link">
                  {office.image_url && (
                    <div className="office-card-image">
                      <img
                        src={resolveMediaUrl(office.image_url)}
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
                {office.address && (
                  <OfficeMapEmbed address={office.address} label={office.name} compact />
                )}
                {officeAttorneys.length > 0 && (
                  <div className="office-card-attorneys">
                    <h3 className="office-card-attorneys-heading">Attorneys in this office</h3>
                    <ul className="office-card-attorney-list">
                      {officeAttorneys.map((attorney) => (
                        <li key={attorney.id}>
                          <Link to={`/attorneys/${slugifyAttorneyName(attorney.name)}`}>
                            {attorney.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
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
          <p>© 2013 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Offices;
