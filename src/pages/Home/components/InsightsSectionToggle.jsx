import '../styles/InsightsSectionToggle.css';

const STORAGE_KEY = 'mll-home-insights-enabled';

export function getStoredInsightsEnabled(defaultEnabled) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    /* ignore */
  }
  return defaultEnabled;
}

export function setStoredInsightsEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* ignore */
  }
}

const InsightsSectionToggle = ({ enabled, onChange }) => {
  return (
    <div className="insights-dev-toggle" role="group" aria-label="Insights section visibility">
      <span className="insights-dev-toggle-label">Insights section (dev)</span>
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

export default InsightsSectionToggle;
