export function parseAuthorIds(article = {}) {
  if (Array.isArray(article.author_ids) && article.author_ids.length > 0) {
    return article.author_ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
  }

  if (typeof article.author_ids === 'string' && article.author_ids.trim()) {
    try {
      const parsed = JSON.parse(article.author_ids);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
      }
    } catch {
      return [];
    }
  }

  if (article.author_id) {
    return [Number(article.author_id)].filter((id) => !Number.isNaN(id));
  }

  return [];
}

export function getArticleAuthors(article, attorneys = []) {
  const ids = parseAuthorIds(article);
  return ids
    .map((id) => attorneys.find((attorney) => attorney.id === id))
    .filter(Boolean);
}

export function formatAuthorNames(authors = []) {
  if (!authors.length) return '';
  if (authors.length === 1) return authors[0].name;
  if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
  return `${authors.slice(0, -1).map((author) => author.name).join(', ')}, and ${authors[authors.length - 1].name}`;
}
