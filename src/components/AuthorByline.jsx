import { Link } from 'react-router-dom';
import { formatAuthorNames, getArticleAuthors } from '../utils/articleAuthors';

function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function AuthorByline({ article, attorneys, className = '', showSeparator = false }) {
  const authors = getArticleAuthors(article, attorneys);
  if (!authors.length) return null;

  const prefix = showSeparator ? (
    <span className="meta-separator" aria-hidden="true">•</span>
  ) : null;

  if (authors.length === 1) {
    return (
      <div className={className}>
        {prefix}
        <Link
          to={`/attorneys/${slugifyName(authors[0].name)}`}
          className="article-author-link"
        >
          By {authors[0].name}
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      {prefix}
      <span className="article-author-byline-label">By </span>
      {authors.map((author, index) => (
        <span key={author.id}>
          {index > 0 && (index === authors.length - 1 ? ' and ' : ', ')}
          <Link
            to={`/attorneys/${slugifyName(author.name)}`}
            className="article-author-link"
          >
            {author.name}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function AuthorBylineText({ article, attorneys, className = '' }) {
  const authors = getArticleAuthors(article, attorneys);
  if (!authors.length) return null;

  return (
    <span className={className}>
      By {formatAuthorNames(authors)}
    </span>
  );
}
