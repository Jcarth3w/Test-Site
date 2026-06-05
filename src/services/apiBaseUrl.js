function trimTrailingSlash(value = '') {
  return String(value).replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '');
  if (configured) return configured;

  // Keep local development convenient when env vars are not set.
  if (import.meta.env.DEV) return 'http://localhost:5001';

  // In production, default to same-origin so reverse proxy setups also work.
  return '';
}

/**
 * Resolve a stored photo/image URL for the browser. Relative `/uploads/...` paths
 * are prefixed with the API base. Absolute `http://localhost:.../uploads/...` (or
 * another host) is rewritten to the current API base so production builds are not
 * stuck pointing at a dev server from CMS data.
 */
export function resolveMediaUrl(raw = '') {
  const s = String(raw || '').trim();
  if (!s) return '';

  const base = trimTrailingSlash(getApiBaseUrl());

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      const pathWithQuery = `${u.pathname}${u.search}`;
      const isUpload = pathWithQuery === '/uploads' || pathWithQuery.startsWith('/uploads/');
      if (!isUpload) return s;

      const host = u.hostname.toLowerCase();
      const isDevHost =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '[::1]' ||
        host.endsWith('.localhost');

      let baseOrigin = '';
      if (base) {
        baseOrigin = new URL(base).origin;
      }

      if (base) {
        if (isDevHost || u.origin !== baseOrigin) {
          return `${base}${pathWithQuery}`;
        }
        return s;
      }

      if (isDevHost) return pathWithQuery;
      return s;
    } catch {
      return s;
    }
  }

  if (base) {
    return `${base}${s.startsWith('/') ? '' : '/'}${s}`;
  }
  return s.startsWith('/') ? s : `/${s}`;
}
