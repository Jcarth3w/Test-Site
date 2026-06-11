import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../../../hooks/useInView';

const PracticeAreasGrid = ({ loading, errorMessage, practices }) => {
  const [ref, isInView] = useInView();

  const sortedPractices = useMemo(
    () => [...practices].sort((a, b) => (a.title || '').localeCompare(b.title || '')),
    [practices]
  );

  const [leftColumn, rightColumn] = useMemo(() => {
    const midpoint = Math.ceil(sortedPractices.length / 2);
    return [sortedPractices.slice(0, midpoint), sortedPractices.slice(midpoint)];
  }, [sortedPractices]);

  const renderColumn = (items, columnOffset = 0) => (
    <ul className="practice-areas-column">
      {items.map((practice, index) => (
        <li
          key={practice.slug}
          className="practice-areas-item"
          style={{ '--practice-delay': `${(columnOffset + index) * 45}ms` }}
        >
          <Link to={`/practice/${practice.slug}`} className="practice-areas-link">
            <span className="practice-areas-link-text">{practice.title}</span>
            <span className="practice-areas-link-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={ref}
      className={`practice-areas-grid-wrap ${isInView ? 'is-in-view' : ''}`}
    >
      {loading && <p className="status-text">Loading practice areas...</p>}
      {!loading && errorMessage && <p className="status-text">{errorMessage}</p>}
      {!loading && !errorMessage && practices.length === 0 && (
        <p className="status-text">No practice areas are currently published.</p>
      )}
      {!loading && !errorMessage && practices.length > 0 && (
        <div className="practice-areas-columns">
          {renderColumn(leftColumn, 0)}
          {renderColumn(rightColumn, leftColumn.length)}
        </div>
      )}
    </div>
  );
};

export default PracticeAreasGrid;
