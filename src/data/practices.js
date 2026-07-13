import { getPracticeContent } from './practiceContent.js';

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
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'construction-defect',
    title: 'Construction Defect',
    category: 'coverage',
    description: 'Coverage and defense counsel in complex construction defect matters.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'environmental',
    title: 'Environmental',
    category: 'coverage',
    description: 'Counsel in environmental claims and related coverage disputes.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'excess-liability',
    title: 'Excess Liability',
    category: 'coverage',
    description: 'Advising excess carriers on high-value liability disputes.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'first-party-property',
    title: 'First-Party Property',
    category: 'coverage',
    description: 'Coverage counsel for property losses, valuation, and causation issues.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'liability',
    title: 'Liability',
    category: 'coverage',
    description: 'Defense and coverage support across general liability matters.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'professional-liability',
    title: 'Professional Liability',
    category: 'coverage',
    description: 'Representation in claims against licensed professionals and firms.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'reinsurance',
    title: 'Reinsurance',
    category: 'coverage',
    description: 'Reinsurance dispute resolution and treaty interpretation support.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'toxic-torts',
    title: 'Toxic Torts',
    category: 'coverage',
    description: 'Defense of toxic exposure and mass tort allegations.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'marine',
    title: 'Marine',
    category: 'defense',
    description: 'Defense and risk counsel for maritime and marine-related claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'architects-engineers',
    title: 'Architects & Engineers',
    category: 'defense',
    description: 'Professional liability defense for design professionals.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'arson',
    title: 'Arson',
    category: 'defense',
    description: 'Litigation support in suspicious loss and intentional loss claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'casualty',
    title: 'Casualty',
    category: 'defense',
    description: 'Defense of casualty matters involving severe injury and losses.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'construction',
    title: 'Construction',
    category: 'defense',
    description: 'Litigation and dispute support for construction stakeholders.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'fire-explosion',
    title: 'Fire & Explosion',
    category: 'defense',
    description: 'Defense in catastrophic fire and explosion investigations and litigation.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'medical-malpractice',
    title: 'Medical Malpractice',
    category: 'defense',
    description: 'Defense of healthcare providers and institutions in malpractice claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'municipality',
    title: 'Municipality',
    category: 'defense',
    description: 'Defense counsel for public entities and municipal liability claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'personal-injury',
    title: 'Personal Injury',
    category: 'defense',
    description: 'Defense of personal injury claims from intake through trial.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'premises-liability',
    title: 'Premises Liability',
    category: 'defense',
    description: 'Defense of owner and occupier liability claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'products-liability',
    title: 'Products Liability',
    category: 'defense',
    description: 'Defense of manufacturers and distributors in product claims.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'transportation',
    title: 'Transportation',
    category: 'defense',
    description: 'Litigation support for motor carrier and transportation incidents.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'wildfires',
    title: 'Wildfires',
    category: 'defense',
    description: 'Counsel in wildfire-related liability and coverage litigation.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'subrogation',
    title: 'Subrogation',
    category: 'subrogation',
    description: 'Recovery actions to recoup paid losses and shift liability.',
    buttonText: 'Get Legal Support'
  },
  {
    slug: 'appeals-trials',
    title: 'Appeals & Trials',
    category: 'appeals-trials',
    description: 'Trial support and appellate representation in complex disputes.',
    buttonText: 'Get Legal Support'
  }
];

export default practices.map((practice) => ({
  ...practice,
  content: getPracticeContent(practice.slug),
}));
