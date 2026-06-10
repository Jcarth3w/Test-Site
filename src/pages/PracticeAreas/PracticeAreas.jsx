import { useEffect, useState } from 'react';
import { fetchPracticeAreas } from '../../services/practicesApi';
import PracticeAreasHero from './components/PracticeAreasHero';
import PracticeAreasGrid from './components/PracticeAreasGrid';
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
      } catch {
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
      <section className="practice-areas-main">
        <div className="container">
          <PracticeAreasHero />
          <PracticeAreasGrid loading={loading} errorMessage={errorMessage} practices={practices} />
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

export default PracticeAreas;
