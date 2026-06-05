import { useSyncExternalStore } from 'react';
import '../styles/HomeShared.css';
import '../styles/TestimonialsSection.css';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(callback) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const TestimonialsSection = ({ section, image }) => {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const quotes = section.quotes;
  const durationSeconds = Math.max(28, quotes.length * 9);

  return (
    <section
      className="home-testimonials"
      style={{ '--testimonial-bg-image': `url("${image}")` }}
    >
      <div className="home-testimonials-overlay" aria-hidden="true" />
      <div className="container">
        <div className="home-section-head align-left">
          <p className="home-eyebrow">{section.eyebrow}</p>
          <h2>{section.title}</h2>
        </div>
        {prefersReducedMotion ? (
          <div className="testimonial-grid">
            {quotes.map((item, index) => (
              <blockquote
                key={`${item.byline}-${index}`}
                className="testimonial-card"
              >
                <p>{item.quote}</p>
                <cite>{item.byline}</cite>
              </blockquote>
            ))}
          </div>
        ) : (
          <div
            className="testimonial-marquee"
            role="region"
            aria-roledescription="carousel"
            aria-label="Client testimonials, auto-scrolling. Hover to pause."
            style={{ '--testimonial-marquee-duration': `${durationSeconds}s` }}
          >
            <div className="testimonial-marquee-viewport">
              <div className="testimonial-marquee-track">
                {quotes.map((item, index) => (
                  <blockquote
                    key={`a-${index}`}
                    className="testimonial-card testimonial-marquee-card"
                  >
                    <p>{item.quote}</p>
                    <cite>{item.byline}</cite>
                  </blockquote>
                ))}
                {quotes.map((item, index) => (
                  <blockquote
                    key={`b-${index}`}
                    className="testimonial-card testimonial-marquee-card"
                    aria-hidden="true"
                  >
                    <p>{item.quote}</p>
                    <cite>{item.byline}</cite>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
