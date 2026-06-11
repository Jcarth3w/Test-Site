import { useState } from 'react';
import HeroSlider from './components/HeroSlider';
import HomePracticeAreasSection from './components/HomePracticeAreasSection';
import AboutSection from './components/AboutSection';
import InsightsSection from './components/InsightsSection';
import InsightsSectionToggle, {
  getStoredInsightsEnabled,
  setStoredInsightsEnabled,
} from './components/InsightsSectionToggle';
import TestimonialsSection from './components/TestimonialsSection';
import FinalCtaSection from './components/FinalCtaSection';
import { homeContent } from './content/homeContent';

const Home = () => {
  const insightsConfig = homeContent.insightsSection;
  const [insightsEnabled, setInsightsEnabled] = useState(() =>
    getStoredInsightsEnabled(insightsConfig.enabledByDefault !== false)
  );

  const handleInsightsToggle = (next) => {
    setInsightsEnabled(next);
    setStoredInsightsEnabled(next);
  };

  return (
    <div className="App">
      <HeroSlider />
      <HomePracticeAreasSection section={homeContent.practiceAreasSection} />
      <AboutSection section={homeContent.aboutSection} />
      {insightsConfig.showDevToggle ? (
        <InsightsSectionToggle enabled={insightsEnabled} onChange={handleInsightsToggle} />
      ) : null}
      {insightsEnabled ? <InsightsSection section={insightsConfig} /> : null}
      {homeContent.testimonialsSection.enabled ? (
        <TestimonialsSection
          section={homeContent.testimonialsSection}
          image={homeContent.images.testimonials}
        />
      ) : null}
      <FinalCtaSection cta={homeContent.finalCta} />
    </div>
  );
};

export default Home;
