import { Link } from 'react-router-dom';
import '../styles/HomeShared.css';
import '../styles/ScrollStorySections.css';

const ScrollStorySections = ({ sections }) => {
  return (
    <section className="home-scroll-sections">
      {sections.map((item) => (
        <article key={item.id} id={item.id} className="scroll-story scroll-story--editorial">
          <div className="scroll-story-copy">
            <p className="home-eyebrow">{item.eyebrow}</p>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
            <Link to={item.ctaLink} className="home-pill-link">{item.ctaLabel}</Link>
          </div>
          <figure className="scroll-story-visual">
            <img src={item.image} alt="" />
          </figure>
        </article>
      ))}
    </section>
  );
};

export default ScrollStorySections;
