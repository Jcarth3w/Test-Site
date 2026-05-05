const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');
const {
  normalizeBoolean,
  normalizeOfficeLocation,
  normalizeDisplayOrder,
  normalizePracticeAreas,
  mapAttorneyRow,
} = require('../helpers');

// Auth: login
router.post('/login', (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../config');
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      logOperation('LOGIN_DB_ERROR', { username, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      logOperation('LOGIN_FAILED', { username, reason: 'user_not_found' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
      logOperation('LOGIN_SUCCESS', { userId: user.id, username: user.username });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      logOperation('LOGIN_FAILED', { username, reason: 'invalid_password' });
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Public: active attorneys
router.get('/public/attorneys', (req, res) => {
  db.all(
    'SELECT * FROM attorneys WHERE is_active = 1 ORDER BY display_order ASC, name ASC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows.map(mapAttorneyRow));
    }
  );
});

// CMS: all attorneys
router.get('/attorneys', authenticateToken, (req, res) => {
  db.all('SELECT * FROM attorneys ORDER BY display_order ASC, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(mapAttorneyRow));
  });
});

// CMS: single attorney
router.get('/attorneys/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM attorneys WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Attorney not found' });
    res.json(mapAttorneyRow(row));
  });
});

// CMS: create attorney
router.post('/attorneys', authenticateToken, (req, res) => {
  const { name, title, bio, specialty, location, display_order, practice_areas, photo_url, is_active } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);
  const officeLocation = normalizeOfficeLocation(location);
  const displayOrder = normalizeDisplayOrder(display_order, 100);
  const practiceAreas = normalizePracticeAreas(practice_areas);
  const practiceAreasJson = JSON.stringify(practiceAreas);
  const normalizedPhotoUrl = (photo_url || '').trim();

  if (officeLocation === null) {
    return res.status(400).json({ error: 'Invalid office location' });
  }
  if (!normalizedPhotoUrl) {
    return res.status(400).json({ error: 'Photo is required for new attorney entries' });
  }

  db.run(
    `INSERT INTO attorneys (name, title, bio, specialty, location, display_order, practice_areas, photo_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, title, bio, specialty, officeLocation, displayOrder, practiceAreasJson, normalizedPhotoUrl, activeValue],
    function (err) {
      if (err) {
        logOperation('ATTORNEY_CREATE_ERROR', { error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      logOperation('ATTORNEY_CREATED', {
        id: this.lastID, name, location: officeLocation,
        display_order: displayOrder, practice_areas_count: practiceAreas.length,
        is_active: activeValue, by: req.user?.username
      });
      res.json({ id: this.lastID, message: 'Attorney created successfully' });
    }
  );
});

// CMS: update attorney
router.put('/attorneys/:id', authenticateToken, (req, res) => {
  const { name, title, bio, specialty, location, display_order, practice_areas, photo_url, is_active } = req.body;
  const activeValue = normalizeBoolean(is_active, 1);
  const officeLocation = normalizeOfficeLocation(location);
  const displayOrder = normalizeDisplayOrder(display_order, 100);
  const practiceAreas = normalizePracticeAreas(practice_areas);
  const practiceAreasJson = JSON.stringify(practiceAreas);

  if (officeLocation === null) {
    return res.status(400).json({ error: 'Invalid office location' });
  }

  db.run(
    `UPDATE attorneys
     SET name = ?, title = ?, bio = ?, specialty = ?, location = ?, display_order = ?,
         practice_areas = ?, photo_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, title, bio, specialty, officeLocation, displayOrder, practiceAreasJson, photo_url, activeValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('ATTORNEY_UPDATE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Attorney not found' });
      logOperation('ATTORNEY_UPDATED', {
        id: req.params.id, location: officeLocation, display_order: displayOrder,
        practice_areas_count: practiceAreas.length, is_active: activeValue, by: req.user?.username
      });
      res.json({ message: 'Attorney updated successfully' });
    }
  );
});

// CMS: toggle attorney status
router.patch('/attorneys/:id/status', authenticateToken, (req, res) => {
  const activeValue = normalizeBoolean(req.body.is_active, 1);

  db.run(
    'UPDATE attorneys SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [activeValue, req.params.id],
    function (err) {
      if (err) {
        logOperation('ATTORNEY_STATUS_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) return res.status(404).json({ error: 'Attorney not found' });
      logOperation('ATTORNEY_STATUS_UPDATED', { id: req.params.id, is_active: activeValue, by: req.user?.username });
      res.json({ message: `Attorney ${activeValue ? 'activated' : 'deactivated'} successfully` });
    }
  );
});

// CMS: delete attorney
router.delete('/attorneys/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM attorneys WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logOperation('ATTORNEY_DELETE_ERROR', { id: req.params.id, error: err.message, by: req.user?.username });
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Attorney not found' });
    logOperation('ATTORNEY_DELETED', { id: req.params.id, by: req.user?.username });
    res.json({ message: 'Attorney deleted successfully' });
  });
});

module.exports = router;
