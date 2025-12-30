export type PoliticalEvent = {
  id: string;
  title: string;
  description: string;
  effect: PoliticalEvent.Effect;
  duration: number; // seconds
  icon: string;
  /** Event tier (1-4): controls when event can trigger based on progress
   * - Tier 1: Early game ($0-$600K) - local events, small impacts
   * - Tier 2: Mid game ($600K-$35M) - regional, growing scrutiny
   * - Tier 3: Late game ($35M-$200M) - national, major investigations
   * - Tier 4: Endgame ($200M+) - viral phenomena, congress */
  tier: 1 | 2 | 3 | 4;
  /** Character ID to display portrait (e.g., "nick-shirley", "tim-walz") */
  character?: string;
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
    | { type: "investigation"; incomeMultiplier: number; viewGain: number }
    | { type: "nothing" }
    | { type: "moneyBonus"; flat: number; percent: number }
    | { type: "viewReduction"; amount: number }
    | { type: "combo"; incomeMultiplier: number; viewMultiplier: number };
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
    tier: 2,
    character: "tim-walz",
  },
  {
    id: "election-year",
    title: "Election Year",
    description: "All investigations mysteriously pause",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 120,
    icon: "🗳️",
    tier: 3,
  },
  {
    id: "news-cycle-moves-on",
    title: "News Cycle Moves On",
    description: "Celebrity scandal distracts everyone",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 90,
    icon: "📺",
    tier: 2,
  },
  {
    id: "immunity-negotiations",
    title: "Immunity Negotiations",
    description: "Your lawyer is talking to prosecutors",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 120,
    icon: "🤝",
    tier: 3,
  },
  {
    id: "bipartisan-concern",
    title: "Bipartisan Concern Expressed",
    description: "Both parties agree something should be done",
    effect: { type: "nothing" },
    duration: 60,
    icon: "🤝",
    tier: 2,
  },
  {
    id: "somali-diaspora-protest",
    title: "Community Protest",
    description: "Cedar-Riverside residents march against fraud stigma",
    effect: { type: "viewMultiplier", amount: 0.8 },
    duration: 75,
    icon: "✊",
    tier: 2,
  },
  {
    id: "holiday-weekend",
    title: "Holiday Weekend",
    description: "Nobody's paying attention",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 100,
    icon: "🎆",
    tier: 1,
  },
  {
    id: "government-shutdown",
    title: "Government Shutdown",
    description: "Investigators sent home, fraud continues",
    effect: { type: "viewMultiplier", amount: 0.3 },
    duration: 90,
    icon: "🏛️",
    tier: 3,
  },
  {
    id: "budget-crisis",
    title: "Budget Crisis",
    description: "Fraud investigation funding cut by 80%",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 80,
    icon: "💸",
    tier: 2,
  },
  {
    id: "staff-turnover",
    title: "Staff Turnover",
    description: "Entire oversight team quits, replaced with interns",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 100,
    icon: "🚪",
    tier: 1,
  },
  {
    id: "new-commissioner",
    title: "New Commissioner",
    description: "Learning curve provides 90 days of cover",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 120,
    icon: "👔",
    tier: 2,
  },
  {
    id: "database-outage",
    title: "Database Outage",
    description: "State systems mysteriously go down",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 60,
    icon: "💻",
    tier: 1,
  },
  {
    id: "winter-storm",
    title: "Winter Storm",
    description: "Minnesota weather shuts down everything",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 75,
    icon: "❄️",
    tier: 1,
  },
  {
    id: "super-bowl-week",
    title: "Super Bowl Week",
    description: "Everyone distracted by football",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 90,
    icon: "🏈",
    tier: 2,
  },

  // ============================================
  // NEGATIVE EVENTS (hurt player, shorter duration)
  // ============================================
  {
    id: "jd-vance-tweet",
    title: "JD Vance Tweet",
    description: "Vice President praises Nick Shirley's investigation",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 30,
    icon: "🐦",
    tier: 3,
  },
  {
    id: "noem-strike-team",
    title: "Kristi Noem Strike Team",
    description: "DHS deploys investigators to Minneapolis",
    effect: { type: "viewMultiplier", amount: 1.4 },
    duration: 60,
    icon: "🎯",
    tier: 4,
    character: "dhs-official",
  },
  {
    id: "fbi-surge",
    title: "FBI Surges Resources",
    description: "Kash Patel announces additional agents",
    effect: { type: "viewMultiplier", amount: 1.25 },
    duration: 60,
    icon: "🔍",
    tier: 3,
    character: "fbi-agent",
  },
  {
    id: "audit-released",
    title: "State Audit Released",
    description: "Report finds 'significant deficiencies'",
    effect: { type: "viewGain", amount: 200_000 },
    duration: 45,
    icon: "📊",
    tier: 2,
  },
  {
    id: "whistleblower",
    title: "Whistleblower Steps Forward",
    description: "Former employee goes to media",
    effect: { type: "viewGain", amount: 400_000 },
    duration: 45,
    icon: "🔔",
    tier: 2,
  },
  {
    id: "doj-investigation",
    title: "DOJ Opens Investigation",
    description: "Federal prosecutors join the case",
    effect: { type: "viewMultiplier", amount: 1.5 },
    duration: 60,
    icon: "⚖️",
    tier: 3,
    character: "federal-judge",
  },
  {
    id: "fbi-raid",
    title: "FBI Raid Nearby",
    description: "They're not at your location... yet",
    effect: { type: "viewGain", amount: 750_000 },
    duration: 30,
    icon: "🚔",
    tier: 3,
    character: "fbi-agent",
  },
  {
    id: "voter-fraud-investigation",
    title: "Voter Fraud Investigation",
    description: "Secretary of State questions registration drives",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 45,
    icon: "🗳️",
    tier: 3,
  },
  {
    id: "wire-transfer-flagged",
    title: "Wire Transfer Flagged",
    description: "Treasury department asks questions about Kenya transfers",
    effect: { type: "viewGain", amount: 400_000 },
    duration: 45,
    icon: "💸",
    tier: 2,
  },
  {
    id: "grand-jury-empaneled",
    title: "Grand Jury Empaneled",
    description: "Subpoenas are coming",
    effect: { type: "viewMultiplier", amount: 1.75 },
    duration: 60,
    icon: "📜",
    tier: 4,
    character: "federal-judge",
  },
  {
    id: "nick-shirley-part-2",
    title: "Nick Shirley Part 2",
    description: "YouTuber releases follow-up investigation",
    effect: { type: "viewGain", amount: 1_500_000 },
    duration: 30,
    icon: "📹",
    tier: 3,
    character: "nick-shirley",
  },
  {
    id: "60-minutes-segment",
    title: "60 Minutes Segment",
    description: "National television covers the scandal",
    effect: { type: "viewGain", amount: 2_500_000 },
    duration: 45,
    icon: "📺",
    tier: 4,
  },
  {
    id: "netflix-documentary",
    title: "Netflix Documentary",
    description: "True crime series announced",
    effect: { type: "viewGain", amount: 3_000_000 },
    duration: 60,
    icon: "🎬",
    tier: 4,
  },
  {
    id: "podcast-viral",
    title: "Podcast Goes Viral",
    description: "Everyone's talking about Minnesota fraud",
    effect: { type: "viewGain", amount: 800_000 },
    duration: 40,
    icon: "🎙️",
    tier: 3,
  },
  {
    id: "trump-rally-mention",
    title: "Trump Rally Mention",
    description: "Former president talks about the fraud",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 30,
    icon: "🎪",
    tier: 4,
  },
  {
    id: "elon-tweet",
    title: "Elon Musk Tweet",
    description: "Billionaire shares fraud story to 150M followers",
    effect: { type: "viewGain", amount: 4_000_000 },
    duration: 25,
    icon: "🚀",
    tier: 4,
  },
  {
    id: "cooperating-witness",
    title: "Cooperating Witness",
    description: "Co-conspirator flips, names names",
    effect: { type: "viewMultiplier", amount: 1.6 },
    duration: 50,
    icon: "🐀",
    tier: 3,
  },
  {
    id: "witness-accident",
    title: "Witness Has 'Accident'",
    description: "Key witness found dead before testimony",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 90,
    icon: "💀",
    tier: 3,
  },
  {
    id: "juror-intimidation",
    title: "Juror Intimidation",
    description: "Several jurors report receiving threats",
    effect: { type: "viewGain", amount: 1_000_000 },
    duration: 40,
    icon: "😨",
    tier: 4,
  },
  {
    id: "informant-disappears",
    title: "Informant Disappears",
    description: "FBI's key source stops returning calls",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 80,
    icon: "👻",
    tier: 3,
  },
  {
    id: "prosecutor-threatened",
    title: "Prosecutor Receives Threats",
    description: "Lead attorney gets security detail",
    effect: { type: "viewGain", amount: 900_000 },
    duration: 45,
    icon: "⚠️",
    tier: 3,
  },
  {
    id: "witness-protection",
    title: "Witness Enters Protection",
    description: "Cooperator moved to undisclosed location",
    effect: { type: "viewMultiplier", amount: 1.3 },
    duration: 60,
    icon: "🛡️",
    tier: 3,
  },
  {
    id: "auditor-car-trouble",
    title: "Auditor Has 'Car Trouble'",
    description: "State inspector's brakes mysteriously fail",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 100,
    icon: "🚗",
    tier: 3,
  },
  {
    id: "journalist-harassed",
    title: "Journalist Harassed",
    description: "Reporter investigating fraud gets death threats",
    effect: { type: "viewGain", amount: 1_200_000 },
    duration: 35,
    icon: "📰",
    tier: 3,
  },
  {
    id: "hit-and-run",
    title: "Convenient Hit-and-Run",
    description: "Potential witness struck by unidentified vehicle",
    effect: { type: "viewMultiplier", amount: 0.45 },
    duration: 85,
    icon: "🚙",
    tier: 3,
  },
  {
    id: "suicide-note-found",
    title: "'Suicide Note' Found",
    description: "Whistleblower's death ruled self-inflicted",
    effect: { type: "viewMultiplier", amount: 0.35 },
    duration: 120,
    icon: "📝",
    tier: 4,
  },
  {
    id: "asset-seizure",
    title: "Asset Seizure",
    description: "Feds freeze bank accounts and properties",
    effect: { type: "viewGain", amount: 600_000 },
    duration: 40,
    icon: "🔒",
    tier: 3,
  },
  {
    id: "indictment-unsealed",
    title: "Indictment Unsealed",
    description: "New defendants named in federal case",
    effect: { type: "viewGain", amount: 1_000_000 },
    duration: 35,
    icon: "📋",
    tier: 3,
  },
  {
    id: "tiktok-trend",
    title: "TikTok Trend",
    description: "#MinnesotaFraud goes viral with Gen Z",
    effect: { type: "viewGain", amount: 1_800_000 },
    duration: 30,
    icon: "📱",
    tier: 3,
  },

  // ============================================
  // INVESTIGATION EVENTS (reduced income + view spike)
  // ============================================
  {
    id: "congressional-hearing",
    title: "Congressional Hearing",
    description: "Tom Emmer demands answers - laying low",
    effect: { type: "investigation", incomeMultiplier: 0.3, viewGain: 500_000 },
    duration: 30,
    icon: "🏛️",
    tier: 4,
  },
  {
    id: "senate-hearing",
    title: "Senate Hearing Scheduled",
    description: "Congressional inquiry - operations slowed",
    effect: { type: "investigation", incomeMultiplier: 0.3, viewGain: 600_000 },
    duration: 35,
    icon: "🏛️",
    tier: 4,
  },
  {
    id: "embassy-alert",
    title: "Embassy Alert",
    description: "Wire transfers under scrutiny",
    effect: {
      type: "investigation",
      incomeMultiplier: 0.25,
      viewGain: 400_000,
    },
    duration: 25,
    icon: "🚨",
    tier: 3,
  },
  {
    id: "irs-audit",
    title: "IRS Audit",
    description: "Tax authorities reviewing books",
    effect: { type: "investigation", incomeMultiplier: 0.3, viewGain: 500_000 },
    duration: 30,
    icon: "📋",
    tier: 2,
  },
  {
    id: "surprise-inspection",
    title: "Surprise Inspection",
    description: "Inspectors on-site - act normal",
    effect: { type: "investigation", incomeMultiplier: 0.2, viewGain: 300_000 },
    duration: 20,
    icon: "🔍",
    tier: 1,
    character: "corrupt-inspector",
  },
  {
    id: "bank-freeze",
    title: "Bank Account Frozen",
    description: "Using backup accounts at reduced capacity",
    effect: {
      type: "investigation",
      incomeMultiplier: 0.25,
      viewGain: 450_000,
    },
    duration: 25,
    icon: "🏦",
    tier: 3,
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
    tier: 2,
  },
  {
    id: "covid-relief-funds",
    title: "COVID Relief Funds",
    description: "Emergency funding = no oversight",
    effect: { type: "incomeMultiplier", amount: 1.5 },
    duration: 90,
    icon: "💰",
    tier: 1,
  },
  {
    id: "end-of-fiscal-year",
    title: "End of Fiscal Year",
    description: "Spend it or lose it mentality",
    effect: { type: "incomeMultiplier", amount: 1.3 },
    duration: 75,
    icon: "📅",
    tier: 1,
  },
  {
    id: "stimulus-package",
    title: "Stimulus Package Passed",
    description: "More money, same oversight",
    effect: { type: "incomeMultiplier", amount: 1.4 },
    duration: 80,
    icon: "💵",
    tier: 2,
  },
  {
    id: "budget-surplus",
    title: "Budget Surplus",
    description: "State has extra money to give away",
    effect: { type: "incomeMultiplier", amount: 1.25 },
    duration: 70,
    icon: "📈",
    tier: 1,
  },
  {
    id: "grant-renewal",
    title: "Grant Renewal Season",
    description: "Federal funds flowing freely",
    effect: { type: "incomeMultiplier", amount: 1.35 },
    duration: 85,
    icon: "🏛️",
    tier: 2,
  },

  // ============================================
  // CHARACTER-LINKED EVENTS
  // ============================================

  // Nick Shirley Events
  {
    id: "nick-filming-outside",
    title: "Nick Shirley Spotted Outside",
    description: "YouTuber with camera seen in your neighborhood",
    effect: { type: "viewGain", amount: 300_000 },
    duration: 45,
    icon: "📸",
    tier: 2,
    character: "nick-shirley",
  },
  {
    id: "nick-interview-request",
    title: "Nick Shirley Interview Request",
    description: "The YouTuber wants to ask you some questions",
    effect: { type: "viewMultiplier", amount: 1.3 },
    duration: 40,
    icon: "🎤",
    tier: 2,
    character: "nick-shirley",
  },
  {
    id: "nick-drone-footage",
    title: "Nick Shirley Drone Footage",
    description: "Aerial view of your empty facilities goes viral",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 35,
    icon: "🚁",
    tier: 3,
    character: "nick-shirley",
  },
  {
    id: "nick-spreadsheet",
    title: "Nick's Fraud Spreadsheet",
    description: "YouTuber's data more detailed than state database",
    effect: { type: "viewGain", amount: 1_200_000 },
    duration: 40,
    icon: "📊",
    tier: 3,
    character: "nick-shirley",
  },

  // Tim Walz Events
  {
    id: "walz-apology-tour",
    title: "Governor's Apology Tour",
    description: "Tim Walz admits oversight 'could have been better'",
    effect: { type: "viewMultiplier", amount: 0.8 },
    duration: 75,
    icon: "🎭",
    tier: 3,
    character: "tim-walz",
  },
  {
    id: "walz-new-task-force",
    title: "New Task Force Announced",
    description: "Governor creates 17th oversight committee",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 100,
    icon: "📋",
    tier: 2,
    character: "tim-walz",
  },
  {
    id: "walz-blames-covid",
    title: "Governor Blames COVID",
    description: "Walz: 'Emergency conditions made oversight difficult'",
    effect: { type: "viewMultiplier", amount: 0.75 },
    duration: 80,
    icon: "😷",
    tier: 2,
    character: "tim-walz",
  },
  {
    id: "walz-culture-of-trust",
    title: "'Culture of Trust'",
    description: "Governor defends state's relaxed oversight approach",
    effect: { type: "viewMultiplier", amount: 0.65 },
    duration: 90,
    icon: "🤝",
    tier: 2,
    character: "tim-walz",
  },

  // FBI Agent Events
  {
    id: "fbi-subpoena",
    title: "FBI Subpoena Served",
    description: "Agents want all your financial records",
    effect: {
      type: "investigation",
      incomeMultiplier: 0.15,
      viewGain: 700_000,
    },
    duration: 25,
    icon: "📄",
    tier: 3,
    character: "fbi-agent",
  },
  {
    id: "fbi-undercover",
    title: "Undercover Agent Discovered",
    description: "That new 'community partner' was wearing a wire",
    effect: { type: "viewGain", amount: 900_000 },
    duration: 35,
    icon: "🕵️",
    tier: 3,
    character: "fbi-agent",
  },
  {
    id: "fbi-bank-records",
    title: "FBI Seizes Bank Records",
    description: "Agents visit every bank in Minneapolis",
    effect: { type: "viewMultiplier", amount: 1.35 },
    duration: 55,
    icon: "🏦",
    tier: 3,
    character: "fbi-agent",
  },

  // DHS Official Events
  {
    id: "dhs-interview",
    title: "DHS Formal Interview",
    description: "Homeland Security wants to 'chat' about wire transfers",
    effect: {
      type: "investigation",
      incomeMultiplier: 0.25,
      viewGain: 550_000,
    },
    duration: 30,
    icon: "🎖️",
    tier: 3,
    character: "dhs-official",
  },
  {
    id: "dhs-asset-review",
    title: "DHS Asset Review",
    description: "Agents cataloging your luxury purchases",
    effect: { type: "viewGain", amount: 650_000 },
    duration: 40,
    icon: "📝",
    tier: 3,
    character: "dhs-official",
  },

  // Corrupt Inspector Events (Positive)
  {
    id: "inspector-wink",
    title: "Inspector's Friendly Visit",
    description: "He found '99 children present' in an empty building",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 100,
    icon: "😉",
    tier: 1,
    character: "corrupt-inspector",
  },
  {
    id: "inspector-tip-off",
    title: "Inspector Tips You Off",
    description: "Heads up about tomorrow's 'surprise' audit",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 120,
    icon: "📱",
    tier: 1,
    character: "corrupt-inspector",
  },
  {
    id: "inspector-lost-paperwork",
    title: "Paperwork 'Lost'",
    description: "Inspector's complaint forms mysteriously vanish",
    effect: { type: "viewMultiplier", amount: 0.55 },
    duration: 90,
    icon: "🗑️",
    tier: 1,
    character: "corrupt-inspector",
  },

  // Federal Judge Events
  {
    id: "judge-bail-hearing",
    title: "Associate's Bail Hearing",
    description: "Federal judge reviewing your partner's case",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 45,
    icon: "🔨",
    tier: 3,
    character: "federal-judge",
  },
  {
    id: "judge-warrant-approved",
    title: "Search Warrant Approved",
    description: "Judge signs off on FBI search of your properties",
    effect: { type: "viewGain", amount: 800_000 },
    duration: 30,
    icon: "📋",
    tier: 3,
    character: "federal-judge",
  },

  // Expensive Lawyer Events
  {
    id: "lawyer-connection",
    title: "Lawyer Works His Magic",
    description: "Your attorney knows someone who knows someone",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 80,
    icon: "💼",
    tier: 3,
    character: "expensive-lawyer",
  },
  {
    id: "lawyer-motion-filed",
    title: "Motion to Suppress",
    description: "Expensive lawyer challenges evidence collection",
    effect: { type: "viewMultiplier", amount: 0.7 },
    duration: 70,
    icon: "⚖️",
    tier: 3,
    character: "expensive-lawyer",
  },

  // ============================================
  // MONEY BONUS EVENTS
  // ============================================
  {
    id: "covid-emergency-grant",
    title: "Emergency COVID Grant",
    description: "Free federal money, no oversight required",
    effect: { type: "moneyBonus", flat: 500_000, percent: 0.02 },
    duration: 60,
    icon: "💉",
    tier: 2,
  },
  {
    id: "end-of-year-surplus",
    title: "End of Year Budget Surplus",
    description: "Use it or lose it - state hands out cash",
    effect: { type: "moneyBonus", flat: 250_000, percent: 0.01 },
    duration: 45,
    icon: "📊",
    tier: 1,
  },
  {
    id: "retroactive-payments",
    title: "Retroactive Payments Approved",
    description: "Claims from 2019 finally processed",
    effect: { type: "moneyBonus", flat: 1_000_000, percent: 0.03 },
    duration: 50,
    icon: "🔄",
    tier: 2,
  },
  {
    id: "mistake-in-your-favor",
    title: "Accounting 'Error'",
    description: "State double-paid your invoice",
    effect: { type: "moneyBonus", flat: 750_000, percent: 0 },
    duration: 40,
    icon: "🎰",
    tier: 2,
  },
  {
    id: "grant-windfall",
    title: "Federal Grant Windfall",
    description: "Biden's infrastructure bill raining money",
    effect: { type: "moneyBonus", flat: 2_000_000, percent: 0.01 },
    duration: 55,
    icon: "🏗️",
    tier: 3,
  },

  // ============================================
  // VIEW REDUCTION EVENTS (Good for player)
  // ============================================
  {
    id: "celebrity-scandal",
    title: "Celebrity Scandal",
    description: "Everyone distracted by Hollywood drama",
    effect: { type: "viewReduction", amount: 2_000_000 },
    duration: 60,
    icon: "⭐",
    tier: 3,
  },
  {
    id: "natural-disaster",
    title: "Natural Disaster Coverage",
    description: "Hurricane dominates the news cycle",
    effect: { type: "viewReduction", amount: 3_000_000 },
    duration: 70,
    icon: "🌪️",
    tier: 3,
  },
  {
    id: "major-sports-event",
    title: "Major Sports Event",
    description: "Everyone's watching the game",
    effect: { type: "viewReduction", amount: 1_500_000 },
    duration: 50,
    icon: "🏆",
    tier: 2,
  },
  {
    id: "viral-cat-video",
    title: "Viral Cat Video",
    description: "Internet has a new obsession",
    effect: { type: "viewReduction", amount: 800_000 },
    duration: 40,
    icon: "🐱",
    tier: 2,
  },
  {
    id: "political-distraction",
    title: "Political Scandal Elsewhere",
    description: "DC drama steals the spotlight",
    effect: { type: "viewReduction", amount: 2_500_000 },
    duration: 65,
    icon: "🏛️",
    tier: 3,
  },

  // ============================================
  // COMBO EVENTS (Mixed effects)
  // ============================================
  {
    id: "audit-season",
    title: "Audit Season",
    description: "More scrutiny, but also more funding",
    effect: { type: "combo", incomeMultiplier: 1.25, viewMultiplier: 1.15 },
    duration: 75,
    icon: "📋",
    tier: 2,
  },
  {
    id: "media-attention",
    title: "Media Attention",
    description: "Coverage brings donations... and scrutiny",
    effect: { type: "combo", incomeMultiplier: 1.4, viewMultiplier: 1.3 },
    duration: 60,
    icon: "📺",
    tier: 3,
  },
  {
    id: "inspector-vacation",
    title: "Inspector on Vacation",
    description: "Less oversight, but you're getting lazy",
    effect: { type: "combo", incomeMultiplier: 0.9, viewMultiplier: 0.5 },
    duration: 90,
    icon: "🏖️",
    tier: 1,
  },
  {
    id: "new-regulations",
    title: "New Regulations",
    description: "More paperwork, but bigger payouts",
    effect: { type: "combo", incomeMultiplier: 1.35, viewMultiplier: 1.2 },
    duration: 80,
    icon: "📜",
    tier: 2,
  },

  // ============================================
  // MORE SATIRICAL STORY EVENTS
  // ============================================
  {
    id: "quality-learing-inspection",
    title: "'Quality LEARING' Passes Inspection",
    description: "Inspector somehow didn't notice the typo",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 80,
    icon: "🪧",
    tier: 1,
    character: "corrupt-inspector",
  },
  {
    id: "phantom-children-graduated",
    title: "Phantom Children 'Graduate'",
    description: "Ceremony held for kids who never existed",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 45,
    icon: "🎓",
    tier: 2,
  },
  {
    id: "aimee-bock-quote",
    title: "Aimee Bock Defense Interview",
    description: "'I was just trying to help the community'",
    effect: { type: "viewMultiplier", amount: 0.8 },
    duration: 60,
    icon: "🎤",
    tier: 3,
  },
  {
    id: "dubai-wire-successful",
    title: "Dubai Wire Transfer Complete",
    description: "Educational supplies successfully delivered abroad",
    effect: { type: "moneyBonus", flat: 500_000, percent: 0.01 },
    duration: 40,
    icon: "🏙️",
    tier: 2,
  },
  {
    id: "kenya-property-purchased",
    title: "Kenya Property Acquired",
    description: "'Staff housing' for employees who don't exist",
    effect: { type: "moneyBonus", flat: 300_000, percent: 0 },
    duration: 35,
    icon: "🏠",
    tier: 2,
  },
  {
    id: "costco-receipt-accepted",
    title: "Bulk Receipt Approved",
    description: "$50K in snacks for 10,000 meals never served",
    effect: { type: "incomeMultiplier", amount: 1.3 },
    duration: 70,
    icon: "🧾",
    tier: 1,
  },
  {
    id: "naptime-verified",
    title: "Naptime Logs Verified",
    description: "All 99 children confirmed sleeping simultaneously",
    effect: { type: "viewMultiplier", amount: 0.7 },
    duration: 65,
    icon: "😴",
    tier: 1,
  },
  {
    id: "therapy-notes-approved",
    title: "Therapy Notes Approved",
    description: "Copy-pasted from 2019, nobody noticed",
    effect: { type: "incomeMultiplier", amount: 1.2 },
    duration: 55,
    icon: "📝",
    tier: 2,
  },
  {
    id: "wheelchair-shipment",
    title: "Wheelchair Shipment Billed",
    description: "500 wheelchairs to one apartment, legit",
    effect: { type: "moneyBonus", flat: 800_000, percent: 0 },
    duration: 50,
    icon: "🦽",
    tier: 2,
  },
  {
    id: "pca-timesheet-accepted",
    title: "127-Hour Timesheet Approved",
    description: "More hours than exist in a day, no problem",
    effect: { type: "incomeMultiplier", amount: 1.15 },
    duration: 60,
    icon: "⏰",
    tier: 1,
  },
  {
    id: "voter-registration-drive",
    title: "Voter Registration Drive",
    description: "Your phantom children are now registered",
    effect: { type: "viewGain", amount: 400_000 },
    duration: 40,
    icon: "🗳️",
    tier: 2,
  },
  {
    id: "community-protest-support",
    title: "Community Rallies for You",
    description: "Supporters claim investigation is 'harassment'",
    effect: { type: "viewReduction", amount: 1_000_000 },
    duration: 55,
    icon: "✊",
    tier: 2,
  },
  {
    id: "records-destroyed",
    title: "Records 'Accidentally' Destroyed",
    description: "Server crash during backup... what a coincidence",
    effect: { type: "viewReduction", amount: 1_500_000 },
    duration: 60,
    icon: "💥",
    tier: 3,
  },
  {
    id: "witness-recants",
    title: "Key Witness Recants",
    description: "Suddenly can't remember anything",
    effect: { type: "viewMultiplier", amount: 0.65 },
    duration: 70,
    icon: "🤷",
    tier: 3,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - BUREAUCRATIC ABSURDITY
  // ============================================
  {
    id: "99-children-napping",
    title: "99 Children Napping",
    description: "Inspector confirms all 99 kids sleeping at exact same time",
    effect: { type: "viewMultiplier", amount: 0.55 },
    duration: 75,
    icon: "😴",
    tier: 1,
    character: "corrupt-inspector",
  },
  {
    id: "wrong-address",
    title: "Investigators Visit Wrong Address",
    description: "FBI raids a Wendy's instead of your daycare",
    effect: { type: "viewMultiplier", amount: 0.4 },
    duration: 90,
    icon: "🍔",
    tier: 2,
    character: "fbi-agent",
  },
  {
    id: "overtime-paradox",
    title: "168-Hour Work Week Approved",
    description: "Somehow more hours than exist in a week, state pays anyway",
    effect: { type: "incomeMultiplier", amount: 1.4 },
    duration: 60,
    icon: "⏰",
    tier: 2,
  },
  {
    id: "three-buildings-same-address",
    title: "Three Daycares, One Building",
    description: "Each licensed for 99 children. Building is a porta-potty",
    effect: { type: "incomeMultiplier", amount: 1.35 },
    duration: 55,
    icon: "🚽",
    tier: 2,
  },
  {
    id: "attendance-exceeds-population",
    title: "Attendance Exceeds City Population",
    description: "Claimed 50,000 meals in town of 2,000. Approved!",
    effect: { type: "moneyBonus", flat: 1_500_000, percent: 0.02 },
    duration: 45,
    icon: "📈",
    tier: 3,
  },
  {
    id: "twins-born-same-day",
    title: "1,000 'Twins' Born Same Day",
    description: "Remarkable fertility event in Cedar-Riverside",
    effect: { type: "incomeMultiplier", amount: 1.25 },
    duration: 50,
    icon: "👶",
    tier: 2,
  },
  {
    id: "state-database-typo",
    title: "Database Adds Extra Zero",
    description: "You requested $100K, state sent $1M by mistake",
    effect: { type: "moneyBonus", flat: 900_000, percent: 0 },
    duration: 30,
    icon: "💻",
    tier: 2,
  },
  {
    id: "inspector-needs-glasses",
    title: "Inspector Forgot Glasses",
    description: "'Everything looks fine to me!' (Building is on fire)",
    effect: { type: "viewMultiplier", amount: 0.45 },
    duration: 85,
    icon: "👓",
    tier: 1,
    character: "corrupt-inspector",
  },
  {
    id: "form-lost-seven-times",
    title: "Complaint Lost (7th Time)",
    description: "State office has very unfortunate shredder placement",
    effect: { type: "viewReduction", amount: 1_200_000 },
    duration: 55,
    icon: "🗑️",
    tier: 2,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - MEDIA & PUBLIC
  // ============================================
  {
    id: "nick-42-minute-video",
    title: "Nick's 42-Minute Deep Dive",
    description: "More thorough than entire state investigation",
    effect: { type: "viewGain", amount: 5_000_000 },
    duration: 40,
    icon: "📹",
    tier: 4,
    character: "nick-shirley",
  },
  {
    id: "rogan-episode",
    title: "Joe Rogan Episode",
    description: "Three hours discussing Minnesota fraud, elk meat",
    effect: { type: "viewGain", amount: 3_500_000 },
    duration: 35,
    icon: "🎙️",
    tier: 4,
  },
  {
    id: "reddit-ama",
    title: "Former Employee AMA",
    description: "'I was told to bill for invisible children'",
    effect: { type: "viewGain", amount: 1_000_000 },
    duration: 45,
    icon: "👽",
    tier: 3,
  },
  {
    id: "snl-cold-open",
    title: "SNL Cold Open",
    description: "Kate McKinnon plays Aimee Bock, it's devastating",
    effect: { type: "viewGain", amount: 2_500_000 },
    duration: 30,
    icon: "🎭",
    tier: 4,
  },
  {
    id: "last-week-tonight",
    title: "Last Week Tonight Segment",
    description: "John Oliver spends 22 minutes on the absurdity",
    effect: { type: "viewGain", amount: 4_000_000 },
    duration: 45,
    icon: "📺",
    tier: 4,
  },
  {
    id: "true-crime-podcast-series",
    title: "True Crime 12-Part Series",
    description: "Each episode more unbelievable than the last",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 60,
    icon: "🎧",
    tier: 4,
  },
  {
    id: "twitter-ratio",
    title: "Walz Gets Ratio'd",
    description: "Governor's defense tweet has 47 likes, 200K quote tweets",
    effect: { type: "viewGain", amount: 800_000 },
    duration: 25,
    icon: "🐦",
    tier: 3,
    character: "tim-walz",
  },
  {
    id: "meme-goes-viral",
    title: "'Quality LEARING' Becomes Meme",
    description: "The misspelled sign is everywhere now",
    effect: { type: "viewGain", amount: 1_500_000 },
    duration: 35,
    icon: "🪧",
    tier: 3,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - POLITICAL ABSURDITY
  // ============================================
  {
    id: "task-force-announces-task-force",
    title: "Task Force Forms Task Force",
    description: "New committee to oversee the oversight committee",
    effect: { type: "viewMultiplier", amount: 0.7 },
    duration: 80,
    icon: "📋",
    tier: 3,
    character: "tim-walz",
  },
  {
    id: "bipartisan-strongly-worded-letter",
    title: "Strongly Worded Letter Sent",
    description: "Both parties agree someone should be concerned",
    effect: { type: "nothing" },
    duration: 60,
    icon: "✉️",
    tier: 2,
  },
  {
    id: "too-trusting-defense",
    title: "'Culture of Trust' Defense",
    description: "Walz: 'We were simply too nice to criminals'",
    effect: { type: "viewMultiplier", amount: 0.75 },
    duration: 70,
    icon: "🤗",
    tier: 3,
    character: "tim-walz",
  },
  {
    id: "robust-oversight-announcement",
    title: "'Robust Oversight' (Again)",
    description: "17th press conference promising reform",
    effect: { type: "viewMultiplier", amount: 0.8 },
    duration: 50,
    icon: "🎤",
    tier: 2,
    character: "tim-walz",
  },
  {
    id: "accountability-postponed",
    title: "Accountability Postponed",
    description: "Investigation timeline extended by 18 months",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 100,
    icon: "📅",
    tier: 3,
  },
  {
    id: "new-director-quits",
    title: "New Director Quits Day 1",
    description: "Anti-fraud chief resigns after seeing the numbers",
    effect: { type: "viewMultiplier", amount: 0.55 },
    duration: 85,
    icon: "🚪",
    tier: 2,
  },
  {
    id: "legislators-shocked",
    title: "Legislators Express Shock",
    description: "Lawmakers stunned by fraud they funded for 6 years",
    effect: { type: "nothing" },
    duration: 45,
    icon: "😲",
    tier: 3,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - MONEY LAUNDERING COMEDY
  // ============================================
  {
    id: "kenya-mansion-complete",
    title: "Nairobi Mansion Complete",
    description: "'Educational materials storage facility' has 12 bedrooms",
    effect: { type: "moneyBonus", flat: 2_000_000, percent: 0.01 },
    duration: 50,
    icon: "🏰",
    tier: 3,
  },
  {
    id: "mercedes-fleet-delivered",
    title: "School Supply Vehicles Arrive",
    description: "7 Mercedes AMGs for 'educational transport'",
    effect: { type: "moneyBonus", flat: 800_000, percent: 0 },
    duration: 40,
    icon: "🚗",
    tier: 3,
  },
  {
    id: "rolex-conference",
    title: "Professional Development Watches",
    description: "Staff needs $50K Rolexes for 'timekeeping purposes'",
    effect: { type: "moneyBonus", flat: 500_000, percent: 0 },
    duration: 35,
    icon: "⌚",
    tier: 2,
  },
  {
    id: "hawala-express",
    title: "Hawala Network Upgrade",
    description: "Money now reaches Kenya in under 4 hours",
    effect: { type: "incomeMultiplier", amount: 1.3 },
    duration: 65,
    icon: "💱",
    tier: 3,
  },
  {
    id: "turkish-beach-retreat",
    title: "Staff Training in Turkey",
    description: "All-inclusive resort for 'cultural competency'",
    effect: { type: "moneyBonus", flat: 600_000, percent: 0 },
    duration: 40,
    icon: "🏖️",
    tier: 2,
  },
  {
    id: "designer-uniforms",
    title: "Staff Uniform Upgrade",
    description: "Gucci scrubs for childcare workers, $8K each",
    effect: { type: "moneyBonus", flat: 400_000, percent: 0 },
    duration: 30,
    icon: "👔",
    tier: 2,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - INVESTIGATION COMEDY
  // ============================================
  {
    id: "cooperator-memory-loss",
    title: "Cooperator Develops Amnesia",
    description: "Key witness suddenly can't recall past 7 years",
    effect: { type: "viewMultiplier", amount: 0.6 },
    duration: 75,
    icon: "🤔",
    tier: 3,
  },
  {
    id: "evidence-flood",
    title: "Evidence Room Floods",
    description: "Sprinkler system activates on fraud documents only",
    effect: { type: "viewReduction", amount: 2_000_000 },
    duration: 65,
    icon: "💧",
    tier: 3,
  },
  {
    id: "laptop-stolen",
    title: "Investigator's Laptop Stolen",
    description: "Thieves somehow knew which coffee shop to visit",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 80,
    icon: "💻",
    tier: 2,
  },
  {
    id: "translation-delays",
    title: "Translation Delays",
    description: "Court can't find Somali translator, case delayed 6 months",
    effect: { type: "viewMultiplier", amount: 0.55 },
    duration: 100,
    icon: "🗣️",
    tier: 3,
  },
  {
    id: "jurisdiction-confusion",
    title: "Jurisdiction Dispute",
    description: "State and feds argue about who has to do the work",
    effect: { type: "viewMultiplier", amount: 0.65 },
    duration: 70,
    icon: "⚖️",
    tier: 2,
  },
  {
    id: "printer-jam",
    title: "Critical Printer Jam",
    description: "Indictment stuck in printer for 3 weeks",
    effect: { type: "viewMultiplier", amount: 0.7 },
    duration: 55,
    icon: "🖨️",
    tier: 2,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - SCALE OF FRAUD
  // ============================================
  {
    id: "half-of-eighteen-billion",
    title: "Half of $18 Billion Missing",
    description: "State: 'We're looking into it'",
    effect: { type: "viewGain", amount: 6_000_000 },
    duration: 50,
    icon: "💰",
    tier: 4,
  },
  {
    id: "gao-report-released",
    title: "GAO Report Released",
    description: "'Significant deficiencies' is putting it mildly",
    effect: { type: "viewGain", amount: 3_000_000 },
    duration: 45,
    icon: "📊",
    tier: 4,
  },
  {
    id: "fraud-exceeds-budget",
    title: "Fraud Exceeds State Budget",
    description: "More stolen than entire education funding",
    effect: { type: "viewGain", amount: 2_500_000 },
    duration: 40,
    icon: "📉",
    tier: 4,
  },
  {
    id: "largest-in-history",
    title: "'Largest in American History'",
    description: "At least you're #1 at something",
    effect: { type: "viewGain", amount: 4_000_000 },
    duration: 35,
    icon: "🏆",
    tier: 4,
  },
  {
    id: "recovery-update",
    title: "$60M of $9B Recovered",
    description: "That's 0.67%. State calls it 'progress'",
    effect: { type: "viewGain", amount: 1_500_000 },
    duration: 45,
    icon: "🎯",
    tier: 4,
  },

  // ============================================
  // NEW SATIRICAL EVENTS - FEEDING OUR FUTURE
  // ============================================
  {
    id: "aimee-bock-quote-2",
    title: "Aimee Bock Interview Resurfaces",
    description: "'I was just feeding the children!' (she wasn't)",
    effect: { type: "viewGain", amount: 900_000 },
    duration: 40,
    icon: "🎤",
    tier: 3,
  },
  {
    id: "28-year-sentence",
    title: "28-Year Sentence Handed Down",
    description: "Aimee Bock finds out, doesn't like it",
    effect: { type: "viewGain", amount: 3_000_000 },
    duration: 35,
    icon: "⚖️",
    tier: 4,
  },
  {
    id: "empty-kitchen-photos",
    title: "Kitchen Photos Surface",
    description: "Claimed 10,000 daily meals. Kitchen has no stove",
    effect: { type: "viewGain", amount: 1_200_000 },
    duration: 40,
    icon: "🍳",
    tier: 3,
  },
  {
    id: "bulk-receipt-scandal",
    title: "Costco Receipt Analyzed",
    description: "$47K in 'meal supplies' was actually furniture",
    effect: { type: "viewGain", amount: 800_000 },
    duration: 35,
    icon: "🧾",
    tier: 2,
  },
  {
    id: "feeding-site-was-nightclub",
    title: "Feeding Site Was Nightclub",
    description: "Free meals served at 2 AM to adults only",
    effect: { type: "viewGain", amount: 1_000_000 },
    duration: 40,
    icon: "🎉",
    tier: 3,
  },
  {
    id: "57-convictions-and-counting",
    title: "57 Convictions and Counting",
    description: "New plea deal announced, more to come",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 45,
    icon: "📋",
    tier: 4,
  },

  // ============================================
  // NEW EVENTS - RANDOM CHAOS
  // ============================================
  {
    id: "intern-finds-fraud",
    title: "Summer Intern Finds Fraud",
    description: "Week 2 discovery that took state 6 years",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 35,
    icon: "👩‍💻",
    tier: 2,
  },
  {
    id: "excel-spreadsheet-limit",
    title: "Excel Row Limit Reached",
    description: "Fraud so extensive it breaks Microsoft Excel",
    effect: { type: "viewGain", amount: 700_000 },
    duration: 30,
    icon: "📊",
    tier: 3,
  },
  {
    id: "blockchain-excuse",
    title: "'It Was on the Blockchain'",
    description: "Defense attorney tries tech excuse, fails spectacularly",
    effect: { type: "viewGain", amount: 400_000 },
    duration: 25,
    icon: "₿",
    tier: 2,
  },
  {
    id: "ai-defense",
    title: "'AI Did It' Defense",
    description: "Defendant blames ChatGPT for forging documents",
    effect: { type: "viewGain", amount: 600_000 },
    duration: 30,
    icon: "🤖",
    tier: 3,
  },
  {
    id: "google-maps-evidence",
    title: "Google Street View Evidence",
    description: "Satellite shows empty building for 4 years straight",
    effect: { type: "viewGain", amount: 1_100_000 },
    duration: 40,
    icon: "🛰️",
    tier: 3,
    character: "nick-shirley",
  },
  {
    id: "yelp-reviews",
    title: "Yelp Reviews Surface",
    description: "'Great daycare, but I've never seen a child here' ⭐⭐⭐",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 35,
    icon: "⭐",
    tier: 2,
  },
  {
    id: "neighbors-interview",
    title: "Neighbor Interview Goes Viral",
    description: "'Kids? At the daycare? Never seen any'",
    effect: { type: "viewGain", amount: 900_000 },
    duration: 40,
    icon: "🏠",
    tier: 2,
    character: "nick-shirley",
  },
];

// Tier thresholds based on total earned (matching zone unlock costs)
// Tier 1: $0 - $600K (early game - daycare, food-program, housing zones)
// Tier 2: $600K - $35M (mid game - autism, medicaid, refugee-services zones)
// Tier 3: $35M - $200M (late game - political, nonprofit-empire zones)
// Tier 4: $200M+ (endgame - the-network, shadow-banking, state-capture zones)
const TIER_THRESHOLDS = [0, 600_000, 35_000_000, 200_000_000];

/**
 * Get the current tier (1-4) based on total money earned
 */
export const getPlayerTier = (totalEarned: number): 1 | 2 | 3 | 4 => {
  if (totalEarned >= TIER_THRESHOLDS[3]) return 4;
  if (totalEarned >= TIER_THRESHOLDS[2]) return 3;
  if (totalEarned >= TIER_THRESHOLDS[1]) return 2;
  return 1;
};

/**
 * Get a random event appropriate for the player's current progress
 * - Events can trigger at their tier or any lower tier (higher progress)
 * - e.g., Tier 2 event can trigger when player is at Tier 2, 3, or 4
 * - Tier 4 events only trigger at endgame
 */
export const getRandomEventForProgress = (totalEarned: number): PoliticalEvent => {
  const playerTier = getPlayerTier(totalEarned);
  
  // Filter events that can happen at this tier
  // Event tier must be <= player tier (higher tier = later game)
  const eligibleEvents = POLITICAL_EVENTS.filter(e => e.tier <= playerTier);
  
  // If somehow no events (shouldn't happen), fallback to all
  if (eligibleEvents.length === 0) {
    return POLITICAL_EVENTS[Math.floor(Math.random() * POLITICAL_EVENTS.length)];
  }
  
  // Weight towards higher-tier events as player progresses
  // This makes late-game events more common when you're in late game
  const weightedEvents: PoliticalEvent[] = [];
  for (const event of eligibleEvents) {
    // Events at player's current tier get 3x weight
    // Events one tier below get 2x weight  
    // Events two+ tiers below get 1x weight
    const tierDiff = playerTier - event.tier;
    const weight = tierDiff === 0 ? 3 : tierDiff === 1 ? 2 : 1;
    for (let i = 0; i < weight; i++) {
      weightedEvents.push(event);
    }
  }
  
  return weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
};

/** @deprecated Use getRandomEventForProgress instead for proper scaling */
export const getRandomEvent = (): PoliticalEvent =>
  POLITICAL_EVENTS[Math.floor(Math.random() * POLITICAL_EVENTS.length)];
