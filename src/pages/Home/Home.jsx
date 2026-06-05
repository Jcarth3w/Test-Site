import { useState } from 'react';
import HeroSlider from './components/HeroSlider';
import InsightsSection from './components/InsightsSection';
import InsightsSectionToggle, {
  getStoredInsightsEnabled,
  setStoredInsightsEnabled,
} from './components/InsightsSectionToggle';
import ScrollStorySections from './components/ScrollStorySections';
import AboutSection from './components/AboutSection';
import ExploreLinksSection from './components/ExploreLinksSection';
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
      {insightsConfig.showDevToggle ? (
        <InsightsSectionToggle enabled={insightsEnabled} onChange={handleInsightsToggle} />
      ) : null}
      {insightsEnabled ? <InsightsSection section={insightsConfig} /> : null}
      <ScrollStorySections sections={homeContent.heroScrollSections} />
      <AboutSection section={homeContent.aboutSection} />
      <ExploreLinksSection links={homeContent.exploreLinks} />
      <TestimonialsSection section={homeContent.testimonialsSection} image={homeContent.images.testimonials} />
      <FinalCtaSection cta={homeContent.finalCta} />

      <footer className="footer">
        <div className="container">
          <p>© 2013 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
