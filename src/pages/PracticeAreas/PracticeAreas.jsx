import { practiceAreasContent } from './content/practiceAreasContent';
import PracticeAreasHero from './components/PracticeAreasHero';
import PracticeCategoryGrid from './components/PracticeCategoryGrid';
import './styles/PracticeAreas.css';

const PracticeAreas = () => {
  return (
    <div className="practice-areas-page practice-areas-page--blocks">
      <section
        className="practice-areas-hero-band"
        style={{ '--practice-hero-image': `url("${practiceAreasContent.heroBackgroundImage}")` }}
        aria-labelledby="practice-areas-heading"
      >
        <div className="practice-areas-hero-texture" aria-hidden="true" />
        <div className="container">
          <PracticeAreasHero />
        </div>
      </section>

      <section className="practice-areas-main practice-areas-main--blocks">
        <div className="container">
          <PracticeCategoryGrid />
        </div>
      </section>
    </div>
  );
};

export default PracticeAreas;
