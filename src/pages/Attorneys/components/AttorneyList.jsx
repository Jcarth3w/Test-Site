import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { fetchPracticeAreas } from '../../../services/practicesApi';
import AttorneyPhoto from './AttorneyPhoto';
import { pageHeroImages } from '../../../content/siteImages';

function getLastName(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : '';
}

function getLastNameInitial(name = '') {
  const lastName = getLastName(name);
  return lastName ? lastName.charAt(0).toUpperCase() : '';
}

const ALPHA_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ROWS_PER_PAGE_OPTIONS = [
  { value: '2', label: '2 rows per page' },
  { value: '3', label: '3 rows per page' },
  { value: '4', label: '4 rows per page' },
  { value: '6', label: '6 rows per page' },
  { value: 'all', label: 'Show all' },
];

function getGridColumnCount(width = window.innerWidth) {
  if (width <= 680) return 1;
  if (width <= 1024) return 2;
  if (width <= 1200) return 3;
  return 4;
}

function useGridColumnCount() {
  const [columnCount, setColumnCount] = useState(() => getGridColumnCount());

  useEffect(() => {
    const updateColumnCount = () => setColumnCount(getGridColumnCount());

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  return columnCount;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const qFromUrl = searchParams.get('q') ?? '';

  const [attorneys, setAttorneys] = useState([]);
  const [query, setQuery] = useState(qFromUrl);
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('all');
  const [catalogPracticeTitles, setCatalogPracticeTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('3');
  const columnCount = useGridColumnCount();

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

  useEffect(() => {
    setQuery(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedLetter, selectedOffice, selectedPracticeArea, pageSize, columnCount]);

  const officeOptions = Array.from(
    new Set(attorneys.map((attorney) => (attorney.location || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const availableLetters = new Set(
    attorneys
      .map((attorney) => getLastNameInitial(attorney.name))
      .filter((letter) => /^[A-Z]$/.test(letter))
  );

  const filteredAttorneys = attorneys.filter((attorney) => {
    const normalizedQuery = query.trim().toLowerCase();
    const practiceAreas = Array.isArray(attorney.practice_areas)
      ? attorney.practice_areas.map((area) => normalizePracticeLabel(area)).filter(Boolean)
      : [];

    if (selectedLetter !== 'all') {
      const lastInitial = getLastNameInitial(attorney.name);
      if (lastInitial !== selectedLetter) return false;
    }

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

  const rowsPerPage = pageSize === 'all' ? null : Number(pageSize);
  const attorneysPerPage = rowsPerPage
    ? rowsPerPage * columnCount
    : filteredAttorneys.length;

  const attorneyPages = useMemo(() => {
    if (pageSize === 'all') {
      return filteredAttorneys.length ? [filteredAttorneys] : [[]];
    }

    const pages = [];
    for (let start = 0; start < filteredAttorneys.length; start += attorneysPerPage) {
      pages.push(filteredAttorneys.slice(start, start + attorneysPerPage));
    }

    return pages.length ? pages : [[]];
  }, [filteredAttorneys, pageSize, attorneysPerPage]);

  const totalPages = attorneyPages.length;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAttorneys = attorneyPages[safePage - 1] || [];

  const resultsStart = paginatedAttorneys.length === 0
    ? 0
    : (safePage - 1) * attorneysPerPage + 1;
  const resultsEnd = paginatedAttorneys.length === 0
    ? 0
    : resultsStart + paginatedAttorneys.length - 1;

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedLetter !== 'all' ||
    selectedOffice !== 'all' ||
    selectedPracticeArea !== 'all';

  const clearFilters = () => {
    setQuery('');
    setSelectedLetter('all');
    setSelectedOffice('all');
    setSelectedPracticeArea('all');
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    }, { replace: true });
  };

  return (
    <>
      <section
        className="attorney-hero-band"
        style={{ '--attorney-hero-image': `url("${pageHeroImages.attorneys}")` }}
        aria-labelledby="attorney-directory-heading"
      >
        <div className="attorney-hero-texture" aria-hidden="true" />
        <div className="container">
          <h1 id="attorney-directory-heading" className="attorney-hero-title">
            Meet Our Attorneys
          </h1>
          <p className="attorney-hero-lead">
            Nationwide counsel for complex fire, explosion, and catastrophic claims.
          </p>
        </div>
      </section>

      <section className="attorney-list">
        <div className="container">
        {loading && <p>Loading attorneys...</p>}
        {!loading && errorMessage && <p>{errorMessage}</p>}
        {!loading && !errorMessage && attorneys.length === 0 && <p>No attorneys are currently published.</p>}
        {!loading && attorneys.length > 0 && (
          <div className="attorney-layout">
            <div className="attorney-toolbar" aria-label="Attorney filters">
              <h2 className="attorney-directory-title">Find an Attorney</h2>
              <div className="attorney-search-wrap">
                <input
                  type="search"
                  className="attorney-search-input"
                  placeholder="Search attorneys by name, practice area, or office"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search attorneys"
                />
              </div>

              <div className="attorney-alpha-bar" role="group" aria-label="Filter by last name">
                <span className="attorney-alpha-label">Last name</span>
                <div className="attorney-alpha-letters">
                  <button
                    type="button"
                    className={`attorney-alpha-btn${selectedLetter === 'all' ? ' is-active' : ''}`}
                    onClick={() => setSelectedLetter('all')}
                    aria-pressed={selectedLetter === 'all'}
                  >
                    All
                  </button>
                  {ALPHA_LETTERS.map((letter) => {
                    const hasAttorneys = availableLetters.has(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        className={`attorney-alpha-btn${selectedLetter === letter ? ' is-active' : ''}${hasAttorneys ? '' : ' is-disabled'}`}
                        onClick={() => hasAttorneys && setSelectedLetter(letter)}
                        disabled={!hasAttorneys}
                        aria-pressed={selectedLetter === letter}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="attorney-filter-row">
                <div className="attorney-filter-field">
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
                </div>

                <div className="attorney-filter-field">
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
                </div>
              </div>
            </div>

            <div className="attorney-results">
              <div className="attorney-results-toolbar" aria-live="polite">
                <p className="attorney-results-count">
                  {filteredAttorneys.length === 0
                    ? `Showing 0 of ${attorneys.length} attorneys`
                    : `Showing ${resultsStart}–${resultsEnd} of ${filteredAttorneys.length} attorneys`}
                </p>
                <div className="attorney-results-actions">
                  <label className="attorney-page-size-field" htmlFor="page-size-filter">
                    <span className="filter-label">Per page</span>
                    <select
                      id="page-size-filter"
                      className="attorney-filter-select attorney-page-size-select"
                      value={pageSize}
                      onChange={(event) => setPageSize(event.target.value)}
                    >
                      {ROWS_PER_PAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  {hasActiveFilters && (
                    <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
              {filteredAttorneys.length === 0 && <p>No attorneys matched your search.</p>}
              <div className="cards-grid">
                {paginatedAttorneys.map((attorney, index) => (
                  <article key={attorney.id || index} className="attorney-card">
                    <div className="attorney-card-media">
                      <Link className="attorney-photo-link" to={`/attorneys/${slugifyName(attorney.name)}`}>
                        {attorney.photo_url ? (
                          <AttorneyPhoto
                            photoUrl={attorney.photo_url}
                            alt={`${attorney.name || 'Attorney'} portrait`}
                          />
                        ) : (
                          <div className="attorney-photo-placeholder" aria-label={`${attorney.name || 'Attorney'} profile`} />
                        )}
                      </Link>
                    </div>
                    <div className="attorney-card-body">
                      <h3>
                        <Link to={`/attorneys/${slugifyName(attorney.name)}`}>{attorney.name}</Link>
                      </h3>
                      <p className="title">{attorney.title}</p>
                      <p className="location">{attorney.location || attorney.specialty}</p>
                      {(attorney.phone || attorney.email) && (
                        <div className="attorney-card-contact">
                          {attorney.phone && (
                            <a className="attorney-card-phone" href={`tel:${attorney.phone}`}>
                              {attorney.phone}
                            </a>
                          )}
                          {attorney.email && (
                            <a className="attorney-card-email" href={`mailto:${attorney.email}`}>
                              {attorney.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {pageSize !== 'all' && totalPages > 1 && (
                <nav className="attorney-pagination" aria-label="Attorney results pages">
                  <button
                    type="button"
                    className="attorney-page-btn attorney-page-btn-nav"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safePage === 1}
                  >
                    Previous
                  </button>

                  <div className="attorney-page-numbers">
                    {pageNumbers.map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`attorney-page-btn${page === safePage ? ' is-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === safePage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="attorney-page-btn attorney-page-btn-nav"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safePage === totalPages}
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default AttorneyList;
