import { useId, useState } from 'react';

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

const Chevron = () => (
  <svg className="value-card-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VALUE_ITEMS = [
  {
    id: 'trial',
    title: 'Experienced Trial Team',
    body: 'Our attorneys have successfully litigated complex defense matters nationwide.',
    Icon: IconTrial,
  },
  {
    id: 'strategy',
    title: 'Strategic Defense',
    body: 'We prioritize managing liability and develop effective strategies to protect our clients.',
    Icon: IconStrategy,
  },
  {
    id: 'communication',
    title: 'Transparent Communication',
    body: 'Clients receive clear updates, strategic guidance, and dedicated support at every step.',
    Icon: IconCommunication,
  },
];

const FirmValues = () => {
  const baseId = useId();
  const [open, setOpen] = useState(() => new Set());

  const toggle = (key) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
          {VALUE_ITEMS.map(({ id, title, body, Icon }) => {
            const panelId = `${baseId}-${id}-panel`;
            const isExpanded = open.has(id);

            return (
              <article key={id} className="value-card value-card--collapsible">
                <h3 className="value-card-heading">
                  <button
                    type="button"
                    className="value-card-trigger"
                    id={`${baseId}-${id}-trigger`}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => toggle(id)}
                  >
                    <span className="value-card-trigger-main">
                      <span className="value-card-icon-wrap" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="value-card-title-text">{title}</span>
                    </span>
                    <span className={`value-card-chevron-wrap${isExpanded ? ' is-open' : ''}`}>
                      <Chevron />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={`${baseId}-${id}-trigger`}
                  aria-hidden={!isExpanded}
                  className={`value-card-panel${isExpanded ? ' value-card-panel--open' : ''}`}
                >
                  <div className="value-card-panel-sizer">
                    <div className="value-card-panel-inner">
                      <p className="value-card-body">{body}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FirmValues;
