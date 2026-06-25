const AttorneyDetailBody = ({
  bio,
  caseWork = [],
  practiceAreas = [],
  education = [],
  barAdmissions = [],
  awards = [],
  affiliations = [],
  showExtendedProfile = true,
}) => {
  const hasBio = Boolean(bio);
  const hasCaseWork = showExtendedProfile && caseWork.length > 0;
  const hasMain = hasBio || hasCaseWork;

  const hasPracticeAreas = showExtendedProfile && practiceAreas.length > 0;
  const hasEducation = education.length > 0;
  const hasBar = barAdmissions.length > 0;
  const hasAwards = awards.length > 0;
  const hasAffiliations = affiliations.length > 0;
  const hasSidebar =
    hasPracticeAreas || hasEducation || hasBar || hasAwards || hasAffiliations;

  if (!hasMain && !hasSidebar) return null;

  const bodyClass = [
    'attorney-detail-body',
    !hasSidebar && 'attorney-detail-body--single',
    !hasMain && hasSidebar && 'attorney-detail-body--sidebar-only',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={bodyClass}>
      {hasMain && (
        <div className="attorney-detail-main">
          {hasBio && (
            <section className="attorney-detail-panel" aria-labelledby="attorney-bio-heading">
              <h2 id="attorney-bio-heading" className="attorney-detail-panel-title">Biography</h2>
              <p className="attorney-detail-bio">{bio}</p>
            </section>
          )}

          {hasCaseWork && (
            <section className="attorney-detail-panel" aria-labelledby="attorney-case-work-heading">
              <h2 id="attorney-case-work-heading" className="attorney-detail-panel-title">
                Notable Case Work
              </h2>
              <ul className="attorney-detail-plain-list attorney-case-work-list">
                {caseWork.map((item, idx) => (
                  <li key={idx} className="attorney-case-work-item">
                    <p className="attorney-case-work-title">{item.title}</p>
                    {item.description && (
                      <p className="attorney-case-work-description">{item.description}</p>
                    )}
                    {item.year && <p className="attorney-case-work-year">{item.year}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {hasSidebar && (
        <aside className="attorney-detail-sidebar">
          {hasPracticeAreas && (
            <section className="attorney-detail-panel" aria-labelledby="attorney-practice-heading">
              <h2 id="attorney-practice-heading" className="attorney-detail-panel-title">
                Practice Areas
              </h2>
              <ul className="attorney-detail-plain-list attorney-practice-list">
                {practiceAreas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </section>
          )}

          {(hasEducation || hasBar || hasAwards) && (
            <section className="attorney-detail-panel" aria-labelledby="attorney-credentials-heading">
              <h2 id="attorney-credentials-heading" className="attorney-detail-panel-title">
                Credentials
              </h2>

              {hasEducation && (
                <div className="attorney-detail-subpanel">
                  <h3 className="attorney-detail-subtitle">Education</h3>
                  <ul className="attorney-detail-plain-list">
                    {education.map((item, idx) => (
                      <li key={idx}>
                        {[item.school, item.year].filter(Boolean).join(' — ')}
                        {item.degree ? ` — ${item.degree}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasBar && (
                <div className="attorney-detail-subpanel">
                  <h3 className="attorney-detail-subtitle">Bar Admissions</h3>
                  <ul className="attorney-detail-plain-list">
                    {barAdmissions.map((admission, idx) => (
                      <li key={idx}>
                        {admission.state}
                        {admission.year ? ` — ${admission.year}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasAwards && (
                <div className="attorney-detail-subpanel">
                  <h3 className="attorney-detail-subtitle">Awards</h3>
                  <ul className="attorney-detail-plain-list">
                    {awards.map((item, idx) => (
                      <li key={idx}>
                        {item.title}
                        {item.description ? ` — ${item.description}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {hasAffiliations && (
            <section className="attorney-detail-panel" aria-labelledby="attorney-affiliations-heading">
              <h2 id="attorney-affiliations-heading" className="attorney-detail-panel-title">
                Affiliations
              </h2>
              <ul className="attorney-detail-plain-list">
                {affiliations.map((item, idx) => (
                  <li key={idx}>
                    {item.title}
                    {item.description ? ` — ${item.description}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      )}
    </div>
  );
};

export default AttorneyDetailBody;
