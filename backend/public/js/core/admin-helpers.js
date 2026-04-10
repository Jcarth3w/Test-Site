import { clearToken, getToken } from './auth.js';

export function requireAuth(redirect = '/admin') {
  if (!getToken()) {
    window.location.href = redirect;
    return false;
  }
  return true;
}

export function bindLogout(buttonId = 'logout-btn') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener('click', () => {
    clearToken();
    window.location.href = '/admin';
  });
}

export function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

export function toSlug(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getLastName(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : '';
}

export function getLastNameInitial(name = '') {
  const last = getLastName(name);
  return last ? last[0].toUpperCase() : '#';
}
