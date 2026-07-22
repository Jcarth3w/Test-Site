import { homeImages } from '../../../content/siteImages';

export const homeContent = {
  // Lead slide stays first. Remaining slides rotate image + tagline together by practice area.
  heroImageSlides: [
    {
      image: homeImages.catastrophicFireFirm4,
      eyebrow: 'Fire & Explosion',
      tagline: "The Nation's Premier Catastrophic Fire and Explosion Law Firm",
    },
    {
      image: homeImages.truckingCrash,
      eyebrow: 'Trucking & Transportation',
      tagline: 'Nationwide Trucking Defense When Every Mile Matters',
    },
    {
      image: homeImages.hoverboardFire,
      eyebrow: 'Product Liability',
      tagline: 'Product Failure Defense Built on Causation Expertise',
    },
    {
      image: homeImages.boatFire,
      eyebrow: 'Marine',
      tagline: 'Marine and Vessel Loss Response From Dock to Trial',
    },
    {
      image: homeImages.constructionDef,
      eyebrow: 'Construction Defect',
      tagline: 'Construction Defect Defense for Complex Property Claims',
    },
    {
      image: homeImages.crushedVehicle,
      eyebrow: 'Casualty',
      tagline: 'Casualty Defense for High-Exposure Liability Claims',
    },
  ],

  insightsSection: {
    eyebrow: 'Insights & News',
    title: 'Perspectives on Defense Strategy and Complex Claims',
    lead:
      'Thought leadership on fire and explosion defense, claims response, and the issues that matter to insurers and corporate clients.',
    viewAllLabel: 'View all insights',
    viewAllLink: '/articles',
    emptyNote:
      'New articles and firm perspectives are in development. Check back soon or contact us to discuss a topic with our team.',
    showcaseImages: [
      {
        src: homeImages.constructionDefect,
        alt: 'Lithum Ion Battery failure',
        description: 'Faulty lithum ion battery investigation.',
      },
      {
        src: homeImages.mllSiteInspection,
        alt: 'Site inspection at a catastrophic loss',
        description: 'Attorneys and experts on site at a catastrophic explosion loss.',
      },
      {
        src: homeImages.liftAx,
        alt: 'Construction Lift Crash',
        description: 'Mechanical lift crash at construction site.',
      },
      {
        src: homeImages.sbWildFire,
        alt: 'Southern California wildfire loss',
        description: 'Southern California wildfire scene with widespread property damage.',
      },
    ],
    placeholders: [
      {
        topic: 'Fire & Explosion',
        title: 'Early Response Priorities After a Catastrophic Fire or Explosion',
        description:
          'What insurers and risk teams should coordinate in the first hours to preserve evidence and shape the defense.',
      },
      {
        topic: 'Investigation & Evidence',
        title: 'Building a Trial-Ready Posture in High-Exposure Claims',
        description:
          'How disciplined discovery, expert alignment, and motion practice reduce uncertainty before resolution.',
      },
      {
        topic: 'Industry',
        title: 'Defense Trends Shaping Complex Casualty and Property Programs',
        description:
          'Practical takeaways for claims leaders managing multi-jurisdictional and technically intensive matters.',
      },
    ],
  },

  // Spotlight practices with in-depth CMS pages (heavy hitters).
  practiceAreasSection: {
    title: 'Practice Areas',
    viewAllLabel: 'View all practice areas',
    viewAllLink: '/practice',
    featuredCount: 6,
    featuredSlugs: [
      'fire-explostion',
      'insurance-defence',
      'product-liability',
      'transportation',
      'construction-defect',
      'marine',
    ],
  },

  aboutSection: {
    eyebrow: 'Who We Are',
    title: 'Experienced Counsel, Nationwide Reach',
    practiceAreaCount: 33,
    image: homeImages.laurenceHLeavitt,
    imageAlt: 'Attorney on site at a loss scene',
  },

  images: {
    testimonials: homeImages.wildfire,
  },

  resultsSection: {
    title: 'Defense Outcomes',
    subtitle:
      'Sample outcomes for design preview only. Final case summaries can be approved and swapped in later.',
    cards: [
      { amount: '$28.6M', description: 'Defense verdict in refinery explosion case with complex causation issues.' },
      { amount: '$14.2M', description: 'Settlement favorable to insured in multi-family apartment fire claim.' },
      { amount: '$9.8M', description: 'Favorable resolution in trucking matter defending against injury claims.' },
      { amount: '$7.4M', description: 'Product liability defense with favorable settlement for manufacturer.' },
      { amount: '$5.1M', description: 'Premises liability defense negotiating reduced settlement exposure.' },
    ]
  },

  testimonialsSection: {
    enabled: false,
    eyebrow: 'Client Feedback',
    title: 'What Our Clients Say About Us',
    quotes: [
      {
        quote:
          '"Responsive from day one. The team coordinated experts and kept our exposure focused while we stayed operational."',
        byline: 'Risk Director — Manufacturing'
      },
      {
        quote:
          '"Clear strategy, disciplined discovery, and trial-ready posture. We always knew where the case stood and why."',
        byline: 'General Counsel — Energy'
      },
      {
        quote:
          '"They understood the technical issues as well as the legal ones and translated both for our board with confidence."',
        byline: 'Claims Lead — Transportation'
      },
      {
        quote:
          '"National reach without losing the local nuance. Counsel felt aligned from coast to coast on a complex multi-site claim."',
        byline: 'VP Insurance — National Program'
      },
      {
        quote:
          '"Practical recommendations under pressure. We valued the balance of aggressive defense and commercial judgment."',
        byline: 'Outside Counsel Liaison — Retail'
      }
    ]
  },

  finalCta: {
    title: 'Looking for a specific attorney?',
    searchPlaceholder: 'Search attorneys by name or keywords',
    link: '/attorneys',
    linkLabel: 'View all attorneys',
  }
};
