import { createAttorney, getAttorneyById, updateAttorney, uploadPhoto } from '../../core/api.js';
import { bindLogout, getIdFromQuery, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const form = document.getElementById('attorney-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('attorney-id');
const photoUrlEl = document.getElementById('photo-url');
const practiceAreasJsonEl = document.getElementById('practice-areas-json');
const nameEl = document.getElementById('name');
const titleEl = document.getElementById('title');
const displayOrderEl = document.getElementById('display-order');
const specialtyEl = document.getElementById('specialty');
const locationEl = document.getElementById('location');
const bioEl = document.getElementById('bio');
const photoEl = document.getElementById('photo');
const activeEl = document.getElementById('attorney-active');
const practiceAreaInputEl = document.getElementById('practice-area-input');
const addPracticeAreaBtnEl = document.getElementById('add-practice-area');
const practiceAreasListEl = document.getElementById('practice-areas-list');
const photoPreviewEl = document.getElementById('photo-preview');
const photoPreviewEmptyEl = document.getElementById('photo-preview-empty');

let previewObjectUrl = '';
let practiceAreas = [];

function normalizePracticeAreaText(value = '') {
  return value.trim().replace(/\s+/g, ' ');
}

function parsePracticeAreas(value) {
  if (Array.isArray(value)) {
    return value.map(normalizePracticeAreaText).filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizePracticeAreaText).filter(Boolean);
      }
    } catch {
      return raw.split(',').map(normalizePracticeAreaText).filter(Boolean);
    }
  }

  return [];
}

function setPracticeAreas(nextValues = []) {
  const seen = new Set();
  practiceAreas = nextValues.filter((item) => {
    const value = normalizePracticeAreaText(item);
    if (!value) return false;
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (practiceAreasJsonEl) {
    practiceAreasJsonEl.value = JSON.stringify(practiceAreas);
  }

  if (!practiceAreasListEl) return;

  practiceAreasListEl.innerHTML = '';
  if (!practiceAreas.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No practice areas added yet.';
    practiceAreasListEl.appendChild(empty);
    return;
  }

  practiceAreas.forEach((area, index) => {
    const pill = document.createElement('span');
    pill.className = 'practice-pill';
    pill.innerHTML = `<span>${area}</span><button type="button" data-index="${index}" aria-label="Remove ${area}">x</button>`;
    pill.querySelector('button').addEventListener('click', () => {
      const next = practiceAreas.filter((_, i) => i !== index);
      setPracticeAreas(next);
    });
    practiceAreasListEl.appendChild(pill);
  });
}

function addPracticeArea() {
  const value = normalizePracticeAreaText(practiceAreaInputEl?.value || '');
  if (!value) return;

  setPracticeAreas([...practiceAreas, value]);
  if (practiceAreaInputEl) {
    practiceAreaInputEl.value = '';
    practiceAreaInputEl.focus();
  }
}

function resolvePhotoUrl(photoUrl = '') {
  if (!photoUrl) return '';
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
}

function clearPreviewObjectUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = '';
  }
}

function setPhotoPreview(photoUrl = '') {
  if (!photoPreviewEl || !photoPreviewEmptyEl) return;

  if (!photoUrl) {
    photoPreviewEl.src = '';
    photoPreviewEl.classList.add('hidden');
    photoPreviewEmptyEl.classList.remove('hidden');
    return;
  }

  photoPreviewEl.src = photoUrl;
  photoPreviewEl.classList.remove('hidden');
  photoPreviewEmptyEl.classList.add('hidden');
}

function normalizeOfficeValue(value = '') {
  return value
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function setOfficeSelection(location = '') {
  const raw = (location || '').trim();
  if (!raw) {
    locationEl.value = '';
    return;
  }

  const target = normalizeOfficeValue(raw);
  const options = Array.from(locationEl.options || []);
  const match = options.find((option) => normalizeOfficeValue(option.value) === target);
  locationEl.value = match ? match.value : '';
}

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

function getPayload() {
  const parsedOrder = Number.parseInt(displayOrderEl.value, 10);

  return {
    name: nameEl.value.trim(),
    title: titleEl.value.trim(),
    display_order: Number.isNaN(parsedOrder) ? 100 : parsedOrder,
    specialty: specialtyEl.value.trim(),
    practice_areas: [...practiceAreas],
    location: locationEl.value,
    bio: bioEl.value.trim(),
    photo_url: photoUrlEl.value || '',
    is_active: activeEl.checked ? 1 : 0
  };
}

async function loadAttorney(id) {
  const attorney = await getAttorneyById(id);
  idEl.value = attorney.id;
  photoUrlEl.value = attorney.photo_url || '';
  nameEl.value = attorney.name || '';
  titleEl.value = attorney.title || '';
  displayOrderEl.value = Number.isFinite(Number(attorney.display_order)) ? Number(attorney.display_order) : 100;
  specialtyEl.value = attorney.specialty || '';
  setPracticeAreas(parsePracticeAreas(attorney.practice_areas));
  setOfficeSelection(attorney.location || '');
  bioEl.value = attorney.bio || '';
  activeEl.checked = Boolean(attorney.is_active);
  setPhotoPreview(resolvePhotoUrl(attorney.photo_url || ''));
  formTitle.textContent = 'Edit Attorney';
}

photoEl.addEventListener('change', () => {
  const file = photoEl.files[0];
  clearPreviewObjectUrl();

  if (!file) {
    setPhotoPreview(resolvePhotoUrl(photoUrlEl.value || ''));
    return;
  }

  previewObjectUrl = URL.createObjectURL(file);
  setPhotoPreview(previewObjectUrl);
});

addPracticeAreaBtnEl?.addEventListener('click', addPracticeArea);

practiceAreaInputEl?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addPracticeArea();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = getPayload();
    const photoFile = photoEl.files[0];
    const isEditing = Boolean(idEl.value);

    if (photoFile) {
      const uploadData = await uploadPhoto(photoFile);
      payload.photo_url = uploadData.photo_url;
      photoUrlEl.value = payload.photo_url;
    }

    if (!isEditing && !payload.photo_url) {
      throw new Error('Photo is required for new attorney entries');
    }

    if (isEditing) {
      await updateAttorney(idEl.value, payload);
      window.location.href = '/admin/attorneys';
      return;
    }

    await createAttorney(payload);
    window.location.href = '/admin/attorneys';
  } catch (error) {
    showMessage(error.message || 'Save failed');
  }
});

(async () => {
  setPhotoPreview('');
  setPracticeAreas([]);

  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadAttorney(id);
  } catch (error) {
    showMessage(error.message || 'Could not load attorney');
  }
})();
