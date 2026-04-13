import '../styles/HomeShared.css';
import '../styles/ProcessSection.css';

const ProcessSection = ({ section, sideImage }) => {
  return (
    <section className="home-process">
      <div className="container">
        <div className="home-section-head align-left">
          <p className="home-eyebrow">{section.eyebrow}</p>
          <h2>{section.title}</h2>
        </div>
        <div className="process-layout">
          <div className="process-grid">
            {section.steps.map((step) => (
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
            style={{ '--process-side-image': `url("${sideImage}")` }}
          />
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
