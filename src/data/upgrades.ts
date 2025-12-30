export type UpgradeEffect =
  | { type: "passiveIncome"; amount: number }
  | { type: "clickBonus"; amount: number }
  | { type: "clickMultiplier"; amount: number }
  | { type: "viewReduction"; amount: number }
  | { type: "viewDecay"; amount: number }
  | { type: "zoneMultiplier"; zone: string; amount: number };

export type Upgrade = {
  id: string;
  zone: string;
  name: string;
  description: string;
  flavorText: string;
  baseCost: number;
  costMultiplier: number;
  effect: UpgradeEffect;
  icon: string;
};

export const UPGRADES: Upgrade[] = [
  // DAYCARE ZONE
  {
    id: "misspelled-sign",
    zone: "daycare",
    name: "Misspelled Sign",
    description: "-10% viral views gain",
    flavorText: "Quality LEARING Center - nobody notices",
    baseCost: 100,
    costMultiplier: 1.5,
    effect: { type: "viewReduction", amount: 0.1 },
    icon: "🪧",
  },
  {
    id: "empty-building",
    zone: "daycare",
    name: "Empty Building",
    description: "+$1/sec passive income",
    flavorText: "Licensed for 99 kids. Current occupancy: 0",
    baseCost: 500,
    costMultiplier: 1.15,
    effect: { type: "passiveIncome", amount: 1 },
    icon: "🏚️",
  },
  {
    id: "phantom-toddlers",
    zone: "daycare",
    name: "Phantom Toddlers",
    description: "+$5 per click",
    flavorText: "They exist on paper, and that's what counts",
    baseCost: 2000,
    costMultiplier: 1.18,
    effect: { type: "clickBonus", amount: 5 },
    icon: "👻",
  },
  {
    id: "tinted-windows",
    zone: "daycare",
    name: "Tinted Windows",
    description: "-25% viral views gain",
    flavorText: "Nick Shirley can't film inside",
    baseCost: 5000,
    costMultiplier: 1.4,
    effect: { type: "viewReduction", amount: 0.25 },
    icon: "🪟",
  },
  {
    id: "fake-naptime-logs",
    zone: "daycare",
    name: "Fake Naptime Logs",
    description: "+$10/sec passive income",
    flavorText: "All 99 children napping simultaneously, every day",
    baseCost: 10000,
    costMultiplier: 1.2,
    effect: { type: "passiveIncome", amount: 10 },
    icon: "📝",
  },
  {
    id: "emergency-children",
    zone: "daycare",
    name: "Emergency Children",
    description: "-40% viral views gain",
    flavorText: "Rent kids for inspector visits - they'll never know",
    baseCost: 25000,
    costMultiplier: 1.6,
    effect: { type: "viewReduction", amount: 0.4 },
    icon: "🧒",
  },
  {
    id: "complicit-inspector",
    zone: "daycare",
    name: "Complicit Inspector",
    description: "Views decay over time",
    flavorText: "Somehow always finds children present",
    baseCost: 50000,
    costMultiplier: 2.0,
    effect: { type: "viewDecay", amount: 1000 },
    icon: "🤫",
  },
  {
    id: "shell-company",
    zone: "daycare",
    name: "Shell Company",
    description: "2x click multiplier",
    flavorText: "Quality Learning Center LLC",
    baseCost: 100000,
    costMultiplier: 2.5,
    effect: { type: "clickMultiplier", amount: 2 },
    icon: "🐚",
  },

  // HOUSING ZONE
  {
    id: "po-box-addresses",
    zone: "housing",
    name: "P.O. Box Addresses",
    description: "+$25/sec passive income",
    flavorText: "Claim vouchers for mailboxes",
    baseCost: 75000,
    costMultiplier: 1.2,
    effect: { type: "passiveIncome", amount: 25 },
    icon: "📬",
  },
  {
    id: "fake-landlord",
    zone: "housing",
    name: "Fake Landlord LLC",
    description: "+$20 per click",
    flavorText: "You're the tenant AND the landlord",
    baseCost: 150000,
    costMultiplier: 1.25,
    effect: { type: "clickBonus", amount: 20 },
    icon: "🏘️",
  },
  {
    id: "section-8-insider",
    zone: "housing",
    name: "Section 8 Insider",
    description: "-30% viral views gain",
    flavorText: "Early warning on audits",
    baseCost: 300000,
    costMultiplier: 1.5,
    effect: { type: "viewReduction", amount: 0.3 },
    icon: "🕴️",
  },
  {
    id: "property-photos",
    zone: "housing",
    name: "Stock Property Photos",
    description: "+$100/sec passive income",
    flavorText: "Same photo used for 47 different 'units'",
    baseCost: 500000,
    costMultiplier: 1.3,
    effect: { type: "passiveIncome", amount: 100 },
    icon: "📸",
  },

  // AUTISM ZONE
  {
    id: "fake-diagnoses",
    zone: "autism",
    name: "Fake Diagnoses",
    description: "+$75/sec passive income",
    flavorText: "Everyone's on the spectrum if you squint",
    baseCost: 400000,
    costMultiplier: 1.2,
    effect: { type: "passiveIncome", amount: 75 },
    icon: "📋",
  },
  {
    id: "session-templates",
    zone: "autism",
    name: "Session Templates",
    description: "+$50 per click",
    flavorText: "Copy-paste therapy notes from 2019",
    baseCost: 750000,
    costMultiplier: 1.25,
    effect: { type: "clickBonus", amount: 50 },
    icon: "📄",
  },
  {
    id: "licensed-therapist",
    zone: "autism",
    name: "Licensed Therapist (on paper)",
    description: "2x click multiplier",
    flavorText: "The degree is from a very real university",
    baseCost: 1500000,
    costMultiplier: 2.0,
    effect: { type: "clickMultiplier", amount: 2 },
    icon: "🎓",
  },
  {
    id: "parent-signatures",
    zone: "autism",
    name: "Parent Signatures",
    description: "+$250/sec passive income",
    flavorText: "Forged consent forms - they'll thank us later",
    baseCost: 3000000,
    costMultiplier: 1.35,
    effect: { type: "passiveIncome", amount: 250 },
    icon: "✍️",
  },

  // MEDICAID ZONE
  {
    id: "pca-fraud",
    zone: "medicaid",
    name: "PCA Fraud Ring",
    description: "+$200/sec passive income",
    flavorText: "Personal Care Attendants who never attend",
    baseCost: 2000000,
    costMultiplier: 1.2,
    effect: { type: "passiveIncome", amount: 200 },
    icon: "👥",
  },
  {
    id: "durable-equipment",
    zone: "medicaid",
    name: "Durable Equipment Scheme",
    description: "+$150 per click",
    flavorText: "Wheelchairs for people who can walk",
    baseCost: 5000000,
    costMultiplier: 1.3,
    effect: { type: "clickBonus", amount: 150 },
    icon: "🦽",
  },
  {
    id: "prescription-kickbacks",
    zone: "medicaid",
    name: "Prescription Kickbacks",
    description: "+$500/sec passive income",
    flavorText: "The pharmacist is in on it too",
    baseCost: 10000000,
    costMultiplier: 1.25,
    effect: { type: "passiveIncome", amount: 500 },
    icon: "💊",
  },
  {
    id: "political-connections",
    zone: "medicaid",
    name: "Political Connections",
    description: "Views decay significantly over time",
    flavorText: "The Governor has your back",
    baseCost: 25000000,
    costMultiplier: 3.0,
    effect: { type: "viewDecay", amount: 10000 },
    icon: "🏛️",
  },
];

export const getUpgradesForZone = (zoneId: string): Upgrade[] =>
  UPGRADES.filter((u) => u.zone === zoneId);
