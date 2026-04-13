import '../styles/HomeShared.css';
import '../styles/TestimonialsSection.css';

const TestimonialsSection = ({ section, image }) => {
  return (
    <section className="home-testimonials">
      <div className="container">
        <div className="home-section-head align-left">
          <p className="home-eyebrow">{section.eyebrow}</p>
          <h2>{section.title}</h2>
        </div>
        <div className="testimonial-layout">
          <div
            className="testimonial-photo"
            aria-hidden="true"
            style={{ '--testimonials-image': `url("${image}")` }}
          />
          <div className="testimonial-grid">
            {section.quotes.map((item) => (
              <blockquote key={item.byline} className="testimonial-card">
                <p>{item.quote}</p>
                <cite>{item.byline}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
