import { getArticles, getAttorneys, setArticleStatus, removeArticle } from '../../core/api.js';
import { bindLogout, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const messageEl = document.getElementById('page-message');
const articleListEl = document.getElementById('article-list');

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

async function loadArticles() {
  try {
    const [articles, attorneys] = await Promise.all([getArticles(), getAttorneys()]);
    articleListEl.innerHTML = '';

    if (!articles.length) {
      articleListEl.innerHTML = '<tr><td colspan="6" class="text-center">No articles yet. Add one to get started.</td></tr>';
      return;
    }

    articles.forEach((article) => {
      const author = attorneys.find((a) => a.id === article.author_id);
      const row = document.createElement('tr');
      const pubDate = article.publication_date ? new Date(article.publication_date).toLocaleDateString() : '-';
      row.innerHTML = `
        <td>${article.title || '-'}</td>
        <td>${author ? author.name : 'No author'}</td>
        <td>${article.slug || '-'}</td>
        <td>${pubDate}</td>
        <td><span class="status-chip ${article.is_published ? 'active' : 'inactive'}">${article.is_published ? 'Published' : 'Draft'}</span></td>
        <td>
          <div class="action-group">
            <a href="/admin/articles/form?id=${article.id}" class="btn btn-ghost btn-sm">Edit</a>
            <button class="btn btn-ghost btn-sm delete-btn" data-id="${article.id}">Delete</button>
            <button class="btn btn-ghost btn-sm status-toggle" data-id="${article.id}">${article.is_published ? 'Unpublish' : 'Publish'}</button>
          </div>
        </td>
      `;

      const deleteBtn = row.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
          await removeArticle(article.id);
          showMessage('Article deleted successfully', 'success');
          await loadArticles();
        } catch (error) {
          showMessage(error.message || 'Delete failed');
        }
      });

      const statusBtn = row.querySelector('.status-toggle');
      statusBtn.addEventListener('click', async () => {
        try {
          await setArticleStatus(article.id, article.is_published ? 0 : 1);
          await loadArticles();
        } catch (error) {
          showMessage(error.message || 'Status update failed');
          await loadArticles();
        }
      });

      articleListEl.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message || 'Failed to load articles');
  }
}

loadArticles();
