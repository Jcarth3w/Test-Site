import { useEffect, useState } from 'react';
import { fetchPracticeAreas } from '../../services/practicesApi';
import { practiceAreasContent } from './content/practiceAreasContent';
import PracticeAreasHero from './components/PracticeAreasHero';
import PracticeAreasGrid from './components/PracticeAreasGrid';
import PracticeCategoryGrid from './components/PracticeCategoryGrid';
import PracticeAreasLayoutToggle, {
  getStoredCategoryLayoutEnabled,
  setStoredCategoryLayoutEnabled,
} from './components/PracticeAreasLayoutToggle';
import './styles/PracticeAreas.css';

const PracticeAreas = () => {
  const layoutConfig = practiceAreasContent.layoutToggle;
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryLayoutEnabled, setCategoryLayoutEnabled] = useState(() =>
    getStoredCategoryLayoutEnabled(layoutConfig.categoryLayoutByDefault === true)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPracticeAreas();
        setPractices(data);
      } catch {
        setErrorMessage('Unable to load practice areas right now. Please try again shortly.');
        setPractices([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLayoutToggle = (next) => {
    setCategoryLayoutEnabled(next);
    setStoredCategoryLayoutEnabled(next);
  };

  return (
    <div className={`practice-areas-page${categoryLayoutEnabled ? ' practice-areas-page--blocks' : ''}`}>
      {layoutConfig.showDevToggle ? (
        <PracticeAreasLayoutToggle enabled={categoryLayoutEnabled} onChange={handleLayoutToggle} />
      ) : null}

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

      <section
        className={`practice-areas-main${categoryLayoutEnabled ? ' practice-areas-main--blocks' : ''}`}
      >
        <div className="container">
          {categoryLayoutEnabled ? (
            <PracticeCategoryGrid />
          ) : (
            <PracticeAreasGrid loading={loading} errorMessage={errorMessage} practices={practices} />
          )}
        </div>
      </section>
    </div>
  );
};

export default PracticeAreas;
