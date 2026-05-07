import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function fetchPublicOffices() {
  const response = await fetch(`${API_BASE_URL}/api/public/offices`);
  if (!response.ok) {
    throw new Error('Failed to fetch offices');
  }
  return response.json();
}

export async function fetchPublicOfficeBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/api/public/offices/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch office');
  }
  return response.json();
}
