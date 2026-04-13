import { createPractice, getPracticeById, updatePractice, uploadPracticeImage } from '../../core/api.js';
import { bindLogout, getIdFromQuery, requireAuth, toSlug } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const form = document.getElementById('practice-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('practice-id');
const slugEl = document.getElementById('practice-slug');
const titleEl = document.getElementById('practice-title');
const descEl = document.getElementById('practice-description');
const contentEl = document.getElementById('practice-content');
const imageUrlEl = document.getElementById('practice-image-url');
const imageFileEl = document.getElementById('practice-image-file');
const uploadImageBtn = document.getElementById('upload-practice-image-btn');
const uploadStatusEl = document.getElementById('upload-practice-image-status');
const buttonTextEl = document.getElementById('practice-button-text');
const activeEl = document.getElementById('practice-active');

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

function setUploadStatus(text, type = 'muted') {
  uploadStatusEl.textContent = text;
  uploadStatusEl.classList.remove('status-error', 'status-success', 'muted');
  uploadStatusEl.classList.add(type);
}

function getPayload() {
  return {
    slug: toSlug(slugEl.value),
    title: titleEl.value.trim(),
    description: descEl.value.trim(),
    content: contentEl.value.trim(),
    image_url: imageUrlEl.value.trim(),
    button_text: buttonTextEl.value.trim() || 'Free Case Review',
    is_active: activeEl.checked ? 1 : 0
  };
}

async function loadPractice(id) {
  const practice = await getPracticeById(id);
  idEl.value = practice.id;
  slugEl.value = practice.slug || '';
  titleEl.value = practice.title || '';
  descEl.value = practice.description || '';
  contentEl.value = practice.content || '';
  imageUrlEl.value = practice.image_url || '';
  buttonTextEl.value = practice.button_text || 'Free Case Review';
  activeEl.checked = Boolean(practice.is_active);
  formTitle.textContent = 'Edit Practice Area';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = getPayload();

    if (idEl.value) {
      await updatePractice(idEl.value, payload);
      window.location.href = '/admin/practices';
      return;
    }

    await createPractice(payload);
    window.location.href = '/admin/practices';
  } catch (error) {
    showMessage(error.message || 'Save failed');
  }
});

uploadImageBtn?.addEventListener('click', async () => {
  const file = imageFileEl?.files?.[0];
  if (!file) {
    setUploadStatus('Please choose an image file first.', 'status-error');
    return;
  }

  uploadImageBtn.disabled = true;
  setUploadStatus('Uploading image...', 'muted');

  try {
    const uploaded = await uploadPracticeImage(file);
    imageUrlEl.value = uploaded.photo_url || '';
    setUploadStatus('Image uploaded successfully. Image URL was filled in.', 'status-success');
  } catch (error) {
    setUploadStatus(error.message || 'Image upload failed.', 'status-error');
  } finally {
    uploadImageBtn.disabled = false;
  }
});

(async () => {
  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadPractice(id);
  } catch (error) {
    showMessage(error.message || 'Could not load practice area');
  }
})();
