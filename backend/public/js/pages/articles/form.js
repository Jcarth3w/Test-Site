import { createArticle, getArticleById, updateArticle, getAttorneys, getArticleCategories, uploadPhoto } from '../../core/api.js';
import { bindLogout, getIdFromQuery, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const form = document.getElementById('article-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('article-id');
const titleEl = document.getElementById('title');
const slugEl = document.getElementById('slug');
const authorIdEl = document.getElementById('author-id');
const categoryEl = document.getElementById('category');
const publicationDateEl = document.getElementById('publication-date');
const sourceUrlEl = document.getElementById('source-url');
const summaryEl = document.getElementById('summary');
const contentEl = document.getElementById('content');
const publishedEl = document.getElementById('article-published');

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

function getPayload() {
  return {
    slug: slugEl.value.trim(),
    title: titleEl.value.trim(),
    summary: summaryEl.value.trim(),
    content: contentEl.value.trim(),
    author_id: authorIdEl.value ? parseInt(authorIdEl.value, 10) : null,
    category: categoryEl.value,
    publication_date: publicationDateEl.value || null,
    source_url: sourceUrlEl.value.trim(),
    is_published: publishedEl.checked ? 1 : 0
  };
}

function populateCategoryOptions(categories, selectedSlug = '') {
  categoryEl.innerHTML = '';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.slug;
    option.textContent = category.title;
    if (category.slug === selectedSlug) option.selected = true;
    categoryEl.appendChild(option);
  });
}

async function loadCategories(selectedSlug = '') {
  try {
    const categories = await getArticleCategories();
    populateCategoryOptions(categories, selectedSlug);
  } catch (error) {
    categoryEl.innerHTML = '<option value="" disabled selected>Could not load categories</option>';
    showMessage(error.message || 'Could not load article categories');
  }
}

async function loadArticle(id) {
  const article = await getArticleById(id);
  idEl.value = article.id;
  titleEl.value = article.title || '';
  slugEl.value = article.slug || '';
  authorIdEl.value = article.author_id || '';
  categoryEl.value = article.category || 'insights';
  sourceUrlEl.value = article.source_url || '';
  summaryEl.value = article.summary || '';
  contentEl.value = article.content || '';
  publishedEl.checked = Boolean(article.is_published);

  if (article.publication_date) {
    const date = new Date(article.publication_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    publicationDateEl.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  formTitle.textContent = 'Edit Article';
}

async function loadAttorneys() {
  try {
    const attorneys = await getAttorneys();
    authorIdEl.innerHTML = '<option value="">No author</option>';
    attorneys.forEach((attorney) => {
      const option = document.createElement('option');
      option.value = attorney.id;
      option.textContent = attorney.name;
      authorIdEl.appendChild(option);
    });
  } catch (error) {
    showMessage('Failed to load attorneys');
  }
}

titleEl.addEventListener('change', () => {
  if (!slugEl.value) {
    slugEl.value = titleEl.value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  }
});


form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = getPayload();
    const isEditing = Boolean(idEl.value);

    if (!payload.slug) {
      throw new Error('Slug is required');
    }

    if (isEditing) {
      await updateArticle(idEl.value, payload);
      window.location.href = '/admin/articles';
      return;
    }

    await createArticle(payload);
    window.location.href = '/admin/articles';
  } catch (error) {
    showMessage(error.message || 'Save failed');
  }
});

(async () => {
  await Promise.all([loadAttorneys(), loadCategories()]);

  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadArticle(id);
  } catch (error) {
    showMessage(error.message || 'Could not load article');
  }
})();
