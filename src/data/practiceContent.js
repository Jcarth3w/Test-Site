/** Long-form copy for individual practice pages (two paragraphs each). */
const practiceContentBySlug = {
  'bad-faith': `When a claim-handling decision is challenged in court, outcomes often turn on documentation, timing, and the reasonableness of the insurer's conduct—not just the policy language. We defend carriers in first-party and third-party bad faith matters arising from settlement pressure, investigation delays, reservation-of-rights disputes, and alleged failures to investigate or pay.

Our attorneys work inside the claims process as much as in the courtroom, helping clients build defensible files, evaluate extra-contractual exposure early, and respond to systemic or class allegations without losing sight of practical business objectives.`,

  'construction-defect': `Construction defect litigation rarely involves a single failing component or one responsible party. These cases turn on building science, contractual allocation, indemnity chains, and coverage questions that can span multiple policy periods and dozens of interested parties.

We represent insurers, contractors, owners, and design professionals in disputes involving water intrusion, structural failures, and long-tail property damage. Our team coordinates engineers, architects, and envelope specialists to develop fact-driven defenses and pursue efficient resolutions when litigation cannot be avoided.`,

  environmental: `Environmental claims sit at a difficult intersection of science, regulation, and civil liability—where remediation standards, historical site use, and policy wording all bear on the outcome. Insurers and insureds call on us when contamination allegations, legacy site liability, or regulatory enforcement triggers coverage disputes.

From initial site assessment through trial, we work with environmental engineers, hydrogeologists, and toxicologists to challenge causation, evaluate cleanup obligations, and develop strategies suited to the technical and jurisdictional complexity of each matter.`,

  'excess-liability': `For excess and umbrella carriers, the critical questions are often when coverage attaches, how much underlying insurance has been eroded, and what authority the primary layer exercised before tendering upstream. We advise excess insurers in high-value disputes involving attachment, exhaustion, allocation, and follow-form issues.

Our lawyers evaluate underlying settlements, assess contribution among carriers, and coordinate strategy across multiple layers in matters involving catastrophic injury, large property loss, and multi-defendant litigation.`,

  'first-party-property': `After a major property loss, positions form quickly—on scope of damage, causation, business interruption, and the application of exclusions. Insurers need counsel who can keep pace with adjusters, engineers, and policyholders from first notice forward.

We handle localized claims and catastrophe-driven portfolios alike, coordinating forensic accountants, building consultants, and coverage analysis to support defensible claim decisions and, when necessary, disciplined litigation.`,

  liability: `General liability claims require early, candid assessment of exposure and a defense calibrated to the stakes. We represent insurers and insureds in bodily injury and property damage disputes where settlement pressure, venue risk, and trial exposure must be weighed together—not in isolation.

Our team defends commercial and personal lines matters involving multi-party fault, damages inflation, and aggressive plaintiff theories, with a consistent focus on controlling cost without surrendering leverage.`,

  'professional-liability': `Professional liability disputes turn on whether a licensed professional breached the standard of care governing their field—and whether any breach actually caused the harm alleged. Those questions demand industry-specific knowledge, not generic litigation tactics.

We defend accountants, attorneys, architects, engineers, and other professionals and their insurers, partnering with qualified experts to evaluate technical merit, challenge damages, and try cases where settlement is not the right answer.`,

  reinsurance: `Reinsurance disputes are commercial relationships under strain as much as coverage fights. Cedents and reinsurers engage us when notice, allocation, aggregation, or treaty interpretation disagreements threaten to disrupt programs built over years of trust.

We handle facultative and treaty matters involving follow-the-settlements clauses, coverage triggers, and multi-reinsurer panels, aiming to protect our clients' positions while preserving workable long-term partnerships where possible.`,

  'toxic-torts': `Toxic tort litigation is won and lost on exposure science, epidemiology, and the admissibility of expert testimony. Manufacturers, distributors, and insurers rely on us in individual claims and consolidated proceedings where causation is aggressively contested and damages theories are expansive.

We develop coordinated expert strategy, challenge general-causation assumptions, and manage the procedural demands of MDL and mass-filing environments without losing sight of case-specific defenses.`,

  'admiralty-marine': `Maritime casualties are governed by a distinct body of federal law and industry custom. Collisions, cargo losses, allisions, and waterfront injuries require counsel comfortable in admiralty jurisdiction and familiar with how vessels, terminals, and marine contractors actually operate.

We represent vessel owners, cargo interests, marine contractors, and insurers from emergency response through trial, coordinating with surveyors, naval architects, and regulatory authorities to preserve evidence and develop specialized defenses.`,

  'architects-engineers': `Design professionals are often sued for problems that originate in field conditions, contractor choices, material performance, or owner-directed changes—not simply in the drawings. Defending architects and engineers means understanding how design intent meets construction reality.

We handle professional liability claims involving alleged design errors, coordination failures, code compliance, and delay or cost impacts, working with structural, civil, and MEP experts to anchor defenses in applicable standards and project facts.`,

  arson: `Suspicious fire claims turn on what investigators can establish about origin, cause, and intent—and whether that record supports or undermines coverage. These disputes demand close coordination with SIU teams and a command of fire science, not just litigation mechanics.

We represent insurers in contested arson and fraud-related property matters, working alongside fire investigators and forensic accountants to evaluate incendiarism evidence, financial motive, and the strength of denial positions from first notice through trial.`,

  casualty: `Casualty claims span a wide spectrum—from routine bodily injury allegations to complex matters involving life-altering injuries, overlapping tort theories, and significant indemnity exposure. The defense strategy should not treat them all the same.

We represent insurers and insureds across commercial and personal contexts, emphasizing early case evaluation, expert retention when warranted, and trial preparation that keeps settlement authority informed by realistic risk assessment.`,

  construction: `Construction litigation is shaped by the contracts, schedules, change orders, and site conditions that define each project. When disputes over injury, delay, defective work, or payment move from the jobsite to the courthouse, stakeholders need counsel who understand how projects are built—not just how cases are filed.

We advise owners, contractors, insurers, and project participants, coordinating scheduling analysts, trade specialists, and coverage counsel to develop defenses grounded in project records and contractual relationships.`,

  'fire-explosion': `No firm matches McCoy Leavitt Laskey's concentration in catastrophic fire and explosion work. Our attorneys are routinely on scene after major losses—alongside origin-and-cause investigators, electrical and mechanical engineers, and other forensic specialists—preserving perishable evidence and shaping the factual record from day one.

We have defended manufacturers, property owners, contractors, and insurers in many of the country's most complex fire and explosion matters. That depth shows in how we challenge assumptions, test expert methodologies, and align litigation strategy with each client's exposure and operational priorities.`,

  'medical-malpractice': `Medical malpractice defense requires counsel who can read clinical records with care, understand the standard of care in context, and explain complex medicine to judges and juries without oversimplifying. Sympathy for the plaintiff is real in these cases; the response must be rigorous and credible.

We represent physicians, hospitals, health systems, and allied professionals in matters involving surgical complications, diagnostic errors, informed consent, and staffing allegations, partnering with qualified medical experts at every stage of evaluation and trial.`,

  municipality: `Public entities face liability claims under rules private defendants never encounter—statutory immunities, notice-of-claim requirements, indemnification statutes, and the political visibility of high-profile verdicts. Municipal defense demands procedural precision and practical judgment.

We represent cities, counties, agencies, and their insurers in premises, operational, and public-service claims, combining knowledge of government liability law with trial advocacy suited to public-sector sensitivities.`,

  'personal-injury': `Plaintiffs' counsel in personal injury cases often press hard early; the defense must be equally deliberate. We defend insurers and insureds in matters ranging from soft-tissue and minor injury claims to catastrophic trauma and wrongful death cases where damages theories can escalate quickly.

Our approach pairs disciplined discovery with credible expert development, giving clients a clear picture of exposure and a defense that is trial-ready when settlement does not serve their interests.`,

  'premises-liability': `Premises liability claims ask whether an owner or manager knew or should have known of a condition that allegedly caused harm—and whether the incident was foreseeable. Answers lie in maintenance logs, inspection practices, prior incidents, and the specific facts of the location.

We defend retailers, hospitality operators, commercial landlords, and residential managers in slip-and-fall, negligent security, and maintenance disputes, focusing on dispositive fact development and standards-of-care analysis tailored to each property type.`,

  'products-liability': `A products claim may allege a design flaw, a manufacturing deviation, an inadequate warning, or end-user misuse—often several theories at once. Manufacturers and distributors need counsel who can unpack those allegations with engineering support and a clear theory of the case.

We defend product makers and sellers in individual and multi-plaintiff matters across consumer, industrial, and commercial lines, challenging causation, testing compliance with applicable standards, and identifying alternative explanations for alleged failures.`,

  transportation: `When a commercial vehicle is involved in a serious accident, critical evidence begins disappearing almost immediately. Our Transportation team is built for rapid response—securing ELD data, driver qualification files, maintenance records, and scene documentation before narratives harden.

We defend motor carriers, fleet operators, logistics companies, and their insurers in high-exposure trucking and transportation claims, combining regulatory knowledge with litigation strategy focused on liability, comparative fault, and damages.`,

  wildfires: `Modern wildfire litigation can involve thousands of related claims, contested causation spanning utility infrastructure and weather events, and exposure figures capable of reshaping a balance sheet. Insurers, utilities, and property interests need counsel who can manage scale without sacrificing case-specific rigor.

We advise clients in some of the most significant wildfire events in recent years, coordinating origin-and-cause analysis, coverage review, and portfolio-wide defense strategy across related proceedings.`,

  subrogation: `Subrogation is only as strong as the investigation behind it. Once a carrier pays a loss, the window to identify responsible parties, preserve evidence, and build a recovery file starts closing. We pursue repayment through targeted pre-suit efforts and litigation when negotiation fails.

Our team handles property, casualty, and complex-loss recoveries, coordinating with technical investigators and coverage counsel to evaluate targets, assess collectability, and maximize returns aligned with each client's operational priorities.`,

  'appeals-trials': `Winning at trial—or preserving issues for appeal—depends on what is developed in the record below. Our trial and appellate lawyers collaborate early, identifying dispositive motions, managing expert testimony, and framing arguments designed to survive scrutiny at every level.

We provide first-chair trial advocacy, appellate briefing, and oral argument in coverage disputes, catastrophic loss cases, and high-exposure liability matters where the difference between a good and a great record is often made months before verdict.`,

  'trucking-accidents': `Commercial trucking accidents generate some of the highest severity claims in transportation litigation—and some of the fastest evidentiary decay. Hours-of-service data, ELD records, and maintenance histories must be secured quickly before they are lost or overwritten.

We defend motor carriers and their insurers in catastrophic trucking matters, combining knowledge of federal motor-carrier regulation with litigation strategy focused on fault, damages, and the unique dynamics of heavy-vehicle collisions.`,

  'insurance-defence': `Insurance defense is rarely one-size-fits-all—coverage positions, reservation of rights, and the insured's own interests can pull in different directions from the first notice of claim. We represent carriers and self-insured clients across civil disputes where coordinated strategy and clear communication matter as much as courtroom skill.

Our attorneys handle bodily injury, property damage, and multi-party litigation with an emphasis on early evaluation, disciplined discovery, and defenses tailored to the policy, the facts, and the forum.`,

  'wrongful-death': `Wrongful death claims carry emotional weight and damages exposure that can dwarf ordinary bodily injury cases. Survivors' grief is real; the defense must still test liability, causation, and every component of claimed loss with precision and respect for the forum.

We represent insurers and insureds in high-exposure survivorship matters, coordinating economists, medical experts, and liability specialists to evaluate exposure early and prepare for trial when resolution by agreement is not achievable.`,
};

const practiceContentAliases = {
  'general-liability': 'liability',
  'product-liability': 'products-liability',
  'prof-liability': 'professional-liability',
  subro: 'subrogation',
  'mass-torts': 'toxic-torts',
};

export function getPracticeContent(slug) {
  const direct = practiceContentBySlug[slug];
  if (direct) return direct;
  const alias = practiceContentAliases[slug];
  return alias ? practiceContentBySlug[alias] : '';
}

export default practiceContentBySlug;
