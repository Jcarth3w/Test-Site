import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPracticeAreas } from '../../services/practicesApi';
import './styles/PracticeAreas.css';

const PracticeAreas = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPracticeAreas();
        setPractices(data);
      } catch (error) {
        setErrorMessage('Unable to load practice areas right now. Please try again shortly.');
        setPractices([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="practice-areas-page">
      <section className="page-hero">
        <div className="container">
          <h1>Practice Areas</h1>
          <p>Our attorneys specialize in catastrophic injury litigation across multiple practice areas.</p>
        </div>
      </section>
      <section className="practices-grid">
        <div className="container">
          {loading && <p>Loading practice areas...</p>}
          {!loading && errorMessage && <p>{errorMessage}</p>}
          {!loading && !errorMessage && practices.length === 0 && <p>No practice areas are currently published.</p>}
          <div className="grid">
            {practices.map((practice) => (
              <div key={practice.slug} className="practice-card">
                <div className="practice-card-media">
                  <img src={practice.image} alt={practice.title} className="practice-card-image" loading="lazy" />
                </div>
                <h3>{practice.title}</h3>
                <p>{practice.description}</p>
                <Link to={`/practice/${practice.slug}`} className="btn btn-primary">
                  Learn More
                </Link>
              </div>
            ))}
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

export default PracticeAreas;
