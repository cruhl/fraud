export type PoliticalEvent = {
  id: string;
  title: string;
  description: string;
  effect: PoliticalEvent.Effect;
  duration: number; // seconds
  icon: string;
  /** AI-generated image path (optional) */
  image?: string;
  /** Prompt for AI image generation */
  imagePrompt?: string;
};

export namespace PoliticalEvent {
  export type Effect =
    | { type: "viewMultiplier"; amount: number }
    | { type: "incomeMultiplier"; amount: number }
    | { type: "viewGain"; amount: number }
    | { type: "pauseFraud" }
    | { type: "nothing" };
}

export const POLITICAL_EVENTS: PoliticalEvent[] = [
  // ============================================
  // POSITIVE EVENTS (help player, longer duration)
  // ============================================
  {
    id: "governor-presser",
    title: "Governor Press Conference",
    description: "Tim Walz announces 'robust oversight' again",
    effect: { type: "viewMultiplier", amount: 0.7 },
    duration: 90,
    icon: "🎤",
  },
  {
    id: "election-year",
    title: "Election Year",
    description: "All investigations mysteriously pause",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 120,
    icon: "🗳️",
  },
  {
    id: "news-cycle-moves-on",
    title: "News Cycle Moves On",
    description: "Celebrity scandal distracts everyone",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 90,
    icon: "📺",
  },
  {
    id: "immunity-negotiations",
    title: "Immunity Negotiations",
    description: "Your lawyer is talking to prosecutors",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 120,
    icon: "🤝",
  },
  {
    id: "bipartisan-concern",
    title: "Bipartisan Concern Expressed",
    description: "Both parties agree something should be done",
    effect: { type: "nothing" },
    duration: 60,
    icon: "🤝",
  },
  {
    id: "somali-diaspora-protest",
    title: "Community Protest",
    description: "Cedar-Riverside residents march against fraud stigma",
    effect: { type: "viewMultiplier", amount: 0.8 },
    duration: 75,
    icon: "✊",
  },
  {
    id: "holiday-weekend",
    title: "Holiday Weekend",
    description: "Nobody's paying attention",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 100,
    icon: "🎆",
  },
  {
    id: "government-shutdown",
    title: "Government Shutdown",
    description: "Investigators sent home, fraud continues",
    effect: { type: "viewMultiplier", amount: 0.3 },
    duration: 90,
    icon: "🏛️",
  },
  {
    id: "budget-crisis",
    title: "Budget Crisis",
    description: "Fraud investigation funding cut by 80%",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 80,
    icon: "💸",
  },
  {
    id: "staff-turnover",
    title: "Staff Turnover",
    description: "Entire oversight team quits, replaced with interns",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 100,
    icon: "🚪",
  },
  {
    id: "new-commissioner",
    title: "New Commissioner",
    description: "Learning curve provides 90 days of cover",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 120,
    icon: "👔",
  },
  {
    id: "database-outage",
    title: "Database Outage",
    description: "State systems mysteriously go down",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 60,
    icon: "💻",
  },
  {
    id: "winter-storm",
    title: "Winter Storm",
    description: "Minnesota weather shuts down everything",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 75,
    icon: "❄️",
  },
  {
    id: "super-bowl-week",
    title: "Super Bowl Week",
    description: "Everyone distracted by football",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 90,
    icon: "🏈",
  },

  // ============================================
  // NEGATIVE EVENTS (hurt player, shorter duration)
  // ============================================
  {
    id: "jd-vance-tweet",
    title: "JD Vance Tweet",
    description: "Vice President praises Nick Shirley's investigation",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 30,
    icon: "🐦",
  },
  {
    id: "noem-strike-team",
    title: "Kristi Noem Strike Team",
    description: "DHS deploys investigators to Minneapolis",
    effect: { type: "viewMultiplier", amount: 1.4 },
    duration: 60,
    icon: "🎯",
  },
  {
    id: "fbi-surge",
    title: "FBI Surges Resources",
    description: "Kash Patel announces additional agents",
    effect: { type: "viewMultiplier", amount: 1.25 },
    duration: 60,
    icon: "🔍",
  },
  {
    id: "audit-released",
    title: "State Audit Released",
    description: "Report finds 'significant deficiencies'",
    effect: { type: "viewGain", amount: 750_000 },
    duration: 45,
    icon: "📊",
  },
  {
    id: "whistleblower",
    title: "Whistleblower Steps Forward",
    description: "Former employee goes to media",
    effect: { type: "viewGain", amount: 1_500_000 },
    duration: 45,
    icon: "🔔",
  },
  {
    id: "doj-investigation",
    title: "DOJ Opens Investigation",
    description: "Federal prosecutors join the case",
    effect: { type: "viewMultiplier", amount: 1.5 },
    duration: 60,
    icon: "⚖️",
  },
  {
    id: "fbi-raid",
    title: "FBI Raid Nearby",
    description: "They're not at your location... yet",
    effect: { type: "viewGain", amount: 3_000_000 },
    duration: 30,
    icon: "🚔",
  },
  {
    id: "voter-fraud-investigation",
    title: "Voter Fraud Investigation",
    description: "Secretary of State questions registration drives",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 45,
    icon: "🗳️",
  },
  {
    id: "wire-transfer-flagged",
    title: "Wire Transfer Flagged",
    description: "Treasury department asks questions about Kenya transfers",
    effect: { type: "viewGain", amount: 1_500_000 },
    duration: 45,
    icon: "💸",
  },
  {
    id: "grand-jury-empaneled",
    title: "Grand Jury Empaneled",
    description: "Subpoenas are coming",
    effect: { type: "viewMultiplier", amount: 1.75 },
    duration: 60,
    icon: "📜",
  },
  {
    id: "nick-shirley-part-2",
    title: "Nick Shirley Part 2",
    description: "YouTuber releases follow-up investigation",
    effect: { type: "viewGain", amount: 5_000_000 },
    duration: 30,
    icon: "📹",
  },
  {
    id: "60-minutes-segment",
    title: "60 Minutes Segment",
    description: "National television covers the scandal",
    effect: { type: "viewGain", amount: 8_000_000 },
    duration: 45,
    icon: "📺",
  },
  {
    id: "netflix-documentary",
    title: "Netflix Documentary",
    description: "True crime series announced",
    effect: { type: "viewGain", amount: 10_000_000 },
    duration: 60,
    icon: "🎬",
  },
  {
    id: "podcast-viral",
    title: "Podcast Goes Viral",
    description: "Everyone's talking about Minnesota fraud",
    effect: { type: "viewGain", amount: 3_000_000 },
    duration: 40,
    icon: "🎙️",
  },
  {
    id: "trump-rally-mention",
    title: "Trump Rally Mention",
    description: "Former president talks about the fraud",
    effect: { type: "viewGain", amount: 7_000_000 },
    duration: 30,
    icon: "🎪",
  },
  {
    id: "elon-tweet",
    title: "Elon Musk Tweet",
    description: "Billionaire shares fraud story to 150M followers",
    effect: { type: "viewGain", amount: 12_000_000 },
    duration: 25,
    icon: "🚀",
  },
  {
    id: "cooperating-witness",
    title: "Cooperating Witness",
    description: "Co-conspirator flips, names names",
    effect: { type: "viewMultiplier", amount: 1.6 },
    duration: 50,
    icon: "🐀",
  },
  {
    id: "witness-accident",
    title: "Witness Has 'Accident'",
    description: "Key witness found dead before testimony",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 90,
    icon: "💀",
  },
  {
    id: "juror-intimidation",
    title: "Juror Intimidation",
    description: "Several jurors report receiving threats",
    effect: { type: "viewGain", amount: 4_000_000 },
    duration: 40,
    icon: "😨",
  },
  {
    id: "informant-disappears",
    title: "Informant Disappears",
    description: "FBI's key source stops returning calls",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 80,
    icon: "👻",
  },
  {
    id: "prosecutor-threatened",
    title: "Prosecutor Receives Threats",
    description: "Lead attorney gets security detail",
    effect: { type: "viewGain", amount: 3_500_000 },
    duration: 45,
    icon: "⚠️",
  },
  {
    id: "witness-protection",
    title: "Witness Enters Protection",
    description: "Cooperator moved to undisclosed location",
    effect: { type: "viewMultiplier", amount: 1.3 },
    duration: 60,
    icon: "🛡️",
  },
  {
    id: "auditor-car-trouble",
    title: "Auditor Has 'Car Trouble'",
    description: "State inspector's brakes mysteriously fail",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 100,
    icon: "🚗",
  },
  {
    id: "journalist-harassed",
    title: "Journalist Harassed",
    description: "Reporter investigating fraud gets death threats",
    effect: { type: "viewGain", amount: 5_000_000 },
    duration: 35,
    icon: "📰",
  },
  {
    id: "hit-and-run",
    title: "Convenient Hit-and-Run",
    description: "Potential witness struck by unidentified vehicle",
    effect: { type: "viewMultiplier", amount: 0.45 },
    duration: 85,
    icon: "🚙",
  },
  {
    id: "suicide-note-found",
    title: "'Suicide Note' Found",
    description: "Whistleblower's death ruled self-inflicted",
    effect: { type: "viewMultiplier", amount: 0.35 },
    duration: 120,
    icon: "📝",
  },
  {
    id: "asset-seizure",
    title: "Asset Seizure",
    description: "Feds freeze bank accounts and properties",
    effect: { type: "viewGain", amount: 2_500_000 },
    duration: 40,
    icon: "🔒",
  },
  {
    id: "indictment-unsealed",
    title: "Indictment Unsealed",
    description: "New defendants named in federal case",
    effect: { type: "viewGain", amount: 4_000_000 },
    duration: 35,
    icon: "📋",
  },
  {
    id: "tiktok-trend",
    title: "TikTok Trend",
    description: "#MinnesotaFraud goes viral with Gen Z",
    effect: { type: "viewGain", amount: 6_000_000 },
    duration: 30,
    icon: "📱",
  },

  // ============================================
  // PAUSE EVENTS (shorter duration)
  // ============================================
  {
    id: "congressional-hearing",
    title: "Congressional Hearing",
    description: "Tom Emmer demands answers",
    effect: { type: "pauseFraud" },
    duration: 30,
    icon: "🏛️",
  },
  {
    id: "senate-hearing",
    title: "Senate Hearing Scheduled",
    description: "Congressional inquiry announced",
    effect: { type: "pauseFraud" },
    duration: 35,
    icon: "🏛️",
  },
  {
    id: "embassy-alert",
    title: "Embassy Alert",
    description: "Wire transfers frozen temporarily",
    effect: { type: "pauseFraud" },
    duration: 25,
    icon: "🚨",
  },
  {
    id: "irs-audit",
    title: "IRS Audit",
    description: "Tax authorities demand records",
    effect: { type: "pauseFraud" },
    duration: 30,
    icon: "📋",
  },
  {
    id: "surprise-inspection",
    title: "Surprise Inspection",
    description: "Actual inspectors show up for once",
    effect: { type: "pauseFraud" },
    duration: 20,
    icon: "🔍",
  },
  {
    id: "bank-freeze",
    title: "Bank Account Frozen",
    description: "Suspicious activity reported",
    effect: { type: "pauseFraud" },
    duration: 25,
    icon: "🏦",
  },

  // ============================================
  // INCOME MODIFIER EVENTS
  // ============================================
  {
    id: "campaign-season",
    title: "Campaign Season",
    description: "Politicians need your donations",
    effect: { type: "incomeMultiplier", amount: 0.7 },
    duration: 60,
    icon: "🎪",
  },
  {
    id: "covid-relief-funds",
    title: "COVID Relief Funds",
    description: "Emergency funding = no oversight",
    effect: { type: "incomeMultiplier", amount: 1.5 },
    duration: 90,
    icon: "💰",
  },
  {
    id: "end-of-fiscal-year",
    title: "End of Fiscal Year",
    description: "Spend it or lose it mentality",
    effect: { type: "incomeMultiplier", amount: 1.3 },
    duration: 75,
    icon: "📅",
  },
  {
    id: "stimulus-package",
    title: "Stimulus Package Passed",
    description: "More money, same oversight",
    effect: { type: "incomeMultiplier", amount: 1.4 },
    duration: 80,
    icon: "💵",
  },
  {
    id: "budget-surplus",
    title: "Budget Surplus",
    description: "State has extra money to give away",
    effect: { type: "incomeMultiplier", amount: 1.25 },
    duration: 70,
    icon: "📈",
  },
  {
    id: "grant-renewal",
    title: "Grant Renewal Season",
    description: "Federal funds flowing freely",
    effect: { type: "incomeMultiplier", amount: 1.35 },
    duration: 85,
    icon: "🏛️",
  },
];

export const getRandomEvent = (): PoliticalEvent =>
  POLITICAL_EVENTS[Math.floor(Math.random() * POLITICAL_EVENTS.length)];
