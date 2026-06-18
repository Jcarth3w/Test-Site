import fallbackPractices from '../data/practices';
import { getPracticeAreaImage } from '../content/siteImages';
import { getApiBaseUrl, resolveMediaUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

function resolvePracticeImageUrl(value, slug) {
  const imageUrl = String(value || '').trim();
  if (!imageUrl) return getPracticeAreaImage(slug);
  const resolved = resolveMediaUrl(imageUrl);
  return resolved || getPracticeAreaImage(slug);
}

function normalizePractice(item) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    image: resolvePracticeImageUrl(item.image_url || item.image, item.slug),
    content: item.content,
    category: item.category || '',
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
