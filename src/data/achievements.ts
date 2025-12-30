export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: Achievement.Condition;
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
    | { type: "acquitted" };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Nick Shirley Achievements
  {
    id: "camera-shy",
    name: "Camera Shy",
    description: "Operate for 5 minutes without Nick Shirley finding you",
    icon: "📷",
    condition: { type: "fakeClaims", amount: 100 },
  },
  {
    id: "the-42-minutes",
    name: "The 42 Minutes",
    description: "Survive as long as Nick Shirley's video",
    icon: "⏱️",
    condition: { type: "fakeClaims", amount: 500 },
  },
  {
    id: "100-million-views",
    name: "100 Million Views",
    description: "Get caught at maximum viral level",
    icon: "📈",
    condition: { type: "viralViews", amount: 100_000_000 },
  },

  // Real Reference Achievements
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
    description: "Get raided but keep operating (reach $1M after arrest)",
    icon: "🔄",
    condition: { type: "totalEarned", amount: 1_000_000 },
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

  // Money Milestones
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
    id: "shirley-exposure",
    name: "Nick Shirley's Discovery",
    description: "Steal $110M (what he exposed in one day)",
    icon: "📹",
    condition: { type: "totalEarned", amount: 110_000_000 },
  },

  // Zone Achievements
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
    id: "diversified-portfolio",
    name: "Diversified Portfolio",
    description: "Run fraud in all 4 zones simultaneously",
    icon: "📊",
    condition: { type: "allZonesUnlocked" },
  },

  // Viral Milestones
  {
    id: "local-news",
    name: "Local News Story",
    description: "Reach 1 million viral views",
    icon: "📺",
    condition: { type: "viralViews", amount: 1_000_000 },
  },
  {
    id: "national-story",
    name: "National Story",
    description: "Reach 10 million viral views",
    icon: "🌎",
    condition: { type: "viralViews", amount: 10_000_000 },
  },
  {
    id: "going-viral",
    name: "Going Viral",
    description: "Reach 50 million viral views",
    icon: "🔥",
    condition: { type: "viralViews", amount: 50_000_000 },
  },

  // Trial Achievements
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
];

