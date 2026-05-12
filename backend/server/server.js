const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { PORT, UPLOAD_DIR } = require('./config');
const { corsOriginHandler, requestLogger } = require('./middleware');
const attorneyRoutes = require('./routes/attorneys');
const practiceRoutes = require('./routes/practices');
const officeRoutes = require('./routes/offices');
const articleRoutes = require('./routes/articles');
const uploadRoutes = require('./routes/upload');
const { serveUploads } = require('./serveUploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
try {
  const files = fs.readdirSync(UPLOAD_DIR);
  const fileCount = files.filter((f) => {
    try {
      return fs.statSync(path.join(UPLOAD_DIR, f)).isFile();
    } catch {
      return false;
    }
  }).length;
  console.log(`Uploads: ${path.resolve(UPLOAD_DIR)} (${fileCount} files on disk)`);
} catch (e) {
  console.warn('Could not read UPLOAD_DIR:', e.message);
}

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: corsOriginHandler, credentials: true }));
app.use(express.json());
app.use('/uploads', serveUploads(UPLOAD_DIR));
app.use(express.static('public'));
app.use(requestLogger);

// Render (and similar) default service URLs hit `/`; the CMS lives under `/admin`.
app.get('/', (req, res) => {
  res.redirect(302, '/admin');
});

// API routes
app.use('/api', attorneyRoutes);
app.use('/api', practiceRoutes);
app.use('/api', officeRoutes);
app.use('/api', articleRoutes);
app.use('/api', uploadRoutes);

// Admin pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'admin.html'));
});
app.get('/admin/attorneys', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'attorneys.html'));
});
app.get('/admin/attorneys/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'attorney-form.html'));
});
app.get('/admin/practices', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'practices.html'));
});
app.get('/admin/practices/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'practice-form.html'));
});

app.get('/admin/offices', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'offices.html'));
});

app.get('/admin/offices/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'office-form.html'));
});

app.get('/admin/articles', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'articles.html'));
});

app.get('/admin/articles/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'article-form.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
