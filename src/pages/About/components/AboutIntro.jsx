import { useInView } from '../../../hooks/useInView';
import { aboutIntro } from '../content/aboutContent';

const AboutIntro = () => {
  const [ref, isInView] = useInView();

  return (
    <header
      ref={ref}
      className={`about-intro${isInView ? ' is-in-view' : ''}`}
      aria-labelledby="about-intro-heading"
    >
      <figure className="about-intro-visual about-reveal about-reveal--image">
        <img src={aboutIntro.image} alt={aboutIntro.imageAlt} loading="eager" decoding="async" />
        <span className="about-intro-scrim" aria-hidden="true" />
      </figure>

      <div className="about-wide-inner about-intro-inner">
        <div className="about-intro-copy">
          <p className="about-intro-eyebrow about-reveal about-reveal--eyebrow">{aboutIntro.eyebrow}</p>
          <h1 id="about-intro-heading" className="about-reveal about-reveal--title">{aboutIntro.title}</h1>
          <div className="about-title-rule about-reveal about-reveal--rule" aria-hidden="true" />
          <p className="about-intro-description about-reveal about-reveal--body">{aboutIntro.description}</p>
        </div>
      </div>
    </header>
  );
};

export default AboutIntro;
