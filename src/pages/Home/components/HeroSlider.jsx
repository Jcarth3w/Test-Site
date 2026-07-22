import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '../styles/HeroSlider.css';
import { homeContent } from '../content/homeContent';
import { shuffleHeroSlides } from '../utils/shuffleHeroSlides';

const TRANSITION_MS = 700;

const HeroSlider = () => {
  const slides = useMemo(
    () => shuffleHeroSlides(homeContent.heroImageSlides),
    []
  );
  const count = slides.length;

  // [last, ...slides, first] — clones at both ends for seamless looping
  const trackSlides = useMemo(() => {
    if (count === 0) return [];
    return [slides[count - 1], ...slides, slides[0]];
  }, [slides, count]);

  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const settlingRef = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  const realIndex =
    count === 0 ? 0 : index === 0 ? count - 1 : index === count + 1 ? 0 : index - 1;
  const activeSlide = slides[realIndex] ?? slides[0];

  const jumpTo = useCallback((nextIndex) => {
    settlingRef.current = true;
    setAnimate(false);
    setIndex(nextIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
        settlingRef.current = false;
      });
    });
  }, []);

  const settleIfNeeded = useCallback(() => {
    const current = indexRef.current;
    if (current === count + 1) {
      jumpTo(1);
    } else if (current === 0) {
      jumpTo(count);
    }
  }, [count, jumpTo]);

  const goToReal = useCallback(
    (target) => {
      if (count === 0 || settlingRef.current || target === realIndex) return;
      setAnimate(true);
      setIndex(target + 1);
    },
    [count, realIndex]
  );

  const nextSlide = useCallback(() => {
    if (count === 0 || settlingRef.current) return;
    if (indexRef.current >= count + 1) return;
    setAnimate(true);
    setIndex((prev) => prev + 1);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count === 0 || settlingRef.current) return;
    if (indexRef.current <= 0) return;
    setAnimate(true);
    setIndex((prev) => prev - 1);
  }, [count]);

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    settleIfNeeded();
  };

  // Fallback when transitionend doesn't fire (reduced motion, interrupted transition)
  useEffect(() => {
    if (count <= 1) return undefined;
    if (index !== count + 1 && index !== 0) return undefined;
    if (settlingRef.current) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(settleIfNeeded, reduced ? 0 : TRANSITION_MS + 50);
    return () => clearTimeout(timer);
  }, [index, count, settleIfNeeded]);

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = setInterval(() => {
      if (settlingRef.current) return;
      if (indexRef.current >= count + 1) return;
      setAnimate(true);
      setIndex((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <section className="hero-slider">
      <div
        className={`slides${animate ? ' is-animated' : ''}`}
        style={{
          width: `${trackSlides.length * 100}%`,
          transform: `translate3d(-${(index * 100) / trackSlides.length}%, 0, 0)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {trackSlides.map((slide, trackIndex) => (
          <div
            key={`${slide.image}-${trackIndex}`}
            className="slide hero-image-slide"
            style={{ width: `${100 / trackSlides.length}%` }}
          >
            <img
              src={slide.image}
              alt=""
              className="hero-slide-image"
              loading={trackIndex <= 1 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div className="hero-banner-content" key={realIndex}>
        {activeSlide?.eyebrow ? (
          <p className="hero-eyebrow">{activeSlide.eyebrow}</p>
        ) : null}
        <h1>{activeSlide?.tagline}</h1>
      </div>

      <button className="prev" onClick={prevSlide} type="button" aria-label="Previous slide">❮</button>
      <button className="next" onClick={nextSlide} type="button" aria-label="Next slide">❯</button>
      <div className="indicators">
        {slides.map((slide, slideIndex) => (
          <span
            key={slide.image}
            className={slideIndex === realIndex ? 'active' : ''}
            onClick={() => goToReal(slideIndex)}
            role="button"
            tabIndex={0}
            aria-label={`Go to ${slide.eyebrow || 'slide'} ${slideIndex + 1}`}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goToReal(slideIndex);
              }
            }}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
