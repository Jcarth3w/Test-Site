import { Link } from 'react-router-dom';
import '../styles/HomeShared.css';
import '../styles/AboutSection.css';

const AboutSection = ({ section }) => {
  return (
    <section className="home-about" aria-labelledby="home-about-heading">
      <div className="home-about-inner">
        <figure className="home-about-visual">
          <img src={section.image} alt="" />
          <span className="home-about-visual-glow" aria-hidden="true" />
        </figure>

        <div className="home-about-copy">
          <p className="home-eyebrow home-about-eyebrow">{section.eyebrow}</p>
          <h2 id="home-about-heading">{section.title}</h2>
          <p className="home-about-lead">{section.lead}</p>

          <ul className="home-about-stats">
            {section.stats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>

          <Link to={section.ctaLink} className="home-about-cta">
            {section.ctaLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
