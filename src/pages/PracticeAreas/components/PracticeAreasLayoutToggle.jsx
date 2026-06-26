import '../../Home/styles/InsightsSectionToggle.css';

const STORAGE_KEY = 'mll-practice-areas-category-layout';

export function getStoredCategoryLayoutEnabled(defaultEnabled = false) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    /* ignore */
  }
  return defaultEnabled;
}

export function setStoredCategoryLayoutEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* ignore */
  }
}

const PracticeAreasLayoutToggle = ({ enabled, onChange }) => {
  return (
    <div className="insights-dev-toggle" role="group" aria-label="Practice areas layout">
      <span className="insights-dev-toggle-label">Category layout (dev)</span>
      <button
        type="button"
        className={`insights-dev-toggle-btn ${enabled ? 'is-on' : 'is-off'}`}
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
      >
        <span className="insights-dev-toggle-track" aria-hidden="true">
          <span className="insights-dev-toggle-thumb" />
        </span>
        <span className="insights-dev-toggle-text">{enabled ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
};

export default PracticeAreasLayoutToggle;
