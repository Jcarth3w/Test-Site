import { getPractices, removePractice, setPracticeStatus } from '../../core/api.js';
import { bindLogout, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const practiceList = document.getElementById('practice-list');
const pageMessage = document.getElementById('page-message');

function showMessage(text, type = 'error') {
  pageMessage.textContent = text;
  pageMessage.classList.remove('hidden', 'error', 'success');
  pageMessage.classList.add(type);
}

function renderList(practices) {
  if (!practices.length) {
    practiceList.innerHTML = '<p class="muted">No practice areas available.</p>';
    return;
  }

  practiceList.innerHTML = '';
  practices.forEach((practice) => {
    const isActive = Boolean(practice.is_active);
    const card = document.createElement('article');
    card.className = 'attorney-item';

    card.innerHTML = `
      <span class="status-chip ${isActive ? 'active' : 'inactive'}">${isActive ? 'ACTIVE' : 'INACTIVE'}</span>
      <h3>${practice.title || 'Untitled Practice'}</h3>
      <p class="meta"><strong>Slug:</strong> ${practice.slug || '-'}</p>
      <p class="meta">${practice.description || ''}</p>
      <div class="card-actions">
        <a class="btn btn-ghost" href="/admin/practices/form?id=${practice.id}">Edit</a>
        <button class="btn btn-warning" data-action="toggle">${isActive ? 'Deactivate' : 'Activate'}</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      try {
        await setPracticeStatus(practice.id, isActive ? 0 : 1);
        await loadPractices();
      } catch (error) {
        showMessage(error.message || 'Status update failed');
      }
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm('Delete this practice area permanently?')) return;

      try {
        await removePractice(practice.id);
        await loadPractices();
      } catch (error) {
        showMessage(error.message || 'Delete failed');
      }
    });

    practiceList.appendChild(card);
  });
}

async function loadPractices() {
  try {
    const practices = await getPractices();
    renderList(practices);
  } catch (error) {
    showMessage(error.message || 'Could not load practice areas');
  }
}

loadPractices();
