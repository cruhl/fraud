/**
 * Crew members that can be hired for passive bonuses
 * Uses existing character images from /assets/generated/characters/
 */

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  imageId: string; // Character image ID (e.g., "corrupt-inspector")
  cost: number;
  description: string;
  effect: CrewEffect;
};

export type CrewEffect =
  | { type: "viewGainReduction"; percent: number } // Reduces view gain by X%
  | { type: "viewDecayBonus"; amount: number } // Adds X views/sec decay
  | { type: "trialAcquittalBonus"; percent: number } // Adds X% to acquittal chance
  | { type: "zoneDiscountPercent"; percent: number }; // Reduces zone costs by X%

export const CREW_MEMBERS: CrewMember[] = [
  {
    id: "corrupt-inspector",
    name: "Complicit Inspector",
    role: "State Inspector",
    imageId: "corrupt-inspector",
    cost: 500_000,
    description: "Looks the other way during audits. -15% view gain.",
    effect: { type: "viewGainReduction", percent: 0.15 },
  },
  {
    id: "expensive-lawyer",
    name: "Maurice \"The Fixer\" Goldman",
    role: "Defense Attorney",
    imageId: "expensive-lawyer",
    cost: 2_000_000,
    description: "The best money can buy. +5% trial acquittal chance.",
    effect: { type: "trialAcquittalBonus", percent: 0.05 },
  },
  {
    id: "dhs-official",
    name: "Deputy Commissioner Miller",
    role: "DHS Official",
    imageId: "dhs-official",
    cost: 5_000_000,
    description: "Buries complaints in paperwork. +3K views/sec decay.",
    effect: { type: "viewDecayBonus", amount: 3000 },
  },
  {
    id: "tim-walz",
    name: "Governor's Office Contact",
    role: "Political Ally",
    imageId: "tim-walz",
    cost: 25_000_000,
    description: "\"Culture of trust.\" -10% zone unlock costs.",
    effect: { type: "zoneDiscountPercent", percent: 0.10 },
  },
  {
    id: "federal-judge",
    name: "Judge Harrison Caldwell",
    role: "Federal Bench",
    imageId: "federal-judge",
    cost: 75_000_000,
    description: "Sympathetic to your \"charity work.\" +15% trial acquittal chance.",
    effect: { type: "trialAcquittalBonus", percent: 0.15 },
  },
];

export function getCrewMember(id: string): CrewMember | undefined {
  return CREW_MEMBERS.find((c) => c.id === id);
}

