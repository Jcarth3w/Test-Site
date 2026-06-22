import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function fetchPublicArticles(category) {
  const params = new URLSearchParams();
  if (category) {
    params.set('category', category);
  }
  const query = params.toString();
  const url = `${API_BASE_URL}/api/public/articles${query ? `?${query}` : ''}`;
  const response = await fetch(url);
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
