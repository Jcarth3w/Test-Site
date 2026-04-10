import { getAuthHeader } from './auth.js';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || 'Request failed';
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function login(username, password) {
  return request('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

export function getAttorneys() {
  return request('/api/attorneys', {
    headers: { ...getAuthHeader() }
  });
}

export function getAttorneyById(id) {
  return request(`/api/attorneys/${id}`, {
    headers: { ...getAuthHeader() }
  });
}

export function createAttorney(payload) {
  return request('/api/attorneys', {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateAttorney(id, payload) {
  return request(`/api/attorneys/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function setAttorneyStatus(id, isActive) {
  return request(`/api/attorneys/${id}/status`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ is_active: isActive })
  });
}

export function removeAttorney(id) {
  return request(`/api/attorneys/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
}

export function getPractices() {
  return request('/api/practices', {
    headers: { ...getAuthHeader() }
  });
}

export function getPracticeById(id) {
  return request(`/api/practices/${id}`, {
    headers: { ...getAuthHeader() }
  });
}

export function createPractice(payload) {
  return request('/api/practices', {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updatePractice(id, payload) {
  return request(`/api/practices/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function setPracticeStatus(id, isActive) {
  return request(`/api/practices/${id}/status`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ is_active: isActive })
  });
}

export function removePractice(id) {
  return request(`/api/practices/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
}

export function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);

  return request('/api/upload', {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData
  });
}
