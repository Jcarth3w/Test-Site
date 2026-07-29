import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { homeImages } from '../../content/siteImages';
import { getArticleCategory } from '../../content/articleCategories';
import { AuthorBylineText } from '../../components/AuthorByline';
import { formatAuthorNames, getArticleAuthors } from '../../utils/articleAuthors';
import { useInView } from '../../hooks/useInView';
import './styles/Articles.css';

const SHOWCASE_IMAGES = [
  {
    src: homeImages.mllSiteInspection,
    alt: 'Site inspection at a catastrophic loss',
    objectPosition: 'center 35%',
  },
  {
    src: homeImages.sbWildFire,
    alt: 'Southern California wildfire scene',
  },
  {
    src: homeImages.constructionDefect,
    alt: 'Lithium ion battery investigation',
  },
  {
    src: homeImages.contructionSite,
    alt: 'Construction site incident',
    objectPosition: 'center 30%',
  },
];

function formatDate(dateString, { short = false } = {}) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
  });
}

function CategoryBadge({ category }) {
  const meta = getArticleCategory(category);
  return (
    <span className={`article-category-badge article-category-badge--${meta.slug} article-category-badge--group-${meta.group}`}>
      {meta.label}
    </span>
  );
}

function articleMatchesQuery(article, attorneys, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const category = getArticleCategory(article.category);
  const authors = formatAuthorNames(getArticleAuthors(article, attorneys));
  const haystack = [
    article.title,
    category.label,
    category.groupLabel,
    authors,
    article.content,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

function FeaturedEntry({ article, attorneys }) {
  const category = getArticleCategory(article.category);

  return (
    <article className="articles-featured">
      <p className="articles-featured-label">Most recent</p>
      <div className="articles-featured-meta">
        <CategoryBadge category={article.category} />
        {article.publication_date && (
          <time dateTime={article.publication_date}>
            {formatDate(article.publication_date)}
          </time>
        )}
      </div>
      <Link to={`/articles/${article.slug}`} className="articles-featured-title-link">
        <h2>{article.title}</h2>
      </Link>
      <AuthorBylineText article={article} attorneys={attorneys} className="articles-featured-author" />
      <Link to={`/articles/${article.slug}`} className="articles-featured-cta">
        Read {category.label.toLowerCase()}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

function RecentEntry({ article, attorneys }) {
  const category = getArticleCategory(article.category);

  return (
    <li>
      <Link to={`/articles/${article.slug}`} className="articles-recent-row">
        <div className="articles-recent-meta">
          <CategoryBadge category={article.category} />
          {article.publication_date && (
            <time dateTime={article.publication_date}>
              {formatDate(article.publication_date, { short: true })}
            </time>
          )}
        </div>
        <div className="articles-recent-main">
          <h3>{article.title}</h3>
          <AuthorBylineText article={article} attorneys={attorneys} className="articles-recent-author" />
        </div>
        <span className="articles-recent-cta">
          Read {category.label.toLowerCase()}
          <span aria-hidden="true">→</span>
        </span>
      </Link>
    </li>
  );
}

function ArticlesShowcase() {
  return (
    <aside className="articles-showcase" aria-label="Firm photography">
      <div className="articles-showcase-grid">
        {SHOWCASE_IMAGES.map((image, index) => (
          <figure
            key={image.src}
            className={`articles-showcase-figure articles-showcase-figure--${index + 1}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading={index < 2 ? 'eager' : 'lazy'}
              style={
                image.objectPosition
                  ? { objectPosition: image.objectPosition }
                  : undefined
              }
            />
          </figure>
        ))}
      </div>
    </aside>
  );
}

function ArticlesBody({ articles, attorneys, query }) {
  const [ref, isInView] = useInView({ threshold: 0.06 });
  const featured = articles[0] ?? null;
  const rest = articles.slice(1);

  return (
    <div ref={ref} className={`articles-layout${isInView ? ' is-in-view' : ''}`}>
      <div className="articles-editorial">
        {featured && (
          <div className="articles-reveal" style={{ '--articles-reveal-delay': '80ms' }}>
            <FeaturedEntry article={featured} attorneys={attorneys} />
          </div>
        )}

        {rest.length > 0 && (
          <section
            className="articles-recent articles-reveal"
            style={{ '--articles-reveal-delay': '160ms' }}
            aria-labelledby="articles-recent-heading"
          >
            <header className="articles-recent-header">
              <h2 id="articles-recent-heading">
                {query.trim() ? 'More matches' : 'More recent'}
              </h2>
            </header>
            <ul className="articles-recent-list">
              {rest.map((article) => (
                <RecentEntry
                  key={article.id}
                  article={article}
                  attorneys={attorneys}
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="articles-reveal" style={{ '--articles-reveal-delay': '120ms' }}>
        <ArticlesShowcase />
      </div>
    </div>
  );
}

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sectionRef, sectionInView] = useInView({ threshold: 0.08 });

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

  const filteredArticles = useMemo(
    () => articles.filter((article) => articleMatchesQuery(article, attorneys, query)),
    [articles, attorneys, query]
  );

  return (
    <main className="articles-page">
      <section
        ref={sectionRef}
        className={`articles-stage${sectionInView ? ' is-in-view' : ''}`}
        aria-labelledby="articles-heading"
      >
        <div className="articles-stage-atmosphere" aria-hidden="true" />
        <div className="container articles-stage-inner">
          <header className="articles-stage-header">
            <div className="articles-stage-heading">
              <h1 id="articles-heading" className="articles-reveal" style={{ '--articles-reveal-delay': '40ms' }}>
                Insights & News
              </h1>
              <div
                className="articles-stage-rule articles-reveal"
                style={{ '--articles-reveal-delay': '110ms' }}
                aria-hidden="true"
              />
            </div>

            <div className="articles-search articles-reveal" style={{ '--articles-reveal-delay': '160ms' }}>
              <label htmlFor="articles-search-input" className="visually-hidden">
                Search publications
              </label>
              <input
                id="articles-search-input"
                type="search"
                className="articles-search-input"
                placeholder="Search by title, topic, or author…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
            </div>
          </header>

          {loading ? (
            <p className="articles-status">Loading articles…</p>
          ) : articles.length === 0 ? (
            <div className="articles-empty">
              <p>No articles available yet.</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="articles-empty">
              <p>No publications matched “{query.trim()}”.</p>
              <button
                type="button"
                className="articles-empty-reset"
                onClick={() => setQuery('')}
              >
                Clear search
              </button>
            </div>
          ) : (
            <ArticlesBody
              articles={filteredArticles}
              attorneys={attorneys}
              query={query}
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default Articles;
