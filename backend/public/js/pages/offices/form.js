import { createOffice, getOfficeById, updateOffice, uploadPhoto } from '../../core/api.js';
import { bindLogout, getIdFromQuery, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const form = document.getElementById('office-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('office-id');
const imageUrlEl = document.getElementById('image-url');
const nameEl = document.getElementById('name');
const displayOrderEl = document.getElementById('display-order');
const addressEl = document.getElementById('address');
const phoneEl = document.getElementById('phone');
const descriptionEl = document.getElementById('description');
const imageEl = document.getElementById('image');
const activeEl = document.getElementById('office-active');
const imagePreviewEl = document.getElementById('image-preview');
const imagePreviewEmptyEl = document.getElementById('image-preview-empty');

let previewObjectUrl = '';

function resolveImageUrl(imageUrl = '') {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

function clearPreviewObjectUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = '';
  }
}

function setImagePreview(imageUrl = '') {
  if (!imagePreviewEl || !imagePreviewEmptyEl) return;

  if (!imageUrl) {
    imagePreviewEl.src = '';
    imagePreviewEl.classList.add('hidden');
    imagePreviewEmptyEl.classList.remove('hidden');
    return;
  }

  imagePreviewEl.src = imageUrl;
  imagePreviewEl.classList.remove('hidden');
  imagePreviewEmptyEl.classList.add('hidden');
}

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

function getPayload() {
  const parsedOrder = Number.parseInt(displayOrderEl.value, 10);

  return {
    slug: nameEl.value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-'),
    name: nameEl.value.trim(),
    address: addressEl.value.trim(),
    phone: phoneEl.value.trim(),
    description: descriptionEl.value.trim(),
    display_order: Number.isNaN(parsedOrder) ? 100 : parsedOrder,
    image_url: imageUrlEl.value || '',
    is_active: activeEl.checked ? 1 : 0
  };
}

async function loadOffice(id) {
  const office = await getOfficeById(id);
  idEl.value = office.id;
  imageUrlEl.value = office.image_url || '';
  nameEl.value = office.name || '';
  displayOrderEl.value = Number.isFinite(Number(office.display_order)) ? Number(office.display_order) : 100;
  addressEl.value = office.address || '';
  phoneEl.value = office.phone || '';
  descriptionEl.value = office.description || '';
  activeEl.checked = Boolean(office.is_active);
  setImagePreview(resolveImageUrl(office.image_url || ''));
  formTitle.textContent = 'Edit Office';
}

imageEl.addEventListener('change', () => {
  const file = imageEl.files[0];
  clearPreviewObjectUrl();

  if (!file) {
    setImagePreview(resolveImageUrl(imageUrlEl.value || ''));
    return;
  }

  previewObjectUrl = URL.createObjectURL(file);
  setImagePreview(previewObjectUrl);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = getPayload();
    const imageFile = imageEl.files[0];
    const isEditing = Boolean(idEl.value);

    if (imageFile) {
      const uploadData = await uploadPhoto(imageFile);
      payload.image_url = uploadData.photo_url;
      imageUrlEl.value = payload.image_url;
    }

    if (!isEditing && !payload.image_url) {
      throw new Error('Image is required for new office entries');
    }

    if (isEditing) {
      await updateOffice(idEl.value, payload);
      window.location.href = '/admin/offices';
      return;
    }

    await createOffice(payload);
    window.location.href = '/admin/offices';
  } catch (error) {
    showMessage(error.message || 'Save failed');
  }
});

(async () => {
  setImagePreview('');

  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadOffice(id);
  } catch (error) {
    showMessage(error.message || 'Could not load office');
  }
})();
