export type PoliticalEvent = {
  id: string;
  title: string;
  description: string;
  effect: PoliticalEvent.Effect;
  duration: number; // seconds
  icon: string;
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
  {
    id: "governor-presser",
    title: "Governor Press Conference",
    description: "Tim Walz announces 'robust oversight' again",
    effect: { type: "viewMultiplier", amount: 0.8 },
    duration: 60,
    icon: "🎤",
  },
  {
    id: "jd-vance-tweet",
    title: "JD Vance Tweet",
    description: "Vice President praises Nick Shirley's investigation",
    effect: { type: "viewGain", amount: 1_000_000 },
    duration: 30,
    icon: "🐦",
  },
  {
    id: "noem-strike-team",
    title: "Kristi Noem Strike Team",
    description: "DHS deploys investigators to Minneapolis",
    effect: { type: "viewMultiplier", amount: 1.5 },
    duration: 90,
    icon: "🎯",
  },
  {
    id: "fbi-surge",
    title: "FBI Surges Resources",
    description: "Kash Patel announces additional agents",
    effect: { type: "viewMultiplier", amount: 1.3 },
    duration: 120,
    icon: "🔍",
  },
  {
    id: "congressional-hearing",
    title: "Congressional Hearing",
    description: "Tom Emmer demands answers",
    effect: { type: "pauseFraud" },
    duration: 45,
    icon: "🏛️",
  },
  {
    id: "election-year",
    title: "Election Year",
    description: "All investigations mysteriously pause",
    effect: { type: "viewMultiplier", amount: 0.5 },
    duration: 180,
    icon: "🗳️",
  },
  {
    id: "bipartisan-concern",
    title: "Bipartisan Concern Expressed",
    description: "Both parties agree something should be done",
    effect: { type: "nothing" },
    duration: 30,
    icon: "🤝",
  },
  {
    id: "audit-released",
    title: "State Audit Released",
    description: "Report finds 'significant deficiencies'",
    effect: { type: "viewGain", amount: 500_000 },
    duration: 60,
    icon: "📊",
  },
  {
    id: "whistleblower",
    title: "Whistleblower Steps Forward",
    description: "Former employee goes to media",
    effect: { type: "viewGain", amount: 2_000_000 },
    duration: 45,
    icon: "🔔",
  },
  {
    id: "news-cycle-moves-on",
    title: "News Cycle Moves On",
    description: "Celebrity scandal distracts everyone",
    effect: { type: "viewMultiplier", amount: 0.3 },
    duration: 120,
    icon: "📺",
  },
];

export const getRandomEvent = (): PoliticalEvent =>
  POLITICAL_EVENTS[Math.floor(Math.random() * POLITICAL_EVENTS.length)];

