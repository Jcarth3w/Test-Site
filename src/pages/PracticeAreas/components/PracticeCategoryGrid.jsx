import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { practiceCategorySections } from '../../../data/practices';

const PracticeCategoryGrid = ({ loading, errorMessage, practices }) => {
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

  return (
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
  );
};

export default PracticeCategoryGrid;
