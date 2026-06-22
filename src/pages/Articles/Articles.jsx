import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPublicNewsletters } from '../../services/newslettersApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import { pageHeroImages, homeImages } from '../../content/siteImages';
import { ARTICLE_CATEGORIES, getArticleCategory } from '../../content/articleCategories';
import { AuthorByline, AuthorBylineText } from '../../components/AuthorByline';
import NewsletterSection from './components/NewsletterSection';
import './styles/Articles.css';

function formatDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function CategoryBadge({ category }) {
  const meta = getArticleCategory(category);
  return (
    <span className={`article-category-badge article-category-badge--${meta.slug}`}>
      {meta.label}
    </span>
  );
}

function ArticleMeta({ article, attorneys }) {
  return (
    <div className="article-meta">
      {article.publication_date && (
        <time dateTime={article.publication_date} className="article-date">
          {formatDate(article.publication_date)}
        </time>
      )}
      <AuthorByline article={article} attorneys={attorneys} showSeparator={Boolean(article.publication_date)} />
    </div>
  );
}

function FeaturedArticle({ article, attorneys }) {
  const imageUrl = article.image_url
    ? resolveMediaUrl(article.image_url)
    : homeImages.constructionDefect;

  return (
    <article className="articles-featured">
      <Link to={`/articles/${article.slug}`} className="articles-featured-media">
        <img src={imageUrl} alt={article.title} loading="eager" />
        <span className="articles-featured-media-label">Featured</span>
      </Link>
      <div className="articles-featured-body">
        <CategoryBadge category={article.category} />
        <Link to={`/articles/${article.slug}`} className="articles-featured-title-link">
          <h2>{article.title}</h2>
        </Link>
        {article.summary && <p className="articles-featured-summary">{article.summary}</p>}
        <ArticleMeta article={article} attorneys={attorneys} />
        <div className="articles-featured-actions">
          <Link to={`/articles/${article.slug}`} className="articles-featured-cta">
            Read {getArticleCategory(article.category).label.toLowerCase()} →
          </Link>
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-source-link"
            >
              Visit source ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function EditorialRow({ article, isLead, attorneys }) {
  return (
    <li>
      <Link
        to={`/articles/${article.slug}`}
        className={`articles-editorial-row ${isLead ? 'articles-editorial-row--lead' : ''}`}
      >
        <div className="articles-editorial-row-main">
          <CategoryBadge category={article.category} />
          {article.publication_date && (
            <time dateTime={article.publication_date}>
              {formatDate(article.publication_date)}
            </time>
          )}
          <h3>{article.title}</h3>
          {article.summary && <p>{article.summary}</p>}
          <AuthorBylineText article={article} attorneys={attorneys} className="articles-editorial-author" />
          <span className="articles-editorial-cta">
            Read {getArticleCategory(article.category).label.toLowerCase()} →
          </span>
        </div>
        {article.image_url && (
          <div className="articles-editorial-thumb">
            <img
              src={resolveMediaUrl(article.image_url)}
              alt=""
              loading="lazy"
            />
          </div>
        )}
      </Link>
    </li>
  );
}

const FILTER_OPTIONS = [
  { slug: 'all', label: 'All' },
  ...ARTICLE_CATEGORIES.map(({ slug, label }) => ({ slug, label })),
];

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, attorneysData, newslettersData] = await Promise.all([
          fetchPublicArticles(),
          fetchPublicAttorneys(),
          fetchPublicNewsletters(),
        ]);
        setArticles(articlesData);
        setAttorneys(attorneysData);
        setNewsletters(newslettersData);
      } catch {
        setArticles([]);
        setAttorneys([]);
        setNewsletters([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredArticles = useMemo(() => {
    if (activeFilter === 'all') return articles;
    return articles.filter((article) => getArticleCategory(article.category).slug === activeFilter);
  }, [articles, activeFilter]);

  const featuredArticle = filteredArticles[0] ?? null;
  const remainingArticles = filteredArticles.slice(1);
  const activeCategoryMeta = activeFilter === 'all'
    ? null
    : getArticleCategory(activeFilter);

  return (
    <main className="articles-page">
      <section
        className="articles-hero"
        style={{ '--page-hero-image': `url("${pageHeroImages.articles}")` }}
      >
        <div className="articles-hero-texture" aria-hidden="true" />
        <div className="container">
          <p className="articles-hero-eyebrow">Insights & News</p>
          <h1>Perspectives on Defense Strategy and Complex Claims</h1>
          <p className="articles-hero-lead">
            Thought leadership, firm announcements, and practical guidance for insurers
            and corporate clients navigating high-exposure matters.
          </p>
        </div>
      </section>

      <section className="articles-hub">
        <div className="container">
          <div className="articles-hub-intro">
            <div className="articles-category-cards">
              {ARTICLE_CATEGORIES.map((category) => (
                <div key={category.slug} className={`articles-category-card articles-category-card--${category.slug}`}>
                  <span className="articles-category-card-label">{category.label}</span>
                  <p>{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {activeFilter === 'all' && newsletters.length > 0 && (
            <NewsletterSection newsletters={newsletters} />
          )}

          <div className="articles-filter-bar" role="tablist" aria-label="Filter articles by category">
            {FILTER_OPTIONS.map((option) => {
              const count = option.slug === 'all'
                ? articles.length
                : articles.filter((a) => getArticleCategory(a.category).slug === option.slug).length;

              return (
                <button
                  key={option.slug}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === option.slug}
                  className={`articles-filter-pill ${activeFilter === option.slug ? 'articles-filter-pill--active' : ''}`}
                  onClick={() => setActiveFilter(option.slug)}
                >
                  {option.label}
                  <span className="articles-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="articles-status">Loading articles…</p>
          ) : filteredArticles.length === 0 ? (
            <div className="articles-empty">
              <p>
                {activeCategoryMeta
                  ? `No ${activeCategoryMeta.label.toLowerCase()} articles published yet.`
                  : 'No articles available yet.'}
              </p>
              {activeFilter !== 'all' && (
                <button
                  type="button"
                  className="articles-empty-reset"
                  onClick={() => setActiveFilter('all')}
                >
                  View all articles
                </button>
              )}
            </div>
          ) : (
            <>
              {featuredArticle && (
                <FeaturedArticle
                  article={featuredArticle}
                  attorneys={attorneys}
                />
              )}

              {remainingArticles.length > 0 && (
                <div className="articles-editorial-panel">
                  <h2 className="articles-editorial-heading">
                    {activeFilter === 'all' ? 'More from the firm' : `More ${activeCategoryMeta?.label.toLowerCase() ?? 'articles'}`}
                  </h2>
                  <ul className="articles-editorial-list">
                    {remainingArticles.map((article, index) => (
                      <EditorialRow
                        key={article.id}
                        article={article}
                        isLead={index === 0}
                        attorneys={attorneys}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Articles;
