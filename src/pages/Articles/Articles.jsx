import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { getApiBaseUrl } from '../../services/apiBaseUrl';
import './styles/Articles.css';

const API_BASE_URL = getApiBaseUrl();

function resolveImageUrl(imageUrl = '') {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

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
          {loading ? (
            <p>Loading articles...</p>
          ) : articles.length === 0 ? (
            <p>No articles available.</p>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <article key={article.id} className="article-card">
                  {article.image_url && (
                    <Link
                      to={`/articles/${article.slug}`}
                      className="article-image-link"
                    >
                      <img
                        src={resolveImageUrl(article.image_url)}
                        alt={article.title}
                        className="article-image"
                      />
                    </Link>
                  )}
                  <div className="article-content">
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
