import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPracticeAreas } from '../../../services/practicesApi';
import { useInView } from '../../../hooks/useInView';
import '../styles/HomeShared.css';
import '../styles/HomePracticeAreasSection.css';

const HomePracticeAreasSection = ({ section }) => {
  const [ref, isInView] = useInView();
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

  const featuredPractices = useMemo(() => {
    const seen = new Set();
    const matched = [];

    for (const slug of section.featuredSlugs) {
      const practice = practices.find((item) => item.slug === slug);
      if (practice && !seen.has(practice.slug)) {
        seen.add(practice.slug);
        matched.push(practice);
      }
      if (matched.length >= section.featuredCount) break;
    }

    if (matched.length >= section.featuredCount) {
      return matched;
    }

    // Only show explicitly featured practices — never pad with unrelated areas.
    return matched.slice(0, section.featuredCount);
  }, [practices, section.featuredSlugs, section.featuredCount]);

  const [leftColumn, rightColumn] = useMemo(() => {
    const midpoint = Math.ceil(featuredPractices.length / 2);
    return [
      featuredPractices.slice(0, midpoint),
      featuredPractices.slice(midpoint),
    ];
  }, [featuredPractices]);

  return (
    <section
      ref={ref}
      className={`home-practice-areas ${isInView ? 'is-in-view' : ''}`}
      aria-labelledby="home-practice-areas-heading"
    >
      <div className="home-practice-areas-bg" aria-hidden="true" />
      <div className="container">
        <div className="home-practice-areas-layout">
          <header className="home-practice-areas-intro home-practice-animate home-practice-animate--intro">
            <h2 id="home-practice-areas-heading">{section.title}</h2>
            <div className="home-practice-areas-title-rule" aria-hidden="true" />
            <Link to={section.viewAllLink} className="home-practice-areas-view-all">
              {section.viewAllLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="home-practice-areas-links">
            {loading && <p className="home-practice-areas-status">Loading practice areas…</p>}
            {!loading && errorMessage && <p className="home-practice-areas-status">{errorMessage}</p>}
            {!loading && !errorMessage && featuredPractices.length === 0 && (
              <p className="home-practice-areas-status">No practice areas are currently published.</p>
            )}
            {!loading && !errorMessage && featuredPractices.length > 0 && (
              <div className="home-practice-areas-columns">
                {[leftColumn, rightColumn].map((column, columnIndex) => (
                  <ul
                    key={columnIndex === 0 ? 'left' : 'right'}
                    className="home-practice-areas-column"
                  >
                    {column.map((practice, index) => (
                      <li
                        key={practice.slug}
                        className="home-practice-animate home-practice-animate--item"
                        style={{
                          '--practice-item-delay': `${columnIndex * 80 + index * 70}ms`,
                        }}
                      >
                        <Link to={`/practice/${practice.slug}`} className="home-practice-areas-link">
                          <span className="home-practice-areas-link-text">{practice.title}</span>
                          <span className="home-practice-areas-link-arrow" aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePracticeAreasSection;
