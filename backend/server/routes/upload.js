const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../config');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const ALLOWED_DOCUMENT_EXT = new Set(['.pdf']);

function isSafeDocumentFilename(name = '') {
  const base = path.basename(String(name));
  if (!base || base === '.' || base === '..') return false;
  if (base.includes('..') || base.includes('/') || base.includes('\\')) return false;
  return ALLOWED_DOCUMENT_EXT.has(path.extname(base).toLowerCase());
}

function isSafeUploadFilename(name = '') {
  const base = path.basename(String(name));
  if (!base || base === '.' || base === '..') return false;
  if (base.includes('..') || base.includes('/') || base.includes('\\')) return false;
  return ALLOWED_EXT.has(path.extname(base).toLowerCase());
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  logOperation('PHOTO_UPLOADED', { filename: req.file.filename, by: req.user?.username });
  res.json({ photo_url: `/uploads/${req.file.filename}` });
});

router.post('/upload/document', authenticateToken, upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!isSafeDocumentFilename(req.file.filename)) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  logOperation('DOCUMENT_UPLOADED', { filename: req.file.filename, by: req.user?.username });
  res.json({ file_url: `/uploads/${req.file.filename}` });
});

/** Push a file using an existing filename (for one-time prod disk sync). */
router.post('/admin/sync-upload', authenticateToken, uploadMemory.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = path.basename(String(req.body.filename || req.file.originalname || ''));
  if (!isSafeUploadFilename(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const dest = path.join(UPLOAD_DIR, filename);
  try {
    fs.writeFileSync(dest, req.file.buffer);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not save file' });
  }

  logOperation('PHOTO_SYNCED', { filename, by: req.user?.username });
  res.json({ photo_url: `/uploads/${filename}`, synced: true });
});

module.exports = router;
