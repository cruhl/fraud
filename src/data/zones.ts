export type Zone = {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockCost: number;
  baseClickValue: number;
  viewsPerClick: number;
  color: string;
};

export const ZONES: Zone[] = [
  {
    id: "daycare",
    name: "Daycare District",
    icon: "🏚️",
    description: "Cedar-Riverside - Submit fake CCAP attendance reports",
    unlockCost: 0,
    baseClickValue: 10,
    viewsPerClick: 100,
    color: "#ef4444",
  },
  {
    id: "housing",
    name: "Housing Fraud",
    icon: "🏠",
    description: "Downtown - Bill for stabilization services never rendered",
    unlockCost: 500_000,
    baseClickValue: 50,
    viewsPerClick: 500,
    color: "#3b82f6",
  },
  {
    id: "autism",
    name: "Autism Services",
    icon: "🧠",
    description: "Suburbs - EIDBI therapy billing fraud",
    unlockCost: 2_000_000,
    baseClickValue: 150,
    viewsPerClick: 1500,
    color: "#8b5cf6",
  },
  {
    id: "medicaid",
    name: "Medicaid Empire",
    icon: "🏥",
    description: "Citywide - PCA fraud and equipment schemes",
    unlockCost: 10_000_000,
    baseClickValue: 500,
    viewsPerClick: 5000,
    color: "#10b981",
  },
];

export const getZone = (id: string): Zone | undefined =>
  ZONES.find((z) => z.id === id);

