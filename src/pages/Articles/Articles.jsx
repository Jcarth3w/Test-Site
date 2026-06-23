import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../../services/articlesApi';
import { fetchPublicAttorneys } from '../../services/attorneysApi';
import { fetchPublicNewsletters } from '../../services/newslettersApi';
import { resolveMediaUrl } from '../../services/apiBaseUrl';
import { pageHeroImages, homeImages } from '../../content/siteImages';
import {
  CONTENT_GROUPS,
  getArticleCategory,
  getActiveGroupSlug,
  getContentGroup,
  getFilterMeta,
  getSubcategoriesForGroup,
  isGroupSlug,
  matchesContentFilter,
} from '../../content/articleCategories';
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
    <span className={`article-category-badge article-category-badge--${meta.slug} article-category-badge--group-${meta.group}`}>
      {meta.label}
    </span>
  );
}

function FeaturedSpotlight({ article, attorneys }) {
  const category = getArticleCategory(article.category);
  const group = getContentGroup(article.category);
  const imageUrl = article.image_url
    ? resolveMediaUrl(article.image_url)
    : homeImages.constructionDefect;

  return (
    <article className={`articles-spotlight articles-spotlight--${group.slug}`}>
      <Link to={`/articles/${article.slug}`} className="articles-spotlight-media">
        <img src={imageUrl} alt="" loading="eager" />
        <span className="articles-spotlight-badge">Latest</span>
      </Link>
      <div className="articles-spotlight-body">
        <CategoryBadge category={article.category} />
        {article.publication_date && (
          <time dateTime={article.publication_date} className="articles-spotlight-date">
            {formatDate(article.publication_date)}
          </time>
        )}
        <Link to={`/articles/${article.slug}`} className="articles-spotlight-title-link">
          <h2>{article.title}</h2>
        </Link>
        <div className="articles-spotlight-footer">
          <AuthorByline article={article} attorneys={attorneys} />
          <Link to={`/articles/${article.slug}`} className="articles-spotlight-cta">
            Read {category.label.toLowerCase()} →
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeedHeader({ activeFilter, activeFilterMeta, articleCount }) {
  if (activeFilter === 'all') {
    return (
      <header className="articles-feed-header articles-feed-header--home">
        <div>
          <h2 className="articles-feed-heading-text">Recent publications</h2>
          <p className="articles-feed-subheading">
            {articleCount} {articleCount === 1 ? 'entry' : 'entries'} from our attorneys
          </p>
        </div>
      </header>
    );
  }

  const groupSlug = getActiveGroupSlug(activeFilter);
  const headerClass = groupSlug ?? activeFilter;

  return (
    <header className={`articles-feed-header articles-feed-header--filtered articles-feed-header--${headerClass}`}>
      <h2 className="articles-feed-heading-text">{activeFilterMeta.label}</h2>
      <p className="articles-feed-subheading">
        {articleCount} {articleCount === 1 ? 'publication' : 'publications'}
      </p>
    </header>
  );
}

function FilterToolbar({ activeFilter, filterCounts, onSelectFilter }) {
  const activeGroup = getActiveGroupSlug(activeFilter);
  const subcategories = activeGroup ? getSubcategoriesForGroup(activeGroup) : [];
  const activeGroupMeta = activeGroup
    ? CONTENT_GROUPS.find((group) => group.slug === activeGroup)
    : null;

  return (
    <div className="articles-filter-stack">
      <nav className="articles-toolbar" aria-label="Filter by section">
        <ul className="articles-toolbar-list">
          {TOP_FILTER_OPTIONS.map((option) => (
            <li key={option.slug}>
              <button
                type="button"
                className={`articles-toolbar-item ${
                  (option.slug === 'all' && activeFilter === 'all')
                  || (option.slug !== 'all' && activeGroup === option.slug)
                    ? 'articles-toolbar-item--active'
                    : ''
                }`}
                aria-current={
                  (option.slug === 'all' && activeFilter === 'all')
                  || (option.slug !== 'all' && activeGroup === option.slug)
                    ? 'true'
                    : undefined
                }
                onClick={() => onSelectFilter(option.slug)}
              >
                {option.label}
                <span className="articles-filter-count">{filterCounts[option.slug]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {activeGroup && activeGroupMeta && (
        <nav className="articles-subtoolbar" aria-label={`Filter ${activeGroupMeta.label}`}>
          <ul className="articles-subtoolbar-list">
            <li>
              <button
                type="button"
                className={`articles-subtoolbar-item ${activeFilter === activeGroup ? 'articles-subtoolbar-item--active' : ''}`}
                aria-current={activeFilter === activeGroup ? 'true' : undefined}
                onClick={() => onSelectFilter(activeGroup)}
              >
                All {activeGroupMeta.label}
                <span className="articles-filter-count">{filterCounts[activeGroup]}</span>
              </button>
            </li>
            {subcategories.map((subcategory) => (
              <li key={subcategory.slug}>
                <button
                  type="button"
                  className={`articles-subtoolbar-item ${activeFilter === subcategory.slug ? 'articles-subtoolbar-item--active' : ''}`}
                  aria-current={activeFilter === subcategory.slug ? 'true' : undefined}
                  onClick={() => onSelectFilter(subcategory.slug)}
                >
                  {subcategory.label}
                  <span className="articles-filter-count">{filterCounts[subcategory.slug]}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

function CategoryAside({ activeFilter, activeFilterMeta, filterCounts, onSelectFilter }) {
  if (activeFilter === 'all') return null;

  const activeGroup = getActiveGroupSlug(activeFilter);
  const activeGroupMeta = CONTENT_GROUPS.find((group) => group.slug === activeGroup);
  const subcategories = activeGroup ? getSubcategoriesForGroup(activeGroup) : [];
  const otherGroups = CONTENT_GROUPS.filter((group) => group.slug !== activeGroup);
  const isSubcategoryFilter = !isGroupSlug(activeFilter);

  return (
    <aside className={`articles-category-aside articles-category-aside--${activeGroup}`} aria-label="Category navigation">
      <button
        type="button"
        className="articles-category-aside-back"
        onClick={() => onSelectFilter('all')}
      >
        ← All Insights & News
      </button>
      <h2 className="articles-category-aside-title">{activeFilterMeta.label}</h2>
      <p className="articles-category-aside-desc">{activeFilterMeta.description}</p>

      {subcategories.length > 0 && (
        <div className="articles-category-aside-explore">
          <h3>{activeGroupMeta.label} types</h3>
          <ul>
            <li>
              <button
                type="button"
                className={activeFilter === activeGroup ? 'is-active' : ''}
                onClick={() => onSelectFilter(activeGroup)}
              >
                All {activeGroupMeta.label}
                <span>{filterCounts[activeGroup]}</span>
              </button>
            </li>
            {subcategories.map((subcategory) => (
              <li key={subcategory.slug}>
                <button
                  type="button"
                  className={activeFilter === subcategory.slug ? 'is-active' : ''}
                  onClick={() => onSelectFilter(subcategory.slug)}
                >
                  {subcategory.label}
                  <span>{filterCounts[subcategory.slug]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {otherGroups.length > 0 && (
        <div className="articles-category-aside-explore">
          <h3>Explore more</h3>
          <ul>
            {otherGroups.map((group) => (
              <li key={group.slug}>
                <button type="button" onClick={() => onSelectFilter(group.slug)}>
                  {group.label}
                  <span>{filterCounts[group.slug]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSubcategoryFilter && (
        <p className="articles-category-aside-note">
          Part of {activeGroupMeta.label}
        </p>
      )}
    </aside>
  );
}

function ArticleRow({ article, isLead, attorneys, showReadCta = false }) {
  const imageUrl = article.image_url
    ? resolveMediaUrl(article.image_url)
    : null;

  return (
    <li>
      <Link
        to={`/articles/${article.slug}`}
        className={`articles-feed-row ${isLead ? 'articles-feed-row--lead' : ''}`}
      >
        {imageUrl && (
          <div className="articles-feed-thumb">
            <img src={imageUrl} alt="" loading={isLead ? 'eager' : 'lazy'} />
          </div>
        )}
        <div className="articles-feed-main">
          <div className="articles-feed-meta">
            <CategoryBadge category={article.category} />
            {article.publication_date && (
              <time dateTime={article.publication_date}>
                {formatDate(article.publication_date)}
              </time>
            )}
          </div>
          <h2>{article.title}</h2>
          <AuthorBylineText article={article} attorneys={attorneys} className="articles-feed-author" />
          {showReadCta && (
            <span className="articles-feed-cta">
              Read {getArticleCategory(article.category).label.toLowerCase()} →
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

const TOP_FILTER_OPTIONS = [
  { slug: 'all', label: 'All' },
  ...CONTENT_GROUPS.map(({ slug, label }) => ({ slug, label })),
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
    return articles.filter((article) => matchesContentFilter(article.category, activeFilter));
  }, [articles, activeFilter]);

  const activeFilterMeta = activeFilter === 'all'
    ? null
    : getFilterMeta(activeFilter);

  const filterCounts = useMemo(() => {
    const counts = { all: articles.length };
    CONTENT_GROUPS.forEach((group) => {
      counts[group.slug] = articles.filter((article) => matchesContentFilter(article.category, group.slug)).length;
      group.subcategories.forEach((subcategory) => {
        counts[subcategory.slug] = articles.filter(
          (article) => matchesContentFilter(article.category, subcategory.slug)
        ).length;
      });
    });
    return counts;
  }, [articles]);

  const isHomeView = activeFilter === 'all';
  const spotlightArticle = isHomeView ? filteredArticles[0] ?? null : null;
  const feedArticles = isHomeView ? filteredArticles.slice(1) : filteredArticles;

  return (
    <main className="articles-page">
      <section
        className="articles-hero"
        style={{ '--page-hero-image': `url("${pageHeroImages.articles}")` }}
      >
        <div className="articles-hero-texture" aria-hidden="true" />
        <div className="articles-hero-accent" aria-hidden="true" />
        <div className="container articles-hero-layout">
          <div className="articles-hero-intro">
            <h1>Insights & News</h1>
            <p className="articles-hero-lead">
              Thought leadership, firm updates, and practical guidance from our attorneys.
            </p>
          </div>
          {newsletters.length > 0 && (
            <NewsletterSection newsletters={newsletters} />
          )}
        </div>
      </section>

      <section className="articles-hub">
        <div className="container">
          <FilterToolbar
            activeFilter={activeFilter}
            filterCounts={filterCounts}
            onSelectFilter={setActiveFilter}
          />

          {loading ? (
            <p className="articles-status">Loading articles…</p>
          ) : filteredArticles.length === 0 ? (
            <div className="articles-empty">
              <p>
                {activeFilterMeta
                  ? `No ${activeFilterMeta.label.toLowerCase()} published yet.`
                  : 'No articles available yet.'}
              </p>
              {activeFilter !== 'all' && (
                <button
                  type="button"
                  className="articles-empty-reset"
                  onClick={() => setActiveFilter('all')}
                >
                  View all publications
                </button>
              )}
            </div>
          ) : (
            <div className="articles-columns">
              <div className="articles-columns-left">
                {spotlightArticle && (
                  <FeaturedSpotlight article={spotlightArticle} attorneys={attorneys} />
                )}
                <CategoryAside
                  activeFilter={activeFilter}
                  activeFilterMeta={activeFilterMeta}
                  filterCounts={filterCounts}
                  onSelectFilter={setActiveFilter}
                />
              </div>

              <div className="articles-columns-right">
                <div className="articles-feed">
                  <FeedHeader
                    activeFilter={activeFilter}
                    activeFilterMeta={activeFilterMeta}
                    articleCount={filteredArticles.length}
                  />

                  {feedArticles.length > 0 ? (
                    <ul className="articles-feed-list">
                      {feedArticles.map((article, index) => (
                        <ArticleRow
                          key={article.id}
                          article={article}
                          isLead={isHomeView && index === 0}
                          attorneys={attorneys}
                          showReadCta
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="articles-feed-solo-note">
                      More publications will appear here as they are published.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Articles;
