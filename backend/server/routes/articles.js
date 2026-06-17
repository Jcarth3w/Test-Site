const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');
const { normalizeBoolean } = require('../helpers');
const {
  ARTICLE_CATEGORIES,
  isValidArticleCategory,
  normalizeArticleCategory
} = require('../articleCategories');

// Public: list of selectable article categories (fixed enum)
router.get('/public/article-categories', (req, res) => {
  res.json(ARTICLE_CATEGORIES);
});

// CMS: same list, surfaced for the form dropdown
router.get('/article-categories', authenticateToken, (req, res) => {
  res.json(ARTICLE_CATEGORIES);
});

// Public: published articles
router.get('/public/articles', (req, res) => {
  const { author_id, category } = req.query;
  let query = 'SELECT * FROM articles WHERE is_published = 1';
  let params = [];

  if (author_id) {
    query += ' AND author_id = ?';
    params.push(author_id);
  }

  if (category) {
    if (!isValidArticleCategory(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    query += ' AND category = ?';
    params.push(normalizeArticleCategory(category));
  }

  query += ' ORDER BY publication_date DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Public: single published article by slug
router.get('/public/articles/:slug', (req, res) => {
  db.get('SELECT * FROM articles WHERE slug = ? AND is_published = 1', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Article not found' });
    res.json(row);
  });
});

// CMS: all articles
router.get('/articles', authenticateToken, (req, res) => {
  db.all('SELECT * FROM articles ORDER BY publication_date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// CMS: single article by id
router.get('/articles/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Article not found' });
    res.json(row);
  });
});

// CMS: create article
router.post('/articles', authenticateToken, (req, res) => {
  const { slug, title, summary, content, author_id, publication_date, image_url, source_url, category, is_published } = req.body;
  const publishedValue = normalizeBoolean(is_published, 0);

  if (!isValidArticleCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const categoryValue = normalizeArticleCategory(category);

  db.run(
    `INSERT INTO articles (slug, title, summary, content, author_id, publication_date, image_url, source_url, category, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [slug, title, summary, content, author_id || null, publication_date || null, image_url, source_url || '', categoryValue, publishedValue],
    function (err) {
      if (err) {
        logOperation('ARTICLE_CREATE_ERROR', { slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('ARTICLE_CREATED', { id: this.lastID, slug, category: categoryValue, is_published: publishedValue, by: req.user?.username });
      res.json({ id: this.lastID, message: 'Article created successfully' });
    }
  );
});

// CMS: update article
router.put('/articles/:id', authenticateToken, (req, res) => {
  const { slug, title, summary, content, author_id, publication_date, image_url, source_url, category, is_published } = req.body;
  const publishedValue = normalizeBoolean(is_published, 0);

  if (!isValidArticleCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const categoryValue = normalizeArticleCategory(category);

  db.run(
    `UPDATE articles
     SET slug = ?, title = ?, summary = ?, content = ?, author_id = ?, publication_date = ?,
         image_url = ?, source_url = ?, category = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [slug, title, summary, content, author_id || null, publication_date || null, image_url, source_url || '', categoryValue, publishedValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('ARTICLE_UPDATE_ERROR', { id: req.params.id, slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Article not found' });
      logOperation('ARTICLE_UPDATED', { id: req.params.id, slug, category: categoryValue, is_published: publishedValue, by: req.user?.username });
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
