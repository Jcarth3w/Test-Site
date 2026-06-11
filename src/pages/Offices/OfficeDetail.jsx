import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPublicOffices, fetchPublicOfficeBySlug } from '../../services/officesApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import OfficeMapEmbed from './components/OfficeMapEmbed';
import { attorneysForOffice, slugifyAttorneyName } from './officeAttorneyMatch';
import './styles/Offices.css';

const OfficeDetail = () => {
  const { slug } = useParams();
  const [office, setOffice] = useState(null);
  const [offices, setOffices] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [officeData, allOffices, attorneyList] = await Promise.all([
          fetchPublicOfficeBySlug(slug),
          fetchPublicOffices(),
          fetchPublicAttorneys().catch(() => [])
        ]);
        setOffice(officeData);
        setOffices(allOffices);
        setAttorneys(Array.isArray(attorneyList) ? attorneyList : []);
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
  const officeAttorneys = attorneysForOffice(attorneys, office);
  const hasMediaColumn = Boolean(office.image_url || office.address);

  return (
    <div className="offices-page">
      <section className="office-detail">
        <div className="container">
          <div
            className={`office-detail-layout${
              otherOffices.length === 0 ? ' office-detail-layout--no-aside' : ''
            }`}
          >
            <div className="office-detail-main">
              <div
                className={
                  hasMediaColumn ? 'office-detail-grid' : 'office-detail-grid office-detail-grid--single'
                }
              >
                {hasMediaColumn && (
                  <div className="office-detail-media">
                    {office.image_url && (
                      <img
                        className="office-detail-image"
                        src={resolveMediaUrl(office.image_url)}
                        alt={office.name}
                      />
                    )}
                    {office.address && (
                      <OfficeMapEmbed address={office.address} label={office.name} />
                    )}
                  </div>
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
                  {officeAttorneys.length > 0 && (
                    <div className="office-detail-attorneys">
                      <h2 className="office-detail-attorneys-heading">Our attorneys in this office</h2>
                      <ul className="office-detail-attorney-list">
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
                </div>
              </div>
            </div>

            {otherOffices.length > 0 && (
              <aside className="office-detail-aside" aria-label="Other office locations">
                <h2 className="office-detail-aside-heading">Other offices</h2>
                <ul className="office-detail-aside-list">
                  {otherOffices.map((o) => (
                    <li key={o.id}>
                      <Link to={`/offices/${o.slug}`}>{o.name}</Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OfficeDetail;
