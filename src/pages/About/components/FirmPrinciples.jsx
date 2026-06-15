import { useInView } from '../../../hooks/useInView';
import { firmPrinciples } from '../content/aboutContent';

const FirmPrinciples = () => {
  const [ref, isInView] = useInView();

  return (
    <section
      ref={ref}
      className={`firm-principles${isInView ? ' is-in-view' : ''}`}
      aria-labelledby="firm-principles-heading"
    >
      <div className="about-wide-inner firm-principles-inner">
        <header className="firm-principles-header about-reveal about-reveal--title">
          <h2 id="firm-principles-heading">{firmPrinciples.title}</h2>
          <p className="firm-principles-intro">{firmPrinciples.intro}</p>
        </header>

        <div className="firm-principles-body">
          {firmPrinciples.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 48)}
              className="firm-principle-item about-reveal about-reveal--body"
              style={{ '--about-reveal-delay': `${100 + index * 70}ms` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FirmPrinciples;
