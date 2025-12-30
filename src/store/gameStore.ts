import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UPGRADES, type Upgrade } from "~/data/upgrades";
import { ZONES, type Zone } from "~/data/zones";
import {
  POLITICAL_EVENTS,
  type PoliticalEvent,
  getRandomEvent,
} from "~/data/events";
import { ACHIEVEMENTS } from "~/data/achievements";

// Define nested types first
export type ThreatLevel =
  | "safe"
  | "local-blogger"
  | "gaining-traction"
  | "regional-news"
  | "national-story"
  | "viral"
  | "the-video";

export type GoldenClaim = {
  id: number;
  type: "money" | "views" | "discount";
  x: number;
  y: number;
  expiresAt: number;
};

export type LifetimeStats = {
  totalMoneyEarned: number;
  totalClaimsFiled: number;
  totalGoldenClaimsCaught: number;
  highestViralViews: number;
  fastestWinTime: number | null;
  timesArrested: number;
};

export type GameState = {
  // Core stats
  money: number;
  totalEarned: number;
  fakeClaims: number;

  // Nick Shirley viral system (replaces suspicion)
  viralViews: number;
  nickShirleyLocation: string | null;
  threatLevel: ThreatLevel;
  maxThreatLevelReached: ThreatLevel;

  // Game state
  isGameOver: boolean;
  isVictory: boolean;
  isArrested: boolean;
  isPaused: boolean;

  // Zones
  activeZone: string;
  unlockedZones: string[];

  // Upgrades
  ownedUpgrades: Record<string, number>;

  // Events
  activeEvent: PoliticalEvent | null;
  eventEndTime: number | null;

  // Achievements
  unlockedAchievements: string[];

  // Prestige
  totalArrestCount: number;
  prestigeBonuses: string[];

  // Golden Claims
  goldenClaim: GoldenClaim | null;
  lastGoldenClaimTime: number;
  discountEndTime: number | null;

  // Lifetime Stats
  lifetimeStats: LifetimeStats;

  // Timing
  lastTick: number;
  gameStartTime: number;
};

// Re-export for backwards compatibility
export namespace GameState {
  export type ThreatLevel = import("~/store/gameStore").ThreatLevel;
  export type GoldenClaim = import("~/store/gameStore").GoldenClaim;
  export type LifetimeStats = import("~/store/gameStore").LifetimeStats;
}

export type GameActions = {
  click: () => void;
  buyUpgrade: (upgradeId: string) => void;
  unlockZone: (zoneId: string) => void;
  setActiveZone: (zoneId: string) => void;
  tick: () => void;
  triggerEvent: (event: PoliticalEvent) => void;
  reset: () => void;
  prestige: () => void;
  clickGoldenClaim: () => void;
  dismissGoldenClaim: () => void;
  unlockTrialAchievement: (type: "arrested" | "acquitted" | "maxSentence") => void;
};

export type GameStore = GameState & GameActions;

const INITIAL_LIFETIME_STATS: GameState.LifetimeStats = {
  totalMoneyEarned: 0,
  totalClaimsFiled: 0,
  totalGoldenClaimsCaught: 0,
  highestViralViews: 0,
  fastestWinTime: null,
  timesArrested: 0,
};

const INITIAL_STATE: GameState = {
  money: 0,
  totalEarned: 0,
  fakeClaims: 0,
  viralViews: 0,
  nickShirleyLocation: null,
  threatLevel: "safe",
  maxThreatLevelReached: "safe",
  isGameOver: false,
  isVictory: false,
  isArrested: false,
  isPaused: false,
  activeZone: "daycare",
  unlockedZones: ["daycare"],
  ownedUpgrades: {},
  activeEvent: null,
  eventEndTime: null,
  unlockedAchievements: [],
  totalArrestCount: 0,
  prestigeBonuses: [],
  goldenClaim: null,
  lastGoldenClaimTime: 0,
  discountEndTime: null,
  lifetimeStats: INITIAL_LIFETIME_STATS,
  lastTick: Date.now(),
  gameStartTime: Date.now(),
};

const VIRAL_THRESHOLD = 100_000_000; // 100 million views = game over
const TARGET_AMOUNT = 9_000_000_000; // $9 billion - the full estimated fraud

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      click: () => {
        const state = get();
        if (state.isGameOver || state.isVictory || state.isPaused) return;

        set((s) => {
          const zone = ZONES.find((z) => z.id === s.activeZone);
          if (!zone) return s;

          const clickValue = GameStore.getClickValue(s);
          const viewsGain = GameStore.getViewsGain(s, zone);
          const viewCap = GameStore.getViewCap(s);
          const newMoney = s.money + clickValue;
          const newTotal = s.totalEarned + clickValue;
          const newViews = Math.min(viewCap, s.viralViews + viewsGain);
          const newThreatLevel = GameStore.getThreatLevel(newViews);

          // Check achievements
          const newAchievements = [...s.unlockedAchievements];
          GameStore.checkAchievements(
            {
              ...s,
              totalEarned: newTotal,
              viralViews: newViews,
              fakeClaims: s.fakeClaims + 1,
            },
            newAchievements
          );

          // Update lifetime stats (with defaults for old saves)
          const currentStats = s.lifetimeStats ?? INITIAL_LIFETIME_STATS;
          const lifetimeStats = {
            ...currentStats,
            totalMoneyEarned: (currentStats.totalMoneyEarned ?? 0) + clickValue,
            totalClaimsFiled: (currentStats.totalClaimsFiled ?? 0) + 1,
            highestViralViews: Math.max(
              currentStats.highestViralViews ?? 0,
              newViews
            ),
          };

          const isNewVictory = !s.isVictory && newTotal >= TARGET_AMOUNT;
          const gameTime = isNewVictory ? Date.now() - s.gameStartTime : null;

          // Update fastest win time if this is a new victory
          const updatedLifetimeStats =
            isNewVictory && gameTime
              ? {
                  ...lifetimeStats,
                  fastestWinTime: lifetimeStats?.fastestWinTime
                    ? Math.min(lifetimeStats.fastestWinTime, gameTime)
                    : gameTime,
                }
              : lifetimeStats;

          return {
            money: newMoney,
            totalEarned: newTotal,
            fakeClaims: s.fakeClaims + 1,
            viralViews: newViews,
            threatLevel: newThreatLevel,
            maxThreatLevelReached: GameStore.maxThreatLevel(
              s.maxThreatLevelReached,
              newThreatLevel
            ),
            isGameOver: newViews >= VIRAL_THRESHOLD,
            isVictory: newTotal >= TARGET_AMOUNT,
            unlockedAchievements: newAchievements,
            lifetimeStats: updatedLifetimeStats,
          };
        });
      },

      buyUpgrade: (upgradeId: string) => {
        const state = get();
        const upgrade = UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return;
        if (!state.unlockedZones.includes(upgrade.zone)) return;

        const owned = state.ownedUpgrades[upgradeId] ?? 0;
        const discountActive = state.discountEndTime
          ? Date.now() < state.discountEndTime
          : false;
        const cost = GameStore.getUpgradeCost(upgrade, owned, discountActive);

        if (state.money < cost || state.isGameOver || state.isVictory) return;

        set((s) => {
          const newAchievements = [...s.unlockedAchievements];
          const newOwned = { ...s.ownedUpgrades, [upgradeId]: owned + 1 };

          // Check upgrade achievements
          ACHIEVEMENTS.forEach((ach) => {
            if (s.unlockedAchievements.includes(ach.id)) return;
            if (
              ach.condition.type === "upgradeOwned" &&
              ach.condition.upgrade === upgradeId &&
              owned + 1 >= ach.condition.count
            ) {
              newAchievements.push(ach.id);
            }
          });

          return {
            money: s.money - cost,
            ownedUpgrades: newOwned,
            unlockedAchievements: newAchievements,
          };
        });
      },

      unlockZone: (zoneId: string) => {
        const state = get();
        const zone = ZONES.find((z) => z.id === zoneId);
        if (!zone || state.unlockedZones.includes(zoneId)) return;
        if (state.money < zone.unlockCost) return;

        set((s) => {
          const newZones = [...s.unlockedZones, zoneId];
          const newAchievements = [...s.unlockedAchievements];

          // Check zone achievements
          ACHIEVEMENTS.forEach((ach) => {
            if (s.unlockedAchievements.includes(ach.id)) return;
            if (
              ach.condition.type === "zoneUnlocked" &&
              ach.condition.zone === zoneId
            ) {
              newAchievements.push(ach.id);
            }
            if (
              ach.condition.type === "allZonesUnlocked" &&
              newZones.length === ZONES.length
            ) {
              newAchievements.push(ach.id);
            }
          });

          return {
            money: s.money - zone.unlockCost,
            unlockedZones: newZones,
            activeZone: zoneId,
            unlockedAchievements: newAchievements,
          };
        });
      },

      setActiveZone: (zoneId: string) => {
        const state = get();
        if (!state.unlockedZones.includes(zoneId)) return;
        set({ activeZone: zoneId });
      },

      tick: () => {
        const state = get();
        if (state.isGameOver || state.isVictory) return;

        set((s) => {
          const now = Date.now();
          const delta = (now - s.lastTick) / 1000;

          // Check if event expired
          let activeEvent = s.activeEvent;
          let eventEndTime = s.eventEndTime;
          let isPaused = s.isPaused;

          if (activeEvent && eventEndTime && now >= eventEndTime) {
            activeEvent = null;
            eventEndTime = null;
            isPaused = false;
          }

          if (isPaused) {
            return { lastTick: now, activeEvent, eventEndTime, isPaused };
          }

          // Calculate passive income
          const passiveIncome = GameStore.getPassiveIncome(s);
          const viewDecay = GameStore.getViewDecay(s);

          // Random event trigger (1.5% chance per tick for more dynamic gameplay)
          let eventViewGain = 0;
          if (!activeEvent && Math.random() < 0.0015) {
            const newEvent = getRandomEvent();
            activeEvent = newEvent;
            eventEndTime = now + newEvent.duration * 1000;
            if (newEvent.effect.type === "pauseFraud") {
              isPaused = true;
            }
            // Apply immediate viewGain effect
            if (newEvent.effect.type === "viewGain") {
              eventViewGain = newEvent.effect.amount;
            }
          }

          // Event modifiers
          let viewMultiplier = 1;
          let incomeMultiplier = 1;
          if (activeEvent?.effect.type === "viewMultiplier") {
            viewMultiplier = activeEvent.effect.amount;
          }
          if (activeEvent?.effect.type === "incomeMultiplier") {
            incomeMultiplier = activeEvent.effect.amount;
          }

          const passiveGain = passiveIncome * delta * incomeMultiplier;

          // Passive income generates views (0.3x rate for balanced late-game)
          const passiveViewGain =
            passiveIncome > 0 ? passiveIncome * 0.3 * delta * viewMultiplier : 0;
          const netViewChange = passiveViewGain - viewDecay * delta + eventViewGain;
          const viewCap = GameStore.getViewCap(s);
          const newViews = Math.min(
            viewCap,
            Math.max(0, s.viralViews + netViewChange)
          );
          const newThreatLevel = GameStore.getThreatLevel(newViews);
          const newMoney = s.money + passiveGain;
          const newTotal = s.totalEarned + passiveGain;

          // Random Nick Shirley location
          let nickLocation = s.nickShirleyLocation;
          if (Math.random() < 0.01) {
            // Include all zones + null (not visible)
            const zoneIds = ZONES.map((z) => z.id);
            const locations: (string | null)[] = [...zoneIds, null];
            nickLocation = locations[Math.floor(Math.random() * locations.length)];
          }

          // Random golden claim spawn (every 30-90 seconds)
          let goldenClaim = s.goldenClaim;
          const timeSinceLastGolden = now - s.lastGoldenClaimTime;
          const minSpawnTime = 30_000;
          const maxSpawnTime = 90_000;

          // Expire existing golden claim
          if (goldenClaim && now > goldenClaim.expiresAt) {
            goldenClaim = null;
          }

          // Spawn new golden claim (3% chance per tick after min time)
          if (
            !goldenClaim &&
            timeSinceLastGolden >= minSpawnTime &&
            Math.random() < 0.03
          ) {
            const types: GameState.GoldenClaim["type"][] = [
              "money",
              "views",
              "discount",
            ];
            // Duration scales with threat level: 6s base, +1s if safe, +0.5s if local-blogger
            let duration = 6000;
            if (newThreatLevel === "safe") duration += 1000;
            else if (newThreatLevel === "local-blogger") duration += 500;

            goldenClaim = {
              id: now,
              type: types[Math.floor(Math.random() * types.length)],
              x: Math.random() * 80 + 10, // 10-90% from left
              y: Math.random() * 60 + 20, // 20-80% from top
              expiresAt: now + duration,
            };
          }

          // Update lifetime stats (with defaults for old saves)
          const currentTickStats = s.lifetimeStats ?? INITIAL_LIFETIME_STATS;
          const lifetimeStats = {
            ...currentTickStats,
            totalMoneyEarned:
              (currentTickStats.totalMoneyEarned ?? 0) + passiveGain,
            highestViralViews: Math.max(
              currentTickStats.highestViralViews ?? 0,
              newViews
            ),
          };

          // Check achievements
          const newAchievements = [...s.unlockedAchievements];
          GameStore.checkAchievements(
            { ...s, totalEarned: newTotal, viralViews: newViews },
            newAchievements
          );

          return {
            money: newMoney,
            totalEarned: newTotal,
            viralViews: newViews,
            threatLevel: newThreatLevel,
            maxThreatLevelReached: GameStore.maxThreatLevel(
              s.maxThreatLevelReached,
              newThreatLevel
            ),
            lastTick: now,
            isGameOver: newViews >= VIRAL_THRESHOLD,
            isVictory: newTotal >= TARGET_AMOUNT,
            activeEvent,
            eventEndTime,
            isPaused,
            nickShirleyLocation: nickLocation,
            unlockedAchievements: newAchievements,
            goldenClaim,
            lastGoldenClaimTime:
              goldenClaim && goldenClaim.id === now
                ? now
                : s.lastGoldenClaimTime,
            lifetimeStats,
          };
        });
      },

      triggerEvent: (event: PoliticalEvent) => {
        set((s) => {
          const now = Date.now();

          // Apply immediate effects
          let viralViews = s.viralViews;
          if (event.effect.type === "viewGain") {
            viralViews += event.effect.amount;
          }

          return {
            activeEvent: event,
            eventEndTime: now + event.duration * 1000,
            isPaused: event.effect.type === "pauseFraud",
            viralViews,
            threatLevel: GameStore.getThreatLevel(viralViews),
          };
        });
      },

      reset: () => {
        set({
          ...INITIAL_STATE,
          lastTick: Date.now(),
          gameStartTime: Date.now(),
          totalArrestCount: get().totalArrestCount,
          prestigeBonuses: get().prestigeBonuses,
          unlockedAchievements: get().unlockedAchievements,
        });
      },

      prestige: () => {
        const state = get();
        const currentPrestigeStats =
          state.lifetimeStats ?? INITIAL_LIFETIME_STATS;
        const newStats = {
          ...currentPrestigeStats,
          timesArrested: (currentPrestigeStats.timesArrested ?? 0) + 1,
        };
        set({
          ...INITIAL_STATE,
          lastTick: Date.now(),
          gameStartTime: Date.now(),
          totalArrestCount: state.totalArrestCount + 1,
          prestigeBonuses: state.prestigeBonuses,
          unlockedAchievements: state.unlockedAchievements,
          lifetimeStats: newStats,
        });
      },

      clickGoldenClaim: () => {
        const state = get();
        if (!state.goldenClaim || state.isGameOver || state.isVictory) return;

        const now = Date.now();
        if (now > state.goldenClaim.expiresAt) return;

        set((s) => {
          const claim = s.goldenClaim!;
          let moneyBonus = 0;
          let viewsReduction = 0;
          let discountEndTime = s.discountEndTime;

          switch (claim.type) {
            case "money":
              // 25x click value + 2% of total earned (min $1000)
              const clickBonus = GameStore.getClickValue(s) * 25;
              const percentBonus = Math.max(1000, s.totalEarned * 0.02);
              moneyBonus = clickBonus + percentBonus;
              break;
            case "views":
              // -5% of current views (min 10K, max 500K)
              viewsReduction = Math.min(
                500_000,
                Math.max(10_000, s.viralViews * 0.05)
              );
              break;
            case "discount":
              // 25% off upgrades for 30 seconds
              discountEndTime = now + 30_000;
              break;
          }

          const newMoney = s.money + moneyBonus;
          const newViews = Math.max(0, s.viralViews - viewsReduction);
          const currentGoldenStats = s.lifetimeStats ?? INITIAL_LIFETIME_STATS;
          const newStats = {
            ...currentGoldenStats,
            totalGoldenClaimsCaught:
              (currentGoldenStats.totalGoldenClaimsCaught ?? 0) + 1,
          };

          return {
            goldenClaim: null,
            money: newMoney,
            totalEarned: s.totalEarned + moneyBonus,
            viralViews: newViews,
            threatLevel: GameStore.getThreatLevel(newViews),
            lifetimeStats: newStats,
            discountEndTime,
          };
        });
      },

      dismissGoldenClaim: () => {
        set({ goldenClaim: null });
      },

      unlockTrialAchievement: (type: "arrested" | "acquitted" | "maxSentence") => {
        set((s) => {
          const newAchievements = [...s.unlockedAchievements];
          
          // Find achievement with matching condition type
          ACHIEVEMENTS.forEach((ach) => {
            if (newAchievements.includes(ach.id)) return;
            if (ach.condition.type === type) {
              newAchievements.push(ach.id);
            }
          });
          
          return { unlockedAchievements: newAchievements };
        });
      },
    }),
    {
      name: "minnesota-fraud-empire",
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        totalArrestCount: state.totalArrestCount,
        prestigeBonuses: state.prestigeBonuses,
        lifetimeStats: state.lifetimeStats,
      }),
    }
  )
);

export namespace GameStore {
  export const getClickValue = (state: GameState): number => {
    let base = 0;
    let multiplier = 1;

    // Base value from active zone
    const zone = ZONES.find((z) => z.id === state.activeZone);
    if (zone) base = zone.baseClickValue;

    // Upgrade bonuses
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (!state.unlockedZones.includes(upgrade.zone)) return;

      if (upgrade.effect.type === "clickBonus") {
        base += upgrade.effect.amount * owned;
      }
      if (upgrade.effect.type === "clickMultiplier") {
        multiplier *= Math.pow(upgrade.effect.amount, owned);
      }
    });

    const prestigeMultiplier = getPrestigeMultiplier(state.totalArrestCount);

    // Victory bonus: +20% income if player has won before
    const victoryBonus = state.lifetimeStats?.fastestWinTime ? 1.2 : 1;

    return Math.floor(base * multiplier * prestigeMultiplier * victoryBonus);
  };

  export const getPassiveIncome = (state: GameState): number => {
    let total = 0;

    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (!state.unlockedZones.includes(upgrade.zone)) return;

      if (upgrade.effect.type === "passiveIncome") {
        total += upgrade.effect.amount * owned;
      }
    });

    const prestigeMultiplier = getPrestigeMultiplier(state.totalArrestCount);

    // Victory bonus: +20% income if player has won before
    const victoryBonus = state.lifetimeStats?.fastestWinTime ? 1.2 : 1;

    return total * prestigeMultiplier * victoryBonus;
  };

  export const getViewsGain = (state: GameState, zone: Zone): number => {
    const base = zone.viewsPerClick;
    let multiplier = 1;

    // Reduction from upgrades
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;

      if (upgrade.effect.type === "viewReduction") {
        multiplier *= Math.pow(1 - upgrade.effect.amount, owned);
      }
    });

    // Event modifiers
    if (state.activeEvent?.effect.type === "viewMultiplier") {
      multiplier *= state.activeEvent.effect.amount;
    }

    // Nick Shirley is in your zone = more views!
    if (state.nickShirleyLocation === zone.id) {
      multiplier *= 1.5;
    }

    return Math.floor(base * multiplier);
  };

  export const getViewDecay = (state: GameState): number => {
    // Base decay of 200/sec to reward patience
    let total = 200;
    let multiplier = 1;

    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;

      if (upgrade.effect.type === "viewDecay") {
        total += upgrade.effect.amount * owned;
      }
      if (upgrade.effect.type === "viewDecayMultiplier") {
        // Fixed: multiply properly instead of multiplying by (amount * owned)
        multiplier *= Math.pow(upgrade.effect.amount, owned);
      }
    });

    // Prestige bonus: +5% view decay per arrest
    const prestigeDecayBonus = 1 + state.totalArrestCount * 0.05;

    return total * multiplier * prestigeDecayBonus;
  };

  export const getViewCap = (state: GameState): number => {
    let cap = VIRAL_THRESHOLD; // Default is the game over threshold

    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;

      if (upgrade.effect.type === "viewCap") {
        cap = Math.min(cap, upgrade.effect.amount);
      }
    });

    return cap;
  };

  export const getThreatLevel = (views: number): GameState.ThreatLevel => {
    if (views >= 95_000_000) return "the-video";
    if (views >= 50_000_000) return "viral";
    if (views >= 10_000_000) return "national-story";
    if (views >= 1_000_000) return "regional-news";
    if (views >= 100_000) return "gaining-traction";
    if (views >= 10_000) return "local-blogger";
    return "safe";
  };

  export const THREAT_LEVEL_ORDER: GameState.ThreatLevel[] = [
    "safe",
    "local-blogger",
    "gaining-traction",
    "regional-news",
    "national-story",
    "viral",
    "the-video",
  ];

  export const compareThreatLevel = (
    a: GameState.ThreatLevel,
    b: GameState.ThreatLevel
  ): number => THREAT_LEVEL_ORDER.indexOf(a) - THREAT_LEVEL_ORDER.indexOf(b);

  export const maxThreatLevel = (
    a: GameState.ThreatLevel,
    b: GameState.ThreatLevel
  ): GameState.ThreatLevel => (compareThreatLevel(a, b) >= 0 ? a : b);

  export const getThreatMessage = (level: GameState.ThreatLevel): string => {
    switch (level) {
      case "safe":
        return "Flying under the radar";
      case "local-blogger":
        return "Nick Shirley is curious...";
      case "gaining-traction":
        return "YouTubers are filming outside";
      case "regional-news":
        return "Local news picked up the story";
      case "national-story":
        return "Kristi Noem mentioned you by name";
      case "viral":
        return "FBI has opened an investigation";
      case "the-video":
        return "You're the star of the 42-minute video";
    }
  };

  export const getUpgradeCost = (
    upgrade: Upgrade,
    owned: number,
    discountActive = false
  ): number => {
    const baseCost = Math.floor(
      upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned)
    );
    return discountActive ? Math.floor(baseCost * 0.75) : baseCost;
  };

  export const checkAchievements = (
    state: GameState,
    achievements: string[]
  ): void => {
    ACHIEVEMENTS.forEach((ach) => {
      if (achievements.includes(ach.id)) return;

      let earned = false;
      switch (ach.condition.type) {
        case "totalEarned":
          earned = state.totalEarned >= ach.condition.amount;
          break;
        case "viralViews":
          earned = state.viralViews >= ach.condition.amount;
          break;
        case "fakeClaims":
          earned = state.fakeClaims >= ach.condition.amount;
          break;
        case "zoneUnlocked":
          earned = state.unlockedZones.includes(ach.condition.zone);
          break;
        case "allZonesUnlocked":
          earned = state.unlockedZones.length === ZONES.length;
          break;
        case "goldenClaimsCaught":
          earned =
            (state.lifetimeStats?.totalGoldenClaimsCaught ?? 0) >=
            ach.condition.amount;
          break;
        case "prestigeLevel":
          earned = state.totalArrestCount >= ach.condition.level;
          break;
        case "speedWin":
          // Check if player won and within time limit
          if (state.isVictory && state.lifetimeStats?.fastestWinTime) {
            earned =
              state.lifetimeStats.fastestWinTime <= ach.condition.maxTimeMs;
          }
          break;
        case "carefulWin":
          // Check if player won without exceeding the max threat level
          if (state.isVictory) {
            const maxAllowedIndex = THREAT_LEVEL_ORDER.indexOf(
              ach.condition.maxThreatLevel as ThreatLevel
            );
            const actualMaxIndex = THREAT_LEVEL_ORDER.indexOf(
              state.maxThreatLevelReached
            );
            earned = actualMaxIndex <= maxAllowedIndex;
          }
          break;
        case "prestigeEarned":
          // Check if player has prestige and has earned enough in current run
          earned =
            state.totalArrestCount > 0 &&
            state.totalEarned >= ach.condition.amount;
          break;
        // Note: "arrested", "acquitted", and "maxSentence" are handled 
        // directly in Trial.tsx since they depend on trial outcomes
      }

      if (earned) achievements.push(ach.id);
    });
  };

  export const TARGET = TARGET_AMOUNT;
  export const VIRAL_LIMIT = VIRAL_THRESHOLD;

  export const formatViews = (views: number): string => {
    if (views >= 1_000_000_000) return (views / 1_000_000_000).toFixed(1) + "B";
    if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + "M";
    if (views >= 1_000) return (views / 1_000).toFixed(1) + "K";
    return views.toFixed(0);
  };

  export const formatMoney = (amount: number): string => {
    if (amount >= 1_000_000_000)
      return "$" + (amount / 1_000_000_000).toFixed(2) + "B";
    if (amount >= 1_000_000) return "$" + (amount / 1_000_000).toFixed(2) + "M";
    if (amount >= 1_000) return "$" + (amount / 1_000).toFixed(2) + "K";
    return "$" + amount.toFixed(0);
  };

  export const formatTimeMs = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Tiered prestige bonuses: 15%, 12%, 10%, then 8% each
  export const getPrestigeBonusPercent = (arrests: number): number => {
    if (arrests === 0) return 0;
    let bonus = 0;
    for (let i = 1; i <= arrests; i++) {
      if (i === 1) bonus += 15;
      else if (i === 2) bonus += 12;
      else if (i === 3) bonus += 10;
      else bonus += 8;
    }
    return bonus;
  };

  export const getNextPrestigeBonusPercent = (arrests: number): number => {
    if (arrests === 0) return 15;
    if (arrests === 1) return 12;
    if (arrests === 2) return 10;
    return 8;
  };

  // Shared prestige multiplier (1 + bonus%)
  export const getPrestigeMultiplier = (arrests: number): number => {
    return 1 + getPrestigeBonusPercent(arrests) / 100;
  };
}
