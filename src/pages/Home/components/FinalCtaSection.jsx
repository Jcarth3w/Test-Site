import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/FinalCtaSection.css';

const FinalCtaSection = ({ cta }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/attorneys?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    navigate(cta.link);
  };

  return (
    <section className="home-closing" aria-labelledby="home-closing-heading">
      <div className="container">
        <h2 id="home-closing-heading" className="home-closing-title">
          {cta.title}
        </h2>

        <form className="home-closing-search" onSubmit={handleSubmit}>
          <label htmlFor="home-attorney-search" className="visually-hidden">
            {cta.searchPlaceholder}
          </label>
          <input
            id="home-attorney-search"
            type="search"
            className="home-closing-search-input"
            placeholder={cta.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <Link to={cta.link} className="home-closing-view-all">
          {cta.linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
};

export default FinalCtaSection;
