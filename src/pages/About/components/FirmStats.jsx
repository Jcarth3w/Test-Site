import { useEffect, useMemo, useState } from 'react';
import { fetchPublicOffices } from '../../../services/officesApi';
import { fetchPublicAttorneys } from '../../../services/attorneysApi';
import { useCountUpStats, useInView } from '../../../hooks/useInView';
import { firmStats } from '../content/aboutContent';

function roundDownToNearestFive(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value / 5) * 5;
}

const FirmStats = () => {
  const [ref, isInView] = useInView();
  const [counts, setCounts] = useState({
    practiceCount: roundDownToNearestFive(firmStats.practiceAreaCount ?? 0),
    officeCount: 0,
    attorneyCount: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      let officeCount = 0;
      let attorneyCount = 0;

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
        setCounts({
          practiceCount: roundDownToNearestFive(firmStats.practiceAreaCount ?? 0),
          officeCount,
          attorneyCount: roundDownToNearestFive(attorneyCount),
        });
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
        value: animatedCounts.practiceCount,
        suffix: '+',
        label: 'Practice areas',
      },
      {
        value: animatedCounts.officeCount,
        label: 'Office locations',
      },
      {
        value: animatedCounts.attorneyCount,
        suffix: '+',
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
              <span className="firm-stat-value">
                {stat.value > 0 ? `${stat.value}${stat.suffix || ''}` : '—'}
              </span>
              <span className="firm-stat-label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FirmStats;
