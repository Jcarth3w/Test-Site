const IconTrial = () => (
  <svg className="value-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const IconStrategy = () => (
  <svg className="value-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconCommunication = () => (
  <svg className="value-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const FirmValues = () => {
  return (
    <section className="firm-values" aria-labelledby="firm-values-heading">
      <div className="firm-values-inner">
        <header className="firm-values-header">
          <h2 id="firm-values-heading">Why Choose Us?</h2>
          <p className="firm-values-intro">
            Depth, discipline, and clarity—so you know where your matter stands and where it is headed.
          </p>
        </header>
        <div className="value-grid">
          <article className="value-card">
            <div className="value-card-icon-wrap" aria-hidden="true">
              <IconTrial />
            </div>
            <h3>Experienced Trial Team</h3>
            <p>Our attorneys have successfully litigated complex defense matters nationwide.</p>
          </article>
          <article className="value-card">
            <div className="value-card-icon-wrap" aria-hidden="true">
              <IconStrategy />
            </div>
            <h3>Strategic Defense</h3>
            <p>We prioritize managing liability and develop effective strategies to protect our clients.</p>
          </article>
          <article className="value-card">
            <div className="value-card-icon-wrap" aria-hidden="true">
              <IconCommunication />
            </div>
            <h3>Transparent Communication</h3>
            <p>Clients receive clear updates, strategic guidance, and dedicated support at every step.</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default FirmValues;
