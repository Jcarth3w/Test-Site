const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function fetchPublicAttorneys() {
  const response = await fetch(`${API_BASE_URL}/api/public/attorneys`);
  if (!response.ok) {
    throw new Error('Failed to fetch attorneys');
  }
  return response.json();
}
