import { getOffices, setOfficeStatus, removeOffice } from '../../core/api.js';
import { bindLogout, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const messageEl = document.getElementById('page-message');
const officeListEl = document.getElementById('office-list');

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

async function loadOffices() {
  try {
    const offices = await getOffices();
    officeListEl.innerHTML = '';

    if (!offices.length) {
      officeListEl.innerHTML = '<tr><td colspan="6" class="text-center">No offices yet. Add one to get started.</td></tr>';
      return;
    }

    offices.forEach((office) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${office.name || '-'}</td>
        <td>${office.address || '-'}</td>
        <td>${office.phone || '-'}</td>
        <td>${office.email || '-'}</td>
        <td><span class="status-chip ${office.is_active ? 'active' : 'inactive'}">${office.is_active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="action-group">
            <a href="/admin/offices/form?id=${office.id}" class="btn btn-ghost btn-sm">Edit</a>
            <button class="btn btn-ghost btn-sm delete-btn" data-id="${office.id}">Delete</button>
            <button class="btn btn-ghost btn-sm status-toggle" data-id="${office.id}">${office.is_active ? 'Deactivate' : 'Activate'}</button>
          </div>
        </td>
      `;

      const deleteBtn = row.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this office?')) return;

        try {
          await removeOffice(office.id);
          showMessage('Office deleted successfully', 'success');
          await loadOffices();
        } catch (error) {
          showMessage(error.message || 'Delete failed');
        }
      });

      const statusBtn = row.querySelector('.status-toggle');
      statusBtn.addEventListener('click', async () => {
        try {
          await setOfficeStatus(office.id, office.is_active ? 0 : 1);
          await loadOffices();
        } catch (error) {
          showMessage(error.message || 'Status update failed');
          await loadOffices();
        }
      });

      officeListEl.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message || 'Failed to load offices');
  }
}

loadOffices();
