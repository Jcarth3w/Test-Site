import { useState, useEffect, useMemo } from 'react';
import '../styles/HeroSlider.css';
import { homeContent } from '../content/homeContent';
import { shuffleHeroSlides } from '../utils/shuffleHeroSlides';

const HeroSlider = () => {
  const slides = useMemo(
    () => shuffleHeroSlides(homeContent.heroImageSlides),
    []
  );
  const [current, setCurrent] = useState(0);
  const activeSlide = slides[current] ?? slides[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero-slider">
      <div className="slides">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`slide hero-image-slide ${index === current ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              alt=""
              className="hero-slide-image"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div className="hero-banner-content" key={current}>
        {activeSlide?.eyebrow ? (
          <p className="hero-eyebrow">{activeSlide.eyebrow}</p>
        ) : null}
        <h1>{activeSlide?.tagline}</h1>
      </div>

      <button className="prev" onClick={prevSlide} type="button" aria-label="Previous slide">❮</button>
      <button className="next" onClick={nextSlide} type="button" aria-label="Next slide">❯</button>
      <div className="indicators">
        {slides.map((slide, index) => (
          <span
            key={slide.image}
            className={index === current ? 'active' : ''}
            onClick={() => setCurrent(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to ${slide.eyebrow || 'slide'} ${index + 1}`}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setCurrent(index);
              }
            }}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
