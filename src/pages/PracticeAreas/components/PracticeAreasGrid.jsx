import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function getColumnCount(width = window.innerWidth) {
  if (width <= 640) return 1;
  if (width <= 1100) return 2;
  return 4;
}

function padForGrid(items, columnCount) {
  const remainder = items.length % columnCount;
  if (remainder === 0) return items;

  const padCount = columnCount - remainder;
  return [...items, ...Array(padCount).fill(null)];
}

function useColumnCount() {
  const [columnCount, setColumnCount] = useState(() => getColumnCount());

  useEffect(() => {
    const updateColumnCount = () => setColumnCount(getColumnCount());
    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  return columnCount;
}

const PracticeAreasGrid = ({ loading, errorMessage, practices }) => {
  const columnCount = useColumnCount();

  const sortedPractices = useMemo(
    () => [...practices].sort((a, b) => (a.title || '').localeCompare(b.title || '')),
    [practices]
  );

  const gridItems = useMemo(
    () => padForGrid(sortedPractices, columnCount),
    [sortedPractices, columnCount]
  );

  return (
    <div className="practice-areas-grid-wrap">
      {loading && <p className="status-text">Loading practice areas...</p>}
      {!loading && errorMessage && <p className="status-text">{errorMessage}</p>}
      {!loading && !errorMessage && practices.length === 0 && (
        <p className="status-text">No practice areas are currently published.</p>
      )}
      {!loading && !errorMessage && practices.length > 0 && (
        <ul
          className="practice-areas-grid"
          style={{ '--practice-columns': columnCount }}
        >
          {gridItems.map((practice, index) =>
            practice ? (
              <li key={practice.slug}>
                <Link to={`/practice/${practice.slug}`} className="practice-areas-link">
                  {practice.title}
                </Link>
              </li>
            ) : (
              <li key={`spacer-${index}`} className="practice-areas-spacer" aria-hidden="true" />
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default PracticeAreasGrid;
