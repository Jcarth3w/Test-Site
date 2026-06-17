import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function fetchPublicArticles(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(`${API_BASE_URL}/api/public/articles${query}`);
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
