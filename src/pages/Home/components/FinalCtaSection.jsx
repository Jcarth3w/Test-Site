import { Link } from 'react-router-dom';
import '../styles/FinalCtaSection.css';

const FinalCtaSection = ({ cta }) => {
  return (
    <section className="home-final-cta">
      <div className="container">
        <h2>{cta.title}</h2>
        <p>{cta.body}</p>
        <div className="final-cta-actions">
          <Link to={cta.primaryLink} className="home-btn-primary">{cta.primaryLabel}</Link>
          <Link to={cta.secondaryLink} className="home-btn-secondary">{cta.secondaryLabel}</Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
