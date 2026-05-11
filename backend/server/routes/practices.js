const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');
const { normalizeBoolean } = require('../helpers');
const {
  PRACTICE_CATEGORIES,
  isValidPracticeCategory,
  normalizePracticeCategory
} = require('../practiceCategories');

// Public: list of selectable practice categories (fixed enum)
router.get('/public/practice-categories', (req, res) => {
  res.json(PRACTICE_CATEGORIES);
});

// CMS: same list, surfaced for the form dropdown
router.get('/practice-categories', authenticateToken, (req, res) => {
  res.json(PRACTICE_CATEGORIES);
});

// Public: active practice areas
router.get('/public/practices', (req, res) => {
  db.all('SELECT * FROM practices WHERE is_active = 1 ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Public: single active practice area by slug
router.get('/public/practices/:slug', (req, res) => {
  db.get('SELECT * FROM practices WHERE slug = ? AND is_active = 1', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Practice area not found' });
    res.json(row);
  });
});

// CMS: all practice areas
router.get('/practices', authenticateToken, (req, res) => {
  db.all('SELECT * FROM practices ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// CMS: single practice area by id
router.get('/practices/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM practices WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Practice area not found' });
    res.json(row);
  });
});

// CMS: create practice area
router.post('/practices', authenticateToken, (req, res) => {
  const { slug, title, description, content, image_url, button_text, category, is_active } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);

  if (!isValidPracticeCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const categoryValue = normalizePracticeCategory(category);

  db.run(
    `INSERT INTO practices (slug, title, description, content, image_url, button_text, category, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [slug, title, description, content, image_url, button_text || 'Free Case Review', categoryValue, activeValue],
    function (err) {
      if (err) {
        logOperation('PRACTICE_CREATE_ERROR', { slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('PRACTICE_CREATED', {
        id: this.lastID,
        slug,
        category: categoryValue,
        is_active: activeValue,
        by: req.user?.username
      });
      res.json({ id: this.lastID, message: 'Practice area created successfully' });
    }
  );
});

// CMS: update practice area
router.put('/practices/:id', authenticateToken, (req, res) => {
  const { slug, title, description, content, image_url, button_text, category, is_active } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);

  if (!isValidPracticeCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const categoryValue = normalizePracticeCategory(category);

  db.run(
    `UPDATE practices
     SET slug = ?, title = ?, description = ?, content = ?, image_url = ?,
         button_text = ?, category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [slug, title, description, content, image_url, button_text || 'Free Case Review', categoryValue, activeValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('PRACTICE_UPDATE_ERROR', { id: req.params.id, slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Practice area not found' });
      logOperation('PRACTICE_UPDATED', {
        id: req.params.id,
        slug,
        category: categoryValue,
        is_active: activeValue,
        by: req.user?.username
      });
      res.json({ message: 'Practice area updated successfully' });
    }
  );
});

// CMS: toggle practice area status
router.patch('/practices/:id/status', authenticateToken, (req, res) => {
  const activeValue = normalizeBoolean(req.body.is_active, 1);

  db.run(
    'UPDATE practices SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [activeValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('PRACTICE_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Practice area not found' });
      logOperation('PRACTICE_STATUS_UPDATED', { id: req.params.id, is_active: activeValue, by: req.user?.username });
      res.json({ message: `Practice area ${activeValue ? 'activated' : 'deactivated'} successfully` });
    }
  );
});

// CMS: delete practice area
router.delete('/practices/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM practices WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logOperation('PRACTICE_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Practice area not found' });
    logOperation('PRACTICE_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Practice area deleted successfully' });
  });
});

module.exports = router;
