import { Link } from 'react-router-dom';
import { aboutHeroImage } from '../content/aboutContent';

const AboutBanner = () => {
  const hasHeroImage = Boolean(aboutHeroImage?.src);

  return (
    <section className="about-banner">
      <div className="about-banner-inner">
        <div className="about-banner-visual">
          {hasHeroImage ? (
            <img
              src={aboutHeroImage.src}
              alt={aboutHeroImage.alt || ''}
              className="about-banner-photo"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="about-banner-visual-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="about-banner-copy">
          <h1>Fire & Explosion Counsel - Nationwide</h1>
          <p>
            In 2013, John McCoy, Laurence Leavitt, and Brook Laskey combined their talents and over 30 years of experience
            to form McCoy Leavitt Laskey LLC, focused on serving the insurance industry with high-quality legal work and an
            innovative approach to complex coverage matters. Over the past 13 years the firm has expanded significantly in
            reach and capability.
          </p>
          <p>
            Today, our practice is anchored in matters related to{' '}
            <strong>fire and explosion litigation</strong>—where we bring deep technical and trial experience—but we also
            handle a broad range of defense and coverage work beyond those cases. We represent clients in{' '}
            <strong>all 50 states</strong>, with offices strategically placed across the country and the resources to
            support matters wherever they arise.
          </p>
          <div className="about-banner-actions">
            <Link to="/practice" className="btn btn-primary">
              Practice areas
            </Link>
            <Link to="/offices" className="btn btn-primary">
              Locations
            </Link>
            <Link to="/attorneys" className="btn btn-primary">
              Find an attorney
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBanner;
