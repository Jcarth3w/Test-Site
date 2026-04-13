import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPracticeBySlug } from '../../services/practicesApi';
import './styles/PracticeDetail.css';

const PracticeDetail = () => {
  const { slug } = useParams();
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadPractice = async () => {
      try {
        const data = await fetchPracticeBySlug(slug);
        setPractice(data);
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

  return (
    <div className="practice-detail-page">
      <section className="practice-hero">
        <div className="container">
          <Link to="/practice" className="practice-back-btn" aria-label="Back to practice areas">
            <span>Back to Practice Areas</span>
          </Link>
          <div className="hero-content">
            <h1>{practice.title}</h1>
            <p>{practice.description}</p>
          </div>
          <div className="hero-image">
            <img src={practice.image} alt={practice.title} />
          </div>
        </div>
      </section>
      <section className="practice-content">
        <div className="container">
          <div className="content-wrapper">
            <div className="content-text">
              <p>{practice.content}</p>
            </div>
            <div className="content-cta">
              <h3>Ready to Discuss Your Case?</h3>
              <p>Get a free, confidential case review with our experienced attorneys.</p>
              <Link to="/contact" className="btn btn-primary">
                {practice.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 MLL Law. All rights reserved.</p>
          <p>Contact us for a free case evaluation.</p>
        </div>
      </footer>
    </div>
  );
};

export default PracticeDetail;