import HeroSlider from './components/HeroSlider';
import CaseResults from './components/CaseResults';
import { Link } from 'react-router-dom';
import './styles/HomeShowcase.css';
import { homeContent } from './content/homeContent';

const Home = () => {
  return (
    <div className="App">
      <HeroSlider />
      <section className="home-proof-strip">
        <div className="container">
          <div className="proof-grid">
            {homeContent.proofItems.map((item) => (
              <div key={item.value} className="proof-item">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-practice-showcase">
        <div className="container">
          <div className="practice-showcase-layout">
            <div className="home-section-head align-left">
              <p className="home-eyebrow">{homeContent.practiceSection.eyebrow}</p>
              <h2>{homeContent.practiceSection.title}</h2>
              <p>{homeContent.practiceSection.intro}</p>
            </div>
            <div className="photo-stack" aria-hidden="true">
              <div
                className="photo-card photo-card-main"
                style={{ '--practice-main-image': `url("${homeContent.images.practiceMain}")` }}
              />
              <div
                className="photo-card photo-card-secondary"
                style={{ '--practice-secondary-image': `url("${homeContent.images.practiceSecondary}")` }}
              />
            </div>
          </div>
          <div className="practice-highlight-grid">
            {homeContent.practiceSection.cards.map((item) => (
              <article key={item.title} className="practice-highlight-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <div className="home-section-cta">
            <Link to={homeContent.practiceSection.ctaLink} className="home-pill-link">{homeContent.practiceSection.ctaLabel}</Link>
          </div>
        </div>
      </section>

      <CaseResults />

      <section className="home-process">
        <div className="container">
          <div className="home-section-head align-left">
            <p className="home-eyebrow">{homeContent.processSection.eyebrow}</p>
            <h2>{homeContent.processSection.title}</h2>
          </div>
          <div className="process-layout">
            <div className="process-grid">
              {homeContent.processSection.steps.map((step) => (
                <article key={step.step} className="process-card">
                  <p className="process-step">{step.step}</p>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
            <div
              className="process-side-photo"
              aria-hidden="true"
              style={{ '--process-side-image': `url("${homeContent.images.processSide}")` }}
            />
          </div>
        </div>
      </section>

      <section className="home-testimonials">
        <div className="container">
          <div className="home-section-head align-left">
            <p className="home-eyebrow">{homeContent.testimonialsSection.eyebrow}</p>
            <h2>{homeContent.testimonialsSection.title}</h2>
          </div>
          <div className="testimonial-layout">
            <div
              className="testimonial-photo"
              aria-hidden="true"
              style={{ '--testimonials-image': `url("${homeContent.images.testimonials}")` }}
            />
            <div className="testimonial-grid">
              {homeContent.testimonialsSection.quotes.map((item) => (
                <blockquote key={item.byline} className="testimonial-card">
                  <p>{item.quote}</p>
                  <cite>{item.byline}</cite>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="container">
          <h2>{homeContent.finalCta.title}</h2>
          <p>{homeContent.finalCta.body}</p>
          <div className="final-cta-actions">
            <Link to={homeContent.finalCta.primaryLink} className="home-btn-primary">{homeContent.finalCta.primaryLabel}</Link>
            <Link to={homeContent.finalCta.secondaryLink} className="home-btn-secondary">{homeContent.finalCta.secondaryLabel}</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 MLL Law. All rights reserved.</p>
          <p>Contact us for free case evaluation.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
