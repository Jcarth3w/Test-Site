function normalizePracticeText(text = '') {
  return String(text).replace(/\\n/g, '\n').trim();
}

function splitIntoSentences(text = '') {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
  if (!sentences?.length) return [text.trim()].filter(Boolean);
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}

function splitLongTextIntoParagraphs(text = '') {
  const sentences = splitIntoSentences(text);
  if (sentences.length < 2) return [text.trim()].filter(Boolean);

  const midpoint = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, midpoint).join(' '),
    sentences.slice(midpoint).join(' '),
  ];
}

export function getPracticeParagraphs(text = '') {
  const normalized = normalizePracticeText(text);
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) return paragraphs;

  if (paragraphs.length === 1) {
    return splitLongTextIntoParagraphs(paragraphs[0]);
  }

  return [];
}
