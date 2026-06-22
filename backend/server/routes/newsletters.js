const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');
const { normalizeBoolean } = require('../helpers');

function mapNewsletterRow(row) {
  return {
    ...row,
    is_published: Number(row.is_published) ? 1 : 0,
  };
}

// Public: published newsletters (newest first)
router.get('/public/newsletters', (req, res) => {
  db.all(
    'SELECT * FROM newsletters WHERE is_published = 1 ORDER BY issue_date DESC, id DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows.map(mapNewsletterRow));
    }
  );
});

// CMS: all newsletters
router.get('/newsletters', authenticateToken, (req, res) => {
  db.all('SELECT * FROM newsletters ORDER BY issue_date DESC, id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(mapNewsletterRow));
  });
});

// CMS: single newsletter by id
router.get('/newsletters/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM newsletters WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Newsletter not found' });
    res.json(mapNewsletterRow(row));
  });
});

function buildNewsletterWriteValues(body) {
  const { slug, title, summary, issue_date, pdf_url, cover_image_url, is_published } = body;
  return {
    slug: String(slug || '').trim(),
    title: String(title || '').trim(),
    summary: String(summary || '').trim(),
    issue_date: issue_date || null,
    pdf_url: String(pdf_url || '').trim(),
    cover_image_url: String(cover_image_url || '').trim(),
    is_published: normalizeBoolean(is_published, 0),
  };
}

// CMS: create newsletter
router.post('/newsletters', authenticateToken, (req, res) => {
  const values = buildNewsletterWriteValues(req.body);

  if (!values.title || !values.slug || !values.pdf_url) {
    return res.status(400).json({ error: 'Title, slug, and PDF are required' });
  }

  db.run(
    `INSERT INTO newsletters (slug, title, summary, issue_date, pdf_url, cover_image_url, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      values.slug,
      values.title,
      values.summary,
      values.issue_date,
      values.pdf_url,
      values.cover_image_url,
      values.is_published,
    ],
    function (err) {
      if (err) {
        logOperation('NEWSLETTER_CREATE_ERROR', { slug: values.slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('NEWSLETTER_CREATED', { id: this.lastID, slug: values.slug, by: req.user?.username });
      res.json({ id: this.lastID, message: 'Newsletter created successfully' });
    }
  );
});

// CMS: update newsletter
router.put('/newsletters/:id', authenticateToken, (req, res) => {
  const values = buildNewsletterWriteValues(req.body);

  if (!values.title || !values.slug || !values.pdf_url) {
    return res.status(400).json({ error: 'Title, slug, and PDF are required' });
  }

  db.run(
    `UPDATE newsletters
     SET slug = ?, title = ?, summary = ?, issue_date = ?, pdf_url = ?, cover_image_url = ?,
         is_published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      values.slug,
      values.title,
      values.summary,
      values.issue_date,
      values.pdf_url,
      values.cover_image_url,
      values.is_published,
      req.params.id,
    ],
    function (err) {
      if (err) {
        logOperation('NEWSLETTER_UPDATE_ERROR', { id: req.params.id, slug: values.slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Newsletter not found' });
      logOperation('NEWSLETTER_UPDATED', { id: req.params.id, slug: values.slug, by: req.user?.username });
      res.json({ message: 'Newsletter updated successfully' });
    }
  );
});

// CMS: toggle newsletter publication status
router.patch('/newsletters/:id/status', authenticateToken, (req, res) => {
  const publishedValue = normalizeBoolean(req.body.is_published, 0);

  db.run(
    'UPDATE newsletters SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [publishedValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('NEWSLETTER_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Newsletter not found' });
      logOperation('NEWSLETTER_STATUS_UPDATED', { id: req.params.id, is_published: publishedValue, by: req.user?.username });
      res.json({ message: 'Newsletter publication status updated successfully' });
    }
  );
});

// CMS: delete newsletter
router.delete('/newsletters/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM newsletters WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logOperation('NEWSLETTER_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Newsletter not found' });
    logOperation('NEWSLETTER_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Newsletter deleted successfully' });
  });
});

module.exports = router;
