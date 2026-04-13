import fallbackPractices from '../data/practices';
import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();
const PRACTICE_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80';

function resolvePracticeImageUrl(value) {
  const imageUrl = String(value || '').trim();
  if (!imageUrl) return PRACTICE_PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  if (API_BASE_URL) {
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

function normalizePractice(item) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    image: resolvePracticeImageUrl(item.image_url || item.image),
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
    if (import.meta.env.DEV) {
      return fallbackPractices.map(normalizePractice);
    }
    throw error;
  }
}

export async function fetchPracticeBySlug(slug) {
  try {
    const item = await safeFetch(`/api/public/practices/${slug}`);
    return normalizePractice(item);
  } catch (error) {
    if (import.meta.env.DEV) {
      return fallbackPractices.map(normalizePractice).find((p) => p.slug === slug) || null;
    }
    throw error;
  }
}
