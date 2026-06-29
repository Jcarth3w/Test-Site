function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function hasConsecutiveFire(slides) {
  if (slides.length < 2) return false;

  for (let index = 0; index < slides.length; index += 1) {
    const current = slides[index];
    const next = slides[(index + 1) % slides.length];
    if (current.isFire && next.isFire) return true;
  }

  return false;
}

function buildInterleavedOrder(fireSlides, nonFireSlides) {
  const fire = shuffleArray(fireSlides);
  const nonFire = shuffleArray(nonFireSlides);
  const ordered = [];
  let fireIndex = 0;
  let nonFireIndex = 0;

  while (fireIndex < fire.length || nonFireIndex < nonFire.length) {
    const lastSlide = ordered[ordered.length - 1];
    const mustPickNonFire = Boolean(lastSlide?.isFire);
    const canPickFire = fireIndex < fire.length;
    const canPickNonFire = nonFireIndex < nonFire.length;

    if (mustPickNonFire && canPickNonFire) {
      ordered.push(nonFire[nonFireIndex]);
      nonFireIndex += 1;
      continue;
    }

    if (!mustPickNonFire && canPickFire && (fire.length - fireIndex >= nonFire.length - nonFireIndex || !canPickNonFire)) {
      ordered.push(fire[fireIndex]);
      fireIndex += 1;
      continue;
    }

    if (canPickNonFire) {
      ordered.push(nonFire[nonFireIndex]);
      nonFireIndex += 1;
      continue;
    }

    if (canPickFire) {
      ordered.push(fire[fireIndex]);
      fireIndex += 1;
    }
  }

  return ordered;
}

export function shuffleHeroSlides(slides) {
  const fireSlides = slides.filter((slide) => slide.isFire);
  const nonFireSlides = slides.filter((slide) => !slide.isFire);

  if (fireSlides.length === 0 || nonFireSlides.length === 0) {
    return shuffleArray(slides);
  }

  let bestOrder = buildInterleavedOrder(fireSlides, nonFireSlides);
  let bestScore = hasConsecutiveFire(bestOrder) ? Number.POSITIVE_INFINITY : 0;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = buildInterleavedOrder(fireSlides, nonFireSlides);
    const consecutivePairs = candidate.reduce((count, slide, index) => {
      const next = candidate[(index + 1) % candidate.length];
      return count + (slide.isFire && next.isFire ? 1 : 0);
    }, 0);

    if (consecutivePairs < bestScore) {
      bestOrder = candidate;
      bestScore = consecutivePairs;
    }

    if (bestScore === 0) break;
  }

  return bestOrder;
}
