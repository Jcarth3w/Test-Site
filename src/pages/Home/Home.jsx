import HeroSlider from './components/HeroSlider';
import HomePracticeAreasSection from './components/HomePracticeAreasSection';
import AboutSection from './components/AboutSection';
import InsightsSection from './components/InsightsSection';
import TestimonialsSection from './components/TestimonialsSection';
import FinalCtaSection from './components/FinalCtaSection';
import { homeContent } from './content/homeContent';

const Home = () => {
  return (
    <div className="App">
      <HeroSlider />
      <HomePracticeAreasSection section={homeContent.practiceAreasSection} />
      <AboutSection section={homeContent.aboutSection} />
      <InsightsSection section={homeContent.insightsSection} />
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
