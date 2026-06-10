import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPracticeAreas } from '../../../services/practicesApi';
import { fetchPublicOffices } from '../../../services/officesApi';
import { useCountUpStats, useInView } from '../../../hooks/useInView';
import '../styles/HomeShared.css';
import '../styles/AboutSection.css';

const AboutSection = ({ section }) => {
  const [ref, isInView] = useInView();
  const [counts, setCounts] = useState({
    practiceCount: 0,
    officeCount: 0,
    yearsExperience: new Date().getFullYear() - section.foundedYear,
  });

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      const yearsExperience = new Date().getFullYear() - section.foundedYear;
      let practiceCount = 0;
      let officeCount = 0;

      try {
        const practices = await fetchPracticeAreas();
        practiceCount = practices.length;
      } catch {
        practiceCount = 0;
      }

      try {
        const offices = await fetchPublicOffices();
        officeCount = offices.length;
      } catch {
        officeCount = 0;
      }

      if (!cancelled) {
        setCounts({ practiceCount, officeCount, yearsExperience });
      }
    };

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [section.foundedYear]);

  const animatedCounts = useCountUpStats(counts, isInView);

  const highlights = useMemo(
    () => [
      {
        value: animatedCounts.yearsExperience,
        label: 'Years of Experience',
        link: '/about',
        cta: 'Our story',
      },
      {
        value: animatedCounts.practiceCount,
        label: 'Practice Areas',
        link: '/practice',
        cta: 'View practice areas',
      },
      {
        value: animatedCounts.officeCount,
        label: 'Office Locations',
        link: '/offices',
        cta: 'View locations',
      },
    ],
    [animatedCounts]
  );

  return (
    <section
      ref={ref}
      className={`home-about ${isInView ? 'is-in-view' : ''}`}
      aria-labelledby="home-about-heading"
    >
      <div className="home-about-pattern" aria-hidden="true" />
      <div className="home-about-inner">
        <figure className="home-about-visual home-about-animate home-about-animate--image">
          <img src={section.image} alt="" />
          <span className="home-about-visual-frame" aria-hidden="true" />
          <span className="home-about-visual-glow" aria-hidden="true" />
        </figure>

        <div className="home-about-copy">
          <p className="home-eyebrow home-about-eyebrow home-about-animate home-about-animate--eyebrow">
            {section.eyebrow}
          </p>
          <h2 id="home-about-heading" className="home-about-animate home-about-animate--title">
            {section.title}
          </h2>
          <div className="home-about-title-rule home-about-animate home-about-animate--rule" aria-hidden="true" />

          <ul className="home-about-stats">
            {highlights.map((stat, index) => (
              <li
                key={stat.label}
                className="home-about-animate home-about-animate--stat"
                style={{ '--about-stat-delay': `${index * 90}ms` }}
              >
                <Link to={stat.link} className="home-about-stat-link">
                  <strong>{stat.value > 0 ? stat.value : '—'}</strong>
                  <span className="home-about-stat-label">{stat.label}</span>
                  <span className="home-about-stat-cta">
                    {stat.cta}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
