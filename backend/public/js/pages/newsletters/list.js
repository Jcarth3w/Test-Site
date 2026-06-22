import {
  getNewsletters,
  setNewsletterStatus,
  removeNewsletter,
} from '../../core/api.js';
import { bindLogout, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const messageEl = document.getElementById('page-message');
const newsletterListEl = document.getElementById('newsletter-list');

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

async function loadNewsletters() {
  try {
    const newsletters = await getNewsletters();
    newsletterListEl.innerHTML = '';

    if (!newsletters.length) {
      newsletterListEl.innerHTML = '<tr><td colspan="5" class="text-center">No newsletters yet. Add one to get started.</td></tr>';
      return;
    }

    newsletters.forEach((newsletter, index) => {
      const row = document.createElement('tr');
      const issueDate = newsletter.issue_date
        ? new Date(newsletter.issue_date).toLocaleDateString()
        : '-';
      const featuredLabel = index === 0 && newsletter.is_published ? ' (featured)' : '';

      row.innerHTML = `
        <td>${newsletter.title || '-'}${featuredLabel}</td>
        <td>${issueDate}</td>
        <td>${newsletter.slug || '-'}</td>
        <td><span class="status-chip ${newsletter.is_published ? 'active' : 'inactive'}">${newsletter.is_published ? 'Published' : 'Draft'}</span></td>
        <td>
          <div class="action-group">
            <a href="/admin/newsletters/form?id=${newsletter.id}" class="btn btn-ghost btn-sm">Edit</a>
            <button class="btn btn-ghost btn-sm delete-btn" data-id="${newsletter.id}">Delete</button>
            <button class="btn btn-ghost btn-sm status-toggle" data-id="${newsletter.id}">${newsletter.is_published ? 'Unpublish' : 'Publish'}</button>
          </div>
        </td>
      `;

      const deleteBtn = row.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this newsletter?')) return;

        try {
          await removeNewsletter(newsletter.id);
          showMessage('Newsletter deleted successfully', 'success');
          await loadNewsletters();
        } catch (error) {
          showMessage(error.message || 'Delete failed');
        }
      });

      const statusBtn = row.querySelector('.status-toggle');
      statusBtn.addEventListener('click', async () => {
        try {
          await setNewsletterStatus(newsletter.id, newsletter.is_published ? 0 : 1);
          await loadNewsletters();
        } catch (error) {
          showMessage(error.message || 'Status update failed');
          await loadNewsletters();
        }
      });

      newsletterListEl.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message || 'Failed to load newsletters');
  }
}

loadNewsletters();
