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
      <section className="page-hero">
        <div className="container">
          <h1>Practice Areas</h1>
          <p>Coverage, defense, subrogation, and appellate matters.</p>
        </div>
      </section>
      <section className="practice-page-intro" aria-labelledby="practice-intro-heading">
        <div className="container practice-page-intro-inner">
          <h2 id="practice-intro-heading" className="visually-hidden">
            About our practice
          </h2>
          <p>
            At our core, we are counselors to, and representatives of, the insurance industry nationwide. We are skilled
            litigators, trial attorneys, and strategic thinkers. McCoy Leavitt Laskey attorneys bring a deep understanding
            of the insurance industry, with particular strength in fire and explosion litigation and a broad portfolio of
            defense and coverage disputes.
          </p>
          <p>
            We help clients chart paths to efficient, well-reasoned resolution—whether through motion practice, mediation,
            or trial. Our attorneys concentrate in coverage, defense, subrogation, and appeals, serving carriers and their
            insureds across the country.
          </p>
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
