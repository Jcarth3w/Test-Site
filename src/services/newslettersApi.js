import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function fetchPublicNewsletters() {
  const response = await fetch(`${API_BASE_URL}/api/public/newsletters`);
  if (!response.ok) {
    throw new Error('Failed to fetch newsletters');
  }
  return response.json();
}
