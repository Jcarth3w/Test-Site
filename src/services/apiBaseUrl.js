function trimTrailingSlash(value = '') {
  return String(value).replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '');
  if (configured) return configured;

  // Keep local development convenient when env vars are not set.
  if (import.meta.env.DEV) return 'http://localhost:5000';

  // In production, default to same-origin so reverse proxy setups also work.
  return '';
}
