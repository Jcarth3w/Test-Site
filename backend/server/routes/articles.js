const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');
const { normalizeBoolean } = require('../helpers');
const { isValidArticleCategory, normalizeArticleCategory, getCategoryFilterValues } = require('../articleCategories');
const { normalizeAuthorIds, serializeAuthorIds, mapArticleRow } = require('../articleHelpers');

function buildPublicArticleQuery({ author_id, category } = {}) {
  let query = 'SELECT * FROM articles WHERE is_published = 1';
  const params = [];

  if (author_id) {
    const parsedAuthorId = Number.parseInt(author_id, 10);
    query += ` AND (
      author_id = ?
      OR EXISTS (
        SELECT 1
        FROM json_each(COALESCE(NULLIF(author_ids, ''), '[]'))
        WHERE CAST(json_each.value AS INTEGER) = ?
      )
    )`;
    params.push(parsedAuthorId, parsedAuthorId);
  }

  if (category) {
    const filterValues = getCategoryFilterValues(category);
    if (filterValues?.length) {
      const placeholders = filterValues.map(() => '?').join(', ');
      query += ` AND category IN (${placeholders})`;
      params.push(...filterValues);
    }
  }

  query += ' ORDER BY publication_date DESC';
  return { query, params };
}

// Public: published articles
router.get('/public/articles', (req, res) => {
  const { query, params } = buildPublicArticleQuery(req.query);

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(mapArticleRow));
  });
});

// Public: single published article by slug
router.get('/public/articles/:slug', (req, res) => {
  db.get('SELECT * FROM articles WHERE slug = ? AND is_published = 1', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Article not found' });
    res.json(mapArticleRow(row));
  });
});

// CMS: all articles
router.get('/articles', authenticateToken, (req, res) => {
  db.all('SELECT * FROM articles ORDER BY publication_date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(mapArticleRow));
  });
});

// CMS: single article by id
router.get('/articles/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Article not found' });
    res.json(mapArticleRow(row));
  });
});

function buildArticleWriteValues(body) {
  const {
    slug,
    title,
    summary,
    content,
    author_id,
    author_ids,
    publication_date,
    image_url,
    source_url,
    is_published,
    category,
  } = body;

  const authorIds = normalizeAuthorIds(author_ids, author_id);
  const primaryAuthorId = authorIds[0] ?? null;

  return {
    slug,
    title,
    summary,
    content,
    author_id: primaryAuthorId,
    author_ids: serializeAuthorIds(authorIds),
    publication_date: publication_date || null,
    image_url,
    source_url: source_url || '',
    is_published: normalizeBoolean(is_published, 0),
    category: normalizeArticleCategory(category),
  };
}

// CMS: create article
router.post('/articles', authenticateToken, (req, res) => {
  if (!isValidArticleCategory(req.body.category)) {
    return res.status(400).json({ error: 'Invalid article category' });
  }

  const values = buildArticleWriteValues(req.body);

  db.run(
    `INSERT INTO articles (
      slug, title, summary, content, author_id, author_ids, publication_date,
      image_url, source_url, is_published, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      values.slug,
      values.title,
      values.summary,
      values.content,
      values.author_id,
      values.author_ids,
      values.publication_date,
      values.image_url,
      values.source_url,
      values.is_published,
      values.category,
    ],
    function (err) {
      if (err) {
        logOperation('ARTICLE_CREATE_ERROR', { slug: values.slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('ARTICLE_CREATED', {
        id: this.lastID,
        slug: values.slug,
        category: values.category,
        is_published: values.is_published,
        by: req.user?.username,
      });
      res.json({ id: this.lastID, message: 'Article created successfully' });
    }
  );
});

// CMS: update article
router.put('/articles/:id', authenticateToken, (req, res) => {
  if (!isValidArticleCategory(req.body.category)) {
    return res.status(400).json({ error: 'Invalid article category' });
  }

  const values = buildArticleWriteValues(req.body);

  db.run(
    `UPDATE articles
     SET slug = ?, title = ?, summary = ?, content = ?, author_id = ?, author_ids = ?,
         publication_date = ?, image_url = ?, source_url = ?, is_published = ?, category = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      values.slug,
      values.title,
      values.summary,
      values.content,
      values.author_id,
      values.author_ids,
      values.publication_date,
      values.image_url,
      values.source_url,
      values.is_published,
      values.category,
      req.params.id,
    ],
    function (err) {
      if (err) {
        logOperation('ARTICLE_UPDATE_ERROR', {
          id: req.params.id,
          slug: values.slug,
          error: err.message,
          by: req.user?.username,
        });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Article not found' });
      logOperation('ARTICLE_UPDATED', {
        id: req.params.id,
        slug: values.slug,
        category: values.category,
        is_published: values.is_published,
        by: req.user?.username,
      });
      res.json({ message: 'Article updated successfully' });
    }
  );
});

// CMS: toggle article publication status
router.patch('/articles/:id/status', authenticateToken, (req, res) => {
  const publishedValue = normalizeBoolean(req.body.is_published, 0);

  db.run(
    'UPDATE articles SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [publishedValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('ARTICLE_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Article not found' });
      logOperation('ARTICLE_STATUS_UPDATED', { id: req.params.id, is_published: publishedValue, by: req.user?.username });
      res.json({ message: 'Article publication status updated successfully' });
    }
  );
});

// CMS: delete article
router.delete('/articles/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM articles WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logOperation('ARTICLE_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Article not found' });
    logOperation('ARTICLE_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Article deleted successfully' });
  });
});

module.exports = router;
