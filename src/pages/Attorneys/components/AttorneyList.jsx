import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { getApiBaseUrl } from '../../../services/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

function getLastName(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : '';
}

function resolvePhotoUrl(photoUrl = '') {
  if (!photoUrl) return '';
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return `${API_BASE_URL}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
}

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const AttorneyList = () => {
  const [attorneys, setAttorneys] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const items = await fetchPublicAttorneys();
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
      } catch (error) {
        setAttorneys([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const officeOptions = Array.from(
    new Set(attorneys.map((attorney) => (attorney.location || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const positionOptions = Array.from(
    new Set(attorneys.map((attorney) => (attorney.title || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const practiceAreaOptions = Array.from(
    new Set(
      attorneys
        .flatMap((attorney) => (Array.isArray(attorney.practice_areas) ? attorney.practice_areas : []))
        .map((area) => String(area || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredAttorneys = attorneys.filter((attorney) => {
    const normalizedQuery = query.trim().toLowerCase();
    const practiceAreas = Array.isArray(attorney.practice_areas)
      ? attorney.practice_areas.map((area) => String(area || '').trim()).filter(Boolean)
      : [];

    if (selectedOffice !== 'all' && (attorney.location || '') !== selectedOffice) {
      return false;
    }

    if (selectedPosition !== 'all' && (attorney.title || '') !== selectedPosition) {
      return false;
    }

    if (selectedPracticeArea !== 'all') {
      const hasPractice = practiceAreas.some((area) => area.toLowerCase() === selectedPracticeArea.toLowerCase());
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
    selectedPosition !== 'all' ||
    selectedPracticeArea !== 'all';

  const clearFilters = () => {
    setQuery('');
    setSelectedOffice('all');
    setSelectedPosition('all');
    setSelectedPracticeArea('all');
  };

  return (
    <section className="attorney-list">
      <div className="container">
        {loading && <p>Loading attorneys...</p>}
        {!loading && attorneys.length === 0 && <p>No attorneys are currently published.</p>}
        {!loading && attorneys.length > 0 && (
          <div className="attorney-layout">
            <aside className="attorney-filters" aria-label="Attorney filters">
              <h3>Find Attorneys</h3>

              <div className="attorney-search-wrap">
                <input
                  type="search"
                  className="attorney-search-input"
                  placeholder="Search by name, area, office, or position"
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

              <label className="filter-label" htmlFor="position-filter">Position</label>
              <select
                id="position-filter"
                className="attorney-filter-select"
                value={selectedPosition}
                onChange={(event) => setSelectedPosition(event.target.value)}
              >
                <option value="all">All positions</option>
                {positionOptions.map((position) => (
                  <option key={position} value={position}>{position}</option>
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
                {practiceAreaOptions.map((area) => (
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
                          src={resolvePhotoUrl(attorney.photo_url)}
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
