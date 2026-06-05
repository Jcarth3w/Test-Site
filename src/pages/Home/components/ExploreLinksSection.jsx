import { Link } from 'react-router-dom';
import '../styles/ExploreLinksSection.css';

const ExploreLinksSection = ({ links }) => {
  return (
    <section className="home-explore-links" aria-label="Explore the firm">
      <div className="container">
        <div className="explore-links-grid">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="explore-link-card">
              <span className="explore-link-label">{link.label}</span>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
              <span className="explore-link-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreLinksSection;
