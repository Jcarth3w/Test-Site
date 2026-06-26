import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPracticeBySlug } from '../../services/practicesApi';
import PracticeRelatedPartners from './components/PracticeRelatedPartners';
import { getRelatedPartnersForPractice } from './utils/practiceAttorneyMatching';
import './styles/PracticeDetail.css';

const PracticeDetail = () => {
  const { slug } = useParams();
  const [practice, setPractice] = useState(null);
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadPractice = async () => {
      try {
        const [practiceData, attorneysData] = await Promise.all([
          fetchPracticeBySlug(slug),
          fetchPublicAttorneys().catch(() => []),
        ]);
        setPractice(practiceData);
        setAttorneys(attorneysData);
      } catch (error) {
        setPractice(null);
        setAttorneys([]);
        setErrorMessage('Unable to load this practice area right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPractice();
  }, [slug]);

  const relatedPartners = useMemo(
    () => (practice ? getRelatedPartnersForPractice(practice, attorneys) : []),
    [practice, attorneys]
  );

  if (loading) {
    return (
      <div className="practice-detail-page">
        <div className="container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="practice-detail-page">
        <div className="container">
          <h1>Practice Area Not Found</h1>
          <p>{errorMessage || 'The requested practice area could not be found.'}</p>
          <Link to="/practice" className="btn btn-primary">View All Practice Areas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-detail-page">
      <section className="practice-hero">
        <div className="container">
          <Link to="/practice" className="practice-back-btn" aria-label="Back to practice areas">
            Back to Practice Areas
          </Link>
          <div className="hero-grid">
            <div className="hero-content">
              <h1>{practice.title}</h1>
              <p className="hero-description">{practice.content || practice.description}</p>
            </div>
            {practice.image && (
              <div className="hero-image">
                <img src={practice.image} alt={practice.title} />
              </div>
            )}
          </div>
          <PracticeRelatedPartners partners={relatedPartners} />
        </div>
      </section>
    </div>
  );
};

export default PracticeDetail;