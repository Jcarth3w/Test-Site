-- Brief descriptions and content for individual practice area pages

UPDATE practices SET
  description = 'Defense and risk counsel for maritime claims involving vessels, cargo, and waterfront operations.',
  content = 'We represent insurers, vessel owners, and marine contractors in admiralty and maritime disputes. Our team handles personal injury, cargo loss, and collision claims with an understanding of federal admiralty law and industry practice.'
WHERE slug = 'admiralty-marine';

UPDATE practices SET
  description = 'Counsel for insurers facing first-party and third-party bad faith allegations.',
  content = 'We defend carriers in disputes over claim handling, settlement conduct, and policy obligations. Our attorneys build defensible records early and pursue resolutions aligned with client objectives.'
WHERE slug = 'bad-faith';

UPDATE practices SET
  description = 'Litigation support for motor carriers and commercial trucking incidents.',
  content = 'We represent trucking companies, fleets, and their insurers in serious injury and property damage claims. Our team provides rapid response, coordinated discovery, and trial-ready defense strategy.'
WHERE slug = 'trucking-accidents';

UPDATE practices SET
  description = 'Defense and coverage counsel in complex construction defect matters.',
  content = 'We advise carriers, contractors, and owners in disputes involving design flaws, workmanship claims, and multi-party allocation. Our attorneys manage technical experts and develop practical case strategies.'
WHERE slug = 'construction-defect';

UPDATE practices SET
  description = 'Counsel in environmental claims, contamination disputes, and related coverage issues.',
  content = 'We address contamination claims, legacy liabilities, and regulatory-adjacent litigation. Our team helps clients evaluate exposure, preserve defenses, and navigate high-stakes environmental disputes.'
WHERE slug = 'environmental';

UPDATE practices SET
  description = 'Advising excess carriers on attachment, exhaustion, and high-value liability disputes.',
  content = 'We represent excess insurers in matters involving policy attachment, exhaustion, and allocation among carriers. Our attorneys provide strategic guidance from pre-suit assessment through trial and appeal.'
WHERE slug = 'excess-liability';

UPDATE practices SET
  description = 'Trial-ready defense in catastrophic fire and explosion investigations and litigation.',
  content = 'Fire and explosion claims demand a highly technical and methodical approach to uncovering the true origin and cause of the incident. Our firm represents manufacturers, property owners, contractors, and insurers in complex matters involving catastrophic loss, working alongside fire investigators, engineers, and forensic experts to challenge assumptions and evaluate liability.'
WHERE slug = 'fire-explostion';

UPDATE practices SET
  description = 'Coverage counsel for property losses, valuation disputes, and causation issues.',
  content = 'We handle first-party property matters involving catastrophic losses, business interruption, and disputed scope of damage. Our team coordinates technical experts and develops clear, evidence-driven positions.'
WHERE slug = 'first-party-property';

UPDATE practices SET
  description = 'Defense and coverage support across general liability claims.',
  content = 'Our general liability practice covers personal injury, property damage, and complex multi-party claims. We provide practical, trial-ready representation focused on risk control and efficient outcomes.'
WHERE slug = 'general-liability';

UPDATE practices SET
  description = 'Comprehensive defense counsel for insurers and self-insured clients.',
  content = 'We represent carriers and insureds across a wide range of civil litigation matters. Our attorneys combine early case assessment with disciplined discovery and clear evaluation strategy.'
WHERE slug = 'insurance-defence';

UPDATE practices SET
  description = 'Recovery actions to recoup paid losses and shift liability to responsible parties.',
  content = 'We pursue subrogation claims through pre-suit recovery efforts and litigation. Our attorneys coordinate technical investigations and damages analysis to maximize recovery for carriers and self-insured clients.'
WHERE slug = 'subro';

UPDATE practices SET
  description = 'Defense of toxic exposure and aggregated mass tort allegations.',
  content = 'We defend mass tort claims involving alleged exposure, causation, and medical damages. Our team develops coordinated expert strategy in individual and multi-plaintiff litigation.'
WHERE slug = 'mass-torts';

UPDATE practices SET
  description = 'Defense of personal injury claims from intake through trial.',
  content = 'Our personal injury defense practice addresses catastrophic and routine claims with disciplined discovery and expert support. We pursue results aligned with client risk tolerance and exposure goals.'
WHERE slug = 'personal-injury';

UPDATE practices SET
  description = 'Strategic defense for manufacturers, distributors, and retailers in product claims.',
  content = 'Product liability claims require a precise and strategic response grounded in both legal and technical analysis. Our firm focuses on protecting manufacturers, distributors, and retailers by thoroughly investigating allegations of design defects, manufacturing flaws, and failure-to-warn claims. We work closely with industry experts to challenge causation, evaluate compliance with applicable standards, and identify misuse or alteration of the product.'
WHERE slug = 'product-liability';

UPDATE practices SET
  description = 'Representation in claims against licensed professionals and their firms.',
  content = 'We defend professional liability claims involving standards of care, causation, and damages. Our attorneys work closely with industry experts to present persuasive defenses.'
WHERE slug = 'prof-liability';

UPDATE practices SET
  description = 'Reinsurance dispute resolution and treaty interpretation counsel.',
  content = 'Our reinsurance team assists cedents and reinsurers with notice, allocation, aggregation, and treaty interpretation issues. We focus on protecting claim position while preserving commercial relationships.'
WHERE slug = 'reinsurance';

UPDATE practices SET
  description = 'Litigation support for transportation, fleet, and logistics incidents.',
  content = 'Our transportation practice handles claims involving commercial vehicles, fleet operations, and logistics-related losses. We provide rapid response and coordinated defense from investigation through trial.'
WHERE slug = 'transportation';

UPDATE practices SET
  description = 'Defense counsel in wrongful death and survivorship claims.',
  content = 'We represent insurers and insureds in high-exposure wrongful death matters requiring careful damages analysis and sympathetic jury presentation. Our team focuses on early evaluation, expert coordination, and strategic resolution.'
WHERE slug = 'wrongful-death';
