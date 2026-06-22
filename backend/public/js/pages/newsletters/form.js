import {
  createNewsletter,
  getNewsletterById,
  updateNewsletter,
  uploadPhoto,
  uploadDocument,
} from '../../core/api.js';
import { bindLogout, getIdFromQuery, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const form = document.getElementById('newsletter-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('newsletter-id');
const titleEl = document.getElementById('title');
const slugEl = document.getElementById('slug');
const issueDateEl = document.getElementById('issue-date');
const summaryEl = document.getElementById('summary');
const pdfUrlEl = document.getElementById('pdf-url');
const coverImageUrlEl = document.getElementById('cover-image-url');
const pdfFileEl = document.getElementById('pdf-file');
const pdfFileNameEl = document.getElementById('pdf-file-name');
const coverImageEl = document.getElementById('cover-image');
const coverPreviewEl = document.getElementById('cover-preview');
const coverPreviewEmptyEl = document.getElementById('cover-preview-empty');
const publishedEl = document.getElementById('newsletter-published');

let coverPreviewObjectUrl = '';

function resolveAssetUrl(url = '') {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

function setCoverPreview(url = '') {
  if (!url) {
    coverPreviewEl.src = '';
    coverPreviewEl.classList.add('hidden');
    coverPreviewEmptyEl.classList.remove('hidden');
    return;
  }

  coverPreviewEl.src = url;
  coverPreviewEl.classList.remove('hidden');
  coverPreviewEmptyEl.classList.add('hidden');
}

function updatePdfLabel(filename = '') {
  if (filename) {
    pdfFileNameEl.textContent = filename;
    return;
  }

  if (pdfUrlEl.value) {
    pdfFileNameEl.textContent = pdfUrlEl.value.split('/').pop();
    return;
  }

  pdfFileNameEl.textContent = 'No PDF selected';
}

function getPayload() {
  return {
    slug: slugEl.value.trim(),
    title: titleEl.value.trim(),
    summary: summaryEl.value.trim(),
    issue_date: issueDateEl.value || null,
    pdf_url: pdfUrlEl.value.trim(),
    cover_image_url: coverImageUrlEl.value.trim(),
    is_published: publishedEl.checked ? 1 : 0,
  };
}

async function loadNewsletter(id) {
  const newsletter = await getNewsletterById(id);
  idEl.value = newsletter.id;
  titleEl.value = newsletter.title || '';
  slugEl.value = newsletter.slug || '';
  summaryEl.value = newsletter.summary || '';
  pdfUrlEl.value = newsletter.pdf_url || '';
  coverImageUrlEl.value = newsletter.cover_image_url || '';
  publishedEl.checked = Boolean(newsletter.is_published);

  if (newsletter.issue_date) {
    const date = new Date(newsletter.issue_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    issueDateEl.value = `${year}-${month}-${day}`;
  }

  updatePdfLabel();
  setCoverPreview(resolveAssetUrl(newsletter.cover_image_url || ''));
  formTitle.textContent = 'Edit Newsletter';
}

titleEl.addEventListener('change', () => {
  if (!slugEl.value) {
    slugEl.value = titleEl.value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  }
});

pdfFileEl.addEventListener('change', () => {
  const file = pdfFileEl.files[0];
  updatePdfLabel(file?.name || '');
});

coverImageEl.addEventListener('change', () => {
  const file = coverImageEl.files[0];
  if (coverPreviewObjectUrl) {
    URL.revokeObjectURL(coverPreviewObjectUrl);
    coverPreviewObjectUrl = '';
  }

  if (!file) {
    setCoverPreview(resolveAssetUrl(coverImageUrlEl.value || ''));
    return;
  }

  coverPreviewObjectUrl = URL.createObjectURL(file);
  setCoverPreview(coverPreviewObjectUrl);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const isEditing = Boolean(idEl.value);
    const pdfFile = pdfFileEl.files[0];
    const coverFile = coverImageEl.files[0];

    if (!pdfUrlEl.value && !pdfFile) {
      throw new Error('A newsletter PDF is required');
    }

    if (pdfFile) {
      const uploadResult = await uploadDocument(pdfFile);
      pdfUrlEl.value = uploadResult.file_url;
    }

    if (coverFile) {
      const uploadResult = await uploadPhoto(coverFile);
      coverImageUrlEl.value = uploadResult.photo_url;
    }

    const payload = getPayload();

    if (!payload.slug) {
      throw new Error('Slug is required');
    }

    if (isEditing) {
      await updateNewsletter(idEl.value, payload);
      window.location.href = '/admin/newsletters';
      return;
    }

    await createNewsletter(payload);
    window.location.href = '/admin/newsletters';
  } catch (error) {
    showMessage(error.message || 'Save failed');
  }
});

(async () => {
  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadNewsletter(id);
  } catch (error) {
    showMessage(error.message || 'Could not load newsletter');
  }
})();
