import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function fetchPublicAttorneys() {
  const response = await fetch(`${API_BASE_URL}/api/public/attorneys`);
  if (!response.ok) {
    throw new Error('Failed to fetch attorneys');
  }
  return response.json();
}
