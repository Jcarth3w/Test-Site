import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { fetchPracticeAreas } from '../../../services/practicesApi';
import { resolveMediaUrl } from '../../../services/apiBaseUrl';

function getLastName(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : '';
}

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function normalizePracticeLabel(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

const AttorneyList = () => {
  const [attorneys, setAttorneys] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('all');
  const [catalogPracticeTitles, setCatalogPracticeTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [attorneysOutcome, practicesOutcome] = await Promise.allSettled([
        fetchPublicAttorneys(),
        fetchPracticeAreas()
      ]);

      if (practicesOutcome.status === 'fulfilled') {
        const uniqueByKey = new Map();
        practicesOutcome.value.forEach((practice) => {
          const title = normalizePracticeLabel(practice.title || '');
          if (!title) return;
          const key = title.toLowerCase();
          if (!uniqueByKey.has(key)) uniqueByKey.set(key, title);
        });
        setCatalogPracticeTitles(
          Array.from(uniqueByKey.values()).sort((a, b) => a.localeCompare(b))
        );
      } else {
        setCatalogPracticeTitles([]);
      }

      if (attorneysOutcome.status === 'fulfilled') {
        const items = attorneysOutcome.value;
        const sorted = [...items].sort((a, b) => {
          const displayA = Number.isFinite(Number(a.display_order)) ? Number(a.display_order) : 100;
          const displayB = Number.isFinite(Number(b.display_order)) ? Number(b.display_order) : 100;
          if (displayA !== displayB) return displayA - displayB;

          const equityA = /equity\s+partner/i.test(a.title || '') ? 0 : 1;
          const equityB = /equity\s+partner/i.test(b.title || '') ? 0 : 1;
          if (equityA !== equityB) return equityA - equityB;

          const lastA = getLastName(a.name);
          const lastB = getLastName(b.name);
          if (lastA.localeCompare(lastB) !== 0) return lastA.localeCompare(lastB);
          return (a.name || '').localeCompare(b.name || '');
        });
        setAttorneys(sorted);
        setErrorMessage('');
      } else {
        setErrorMessage('Unable to load attorneys right now. Please try again shortly.');
        setAttorneys([]);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const officeOptions = Array.from(
    new Set(attorneys.map((attorney) => (attorney.location || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filteredAttorneys = attorneys.filter((attorney) => {
    const normalizedQuery = query.trim().toLowerCase();
    const practiceAreas = Array.isArray(attorney.practice_areas)
      ? attorney.practice_areas.map((area) => normalizePracticeLabel(area)).filter(Boolean)
      : [];

    if (selectedOffice !== 'all' && (attorney.location || '') !== selectedOffice) {
      return false;
    }

    if (selectedPracticeArea !== 'all') {
      const selectedKey = normalizePracticeLabel(selectedPracticeArea).toLowerCase();
      const hasPractice = practiceAreas.some((area) => area.toLowerCase() === selectedKey);
      if (!hasPractice) return false;
    }

    if (!normalizedQuery) return true;

    const searchText = [
      attorney.name,
      attorney.title,
      attorney.specialty,
      attorney.location,
      practiceAreas.join(' ')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchText.includes(normalizedQuery);
  });

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedOffice !== 'all' ||
    selectedPracticeArea !== 'all';

  const clearFilters = () => {
    setQuery('');
    setSelectedOffice('all');
    setSelectedPracticeArea('all');
  };

  return (
    <section className="attorney-list">
      <div className="container">
        {loading && <p>Loading attorneys...</p>}
        {!loading && errorMessage && <p>{errorMessage}</p>}
        {!loading && !errorMessage && attorneys.length === 0 && <p>No attorneys are currently published.</p>}
        {!loading && attorneys.length > 0 && (
          <div className="attorney-layout">
            <aside className="attorney-filters" aria-label="Attorney filters">
              <h3>Find Attorneys</h3>

              <div className="attorney-search-wrap">
                <input
                  type="search"
                  className="attorney-search-input"
                  placeholder="Search by name, area, or office"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search attorneys"
                />
              </div>

              <label className="filter-label" htmlFor="office-filter">Office</label>
              <select
                id="office-filter"
                className="attorney-filter-select"
                value={selectedOffice}
                onChange={(event) => setSelectedOffice(event.target.value)}
              >
                <option value="all">All offices</option>
                {officeOptions.map((office) => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </select>

              <label className="filter-label" htmlFor="practice-filter">Area of Practice</label>
              <select
                id="practice-filter"
                className="attorney-filter-select"
                value={selectedPracticeArea}
                onChange={(event) => setSelectedPracticeArea(event.target.value)}
              >
                <option value="all">All practice areas</option>
                {catalogPracticeTitles.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </aside>

            <div className="attorney-results">
              <div className="attorney-results-toolbar" aria-live="polite">
                <p className="attorney-results-count">
                  Showing {filteredAttorneys.length} of {attorneys.length} attorneys
                </p>
                {hasActiveFilters && (
                  <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
              {filteredAttorneys.length === 0 && <p>No attorneys matched your search.</p>}
              <div className="cards-grid">
                {filteredAttorneys.map((attorney, index) => (
                  <div key={attorney.id || index} className="attorney-card">
                    <Link className="attorney-photo-link" to={`/attorneys/${slugifyName(attorney.name)}`}>
                      {attorney.photo_url ? (
                        <img
                          className="attorney-photo"
                          src={resolveMediaUrl(attorney.photo_url)}
                          alt={`${attorney.name || 'Attorney'} portrait`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="attorney-photo-placeholder" aria-label={`${attorney.name || 'Attorney'} profile`} />
                      )}
                    </Link>
                    <h3>{attorney.name}</h3>
                    <p className="title">{attorney.title}</p>
                    <p className="location">{attorney.location || attorney.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AttorneyList;
