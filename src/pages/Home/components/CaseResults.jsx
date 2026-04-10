import '../styles/CaseResults.css';
import { homeContent } from '../content/homeContent';

const CaseResults = () => {
  const results = homeContent.resultsSection;

  return (
    <section className="case-results">
      <div className="container">
        <h2>{results.title}</h2>
        <p className="subtitle">{results.subtitle}</p>
        <div className="results-grid">
          {results.cards.map((card) => (
            <div key={`${card.amount}-${card.description}`} className="result-card">
              <div className="amount">{card.amount}</div>
              <div className="description">{card.description}</div>
            </div>
          ))}
        </div>
        <div className="results-cta">
          <a href={results.ctaLink} className="btn btn-outline">{results.ctaLabel}</a>
        </div>
      </div>
    </section>
  );
};

export default CaseResults;