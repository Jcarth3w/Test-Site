import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPracticeAreas, fetchPracticeCategories } from '../../services/practicesApi';
import {
  practiceCategorySlugAliases,
} from '../../data/practiceCategorySections';
import { getPracticeCategoryImage } from '../../content/siteImages';
import { getPracticeLinkPathForLabel } from './utils/practiceAttorneyMatching';
import './styles/PracticeDetail.css';
import './styles/PracticeCategoryDetail.css';

const PracticeCategoryDetail = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [practiceCatalog, setPracticeCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categories, practices] = await Promise.all([
          fetchPracticeCategories(),
          fetchPracticeAreas().catch(() => []),
        ]);
        const resolvedSlug = practiceCategorySlugAliases[slug] || slug;
        const match = categories.find((item) => item.slug === resolvedSlug) || null;
        setCategory(match);
        setPracticeCatalog(practices);
      } catch {
        setCategory(null);
        setErrorMessage('Unable to load this practice category right now.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="practice-category-detail-page">
        <div className="container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="practice-category-detail-page">
        <div className="container">
          <h1>Category Not Found</h1>
          <p>{errorMessage || 'The requested practice category could not be found.'}</p>
          <Link to="/practice" className="btn btn-primary">
            View All Practice Areas
          </Link>
        </div>
      </div>
    );
  }

  const categoryImage = getPracticeCategoryImage(category.slug);
  const practices = category.practices || [];
  const overviewParagraphs = Array.isArray(category.description)
    ? category.description
    : category.description
      ? [category.description]
      : [];

  return (
    <div className="practice-category-detail-page">
      <section className="practice-category-intro">
        <div className="container">
          <Link to="/practice" className="practice-category-back" aria-label="Back to practice areas">
            ← Back to Practice Areas
          </Link>

          <div className="practice-category-intro-grid">
            <div className="practice-category-intro-copy">
              <p className="practice-category-kicker">Practice Category</p>
              <h1>{category.title}</h1>

              {overviewParagraphs.length > 0 ? (
                <div className="practice-category-overview">
                  {overviewParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </div>

            {categoryImage ? (
              <figure className="practice-category-figure">
                <img src={categoryImage} alt="" />
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <section className="practice-category-content">
        <div className="container">
          <div className="practice-category-practices">
            <h2>Related practice areas</h2>
            {practices.length === 0 ? (
              <p className="practice-category-empty">No practices are currently listed in this category.</p>
            ) : (
              <ul className="practice-category-tag-grid" aria-label="Practice areas in this category">
                {practices.map((practice) => (
                  <li key={practice}>
                    <Link
                      to={getPracticeLinkPathForLabel(practice, practiceCatalog)}
                      className="practice-category-tag"
                    >
                      {practice}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PracticeCategoryDetail;
