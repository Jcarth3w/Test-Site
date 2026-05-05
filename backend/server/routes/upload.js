const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR } = require('../config');
const { authenticateToken } = require('../middleware');
const { logOperation } = require('../logger');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  logOperation('PHOTO_UPLOADED', { filename: req.file.filename, by: req.user?.username });
  res.json({ photo_url: `/uploads/${req.file.filename}` });
});

module.exports = router;
