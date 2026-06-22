import { createArticle, getArticleById, updateArticle, getAttorneys } from '../../core/api.js';
import { bindLogout, getIdFromQuery, requireAuth } from '../../core/admin-helpers.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

bindLogout('logout-btn');

const CATEGORY_META = {
  article: {
    label: 'Article',
    description:
      'In-depth firm perspectives and practical guidance — typically one primary author, with structured sections.',
    summaryHint: 'Lead with the practical takeaway readers should remember.',
    contentHint: 'Full article body. Use headings for sections. HTML is supported.',
  },
  insight: {
    label: 'Insight',
    description:
      'Commentary on a case, ruling, or development — often shorter and commonly co-authored.',
    summaryHint: 'Summarize the ruling or development and why it matters to your audience.',
    contentHint: 'Analysis of the decision or trend. Cite the court or source when possible.',
  },
  news: {
    label: 'News',
    description: 'Firm announcements, media coverage, speaking engagements, and honors.',
    summaryHint: 'Brief announcement text for listings.',
    contentHint: 'Event details, quote, or press release body. Use Source URL for external coverage.',
  },
};

const form = document.getElementById('article-form');
const formTitle = document.getElementById('form-title');
const messageEl = document.getElementById('page-message');

const idEl = document.getElementById('article-id');
const titleEl = document.getElementById('title');
const slugEl = document.getElementById('slug');
const authorAddSelectEl = document.getElementById('author-add-select');
const addAuthorBtn = document.getElementById('add-author-btn');
const authorListEl = document.getElementById('author-list');
const publicationDateEl = document.getElementById('publication-date');
const sourceUrlEl = document.getElementById('source-url');
const categoryEl = document.getElementById('category');
const categoryLabelEl = document.getElementById('category-label');
const categoryDescriptionEl = document.getElementById('category-description');
const summaryHintEl = document.getElementById('summary-hint');
const contentHintEl = document.getElementById('content-hint');
const summaryEl = document.getElementById('summary');
const contentEl = document.getElementById('content');
const publishedEl = document.getElementById('article-published');

let attorneys = [];
let selectedAuthorIds = [];

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden', 'error', 'success');
  messageEl.classList.add(type);
}

function normalizeCategory(value) {
  if (value === 'alert') return 'insight';
  return CATEGORY_META[value] ? value : 'article';
}

function updateCategoryGuidance() {
  const meta = CATEGORY_META[normalizeCategory(categoryEl.value)];
  categoryLabelEl.textContent = meta.label;
  categoryDescriptionEl.textContent = meta.description;
  summaryHintEl.textContent = meta.summaryHint;
  contentHintEl.textContent = meta.contentHint;
}

function getAttorneyName(id) {
  const attorney = attorneys.find((item) => item.id === id);
  return attorney ? attorney.name : `Attorney #${id}`;
}

function renderAuthorList() {
  authorListEl.innerHTML = '';

  if (!selectedAuthorIds.length) {
    authorListEl.innerHTML = '<li class="author-chip-empty muted">No authors added yet.</li>';
    return;
  }

  selectedAuthorIds.forEach((id, index) => {
    const item = document.createElement('li');
    item.className = 'author-chip';
    item.innerHTML = `
      <span class="author-chip-name">${getAttorneyName(id)}</span>
      ${index === 0 ? '<span class="author-chip-badge">Primary</span>' : ''}
      <button type="button" class="author-chip-remove" data-id="${id}" aria-label="Remove ${getAttorneyName(id)}">×</button>
    `;
    authorListEl.appendChild(item);
  });

  authorListEl.querySelectorAll('.author-chip-remove').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number.parseInt(button.dataset.id, 10);
      selectedAuthorIds = selectedAuthorIds.filter((authorId) => authorId !== id);
      renderAuthorList();
    });
  });
}

function addSelectedAuthor() {
  const id = Number.parseInt(authorAddSelectEl.value, 10);
  if (Number.isNaN(id)) {
    showMessage('Select an attorney to add');
    return;
  }

  if (selectedAuthorIds.includes(id)) {
    showMessage('That attorney is already listed');
    return;
  }

  selectedAuthorIds.push(id);
  authorAddSelectEl.value = '';
  renderAuthorList();
}

function getPayload() {
  return {
    slug: slugEl.value.trim(),
    title: titleEl.value.trim(),
    summary: summaryEl.value.trim(),
    content: contentEl.value.trim(),
    author_ids: selectedAuthorIds,
    author_id: selectedAuthorIds[0] ?? null,
    publication_date: publicationDateEl.value || null,
    source_url: sourceUrlEl.value.trim(),
    category: normalizeCategory(categoryEl.value),
    is_published: publishedEl.checked ? 1 : 0,
  };
}

async function loadArticle(id) {
  const article = await getArticleById(id);
  idEl.value = article.id;
  titleEl.value = article.title || '';
  slugEl.value = article.slug || '';
  sourceUrlEl.value = article.source_url || '';
  categoryEl.value = normalizeCategory(article.category);
  summaryEl.value = article.summary || '';
  contentEl.value = article.content || '';
  publishedEl.checked = Boolean(article.is_published);
  selectedAuthorIds = Array.isArray(article.author_ids)
    ? [...article.author_ids]
    : article.author_id
      ? [article.author_id]
      : [];

  if (article.publication_date) {
    const date = new Date(article.publication_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    publicationDateEl.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  updateCategoryGuidance();
  renderAuthorList();
  formTitle.textContent = 'Edit Entry';
}

async function loadAttorneys() {
  try {
    attorneys = await getAttorneys();
    authorAddSelectEl.innerHTML = '<option value="">Select an attorney…</option>';
    attorneys.forEach((attorney) => {
      const option = document.createElement('option');
      option.value = attorney.id;
      option.textContent = attorney.name;
      authorAddSelectEl.appendChild(option);
    });
  } catch {
    showMessage('Failed to load attorneys');
  }
}

titleEl.addEventListener('change', () => {
  if (!slugEl.value) {
    slugEl.value = titleEl.value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  }
});

categoryEl.addEventListener('change', updateCategoryGuidance);
addAuthorBtn.addEventListener('click', addSelectedAuthor);

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
  updateCategoryGuidance();
  renderAuthorList();
  await loadAttorneys();

  const id = getIdFromQuery();
  if (!id) return;

  try {
    await loadArticle(id);
  } catch (error) {
    showMessage(error.message || 'Could not load article');
  }
})();
