import { Link } from 'react-router-dom';
import '../styles/HomeShared.css';
import '../styles/ScrollStorySections.css';

const ScrollStorySections = ({ sections }) => {
  return (
    <section className="home-scroll-sections">
      <div className="container">
        {sections.map((item, index) => (
          <article
            key={item.id}
            id={item.id}
            className={`scroll-story ${index % 2 === 1 ? 'reverse' : ''}`}
          >
            <div className="scroll-story-copy">
              <p className="home-eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <Link to={item.ctaLink} className="home-pill-link">{item.ctaLabel}</Link>
            </div>
            <div
              className="scroll-story-image"
              aria-hidden="true"
              style={{ '--scroll-story-image': `url("${item.image}")` }}
            />
          </article>
        ))}
      </div>
    </section>
  );
};

export default ScrollStorySections;
