import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicArticleBySlug } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import { getArticleCategory } from '../../content/articleCategories';
import { getArticleAuthors } from '../../utils/articleAuthors';
import { AuthorByline } from '../../components/AuthorByline';
import './styles/Articles.css';

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function looksLikeHtml(str = '') {
  return /<[a-z][\s\S]*>/i.test(String(str).trim());
}

function ArticleBody({ content }) {
  const raw = content ?? '';
  if (looksLikeHtml(raw)) {
    return (
      <div
        className="article-detail-prose"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  }
  return (
    <div className="article-detail-prose article-detail-prose--plain">
      {raw}
    </div>
  );
}

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articleData, attorneysData] = await Promise.all([
          fetchPublicArticleBySlug(slug),
          fetchPublicAttorneys(),
        ]);
        setArticle(articleData);
        setAttorneys(attorneysData);
      } catch {
        setArticle(null);
        setAttorneys([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const articleAuthors = useMemo(
    () => (article ? getArticleAuthors(article, attorneys) : []),
    [article, attorneys]
  );
  const primaryAuthor = articleAuthors[0] ?? null;

  if (loading) {
    return (
      <div className="article-detail-page">
        <section className="article-detail">
          <div className="container">
            <p>Loading article...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <section className="article-detail">
          <div className="container">
            <h1>Article Not Found</h1>
            <p>The requested article is not available.</p>
            <Link className="article-link" to="/articles">Back to Insights & News</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <section className="article-detail">
        <div className="container">
          <Link className="article-back" to="/articles" aria-label="Back to Insights & News">
            <span className="article-back-icon" aria-hidden="true"></span>
            <span>Back to Insights & News</span>
          </Link>

          {article.image_url && (
            <img
              className="article-detail-hero"
              src={resolveMediaUrl(article.image_url)}
              alt={article.title}
            />
          )}

          <div className="article-detail-header">
            <div className="article-detail-header-text">
              <span className={`article-category-badge article-category-badge--${getArticleCategory(article.category).slug}`}>
                {getArticleCategory(article.category).label}
              </span>
              <h1>{article.title}</h1>
              <div className="article-detail-meta">
                {article.publication_date && (
                  <span className="detail-date">
                    {new Date(article.publication_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                <AuthorByline
                  article={article}
                  attorneys={attorneys}
                  showSeparator={Boolean(article.publication_date)}
                />
              </div>
            </div>
            {primaryAuthor && articleAuthors.length === 1 && (
              <Link
                to={`/attorneys/${slugifyName(primaryAuthor.name)}`}
                className="article-author-photo-link"
                aria-label={`${primaryAuthor.name} — view full profile`}
              >
                {primaryAuthor.photo_url ? (
                  <img
                    className="article-author-photo"
                    src={resolveMediaUrl(primaryAuthor.photo_url)}
                    alt=""
                  />
                ) : (
                  <div
                    className="article-author-photo-placeholder"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )}
          </div>

          <ArticleBody content={article.content} />

          {article.source_url && (
            <div className="article-source-box">
              <span className="article-source-label">Original source</span>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-source-button"
                title={article.source_url}
              >
                View original article
                <span className="article-source-button-icon" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
