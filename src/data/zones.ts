export type Zone = {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockCost: number;
  baseClickValue: number;
  viewsPerClick: number;
  color: string;
  /** AI-generated image path (optional, falls back to icon emoji) */
  image?: string;
  /** Prompt used for AI image generation */
  imagePrompt?: string;
};

export const ZONES: Zone[] = [
  // ============================================
  // TIER 0 - STARTING ZONE
  // ============================================
  {
    id: "daycare",
    name: "Daycare District",
    icon: "🏚️",
    description: "Cedar-Riverside - Submit fake CCAP attendance reports",
    unlockCost: 0,
    baseClickValue: 100,
    viewsPerClick: 100,
    color: "#ef4444",
    image: "/assets/generated/zones/daycare.webp",
    imagePrompt: "empty playground with rusty swing set, abandoned brick building behind, overcast sky",
  },

  // ============================================
  // TIER 1 - EARLY GAME
  // ============================================
  {
    id: "food-program",
    name: "Feeding Our Future",
    icon: "🍽️",
    description: "North Minneapolis - Bill for meals never served to children",
    unlockCost: 25_000,
    baseClickValue: 175,
    viewsPerClick: 150,
    color: "#f97316",
    image: "/assets/generated/zones/food-program.webp",
    imagePrompt: "empty warehouse interior, stacked food trays covered in dust, single bare lightbulb",
  },
  {
    id: "housing",
    name: "Housing Fraud",
    icon: "🏠",
    description: "Downtown - Bill for stabilization services never rendered",
    unlockCost: 150_000,
    baseClickValue: 300,
    viewsPerClick: 200,
    color: "#3b82f6",
    image: "/assets/generated/zones/housing.webp",
    imagePrompt: "run down apartment building exterior, broken windows, fire escape, urban decay",
  },

  // ============================================
  // TIER 2 - MID GAME
  // ============================================
  {
    id: "autism",
    name: "Autism Services",
    icon: "🧠",
    description: "Suburbs - EIDBI therapy billing fraud",
    unlockCost: 600_000,
    baseClickValue: 600,
    viewsPerClick: 400,
    color: "#8b5cf6",
    image: "/assets/generated/zones/autism.webp",
    imagePrompt: "empty waiting room, plastic chairs, dusty reception desk, fluorescent lights",
  },
  {
    id: "medicaid",
    name: "Medicaid Empire",
    icon: "🏥",
    description: "Citywide - PCA fraud and equipment schemes",
    unlockCost: 4_000_000,
    baseClickValue: 1500,
    viewsPerClick: 1500,
    color: "#10b981",
    image: "/assets/generated/zones/medicaid.webp",
    imagePrompt: "pile of wheelchairs and crutches in warehouse, cardboard boxes, dim lighting",
  },
  {
    id: "refugee-services",
    name: "Refugee Services",
    icon: "🌍",
    description: "Multiple Sites - Resettlement funds for people who don't exist",
    unlockCost: 12_000_000,
    baseClickValue: 2500,
    viewsPerClick: 2500,
    color: "#0ea5e9",
    image: "/assets/generated/zones/refugee-services.webp",
    imagePrompt: "empty office with overturned chairs, scattered papers on floor, world map on wall",
  },

  // ============================================
  // TIER 3 - LATE GAME
  // ============================================
  {
    id: "political",
    name: "Political Machine",
    icon: "🏛️",
    description: "Capitol - Buy protection, manufacture consent",
    unlockCost: 35_000_000,
    baseClickValue: 5000,
    viewsPerClick: 3000,
    color: "#dc2626",
    image: "/assets/generated/zones/political.webp",
    imagePrompt: "Minnesota State Capitol building, white marble dome, golden Quadriga statue on top, Saint Paul, classical architecture, wide stone steps, dramatic evening light",
  },
  {
    id: "nonprofit-empire",
    name: "Nonprofit Empire",
    icon: "🎗️",
    description: "501(c)(3) Network - Charity begins at your home... in Dubai",
    unlockCost: 80_000_000,
    baseClickValue: 8000,
    viewsPerClick: 4000,
    color: "#be185d",
    image: "/assets/generated/zones/nonprofit-empire.webp",
    imagePrompt: "grand ballroom with crystal chandelier, velvet curtains, marble floor",
  },

  // ============================================
  // TIER 4 - ENDGAME
  // ============================================
  {
    id: "endgame",
    name: "The Network",
    icon: "🕸️",
    description: "Global - When $9 billion isn't enough",
    unlockCost: 200_000_000,
    baseClickValue: 20000,
    viewsPerClick: 5000,
    color: "#fbbf24",
    image: "/assets/generated/zones/endgame.webp",
    imagePrompt: "corkboard with photos connected by red string, newspaper clippings, desk lamp",
  },
  {
    id: "shadow-banking",
    name: "Shadow Banking",
    icon: "🏦",
    description: "Offshore - Money that doesn't exist in banks that don't exist",
    unlockCost: 500_000_000,
    baseClickValue: 50000,
    viewsPerClick: 6000,
    color: "#4c1d95",
    image: "/assets/generated/zones/shadow-banking.webp",
    imagePrompt: "bank vault door, stacks of gold bars, safety deposit boxes, dim lighting",
  },
  {
    id: "state-capture",
    name: "Complete State Capture",
    icon: "👑",
    description: "Minnesota - You ARE the government now",
    unlockCost: 1_500_000_000,
    baseClickValue: 150000,
    viewsPerClick: 4000,
    color: "#b91c1c",
    image: "/assets/generated/zones/state-capture.webp",
    imagePrompt: "golden throne made of bundled cash, red velvet carpet, spotlight from above",
  },
];

export const getZone = (id: string): Zone | undefined =>
  ZONES.find((z) => z.id === id);
