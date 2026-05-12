import { createAttorney, getAttorneyById, getPractices, updateAttorney, uploadPhoto } from '../../core/api.js';
import { bindLogout, getIdFromQuery } from '../../core/admin-helpers.js';

bindLogout('logout-btn');

const form = document.getElementById('attorney-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('attorney-id');
const photoUrlEl = document.getElementById('photo-url');
const practiceAreasJsonEl = document.getElementById('practice-areas-json');
const educationJsonEl = document.getElementById('education-json');
const barAdmissionsJsonEl = document.getElementById('bar-admissions-json');
const awardsJsonEl = document.getElementById('awards-json');
const affiliationsJsonEl = document.getElementById('affiliations-json');
const nameEl = document.getElementById('name');
const titleEl = document.getElementById('title');
const displayOrderEl = document.getElementById('display-order');
const specialtyEl = document.getElementById('specialty');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const locationEl = document.getElementById('location');
const bioEl = document.getElementById('bio');
const photoEl = document.getElementById('photo');
const activeEl = document.getElementById('attorney-active');
const practiceAreaInputEl = document.getElementById('practice-area-input');
const practiceFromCatalogEl = document.getElementById('practice-area-from-catalog');
const addPracticeAreaBtnEl = document.getElementById('add-practice-area');
const practiceAreasListEl = document.getElementById('practice-areas-list');
const photoPreviewEl = document.getElementById('photo-preview');
const photoPreviewEmptyEl = document.getElementById('photo-preview-empty');

// Education elements
const educationSchoolEl = document.getElementById('education-school');
const educationDegreeEl = document.getElementById('education-degree');
const educationYearEl = document.getElementById('education-year');
const addEducationBtnEl = document.getElementById('add-education');
const educationListEl = document.getElementById('education-list');

// Bar Admissions elements
const barStateEl = document.getElementById('bar-state');
const barYearEl = document.getElementById('bar-year');
const addBarAdmissionBtnEl = document.getElementById('add-bar-admission');
const barAdmissionsListEl = document.getElementById('bar-admissions-list');

// Awards & affiliations (title + optional description, same shape as legacy highlights)
const awardTitleEl = document.getElementById('award-title');
const awardDescriptionEl = document.getElementById('award-description');
const addAwardBtnEl = document.getElementById('add-award');
const awardsListEl = document.getElementById('awards-list');
const affiliationTitleEl = document.getElementById('affiliation-title');
const affiliationDescriptionEl = document.getElementById('affiliation-description');
const addAffiliationBtnEl = document.getElementById('add-affiliation');
const affiliationsListEl = document.getElementById('affiliations-list');

let previewObjectUrl = '';
let practiceAreas = [];
let education = [];
let barAdmissions = [];
let awards = [];
let affiliations = [];

function normalizePracticeAreaText(value = '') {
  return value.trim().replace(/\s+/g, ' ');
}

function parsePracticeAreas(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item == null) return '';
        if (typeof item === 'string') return normalizePracticeAreaText(item);
        if (typeof item === 'object' && item.title) return normalizePracticeAreaText(item.title);
        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsePracticeAreas(parsed);
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
    const label = document.createElement('span');
    label.textContent = area;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Remove ${area}`);
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      const next = practiceAreas.filter((_, i) => i !== index);
      setPracticeAreas(next);
    });
    pill.appendChild(label);
    pill.appendChild(removeBtn);
    practiceAreasListEl.appendChild(pill);
  });
}

async function loadPracticeCatalog() {
  if (!practiceFromCatalogEl) return;

  const placeholder = '<option value="">Add from practice directory…</option>';

  try {
    const rows = await getPractices();
    const titles = rows
      .map((row) => normalizePracticeAreaText(row?.title || ''))
      .filter(Boolean);

    const uniqueByKey = new Map();
    titles.forEach((title) => {
      const key = title.toLowerCase();
      if (!uniqueByKey.has(key)) uniqueByKey.set(key, title);
    });

    const sorted = Array.from(uniqueByKey.values()).sort((a, b) => a.localeCompare(b));

    practiceFromCatalogEl.innerHTML = placeholder;
    sorted.forEach((title) => {
      const opt = document.createElement('option');
      opt.value = title;
      opt.textContent = title;
      practiceFromCatalogEl.appendChild(opt);
    });
  } catch {
    practiceFromCatalogEl.innerHTML =
      '<option value="">Could not load practice directory (try refreshing)</option>';
  }
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

function parseEducation(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function setEducation(nextValues = []) {
  education = nextValues.filter((item) => item && (item.school || item.degree));

  if (educationJsonEl) {
    educationJsonEl.value = JSON.stringify(education);
  }

  if (!educationListEl) return;
  educationListEl.innerHTML = '';

  if (!education.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No education entries added yet.';
    educationListEl.appendChild(empty);
    return;
  }

  education.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'education-item-display';
    const yearText = entry.year ? ` (${entry.year})` : '';
    const labelText = [entry.degree, entry.school].filter(Boolean).join(' - ');
    item.innerHTML = `
      <div>
        <strong>${labelText || 'Education entry'}</strong>${yearText}
        <button type="button" data-index="${index}" aria-label="Remove" class="remove-btn">x</button>
      </div>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => {
      setEducation(education.filter((_, i) => i !== index));
    });
    educationListEl.appendChild(item);
  });
}

function addEducation() {
  const school = (educationSchoolEl?.value || '').trim();
  const degree = (educationDegreeEl?.value || '').trim();
  const year = (educationYearEl?.value || '').trim();

  if (!school && !degree) return;

  setEducation([
    ...education,
    { school, degree, year: year ? parseInt(year, 10) : null }
  ]);

  if (educationSchoolEl) educationSchoolEl.value = '';
  if (educationDegreeEl) educationDegreeEl.value = '';
  if (educationYearEl) educationYearEl.value = '';
  if (educationSchoolEl) educationSchoolEl.focus();
}

function parseBarAdmissions(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function setBarAdmissions(nextValues = []) {
  barAdmissions = nextValues.filter((item) => item && item.state);

  if (barAdmissionsJsonEl) {
    barAdmissionsJsonEl.value = JSON.stringify(barAdmissions);
  }

  if (!barAdmissionsListEl) return;
  barAdmissionsListEl.innerHTML = '';

  if (!barAdmissions.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No bar admissions added yet.';
    barAdmissionsListEl.appendChild(empty);
    return;
  }

  barAdmissions.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'bar-admission-item-display';
    const yearText = entry.year ? ` (${entry.year})` : '';
    item.innerHTML = `
      <div>
        <strong>${entry.state}</strong>${yearText}
        <button type="button" data-index="${index}" aria-label="Remove" class="remove-btn">x</button>
      </div>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => {
      setBarAdmissions(barAdmissions.filter((_, i) => i !== index));
    });
    barAdmissionsListEl.appendChild(item);
  });
}

function addBarAdmission() {
  const state = (barStateEl?.value || '').trim();
  const year = (barYearEl?.value || '').trim();

  if (!state) return;

  setBarAdmissions([
    ...barAdmissions,
    { state, year: year ? parseInt(year, 10) : null }
  ]);

  if (barStateEl) barStateEl.value = '';
  if (barYearEl) barYearEl.value = '';
  if (barStateEl) barStateEl.focus();
}

function parseTitleDescriptionItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function renderTitleDescriptionList(containerEl, entries, itemClass, onRemove) {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No entries added yet.';
    containerEl.appendChild(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = itemClass;
    const descText = entry.description ? `<p>${entry.description}</p>` : '';
    item.innerHTML = `
      <div>
        <strong>${entry.title}</strong>${descText}
        <button type="button" data-index="${index}" aria-label="Remove" class="remove-btn">x</button>
      </div>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => {
      onRemove(index);
    });
    containerEl.appendChild(item);
  });
}

function setAwards(nextValues = []) {
  awards = nextValues.filter((item) => item && item.title);

  if (awardsJsonEl) {
    awardsJsonEl.value = JSON.stringify(awards);
  }

  renderTitleDescriptionList(awardsListEl, awards, 'award-item-display', (index) => {
    setAwards(awards.filter((_, i) => i !== index));
  });
}

function addAward() {
  const title = (awardTitleEl?.value || '').trim();
  const description = (awardDescriptionEl?.value || '').trim();

  if (!title) return;

  setAwards([...awards, { title, description: description || null }]);

  if (awardTitleEl) awardTitleEl.value = '';
  if (awardDescriptionEl) awardDescriptionEl.value = '';
  if (awardTitleEl) awardTitleEl.focus();
}

function setAffiliations(nextValues = []) {
  affiliations = nextValues.filter((item) => item && item.title);

  if (affiliationsJsonEl) {
    affiliationsJsonEl.value = JSON.stringify(affiliations);
  }

  renderTitleDescriptionList(affiliationsListEl, affiliations, 'affiliation-item-display', (index) => {
    setAffiliations(affiliations.filter((_, i) => i !== index));
  });
}

function addAffiliation() {
  const title = (affiliationTitleEl?.value || '').trim();
  const description = (affiliationDescriptionEl?.value || '').trim();

  if (!title) return;

  setAffiliations([...affiliations, { title, description: description || null }]);

  if (affiliationTitleEl) affiliationTitleEl.value = '';
  if (affiliationDescriptionEl) affiliationDescriptionEl.value = '';
  if (affiliationTitleEl) affiliationTitleEl.focus();
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
    email: emailEl.value.trim(),
    phone: phoneEl.value.trim(),
    practice_areas: [...practiceAreas],
    education: [...education],
    bar_admissions: [...barAdmissions],
    awards: [...awards],
    affiliations: [...affiliations],
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
  emailEl.value = attorney.email || '';
  phoneEl.value = attorney.phone || '';
  setPracticeAreas(parsePracticeAreas(attorney.practice_areas));
  setEducation(parseEducation(attorney.education));
  setBarAdmissions(parseBarAdmissions(attorney.bar_admissions));
  setAwards(parseTitleDescriptionItems(attorney.awards));
  setAffiliations(parseTitleDescriptionItems(attorney.affiliations));
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

practiceFromCatalogEl?.addEventListener('change', () => {
  const value = normalizePracticeAreaText(practiceFromCatalogEl.value || '');
  if (!value) return;
  setPracticeAreas([...practiceAreas, value]);
  practiceFromCatalogEl.value = '';
});

practiceAreaInputEl?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addPracticeArea();
});

addEducationBtnEl?.addEventListener('click', addEducation);

educationYearEl?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addEducation();
});

addBarAdmissionBtnEl?.addEventListener('click', addBarAdmission);

barYearEl?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addBarAdmission();
});

addAwardBtnEl?.addEventListener('click', addAward);

awardDescriptionEl?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addAward();
});

addAffiliationBtnEl?.addEventListener('click', addAffiliation);

affiliationDescriptionEl?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addAffiliation();
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
  setEducation([]);
  setBarAdmissions([]);
  setAwards([]);
  setAffiliations([]);

  await loadPracticeCatalog();

  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadAttorney(id);
  } catch (error) {
    showMessage(error.message || 'Could not load attorney');
  }
})();
