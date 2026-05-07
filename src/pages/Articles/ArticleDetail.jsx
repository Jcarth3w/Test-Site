import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicArticleBySlug } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { getApiBaseUrl } from '../../services/apiBaseUrl';
import './styles/Articles.css';

const API_BASE_URL = getApiBaseUrl();

function resolveImageUrl(imageUrl = '') {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const articleData = await fetchPublicArticleBySlug(slug);
        setArticle(articleData);

        if (articleData.author_id) {
          const attorneys = await fetchPublicAttorneys();
          const authorData = attorneys.find((a) => a.id === articleData.author_id);
          setAuthor(authorData);
        }
      } catch {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

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
            <Link className="article-link" to="/articles">Back to Articles</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <section className="article-detail">
        <div className="container">
          <Link className="article-back" to="/articles" aria-label="Back to Articles">
            <span className="article-back-icon" aria-hidden="true"></span>
            <span>Back to Articles</span>
          </Link>

          {article.image_url && (
            <img
              className="article-detail-hero"
              src={resolveImageUrl(article.image_url)}
              alt={article.title}
            />
          )}

          <div className="article-detail-header">
            <div className="article-detail-header-text">
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
                {author && (
                  <>
                    <span className="meta-separator">•</span>
                    <Link
                      to={`/attorneys/${slugifyName(author.name)}`}
                      className="detail-author-link"
                    >
                      By {author.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
            {author && (
              <Link
                to={`/attorneys/${slugifyName(author.name)}`}
                className="article-author-photo-link"
                aria-label={`${author.name} — view full profile`}
              >
                {author.photo_url ? (
                  <img
                    className="article-author-photo"
                    src={resolvePhotoUrl(author.photo_url)}
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

          {article.summary && (
            <div className="article-summary-box">
              {article.summary}
            </div>
          )}

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

      <footer className="footer">
        <div className="container">
          <p>© 2012 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default ArticleDetail;
