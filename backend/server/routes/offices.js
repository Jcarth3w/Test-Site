const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');
const { normalizeBoolean } = require('../helpers');

// Public: active offices
router.get('/public/offices', (req, res) => {
  db.all('SELECT * FROM offices WHERE is_active = 1 ORDER BY display_order ASC, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Public: single active office by slug
router.get('/public/offices/:slug', (req, res) => {
  db.get('SELECT * FROM offices WHERE slug = ? AND is_active = 1', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Office not found' });
    res.json(row);
  });
});

// CMS: all offices
router.get('/offices', authenticateToken, (req, res) => {
  db.all('SELECT * FROM offices ORDER BY display_order ASC, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// CMS: single office by id
router.get('/offices/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM offices WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Office not found' });
    res.json(row);
  });
});

// CMS: create office
router.post('/offices', authenticateToken, (req, res) => {
  const { slug, name, address, phone, email, description, image_url, is_active, display_order } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);
  const orderValue = parseInt(display_order, 10) || 100;

  db.run(
    `INSERT INTO offices (slug, name, address, phone, email, description, image_url, is_active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [slug, name, address, phone, email, description, image_url, activeValue, orderValue],
    function (err) {
      if (err) {
        logOperation('OFFICE_CREATE_ERROR', { slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('OFFICE_CREATED', { id: this.lastID, slug, is_active: activeValue, by: req.user?.username });
      res.json({ id: this.lastID, message: 'Office created successfully' });
    }
  );
});

// CMS: update office
router.put('/offices/:id', authenticateToken, (req, res) => {
  const { slug, name, address, phone, email, description, image_url, is_active, display_order } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);
  const orderValue = parseInt(display_order, 10) || 100;

  db.run(
    `UPDATE offices
     SET slug = ?, name = ?, address = ?, phone = ?, email = ?, description = ?,
         image_url = ?, is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [slug, name, address, phone, email, description, image_url, activeValue, orderValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('OFFICE_UPDATE_ERROR', { id: req.params.id, slug, error: err.message, by: req.user?.username });
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Office not found' });
      logOperation('OFFICE_UPDATED', { id: req.params.id, slug, is_active: activeValue, by: req.user?.username });
      res.json({ message: 'Office updated successfully' });
    }
  );
});

// CMS: toggle office status
router.patch('/offices/:id/status', authenticateToken, (req, res) => {
  const activeValue = normalizeBoolean(req.body.is_active, 1);

  db.run(
    'UPDATE offices SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [activeValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('OFFICE_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Office not found' });
      logOperation('OFFICE_STATUS_UPDATED', { id: req.params.id, is_active: activeValue, by: req.user?.username });
      res.json({ message: 'Office status updated successfully' });
    }
  );
});

// CMS: delete office
router.delete('/offices/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM offices WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logOperation('OFFICE_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Office not found' });
    logOperation('OFFICE_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Office deleted successfully' });
  });
});

module.exports = router;
