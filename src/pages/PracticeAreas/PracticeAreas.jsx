import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPracticeAreas } from '../../services/practicesApi';
import { practiceCategorySections } from '../../data/practices';
import './styles/PracticeAreas.css';

const PracticeAreas = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const practicesByCategory = useMemo(() => {
    const grouped = {};
    practices.forEach((practice) => {
      const categorySlug = practice.category || '';
      if (!grouped[categorySlug]) grouped[categorySlug] = [];
      grouped[categorySlug].push(practice);
    });
    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    });
    return grouped;
  }, [practices]);

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
          <p>Coverage, defense, subrogation, and appellate matters.</p>
        </div>
      </section>
      <section className="practice-categories">
        <div className="container">
          {loading && <p className="status-text">Loading practice areas...</p>}
          {!loading && errorMessage && <p className="status-text">{errorMessage}</p>}
          {!loading && !errorMessage && practices.length === 0 && (
            <p className="status-text">No practice areas are currently published.</p>
          )}
          {!loading && !errorMessage && practices.length > 0 && (
            <div className="practice-tabs">
              {practiceCategorySections.map((section) => {
                const sectionPractices = practicesByCategory[section.slug] || [];
                if (sectionPractices.length === 0) return null;
                return (
                  <article key={section.slug} className="category-tab">
                    <header className="category-tab-header">
                      <h2>{section.title}</h2>
                      <p className="category-subtitle">{section.subtitle}</p>
                    </header>
                    <ul className="category-practices">
                      {sectionPractices.map((practice) => (
                        <li key={`${section.slug}-${practice.slug}`}>
                          <Link to={`/practice/${practice.slug}`}>{practice.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}
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
