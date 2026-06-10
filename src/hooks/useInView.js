import { useEffect, useRef, useState } from 'react';

export function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: '0px 0px -8% 0px', ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}

function useCountUp(target, active, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || !Number.isFinite(target)) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }

    let frameId = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, active, duration]);

  return value;
}

export function useCountUpStats(stats, active) {
  const practiceCount = useCountUp(stats.practiceCount, active);
  const officeCount = useCountUp(stats.officeCount, active);
  const yearsExperience = useCountUp(stats.yearsExperience, active);

  return { practiceCount, officeCount, yearsExperience };
}
