export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: Achievement.Condition;
  secret?: boolean;
};

export namespace Achievement {
  export type Condition =
    | { type: "totalEarned"; amount: number }
    | { type: "viralViews"; amount: number }
    | { type: "fakeClaims"; amount: number }
    | { type: "zoneUnlocked"; zone: string }
    | { type: "upgradeOwned"; upgrade: string; count: number }
    | { type: "allZonesUnlocked" }
    | { type: "arrested" }
    | { type: "maxSentence" }
    | { type: "acquitted" }
    | { type: "goldenClaimsCaught"; amount: number }
    | { type: "prestigeLevel"; level: number }
    | { type: "speedWin"; maxTimeMs: number }
    | { type: "carefulWin"; maxThreatLevel: string }
    | { type: "prestigeEarned"; amount: number }
    | { type: "playTime"; minTimeMs: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ============================================
  // NICK SHIRLEY ACHIEVEMENTS
  // ============================================
  {
    id: "camera-shy",
    name: "Camera Shy",
    description: "Operate for 5 minutes without Nick Shirley finding you",
    icon: "📷",
    condition: { type: "playTime", minTimeMs: 5 * 60 * 1000 },
  },
  {
    id: "the-42-minutes",
    name: "The 42 Minutes",
    description: "Survive as long as Nick Shirley's video",
    icon: "⏱️",
    condition: { type: "playTime", minTimeMs: 42 * 60 * 1000 },
  },
  {
    id: "100-million-views",
    name: "100 Million Views",
    description: "Get caught at maximum viral level",
    icon: "📈",
    condition: { type: "viralViews", amount: 100_000_000 },
  },

  // ============================================
  // REAL REFERENCE ACHIEVEMENTS
  // ============================================
  {
    id: "quality-learing",
    name: "Quality Learing",
    description: "Buy the misspelled sign upgrade",
    icon: "🪧",
    condition: { type: "upgradeOwned", upgrade: "misspelled-sign", count: 1 },
  },
  {
    id: "licensed-for-99",
    name: "Licensed for 99",
    description: "Claim 99 phantom children in one session",
    icon: "👻",
    condition: { type: "fakeClaims", amount: 99 },
  },
  {
    id: "baraka-method",
    name: "The Baraka Method",
    description: "Get raided but keep operating (reach $5M after arrest)",
    icon: "🔄",
    condition: { type: "prestigeEarned", amount: 5_000_000 },
  },
  {
    id: "nine-billion-club",
    name: "The $9 Billion Club",
    description: "Steal the full estimated fraud amount",
    icon: "💰",
    condition: { type: "totalEarned", amount: 9_000_000_000 },
  },
  {
    id: "28-years",
    name: "28 Years",
    description: "Receive maximum sentence",
    icon: "⛓️",
    condition: { type: "maxSentence" },
  },

  // ============================================
  // MONEY MILESTONES
  // ============================================
  {
    id: "first-million",
    name: "First Million",
    description: "Steal your first $1,000,000",
    icon: "💵",
    condition: { type: "totalEarned", amount: 1_000_000 },
  },
  {
    id: "quality-learning-money",
    name: "Quality Learning Center",
    description: "Match the $1.9M the real center received",
    icon: "🏚️",
    condition: { type: "totalEarned", amount: 1_900_000 },
  },
  {
    id: "ten-million",
    name: "Eight Figures",
    description: "Steal $10,000,000",
    icon: "💎",
    condition: { type: "totalEarned", amount: 10_000_000 },
  },
  {
    id: "fifty-million",
    name: "Fifty Million",
    description: "Steal $50,000,000",
    icon: "💸",
    condition: { type: "totalEarned", amount: 50_000_000 },
  },
  {
    id: "hundred-million",
    name: "Hundred Millionaire",
    description: "Steal $100,000,000",
    icon: "💎",
    condition: { type: "totalEarned", amount: 100_000_000 },
  },
  {
    id: "shirley-exposure",
    name: "Nick Shirley's Discovery",
    description: "Steal $110M (what he exposed in one day)",
    icon: "📹",
    condition: { type: "totalEarned", amount: 110_000_000 },
  },
  {
    id: "quarter-billion",
    name: "Quarter Billion",
    description: "Steal $250,000,000",
    icon: "🏦",
    condition: { type: "totalEarned", amount: 250_000_000 },
  },
  {
    id: "half-billion",
    name: "Half Billion",
    description: "Steal $500,000,000",
    icon: "🏛️",
    condition: { type: "totalEarned", amount: 500_000_000 },
  },
  {
    id: "billionaire",
    name: "Fraud Billionaire",
    description: "Steal $1,000,000,000",
    icon: "🤑",
    condition: { type: "totalEarned", amount: 1_000_000_000 },
  },
  {
    id: "five-billion",
    name: "Halfway There",
    description: "Steal $5,000,000,000 (halfway to victory)",
    icon: "📈",
    condition: { type: "totalEarned", amount: 5_000_000_000 },
  },

  // ============================================
  // ZONE ACHIEVEMENTS
  // ============================================
  {
    id: "food-program-unlocked",
    name: "Feeding Our Fraud",
    description: "Unlock the Food Program zone",
    icon: "🍽️",
    condition: { type: "zoneUnlocked", zone: "food-program" },
  },
  {
    id: "housing-crisis",
    name: "Housing Crisis",
    description: "Unlock the Housing Fraud zone",
    icon: "🏠",
    condition: { type: "zoneUnlocked", zone: "housing" },
  },
  {
    id: "spectrum-of-fraud",
    name: "Spectrum of Fraud",
    description: "Unlock the Autism Services zone",
    icon: "🧠",
    condition: { type: "zoneUnlocked", zone: "autism" },
  },
  {
    id: "full-medicaid",
    name: "Full Medicaid",
    description: "Unlock the Medicaid Empire zone",
    icon: "🏥",
    condition: { type: "zoneUnlocked", zone: "medicaid" },
  },
  {
    id: "refugee-unlocked",
    name: "Resettlement Racket",
    description: "Unlock the Refugee Services zone",
    icon: "🌍",
    condition: { type: "zoneUnlocked", zone: "refugee-services" },
  },
  {
    id: "political-machine",
    name: "Political Machine",
    description: "Unlock the Political Machine zone",
    icon: "🏛️",
    condition: { type: "zoneUnlocked", zone: "political" },
  },
  {
    id: "nonprofit-unlocked",
    name: "Non-Prophet",
    description: "Unlock the Nonprofit Empire zone",
    icon: "🎗️",
    condition: { type: "zoneUnlocked", zone: "nonprofit-empire" },
  },
  {
    id: "the-network-unlocked",
    name: "The Network",
    description: "Unlock the endgame Network zone",
    icon: "🕸️",
    condition: { type: "zoneUnlocked", zone: "endgame" },
  },
  {
    id: "shadow-banking-unlocked",
    name: "Shadow Banker",
    description: "Unlock the Shadow Banking zone",
    icon: "🏦",
    condition: { type: "zoneUnlocked", zone: "shadow-banking" },
  },
  {
    id: "state-capture-unlocked",
    name: "You Are The State",
    description: "Unlock the Complete State Capture zone",
    icon: "👑",
    condition: { type: "zoneUnlocked", zone: "state-capture" },
  },
  {
    id: "diversified-portfolio",
    name: "Diversified Portfolio",
    description: "Run fraud in all zones simultaneously",
    icon: "📊",
    condition: { type: "allZonesUnlocked" },
  },

  // ============================================
  // VIRAL MILESTONES
  // ============================================
  {
    id: "local-news",
    name: "Local News Story",
    description: "Reach 1 million viral views",
    icon: "📺",
    condition: { type: "viralViews", amount: 1_000_000 },
  },
  {
    id: "regional-story",
    name: "Regional Story",
    description: "Reach 5 million viral views",
    icon: "📡",
    condition: { type: "viralViews", amount: 5_000_000 },
  },
  {
    id: "national-story",
    name: "National Story",
    description: "Reach 10 million viral views",
    icon: "🌎",
    condition: { type: "viralViews", amount: 10_000_000 },
  },
  {
    id: "jd-vance-tweet",
    name: "Tweeted by JD Vance",
    description: "Reach 25 million viral views",
    icon: "🐦",
    condition: { type: "viralViews", amount: 25_000_000 },
  },
  {
    id: "going-viral",
    name: "Going Viral",
    description: "Reach 50 million viral views",
    icon: "🔥",
    condition: { type: "viralViews", amount: 50_000_000 },
  },
  {
    id: "kristi-noem",
    name: "Kristi Noem Mentioned You",
    description: "Reach 75 million viral views and survive",
    icon: "👩‍⚖️",
    condition: { type: "viralViews", amount: 75_000_000 },
  },
  {
    id: "close-call",
    name: "Close Call",
    description: "Reach 90 million views and survive",
    icon: "😰",
    condition: { type: "viralViews", amount: 90_000_000 },
    secret: true,
  },

  // ============================================
  // TRIAL ACHIEVEMENTS
  // ============================================
  {
    id: "first-arrest",
    name: "First Arrest",
    description: "Get arrested for the first time",
    icon: "🚔",
    condition: { type: "arrested" },
  },
  {
    id: "got-off",
    name: "Got Off",
    description: "Get acquitted at trial",
    icon: "⚖️",
    condition: { type: "acquitted" },
  },

  // ============================================
  // SPEED ACHIEVEMENTS
  // ============================================
  {
    id: "speed-run",
    name: "Speed Run",
    description: "Win in under 20 minutes",
    icon: "⚡",
    condition: { type: "speedWin", maxTimeMs: 20 * 60 * 1000 },
    secret: true,
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Win in under 15 minutes",
    icon: "🏎️",
    condition: { type: "speedWin", maxTimeMs: 15 * 60 * 1000 },
    secret: true,
  },
  {
    id: "slow-and-steady",
    name: "Slow and Steady",
    description: "File 10,000 fake claims",
    icon: "🐢",
    condition: { type: "fakeClaims", amount: 10_000 },
  },

  // ============================================
  // GOLDEN CLAIM ACHIEVEMENTS
  // ============================================
  {
    id: "golden-touch",
    name: "Golden Touch",
    description: "Catch 10 golden claims",
    icon: "✨",
    condition: { type: "goldenClaimsCaught", amount: 10 },
  },
  {
    id: "claim-hunter",
    name: "Claim Hunter",
    description: "Catch 50 golden claims",
    icon: "🏹",
    condition: { type: "goldenClaimsCaught", amount: 50 },
  },
  {
    id: "gold-digger",
    name: "Gold Digger",
    description: "Catch 100 golden claims",
    icon: "⛏️",
    condition: { type: "goldenClaimsCaught", amount: 100 },
  },
  {
    id: "golden-empire",
    name: "Golden Empire",
    description: "Catch 250 golden claims",
    icon: "👑",
    condition: { type: "goldenClaimsCaught", amount: 250 },
  },

  // ============================================
  // PRESTIGE ACHIEVEMENTS
  // ============================================
  {
    id: "repeat-offender",
    name: "Repeat Offender",
    description: "Get arrested 3 times",
    icon: "🔄",
    condition: { type: "prestigeLevel", level: 3 },
  },
  {
    id: "career-criminal",
    name: "Career Criminal",
    description: "Get arrested 5 times",
    icon: "👔",
    condition: { type: "prestigeLevel", level: 5 },
  },
  {
    id: "serial-fraudster",
    name: "Serial Fraudster",
    description: "Get arrested 7 times",
    icon: "📜",
    condition: { type: "prestigeLevel", level: 7 },
  },
  {
    id: "untouchable",
    name: "Untouchable",
    description: "Get arrested 10 times",
    icon: "🌟",
    condition: { type: "prestigeLevel", level: 10 },
  },

  // ============================================
  // UPGRADE COLLECTION ACHIEVEMENTS
  // ============================================
  {
    id: "aimee-bock-student",
    name: "Student of Aimee Bock",
    description: "Buy The Aimee Bock Method upgrade",
    icon: "🎓",
    condition: { type: "upgradeOwned", upgrade: "aimee-bock-method", count: 1 },
  },
  {
    id: "crypto-bro",
    name: "Crypto Bro",
    description: "Buy the Crypto Laundering upgrade",
    icon: "₿",
    condition: { type: "upgradeOwned", upgrade: "crypto-laundering", count: 1 },
  },
  {
    id: "senator-on-payroll",
    name: "Senator on Payroll",
    description: "Buy the State Senator upgrade",
    icon: "🎩",
    condition: { type: "upgradeOwned", upgrade: "state-senator", count: 1 },
  },
  {
    id: "doj-immunity",
    name: "DOJ Immunity",
    description: "Buy the DOJ Contact upgrade",
    icon: "⚖️",
    condition: { type: "upgradeOwned", upgrade: "doj-contact", count: 1 },
  },
  {
    id: "international-fugitive",
    name: "International Fugitive",
    description: "Buy the International Connections upgrade",
    icon: "🌍",
    condition: { type: "upgradeOwned", upgrade: "international-connections", count: 1 },
  },
  {
    id: "super-pac-player",
    name: "Super PAC Player",
    description: "Buy the Super PAC upgrade",
    icon: "💼",
    condition: { type: "upgradeOwned", upgrade: "super-pac", count: 1 },
  },
  {
    id: "lobbyist-connections",
    name: "Lobbyist Connections",
    description: "Buy the Lobbyist Army upgrade",
    icon: "🦅",
    condition: { type: "upgradeOwned", upgrade: "lobbyist-army", count: 1 },
  },
  {
    id: "bought-legislature",
    name: "Bought the Legislature",
    description: "Buy the Legislative Capture upgrade",
    icon: "📜",
    condition: { type: "upgradeOwned", upgrade: "legislative-capture", count: 1 },
  },
  {
    id: "ballot-boss",
    name: "Ballot Boss",
    description: "Buy the Ballot Harvesting upgrade",
    icon: "🗳️",
    condition: { type: "upgradeOwned", upgrade: "ballot-harvesting", count: 1 },
  },
  {
    id: "immunity-achieved",
    name: "Immunity Achieved",
    description: "Buy the Immunity Deal upgrade",
    icon: "🛡️",
    condition: { type: "upgradeOwned", upgrade: "immunity-deal", count: 1 },
  },
  {
    id: "silenced-truth",
    name: "Silenced the Truth",
    description: "Buy the Whistleblower Silencer upgrade",
    icon: "🤐",
    condition: { type: "upgradeOwned", upgrade: "whistleblower-silencer", count: 1 },
  },
  {
    id: "media-blackout",
    name: "Media Blackout",
    description: "Buy the Media Suppression upgrade",
    icon: "📵",
    condition: { type: "upgradeOwned", upgrade: "media-suppression", count: 1 },
  },
  {
    id: "hawala-master",
    name: "Hawala Master",
    description: "Buy the Hawala Network upgrade",
    icon: "💱",
    condition: { type: "upgradeOwned", upgrade: "hawala-network", count: 1 },
  },
  {
    id: "governor-bought",
    name: "The Governor's Yours",
    description: "Buy the Governor on Payroll upgrade",
    icon: "👑",
    condition: { type: "upgradeOwned", upgrade: "governor-on-payroll", count: 1 },
  },
  {
    id: "total-immunity-achieved",
    name: "Above The Law",
    description: "Buy the Total Immunity upgrade",
    icon: "🛡️",
    condition: { type: "upgradeOwned", upgrade: "total-immunity", count: 1 },
  },

  // ============================================
  // DARK SATIRE / SECRET ACHIEVEMENTS
  // ============================================
  {
    id: "al-shabaab-joke",
    name: "Educational Supplies",
    description: "Wire $10M overseas for 'curriculum development'",
    icon: "📦",
    condition: { type: "totalEarned", amount: 10_000_000 },
    secret: true,
  },
  {
    id: "phantom-voter",
    name: "Phantom Voter",
    description: "Your phantom toddlers are now registered to vote",
    icon: "🗳️",
    condition: { type: "fakeClaims", amount: 5_000 },
    secret: true,
  },
  {
    id: "embassy-row",
    name: "Embassy Row",
    description: "Your lawyer is negotiating with 3 countries",
    icon: "🏛️",
    condition: { type: "prestigeLevel", level: 7 },
    secret: true,
  },
  {
    id: "ghost-operator",
    name: "Ghost Operator",
    description: "File 100,000 fake claims",
    icon: "👻",
    condition: { type: "fakeClaims", amount: 100_000 },
    secret: true,
  },

  // ============================================
  // STRATEGIC ACHIEVEMENTS
  // ============================================
  {
    id: "careful-criminal",
    name: "Careful Criminal",
    description: "Win without ever reaching 'viral' threat level (50M views)",
    icon: "🎭",
    condition: { type: "carefulWin", maxThreatLevel: "national-story" },
  },
  {
    id: "first-victory",
    name: "First Victory",
    description: "Win the game for the first time",
    icon: "🏆",
    condition: { type: "totalEarned", amount: 9_000_000_000 },
  },

  // ============================================
  // CLAIM MILESTONES
  // ============================================
  {
    id: "hundred-claims",
    name: "Getting Started",
    description: "File 100 fake claims",
    icon: "📝",
    condition: { type: "fakeClaims", amount: 100 },
  },
  {
    id: "thousand-claims",
    name: "Paperwork Pro",
    description: "File 1,000 fake claims",
    icon: "📋",
    condition: { type: "fakeClaims", amount: 1_000 },
  },
  {
    id: "five-thousand-claims",
    name: "Bureaucratic Master",
    description: "File 5,000 fake claims",
    icon: "🗂️",
    condition: { type: "fakeClaims", amount: 5_000 },
  },
  {
    id: "twenty-thousand-claims",
    name: "Industrial Scale",
    description: "File 20,000 fake claims",
    icon: "🏭",
    condition: { type: "fakeClaims", amount: 20_000 },
  },
  {
    id: "fifty-thousand-claims",
    name: "Fraud Factory",
    description: "File 50,000 fake claims",
    icon: "⚙️",
    condition: { type: "fakeClaims", amount: 50_000 },
  },
];
