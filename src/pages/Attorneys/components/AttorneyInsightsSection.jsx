import { Link } from 'react-router-dom';

const AttorneyInsightsSection = ({ articles = [] }) => {
  if (!articles.length) return null;

  return (
    <section className="attorney-detail-insights-band" aria-labelledby="attorney-insights-heading">
      <div className="attorney-detail-page-inner">
        <h2 id="attorney-insights-heading" className="attorney-detail-panel-title">
          Insights &amp; News
        </h2>
        <ul className="attorney-insights-grid">
          {articles.map((article) => (
            <li key={article.id} className="attorney-insight-item">
              <Link to={`/articles/${article.slug}`} className="attorney-insight-link">
                {article.title}
              </Link>
              {article.publication_date && (
                <p className="attorney-insight-date">
                  {new Date(article.publication_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AttorneyInsightsSection;
