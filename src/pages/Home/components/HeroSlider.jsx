import { useState, useEffect } from 'react';
import '../styles/HeroSlider.css';
import { homeContent } from '../content/homeContent';

const HeroSlider = () => {
  const slides = homeContent.heroSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero-slider">
      <div className="slides" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className={`slide ${slide.theme}`}>
            <div className="slide-content">
              <p className="hero-eyebrow">{slide.eyebrow}</p>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <div className="hero-actions">
                <a href={slide.ctaLink} className="hero-btn hero-btn-primary">{slide.ctaLabel}</a>
                <a href={homeContent.heroSecondaryCta.link} className="hero-btn hero-btn-secondary">{homeContent.heroSecondaryCta.label}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="prev" onClick={prevSlide}>❮</button>
      <button className="next" onClick={nextSlide}>❯</button>
      <div className="indicators">
        {slides.map((_, index) => (
          <span
            key={index}
            className={index === current ? 'active' : ''}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;