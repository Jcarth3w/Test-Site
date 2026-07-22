function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

/**
 * Keeps the lead slide (fire & explosion) first, then shuffles
 * the remaining practice-area slides for variety on each load.
 */
export function shuffleHeroSlides(slides) {
  if (!slides.length) return [];
  if (slides.length === 1) return [...slides];

  const [leadSlide, ...restSlides] = slides;
  return [leadSlide, ...shuffleArray(restSlides)];
}
