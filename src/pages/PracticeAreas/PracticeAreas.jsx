import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPracticeAreas } from '../../services/practicesApi';
import './styles/PracticeAreas.css';

const FIRE_EXPLOSION_KEYWORDS = [
  'fire',
  'explosion',
  'wildfire',
  'subrogation',
  'carbon monoxide',
  'electrical',
  'chemical',
  'natural gas',
  'propane'
];

const PRACTICE_CATEGORIES = [
  {
    id: 'fire-explosion',
    title: 'Fire & Explosion',
    description:
      'Focused defense for catastrophic fire, explosion, and related subrogation claims involving complex causation and technical investigation.'
  },
  {
    id: 'other',
    title: 'Other',
    description:
      'Experienced defense counsel for additional liability, coverage, construction, trucking, premises, product, and professional matters.'
  }
];

function isFireExplosionPractice(practice) {
  const searchableText = `${practice.title || ''} ${practice.description || ''} ${practice.slug || ''}`.toLowerCase();
  return FIRE_EXPLOSION_KEYWORDS.some((keyword) => searchableText.includes(keyword));
}

function groupPracticesByCategory(practices) {
  const grouped = {
    'fire-explosion': [],
    other: []
  };

  practices.forEach((practice) => {
    const categoryId = isFireExplosionPractice(practice) ? 'fire-explosion' : 'other';
    grouped[categoryId].push(practice);
  });

  return PRACTICE_CATEGORIES.map((category) => ({
    ...category,
    practiceAreas: grouped[category.id] || []
  })).filter((category) => category.practiceAreas.length > 0);
}

const PracticeAreas = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);

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

  const practiceCategories = groupPracticesByCategory(practices);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  return (
    <div className="practice-areas-page">
      <section className="page-hero">
        <div className="container">
          <h1>Practice Areas</h1>
          <p>Our attorneys provide experienced defense counsel across multiple practice areas.</p>
        </div>
      </section>
      <section className="practices-grid">
        <div className="container">
          {loading && <p>Loading practice areas...</p>}
          {!loading && errorMessage && <p>{errorMessage}</p>}
          {!loading && !errorMessage && practices.length === 0 && <p>No practice areas are currently published.</p>}
          <div className="practice-category-grid">
            {!loading && !errorMessage && practiceCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const contentId = `practice-category-${category.id}`;

              return (
                <article key={category.id} className={`practice-category-card${isExpanded ? ' expanded' : ''}`}>
                  <button
                    type="button"
                    className="practice-category-toggle"
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                  >
                    <span className="practice-category-copy">
                      <span className="practice-category-title">{category.title}</span>
                      <span className="practice-category-description">{category.description}</span>
                    </span>
                    <span className="practice-category-icon" aria-hidden="true">
                      {isExpanded ? '-' : '+'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div id={contentId} className="practice-category-content">
                      <ul className="practice-area-list">
                        {category.practiceAreas.map((practice) => (
                          <li key={practice.slug}>
                            <Link to={`/practice/${practice.slug}`} className="practice-area-link">
                              <span>{practice.title}</span>
                              {practice.description && <small>{practice.description}</small>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <p>© 2012 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default PracticeAreas;
