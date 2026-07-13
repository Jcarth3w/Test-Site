const HOME = '/images/home';

/** Photography from public/images/home — shared across pages. */
export const homeImages = {
  truckExplosion: `${HOME}/TruckExplosion.PNG`,
  wildfire: `${HOME}/wildfire.jpg`,
  rvExplosion: `${HOME}/RV%20Explosion.jpeg`,
  foodTruck: `${HOME}/FoodTruck.jpg`,
  constructionDefect: `${HOME}/ConstructionDefect.JPG`,
  constructionDef: `${HOME}/ConstructionDefect.jpeg`,
  autoAx: `${HOME}/AutoAx.jpg`,
  boatFire: `${HOME}/BoatFire.jpg`,
  liftAx: `${HOME}/LiftAx.png`,
  sbWildFire: `${HOME}/SBWildFire.jpg`,
  truckingCrash: `${HOME}/TruckingCrash.PNG`,
  hoverboardFire: `${HOME}/HoverboardFire.JPG`,
  crushedVehicle: `${HOME}/CrushedVehicle.PNG`,
  burningGolfCart: `${HOME}/BurningGolfCart.webp`,
  catastrophicFireFirm2: `${HOME}/catastrophic-fire-and-explosion-law-firm-2.jpg`,
  laurenceHLeavitt: `${HOME}/laurence-h-leavitt-on-scene.jpg`,
  mllSiteInspection: `${HOME}/mll-catastrophic-explosion-site-inspection.jpg`,
};

/** Subtle hero backgrounds for interior listing pages. */
export const pageHeroImages = {
  articles: homeImages.constructionDefect,
  attorneys: homeImages.truckingCrash,
  results: homeImages.crushedVehicle,
};

/** Default hero imagery for practice area detail pages when no CMS image is set. */
export const practiceAreaImages = {
  'fire-explosion': homeImages.truckExplosion,
  'fire-explostion': homeImages.truckExplosion,
  arson: homeImages.foodTruck,
  'products-liability': homeImages.hoverboardFire,
  'product-liability': homeImages.hoverboardFire,
  transportation: homeImages.truckingCrash,
  wildfires: homeImages.wildfire,
  'construction-defect': homeImages.constructionDefect,
  construction: homeImages.constructionDefect,
  casualty: homeImages.crushedVehicle,
  'personal-injury': homeImages.crushedVehicle,
  'premises-liability': homeImages.burningGolfCart,
  'first-party-property': homeImages.rvExplosion,
  'bad-faith': homeImages.rvExplosion,
  environmental: homeImages.wildfire,
  'excess-liability': homeImages.crushedVehicle,
  liability: homeImages.crushedVehicle,
  'professional-liability': homeImages.constructionDefect,
  reinsurance: homeImages.constructionDefect,
  'toxic-torts': homeImages.foodTruck,
  marine: homeImages.boatFire,
  'admiralty-marine': homeImages.boatFire,
  'admirality-marine': homeImages.boatFire,
  trucking: homeImages.truckingCrash,
  'architects-engineers': homeImages.constructionDefect,
  'medical-malpractice': homeImages.crushedVehicle,
  municipality: homeImages.burningGolfCart,
  subrogation: homeImages.truckingCrash,
  'appeals-trials': homeImages.truckExplosion,
};

export function getPracticeAreaImage(slug) {
  return practiceAreaImages[slug] || homeImages.constructionDefect;
}

/** Default hero imagery for practice category pages. */
export const practiceCategoryImages = {
  'insurance-coverage-contract-bad-faith': homeImages.rvExplosion,
  'commercial-liability-defense': homeImages.constructionDefect,
  'property-fire-casualty-claims': homeImages.truckExplosion,
  'general-liability-casualty-defense': homeImages.crushedVehicle,
  'transportation-maritime-defense': homeImages.truckingCrash,
  'construction-products-complex-tort': homeImages.hoverboardFire,
  'professional-healthcare-management-liability': homeImages.crushedVehicle,
};

export function getPracticeCategoryImage(slug) {
  return practiceCategoryImages[slug] || homeImages.constructionDefect;
}
