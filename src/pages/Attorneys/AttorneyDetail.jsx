import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPublicArticlesByAuthor } from '../../services/articlesApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import './styles/Attorneys.css';

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escapeVCardValue(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { familyName: '', givenName: '', additionalName: '' };
  if (parts.length === 1) return { familyName: parts[0], givenName: '', additionalName: '' };

  const familyName = parts[parts.length - 1];
  const givenName = parts[0];
  const additionalName = parts.slice(1, -1).join(' ');
  return { familyName, givenName, additionalName };
}

function downloadVCard(attorney) {
  if (!attorney || !attorney.name) return;

  const { familyName, givenName, additionalName } = splitName(attorney.name);
  const firmName = 'McCoy Leavitt Laskey LLC';
  const revisionDate = new Date().toISOString().replace(/\.\d{3}Z$/, ',000Z');

  const vcardLines = [
    'BEGIN:VCARD',
    'PROFILE:VCARD',
    'VERSION:3.0',
    'MAILER:Microsoft Exchange',
    'PRODID:Microsoft Exchange',
    `FN:${escapeVCardValue(attorney.name)}`,
    `N:${escapeVCardValue(familyName)};${escapeVCardValue(givenName)};${escapeVCardValue(additionalName)};;`,
    attorney.phone ? `TEL;TYPE=WORK,VOICE:${escapeVCardValue(attorney.phone)}` : '',
    attorney.email ? `EMAIL;TYPE=INTERNET:${escapeVCardValue(attorney.email)}` : '',
    'NOTE:\\n\\n',
    `ORG:${escapeVCardValue(firmName)};`,
    'CLASS:PUBLIC',
    attorney.title ? `TITLE:${escapeVCardValue(attorney.title)}` : '',
    'X-MS-IMADDRESS:',
    'URL;TYPE=WORK:https://mlllaw.com',
    `REV;VALUE=DATE-TIME:${revisionDate}`,
    'END:VCARD'
  ].filter(Boolean);

  const blob = new Blob([vcardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugifyName(attorney.name)}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseJsonArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

function practiceAreaLabel(area) {
  if (area == null) return '';
  if (typeof area === 'string') return area.trim();
  if (typeof area === 'object' && typeof area.title === 'string') return area.title.trim();
  return String(area).trim();
}

const AttorneyDetail = () => {
  const { slug } = useParams();
  const [attorneys, setAttorneys] = useState([]);
  const [articles, setArticles] = useState([]);
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

  useEffect(() => {
    if (attorney?.id) {
      const loadArticles = async () => {
        try {
          const authorArticles = await fetchPublicArticlesByAuthor(attorney.id);
          setArticles(authorArticles);
        } catch {
          setArticles([]);
        }
      };
      loadArticles();
    }
  }, [attorney]);

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

  const practiceAreasRaw = parseJsonArray(attorney.practice_areas);
  const practiceAreas = practiceAreasRaw.map(practiceAreaLabel).filter(Boolean);
  const education = parseJsonArray(attorney.education);
  const barAdmissions = parseJsonArray(attorney.bar_admissions);
  const awards = parseJsonArray(attorney.awards);
  const affiliations = parseJsonArray(attorney.affiliations);

  return (
    <div className="attorneys-page">
      <section className="attorney-detail">
        <div className="container attorney-detail-container">
          <div className="attorney-detail-profile-card">
            <div className="attorney-detail-header">
              {attorney.photo_url && (
                <img
                  className="attorney-detail-photo"
                  src={resolveMediaUrl(attorney.photo_url)}
                  alt={`${attorney.name || 'Attorney'} portrait`}
                />
              )}
              <div className="attorney-detail-info">
                <h1>{attorney.name}</h1>
                {attorney.title && <p className="attorney-detail-title">{attorney.title}</p>}
                <div className="attorney-detail-meta">
                  {attorney.location && (
                    <p className="attorney-detail-meta-item">
                      <span className="attorney-detail-meta-label">Location</span>
                      <span className="attorney-detail-meta-value">{attorney.location}</span>
                    </p>
                  )}
                  {attorney.email && (
                    <p className="attorney-detail-meta-item">
                      <span className="attorney-detail-meta-label">Email</span>
                      <a className="attorney-detail-meta-value" href={`mailto:${attorney.email}`}>
                        {attorney.email}
                      </a>
                    </p>
                  )}
                  {attorney.phone && (
                    <p className="attorney-detail-meta-item">
                      <span className="attorney-detail-meta-label">Phone</span>
                      <a className="attorney-detail-meta-value" href={`tel:${attorney.phone}`}>
                        {attorney.phone}
                      </a>
                    </p>
                  )}
                </div>
                <div className="attorney-detail-actions">
                  <button
                    type="button"
                    className="download-vcard-link"
                    onClick={() => downloadVCard(attorney)}
                  >
                    Download vCard
                  </button>
                </div>
              </div>
            </div>
            {attorney.bio && (
              <div className="attorney-detail-bio-wrap">
                <p className="attorney-detail-bio">{attorney.bio}</p>
              </div>
            )}
          </div>

          <div className="attorney-detail-sections">
            {practiceAreas.length > 0 && (
              <div className="attorney-section">
                <h3>Practice Areas</h3>
                <ul className="attorney-list">
                  {practiceAreas.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            )}

            {education.length > 0 && (
              <div className="attorney-section">
                <h3>Education</h3>
                <ul className="attorney-list">
                  {education.map((item, idx) => (
                    <li key={idx}>
                      {item.degree} {item.school}{item.year ? `, ${item.year}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {barAdmissions.length > 0 && (
              <div className="attorney-section">
                <h3>Bar Admissions</h3>
                <ul className="attorney-list">
                  {barAdmissions.map((admission, idx) => (
                    <li key={idx}>
                      {admission.state}{admission.year ? `, ${admission.year}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {awards.length > 0 && (
              <div className="attorney-section">
                <h3>Awards</h3>
                <ul className="attorney-list">
                  {awards.map((item, idx) => (
                    <li key={idx}>
                      {item.title}
                      {item.description && ` - ${item.description}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {affiliations.length > 0 && (
              <div className="attorney-section">
                <h3>Affiliations</h3>
                <ul className="attorney-list">
                  {affiliations.map((item, idx) => (
                    <li key={idx}>
                      {item.title}
                      {item.description && ` - ${item.description}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {articles.length > 0 && (
              <div className="attorney-section attorney-section-full">
                <h3>Publications & Articles</h3>
                <ul className="attorney-articles-list">
                  {articles.map((article) => (
                    <li key={article.id} className="attorney-article-card">
                      <Link to={`/articles/${article.slug}`} className="article-link">
                        {article.title}
                      </Link>
                      {article.publication_date && (
                        <p className="article-date">
                          {new Date(article.publication_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                      {article.summary && <p className="article-summary">{article.summary}</p>}
                      <div className="attorney-article-actions">
                        <Link to={`/articles/${article.slug}`} className="attorney-article-read-more">
                          Read Article →
                        </Link>
                        {article.source_url && (
                          <a
                            href={article.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attorney-article-source"
                          >
                            Visit Source ↗
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AttorneyDetail;
