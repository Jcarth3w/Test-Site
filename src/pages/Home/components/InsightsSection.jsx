import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../../../services/articlesApi';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { getArticleCategory } from '../../../content/articleCategories';
import { AuthorBylineText } from '../../../components/AuthorByline';
import '../styles/HomeShared.css';
import '../styles/InsightsSection.css';

function topicClassName(topic = '') {
  return topic
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const InsightsSection = ({ section }) => {
  const [articles, setArticles] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const showcaseImages = section.showcaseImages ?? [];

  useEffect(() => {
    let cancelled = false;

    const loadArticles = async () => {
      try {
        const [data, attorneysData] = await Promise.all([
          fetchPublicArticles(),
          fetchPublicAttorneys(),
        ]);
        if (!cancelled) {
          setArticles(data.slice(0, 3));
          setAttorneys(attorneysData);
        }
      } catch {
        if (!cancelled) {
          setArticles([]);
          setAttorneys([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadArticles();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasArticles = !loading && articles.length > 0;
  const placeholders = section.placeholders;

  const listContent = loading ? (
    <p className="home-insights-status">Loading insights…</p>
  ) : hasArticles ? (
    <div className="insights-editorial-panel">
      <ul className="insights-editorial-list">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link
              to={`/articles/${article.slug}`}
              className={`insight-row insight-row--live ${index === 0 ? 'insight-row--lead' : ''}`}
            >
              <div className="insight-row-main">
                <span className={`insight-topic insight-topic--${getArticleCategory(article.category).slug}`}>
                  {getArticleCategory(article.category).label}
                </span>
                {article.publication_date && (
                  <time dateTime={article.publication_date}>
                    {new Date(article.publication_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
                <h3>{article.title}</h3>
                <AuthorBylineText
                  article={article}
                  attorneys={attorneys}
                  className="insight-row-author"
                />
                <span className="insight-row-cta">
                  Read {getArticleCategory(article.category).label.toLowerCase()} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <>
      <div className="insights-editorial-panel">
        <ul className="insights-editorial-list">
          {placeholders.map((item, index) => (
            <li key={item.title}>
              <article
                className={`insight-row insight-row--preview ${index === 0 ? 'insight-row--lead' : ''}`}
              >
                <div className="insight-row-main">
                  <span className={`insight-topic insight-topic--${topicClassName(item.topic)}`}>
                    {item.topic}
                  </span>
                  <h3>{item.title}</h3>
                </div>
                <span className="insight-row-badge">Coming soon</span>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <p className="home-insights-note">{section.emptyNote}</p>
    </>
  );

  return (
    <section className="home-insights" aria-labelledby="home-insights-heading">
      <div className="container">
        <div className="home-insights-layout">
          <div className="home-insights-main">
            <header className="home-insights-header">
              <div className="home-insights-intro">
                <p className="home-eyebrow">{section.eyebrow}</p>
                <h2 id="home-insights-heading">{section.title}</h2>
                <p className="home-insights-lead">{section.lead}</p>
              </div>
              <Link to={section.viewAllLink} className="home-insights-view-all">
                {section.viewAllLabel}
                <span aria-hidden="true">→</span>
              </Link>
            </header>
            {listContent}
          </div>

          {showcaseImages.length > 0 ? (
            <aside className="home-insights-showcase" aria-label="Firm photography">
              <div className="insights-showcase-grid">
                {showcaseImages.map((image) => (
                  <figure key={image.src} className="insights-showcase-figure">
                    <img src={image.src} alt={image.alt} loading="lazy" />
                    {image.description ? (
                      <figcaption className="insights-showcase-caption">
                        <p>{image.description}</p>
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
