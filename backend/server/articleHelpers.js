const { parseStoredJsonArray } = require('./helpers');
const { normalizeArticleCategory } = require('./articleCategories');

function normalizeAuthorIds(value, fallbackAuthorId = null) {
  let ids = [];

  if (Array.isArray(value)) {
    ids = value;
  } else if (typeof value === 'string') {
    ids = parseStoredJsonArray(value);
  }

  const normalized = [];
  const seen = new Set();

  ids.forEach((id) => {
    const parsed = Number.parseInt(id, 10);
    if (Number.isNaN(parsed) || seen.has(parsed)) return;
    seen.add(parsed);
    normalized.push(parsed);
  });

  if (!normalized.length && fallbackAuthorId) {
    const parsed = Number.parseInt(fallbackAuthorId, 10);
    if (!Number.isNaN(parsed)) normalized.push(parsed);
  }

  return normalized;
}

function serializeAuthorIds(authorIds) {
  return JSON.stringify(normalizeAuthorIds(authorIds));
}

function mapArticleRow(row) {
  const authorIds = normalizeAuthorIds(row.author_ids, row.author_id);
  return {
    ...row,
    category: normalizeArticleCategory(row.category),
    author_ids: authorIds,
    author_id: authorIds[0] ?? row.author_id ?? null,
  };
}

module.exports = {
  normalizeAuthorIds,
  serializeAuthorIds,
  mapArticleRow,
};
