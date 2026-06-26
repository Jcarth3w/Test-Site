import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../../../hooks/useInView';
import { fetchPracticeCategories } from '../../../services/practicesApi';

const PracticeCategoryGrid = () => {
  const [ref, isInView] = useInView();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchPracticeCategories();
        setCategories(data);
      } catch {
        setCategories([]);
        setErrorMessage('Unable to load practice categories right now. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div
      ref={ref}
      className={`practice-category-grid-wrap ${isInView ? 'is-in-view' : ''}`}
    >
      {loading && <p className="status-text">Loading practice areas...</p>}
      {!loading && errorMessage && <p className="status-text">{errorMessage}</p>}
      {!loading && !errorMessage && categories.length === 0 && (
        <p className="status-text">No practice categories are currently published.</p>
      )}
      {!loading && !errorMessage && categories.length > 0 && (
        <ul className="practice-category-blocks">
          {categories.map((category, index) => (
            <li
              key={category.slug}
              className="practice-category-block"
              style={{ '--practice-delay': `${index * 50}ms` }}
            >
              <Link to={`/practice/category/${category.slug}`} className="practice-category-block-link">
                <div className="practice-category-block-content">
                  <span className="practice-category-block-title">{category.title}</span>
                  <span className="practice-category-block-more" aria-hidden="true">
                    View more →
                  </span>
                </div>
                {(category.practices?.length ?? 0) > 0 ? (
                  <span className="practice-category-block-count">
                    {category.practices.length} practice area
                    {category.practices.length === 1 ? '' : 's'}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PracticeCategoryGrid;
