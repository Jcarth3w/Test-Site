import { Link } from 'react-router-dom';

const AboutBanner = () => {
  return (
    <section className="about-banner">
      <div className="container">
        <h1>Trusted Counsel for Fire, Explosion, and Complex Claims</h1>
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
        <p className="about-banner-links">
          <Link to="/practice" className="about-inline-link">
            Explore our practice areas
          </Link>
          <span className="about-banner-links-sep" aria-hidden="true">
            ·
          </span>
          <Link to="/offices" className="about-inline-link">
            View our locations
          </Link>
        </p>
        <Link to="/attorneys" className="btn btn-primary">
          Find an attorney
        </Link>
      </div>
    </section>
  );
};

export default AboutBanner;
