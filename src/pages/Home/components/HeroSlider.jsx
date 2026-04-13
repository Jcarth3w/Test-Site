import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroSlider.css';
import { homeContent } from '../content/homeContent';

const HeroSlider = () => {
  const slides = homeContent.heroImageSlides;
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
      <div className="slides">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide hero-image-slide ${index === current ? 'active' : ''}`}
            style={{ '--hero-slide-image': `url("${slide.image}")` }}
          >
            <p className="hero-image-caption">{slide.caption}</p>
          </div>
        ))}
      </div>

      <div className="hero-banner-content">
        <p className="hero-eyebrow">{homeContent.heroBanner.eyebrow}</p>
        <h1>{homeContent.heroBanner.tagline}</h1>
        <div className="hero-actions">
          <Link to={homeContent.heroBanner.primaryCtaLink} className="hero-btn hero-btn-primary">{homeContent.heroBanner.primaryCtaLabel}</Link>
          <Link to={homeContent.heroBanner.secondaryCtaLink} className="hero-btn hero-btn-secondary">{homeContent.heroBanner.secondaryCtaLabel}</Link>
        </div>
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