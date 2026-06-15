import { useEffect, useMemo, useState } from 'react';
import { fetchPracticeAreas } from '../../../services/practicesApi';
import { fetchPublicOffices } from '../../../services/officesApi';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { useCountUpStats, useInView } from '../../../hooks/useInView';
import { firmStats } from '../content/aboutContent';

const FirmStats = () => {
  const [ref, isInView] = useInView();
  const [counts, setCounts] = useState({
    practiceCount: 0,
    officeCount: 0,
    attorneyCount: 0,
    yearsExperience: new Date().getFullYear() - firmStats.foundedYear,
  });

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      const yearsExperience = new Date().getFullYear() - firmStats.foundedYear;
      let practiceCount = 0;
      let officeCount = 0;
      let attorneyCount = 0;

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

      try {
        const attorneys = await fetchPublicAttorneys();
        attorneyCount = attorneys.length;
      } catch {
        attorneyCount = 0;
      }

      if (!cancelled) {
        setCounts({ practiceCount, officeCount, attorneyCount, yearsExperience });
      }
    };

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const animatedCounts = useCountUpStats(counts, isInView);

  const stats = useMemo(
    () => [
      {
        value: animatedCounts.yearsExperience,
        label: 'Years of firm history',
      },
      {
        value: animatedCounts.practiceCount,
        label: 'Practice areas',
      },
      {
        value: animatedCounts.officeCount,
        label: 'Office locations',
      },
      {
        value: animatedCounts.attorneyCount,
        label: 'Attorneys',
      },
      ...firmStats.staticStats.map((stat) => ({
        value: stat.value,
        label: stat.label,
      })),
    ],
    [animatedCounts]
  );

  return (
    <section
      ref={ref}
      className={`firm-stats${isInView ? ' is-in-view' : ''}`}
      aria-label="Firm highlights"
    >
      <div className="firm-stats-pattern" aria-hidden="true" />
      <div className="about-wide-inner firm-stats-inner">
        <ul className="firm-stats-grid">
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className="firm-stat about-reveal about-reveal--card"
              style={{ '--about-reveal-delay': `${index * 70}ms` }}
            >
              <span className="firm-stat-value">{stat.value > 0 ? stat.value : '—'}</span>
              <span className="firm-stat-label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FirmStats;
