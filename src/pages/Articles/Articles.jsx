import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import {
  ARTICLE_CATEGORIES,
  getArticleCategoryLabel,
  normalizeArticleCategory,
} from '../../services/articleCategories';
import './styles/Articles.css';

const FILTERS = [
  { slug: 'all', title: 'All' },
  ...ARTICLE_CATEGORIES.map(({ slug, title }) => ({ slug, title })),
];

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, attorneysData] = await Promise.all([
          fetchPublicArticles(),
          fetchPublicAttorneys(),
        ]);
        setArticles(articlesData);
        setAttorneys(attorneysData);
      } catch {
        setArticles([]);
        setAttorneys([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getAuthorName = (authorId) => {
    const author = attorneys.find((a) => a.id === authorId);
    return author?.name || 'Unknown Author';
  };

  const getAuthorSlug = (authorId) => {
    const author = attorneys.find((a) => a.id === authorId);
    return author ? slugifyName(author.name) : '';
  };

  const counts = useMemo(() => {
    const tally = { all: articles.length };
    ARTICLE_CATEGORIES.forEach(({ slug }) => {
      tally[slug] = 0;
    });
    articles.forEach((article) => {
      const slug = normalizeArticleCategory(article.category);
      tally[slug] = (tally[slug] || 0) + 1;
    });
    return tally;
  }, [articles]);

  const visibleArticles = useMemo(() => {
    if (activeFilter === 'all') return articles;
    return articles.filter(
      (article) => normalizeArticleCategory(article.category) === activeFilter
    );
  }, [articles, activeFilter]);

  return (
    <main className="articles-page">
      <section className="page-hero">
        <div className="container">
          <h1>Insights & News</h1>
          <p>Explore our latest articles on defense strategy, fire and explosion claims, and litigation insights.</p>
        </div>
      </section>

      <section className="articles-section">
        <div className="container">
          {!loading && articles.length > 0 && (
            <div className="article-filters" role="tablist" aria-label="Filter articles">
              {FILTERS.map((filter) => (
                <button
                  key={filter.slug}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.slug}
                  className={`article-filter ${activeFilter === filter.slug ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(filter.slug)}
                >
                  {filter.title}
                  <span className="article-filter-count">{counts[filter.slug] ?? 0}</span>
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <p>Loading articles...</p>
          ) : articles.length === 0 ? (
            <p>No articles available.</p>
          ) : visibleArticles.length === 0 ? (
            <p>No {getArticleCategoryLabel(activeFilter).toLowerCase()} articles available yet.</p>
          ) : (
            <div className="articles-grid">
              {visibleArticles.map((article) => (
                <article key={article.id} className="article-card">
                  {article.image_url && (
                    <Link
                      to={`/articles/${article.slug}`}
                      className="article-image-link"
                    >
                      <img
                        src={resolveMediaUrl(article.image_url)}
                        alt={article.title}
                        className="article-image"
                      />
                    </Link>
                  )}
                  <div className="article-content">
                    <span
                      className={`article-category-badge article-category-badge--${normalizeArticleCategory(
                        article.category
                      )}`}
                    >
                      {getArticleCategoryLabel(article.category)}
                    </span>
                    <Link
                      to={`/articles/${article.slug}`}
                      className="article-title-link"
                    >
                      <h2 className="article-title">{article.title}</h2>
                    </Link>
                    {article.summary && (
                      <p className="article-summary">{article.summary}</p>
                    )}
                    <div className="article-meta">
                      {article.publication_date && (
                        <span className="article-date">
                          {new Date(article.publication_date).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      )}
                      {article.author_id && (
                        <>
                          <span className="meta-separator">•</span>
                          <Link
                            to={`/attorneys/${getAuthorSlug(article.author_id)}`}
                            className="article-author-link"
                          >
                            By {getAuthorName(article.author_id)}
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="article-actions">
                      <Link
                        to={`/articles/${article.slug}`}
                        className="read-more-link"
                      >
                        Read Article →
                      </Link>
                      {article.source_url && (
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="article-source-link"
                        >
                          Visit Source ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Articles;
