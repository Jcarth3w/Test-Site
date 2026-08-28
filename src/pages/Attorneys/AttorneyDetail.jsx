import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPublicArticlesByAuthor } from '../../services/articlesApi';
import { fetchPublicOffices } from '../../services/officesApi';
import { attorneyMatchesOffice } from '../Offices/officeAttorneyMatch';
import AttorneyProfileHero from './components/AttorneyProfileHero';
import AttorneyDetailBody from './components/AttorneyDetailBody';
import AttorneyInsightsSection from './components/AttorneyInsightsSection';
import {
  slugifyName,
  parseJsonArray,
  practiceAreaLabel,
  isSeniorAttorney,
} from './utils/attorneyUtils';
import './styles/Attorneys.css';

const AttorneyDetail = () => {
  const { slug } = useParams();
  const [attorneys, setAttorneys] = useState([]);
  const [offices, setOffices] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [items, officeList] = await Promise.all([
          fetchPublicAttorneys(),
          fetchPublicOffices().catch(() => []),
        ]);
        setAttorneys(items);
        setOffices(Array.isArray(officeList) ? officeList : []);
      } catch {
        setAttorneys([]);
        setOffices([]);
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

  const officeHref = useMemo(() => {
    if (!attorney?.location || !offices.length) return null;
    const match = offices.find((office) => attorneyMatchesOffice(attorney.location, office.name));
    return match?.slug ? `/offices/${match.slug}` : null;
  }, [attorney, offices]);

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
          <div className="attorney-detail-page-inner">
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
          <div className="attorney-detail-page-inner">
            <h1>Attorney Not Found</h1>
            <p>The requested attorney profile is not available.</p>
            <Link className="attorney-link" to="/attorneys">Back to Attorneys</Link>
          </div>
        </section>
      </div>
    );
  }

  const senior = isSeniorAttorney(attorney);
  const photoOnRight = Number(attorney.id) % 2 === 1;
  const practiceAreas = parseJsonArray(attorney.practice_areas).map(practiceAreaLabel).filter(Boolean);
  const education = parseJsonArray(attorney.education);
  const barAdmissions = parseJsonArray(attorney.bar_admissions);
  const awards = parseJsonArray(attorney.awards);
  const affiliations = parseJsonArray(attorney.affiliations);
  const caseWork = parseJsonArray(attorney.case_work);

  return (
    <div className="attorneys-page attorney-detail-page">
      <AttorneyProfileHero
        attorney={attorney}
        photoOnRight={photoOnRight}
        officeHref={officeHref}
      />

      <div className="attorney-detail-content-band">
        <div className="attorney-detail-page-inner">
          <AttorneyDetailBody
            bio={attorney.bio}
            caseWork={caseWork}
            practiceAreas={practiceAreas}
            education={education}
            barAdmissions={barAdmissions}
            awards={awards}
            affiliations={affiliations}
            showExtendedProfile={senior}
          />
        </div>
      </div>

      <AttorneyInsightsSection articles={articles} />
    </div>
  );
};

export default AttorneyDetail;
