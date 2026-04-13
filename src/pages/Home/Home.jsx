import HeroSlider from './components/HeroSlider';
import CaseResults from './components/CaseResults';
import ProofStrip from './components/ProofStrip';
import ScrollStorySections from './components/ScrollStorySections';
import ProcessSection from './components/ProcessSection';
import TestimonialsSection from './components/TestimonialsSection';
import FinalCtaSection from './components/FinalCtaSection';
import { homeContent } from './content/homeContent';

const Home = () => {
  return (
    <div className="App">
      <HeroSlider />
      <ProofStrip items={homeContent.proofItems} />
      <ScrollStorySections sections={homeContent.heroScrollSections} />

      <CaseResults />
      <ProcessSection section={homeContent.processSection} sideImage={homeContent.images.processSide} />
      <TestimonialsSection section={homeContent.testimonialsSection} image={homeContent.images.testimonials} />
      <FinalCtaSection cta={homeContent.finalCta} />

      <footer className="footer">
        <div className="container">
          <p>© 2012 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
