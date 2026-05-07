import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function fetchPublicArticles() {
  const response = await fetch(`${API_BASE_URL}/api/public/articles`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

export async function fetchPublicArticleBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/api/public/articles/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

export async function fetchPublicArticlesByAuthor(authorId) {
  const response = await fetch(`${API_BASE_URL}/api/public/articles?author_id=${authorId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}
