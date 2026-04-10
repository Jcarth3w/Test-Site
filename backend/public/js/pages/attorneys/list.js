import { getAttorneys, removeAttorney, setAttorneyStatus } from '../../core/api.js';
import { bindLogout, getLastName, getLastNameInitial, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const letterFilter = document.getElementById('letter-filter');
const attorneyList = document.getElementById('attorney-list');
const pageMessage = document.getElementById('page-message');
let allAttorneys = [];

function showMessage(text, type = 'error') {
  pageMessage.textContent = text;
  pageMessage.classList.remove('hidden', 'error', 'success');
  pageMessage.classList.add(type);
}

function compareByLastName(a, b) {
  const lastA = getLastName(a.name);
  const lastB = getLastName(b.name);
  if (lastA.localeCompare(lastB) !== 0) return lastA.localeCompare(lastB);
  return (a.name || '').localeCompare(b.name || '');
}

function populateLetterFilter(items) {
  const letters = Array.from(new Set(items.map((item) => getLastNameInitial(item.name)).filter((char) => /^[A-Z]$/.test(char)))).sort();

  letterFilter.innerHTML = '<option value="ALL">All</option>';
  letters.forEach((letter) => {
    const option = document.createElement('option');
    option.value = letter;
    option.textContent = letter;
    letterFilter.appendChild(option);
  });
}

function renderList() {
  const selected = letterFilter.value || 'ALL';
  const filtered = selected === 'ALL'
    ? allAttorneys
    : allAttorneys.filter((item) => getLastNameInitial(item.name) === selected);

  if (!filtered.length) {
    attorneyList.innerHTML = '<p class="muted">No attorneys match this filter.</p>';
    return;
  }

  attorneyList.innerHTML = '';
  filtered.forEach((attorney) => {
    const isActive = Boolean(attorney.is_active);
    const displayOrder = Number.isFinite(Number(attorney.display_order)) ? Number(attorney.display_order) : 100;
    const practiceAreas = Array.isArray(attorney.practice_areas) ? attorney.practice_areas : [];
    const card = document.createElement('article');
    card.className = 'attorney-item';

    const photoSrc = attorney.photo_url ? attorney.photo_url : null;
    card.innerHTML = `
      ${photoSrc ? `<img class="attorney-list-photo" src="${photoSrc}" alt="${attorney.name || ''}" onerror="this.style.display='none'">` : ''}
      <span class="status-chip ${isActive ? 'active' : 'inactive'}">${isActive ? 'ACTIVE' : 'INACTIVE'}</span>
      <h3>${attorney.name || 'Unnamed Attorney'}</h3>
      <p class="meta"><strong>Title:</strong> ${attorney.title || '-'}</p>
      <p class="meta"><strong>Display Order:</strong> ${displayOrder}</p>
      <p class="meta"><strong>Specialty:</strong> ${attorney.specialty || '-'}</p>
      <p class="meta"><strong>Practice Areas:</strong> ${practiceAreas.length ? practiceAreas.join(', ') : '-'}</p>
      <p class="meta"><strong>Last Name:</strong> ${getLastName(attorney.name) || '-'}</p>
      <div class="card-actions">
        <a class="btn btn-ghost" href="/admin/attorneys/form?id=${attorney.id}">Edit</a>
        <button class="btn btn-warning" data-action="toggle">${isActive ? 'Deactivate' : 'Activate'}</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      try {
        await setAttorneyStatus(attorney.id, isActive ? 0 : 1);
        await loadAttorneys();
      } catch (error) {
        showMessage(error.message || 'Status update failed');
      }
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm('Delete this attorney permanently?')) return;

      try {
        await removeAttorney(attorney.id);
        await loadAttorneys();
      } catch (error) {
        showMessage(error.message || 'Delete failed');
      }
    });

    attorneyList.appendChild(card);
  });
}

async function loadAttorneys() {
  try {
    const attorneys = await getAttorneys();
    allAttorneys = attorneys.sort(compareByLastName);
    populateLetterFilter(allAttorneys);
    renderList();
  } catch (error) {
    showMessage(error.message || 'Could not load attorneys');
  }
}

letterFilter.addEventListener('change', renderList);
loadAttorneys();
