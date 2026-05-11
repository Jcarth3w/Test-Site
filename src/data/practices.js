export const practiceCategorySections = [
  {
    slug: 'coverage',
    title: 'Coverage',
    subtitle: 'First-Party Property & Third-Party Liability',
    description: 'Policy interpretation, indemnity disputes, and complex coverage litigation.'
  },
  {
    slug: 'defense',
    title: 'Defense',
    subtitle: 'Trial-ready counsel across catastrophic and complex claims',
    description: 'Strategic defense from investigation through trial in high-exposure matters.'
  },
  {
    slug: 'subrogation',
    title: 'Subrogation',
    subtitle: 'Recovery actions for carriers and self-insured entities',
    description: 'Efficient recovery strategy, liability analysis, and coordinated litigation.'
  },
  {
    slug: 'appeals-trials',
    title: 'Appeals & Trials',
    subtitle: 'Appellate advocacy and courtroom execution',
    description: 'Preservation of key issues, appellate briefing, and trial support.'
  }
];

const practices = [
  {
    slug: 'bad-faith',
    title: 'Bad Faith',
    category: 'coverage',
    description: 'Representation in first-party and third-party bad faith litigation.',
    content: 'Our attorneys handle bad faith disputes involving claim handling, settlement conduct, and policy obligations. We build defensible records early and pursue efficient resolutions aligned with our clients\' business goals.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'construction-defect',
    title: 'Construction Defect',
    category: 'coverage',
    description: 'Coverage and defense counsel in complex construction defect matters.',
    content: 'We advise carriers, contractors, and owners in construction defect disputes involving multi-party claims, allocation issues, and long-tail exposure. Our team manages technical experts and drives practical case strategy.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'environmental',
    title: 'Environmental',
    category: 'coverage',
    description: 'Counsel in environmental claims and related coverage disputes.',
    content: 'Our environmental practice addresses contamination claims, legacy liabilities, and regulatory-adjacent litigation. We help clients evaluate risk, preserve defenses, and navigate high-stakes exposure.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'excess-liability',
    title: 'Excess Liability',
    category: 'coverage',
    description: 'Advising excess carriers on high-value liability disputes.',
    content: 'We represent excess insurers in complex matters involving attachment, exhaustion, and allocation disputes. Our attorneys provide strategic guidance from pre-suit assessment through trial and appeal.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'first-party-property',
    title: 'First-Party Property',
    category: 'coverage',
    description: 'Coverage counsel for property losses, valuation, and causation issues.',
    content: 'We handle first-party property matters involving catastrophic losses, business interruption, and disputed scope of damage. Our team coordinates technical experts and develops clear, evidence-driven positions.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'liability',
    title: 'Liability',
    category: 'coverage',
    description: 'Defense and coverage support across general liability matters.',
    content: 'Our liability practice covers personal injury, property damage, and complex multi-party claims. We provide practical, trial-ready representation focused on risk control and efficient outcomes.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'professional-liability',
    title: 'Professional Liability',
    category: 'coverage',
    description: 'Representation in claims against licensed professionals and firms.',
    content: 'We defend professional liability claims involving technical standards, causation, and damages. Our attorneys work closely with industry experts to present persuasive defenses.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'reinsurance',
    title: 'Reinsurance',
    category: 'coverage',
    description: 'Reinsurance dispute resolution and treaty interpretation support.',
    content: 'Our reinsurance team assists cedents and reinsurers with notice, allocation, aggregation, and treaty interpretation issues. We focus on preserving commercial relationships while protecting claim position.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'toxic-torts',
    title: 'Toxic Torts',
    category: 'coverage',
    description: 'Defense of toxic exposure and mass tort allegations.',
    content: 'We defend toxic tort claims involving alleged exposure, causation, and medical damages. Our team develops coordinated expert strategy in individual and aggregate litigation.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'admiralty-marine',
    title: 'Admiralty & Marine',
    category: 'defense',
    description: 'Defense and risk counsel for maritime and marine-related claims.',
    content: 'We represent clients in admiralty and marine matters including vessel incidents, cargo disputes, and maritime personal injury claims. Our practice combines industry fluency with litigation depth.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'architects-engineers',
    title: 'Architects & Engineers',
    category: 'defense',
    description: 'Professional liability defense for design professionals.',
    content: 'We defend architects and engineers in claims involving design standards, project coordination, and alleged delay or cost impacts. Our counsel is informed by both technical and legal analysis.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'arson',
    title: 'Arson',
    category: 'defense',
    description: 'Litigation support in suspicious loss and intentional loss claims.',
    content: 'Our attorneys handle arson-related disputes requiring detailed origin and cause investigation, SIU coordination, and evidentiary development. We protect claim position from first notice through trial.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'casualty',
    title: 'Casualty',
    category: 'defense',
    description: 'Defense of casualty matters involving severe injury and losses.',
    content: 'We represent insurers and insureds in casualty claims across commercial and personal contexts. Our team focuses on early case assessment, exposure management, and strategic resolution.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'construction',
    title: 'Construction',
    category: 'defense',
    description: 'Litigation and dispute support for construction stakeholders.',
    content: 'We advise and defend owners, contractors, and insurers in construction disputes involving injury, delay, contract interpretation, and project risk. We tailor strategy to project realities and jurisdictional standards.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'fire-explosion',
    title: 'Fire & Explosion',
    category: 'defense',
    description: 'Defense in catastrophic fire and explosion investigations and litigation.',
    content: 'Our practice handles high-severity fire and explosion cases with urgent scene response, expert coordination, and rigorous causation analysis. We provide trial-ready representation from day one.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'medical-malpractice',
    title: 'Medical Malpractice',
    category: 'defense',
    description: 'Defense of healthcare providers and institutions in malpractice claims.',
    content: 'We defend physicians, hospitals, and allied professionals against malpractice allegations. Our attorneys partner with medical experts to challenge standard-of-care and causation claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'municipality',
    title: 'Municipality',
    category: 'defense',
    description: 'Defense counsel for public entities and municipal liability claims.',
    content: 'We represent municipalities and public agencies in litigation involving premises, operations, and public service claims. Our team navigates statutory defenses and complex procedural requirements.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'personal-injury',
    title: 'Personal Injury',
    category: 'defense',
    description: 'Defense of personal injury claims from intake through trial.',
    content: 'Our personal injury defense practice addresses catastrophic and routine claims with disciplined discovery, expert support, and clear evaluation strategy. We pursue results aligned with client risk tolerance.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'premises-liability',
    title: 'Premises Liability',
    category: 'defense',
    description: 'Defense of owner and occupier liability claims.',
    content: 'We defend premises liability cases involving alleged dangerous conditions, negligent security, and maintenance disputes. Our attorneys focus on practical fact development and dispositive motion strategy.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'products-liability',
    title: 'Products Liability',
    category: 'defense',
    description: 'Defense of manufacturers and distributors in product claims.',
    content: 'We represent product manufacturers, suppliers, and retailers in defect, warning, and design claims. Our team leverages engineering and industry experts to contest causation and damages.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'transportation',
    title: 'Transportation',
    category: 'defense',
    description: 'Litigation support for motor carrier and transportation incidents.',
    content: 'Our transportation practice handles trucking, fleet, and logistics litigation involving serious injury and property damage. We provide rapid response and coordinated defense strategy.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'wildfires',
    title: 'Wildfires',
    category: 'defense',
    description: 'Counsel in wildfire-related liability and coverage litigation.',
    content: 'We advise clients in wildfire matters involving mass claims, complex causation, and high-exposure damages. Our team builds scalable defense frameworks for coordinated case management.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'subrogation',
    title: 'Subrogation',
    category: 'subrogation',
    description: 'Recovery actions to recoup paid losses and shift liability.',
    content: 'We pursue subrogation claims through pre-suit recovery efforts and litigation. Our attorneys coordinate technical investigations and damages analysis to maximize recovery.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'appeals-trials',
    title: 'Appeals & Trials',
    category: 'appeals-trials',
    description: 'Trial support and appellate representation in complex disputes.',
    content: 'Our lawyers provide trial and appellate advocacy with an emphasis on preserving issues, building persuasive records, and advancing durable outcomes.',
    buttonText: 'Get Legal Support'
  }
];

export default practices;
