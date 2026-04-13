import fallbackPractices from '../data/practices';
import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

function normalizePractice(item) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    image: item.image_url || item.image,
    content: item.content,
    buttonText: item.button_text || item.buttonText || 'Free Case Review',
    isActive: item.is_active ?? 1
  };
}

async function safeFetch(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export async function fetchPracticeAreas() {
  try {
    const items = await safeFetch('/api/public/practices');
    return items.map(normalizePractice);
  } catch (error) {
    return fallbackPractices.map(normalizePractice);
  }
}

export async function fetchPracticeBySlug(slug) {
  try {
    const item = await safeFetch(`/api/public/practices/${slug}`);
    return normalizePractice(item);
  } catch (error) {
    return fallbackPractices.map(normalizePractice).find((p) => p.slug === slug) || null;
  }
}
