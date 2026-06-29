import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPracticeBySlug } from '../../services/practicesApi';
import { getAttorneySearchPathForPractice } from './utils/practiceAttorneyMatching';
import { getPracticeParagraphs } from './utils/practiceContent';
import './styles/PracticeDetail.css';

const PracticeDetail = () => {
  const { slug } = useParams();
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadPractice = async () => {
      try {
        const practiceData = await fetchPracticeBySlug(slug);
        setPractice(practiceData);
      } catch (error) {
        setPractice(null);
        setErrorMessage('Unable to load this practice area right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPractice();
  }, [slug]);

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

  const descriptionParagraphs = getPracticeParagraphs(practice.content || practice.description);

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
              <div className="hero-description">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                ))}
              </div>
              <div className="practice-attorneys-btn-wrap">
                <Link
                  to={getAttorneySearchPathForPractice(practice)}
                  className="practice-attorneys-btn"
                >
                  View attorneys
                </Link>
              </div>
            </div>
            {practice.image && (
              <div className="hero-image">
                <img src={practice.image} alt={practice.title} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PracticeDetail;