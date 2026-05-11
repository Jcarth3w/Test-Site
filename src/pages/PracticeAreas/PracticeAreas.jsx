import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPracticeAreas } from '../../services/practicesApi';
import { practiceCategorySections } from '../../data/practices';
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
