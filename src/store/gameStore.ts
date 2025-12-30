import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UPGRADES, type Upgrade } from "~/data/upgrades";
import { ZONES, type Zone } from "~/data/zones";
import { POLITICAL_EVENTS, type PoliticalEvent, getRandomEvent } from "~/data/events";
import { ACHIEVEMENTS, type Achievement } from "~/data/achievements";

export type GameState = {
  // Core stats
  money: number;
  totalEarned: number;
  fakeClaims: number;

  // Nick Shirley viral system (replaces suspicion)
  viralViews: number;
  nickShirleyLocation: string | null;
  threatLevel: GameState.ThreatLevel;

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

  // Timing
  lastTick: number;
  gameStartTime: number;
};

export namespace GameState {
  export type ThreatLevel =
    | "safe"
    | "local-blogger"
    | "gaining-traction"
    | "regional-news"
    | "national-story"
    | "viral"
    | "the-video";
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
};

export type GameStore = GameState & GameActions;

const INITIAL_STATE: GameState = {
  money: 0,
  totalEarned: 0,
  fakeClaims: 0,
  viralViews: 0,
  nickShirleyLocation: null,
  threatLevel: "safe",
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
          const newMoney = s.money + clickValue;
          const newTotal = s.totalEarned + clickValue;
          const newViews = s.viralViews + viewsGain;
          const newThreatLevel = GameStore.getThreatLevel(newViews);

          // Check achievements
          const newAchievements = [...s.unlockedAchievements];
          GameStore.checkAchievements(
            { ...s, totalEarned: newTotal, viralViews: newViews, fakeClaims: s.fakeClaims + 1 },
            newAchievements
          );

          return {
            money: newMoney,
            totalEarned: newTotal,
            fakeClaims: s.fakeClaims + 1,
            viralViews: newViews,
            threatLevel: newThreatLevel,
            isGameOver: newViews >= VIRAL_THRESHOLD,
            isVictory: newTotal >= TARGET_AMOUNT,
            unlockedAchievements: newAchievements,
          };
        });
      },

      buyUpgrade: (upgradeId: string) => {
        const state = get();
        const upgrade = UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return;
        if (!state.unlockedZones.includes(upgrade.zone)) return;

        const owned = state.ownedUpgrades[upgradeId] ?? 0;
        const cost = GameStore.getUpgradeCost(upgrade, owned);

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
            if (ach.condition.type === "zoneUnlocked" && ach.condition.zone === zoneId) {
              newAchievements.push(ach.id);
            }
            if (ach.condition.type === "allZonesUnlocked" && newZones.length === ZONES.length) {
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
          const passiveGain = passiveIncome * delta;

          // Event modifiers
          let viewMultiplier = 1;
          if (activeEvent?.effect.type === "viewMultiplier") {
            viewMultiplier = activeEvent.effect.amount;
          }

          // Passive income generates views too
          const passiveViewGain = passiveIncome > 0 ? passiveIncome * 10 * delta * viewMultiplier : 0;
          const netViewChange = passiveViewGain - viewDecay * delta;
          const newViews = Math.max(0, s.viralViews + netViewChange);
          const newThreatLevel = GameStore.getThreatLevel(newViews);
          const newMoney = s.money + passiveGain;
          const newTotal = s.totalEarned + passiveGain;

          // Random event trigger (1% chance per tick)
          if (!activeEvent && Math.random() < 0.001) {
            const newEvent = getRandomEvent();
            activeEvent = newEvent;
            eventEndTime = now + newEvent.duration * 1000;
            if (newEvent.effect.type === "pauseFraud") {
              isPaused = true;
            }
          }

          // Random Nick Shirley location
          let nickLocation = s.nickShirleyLocation;
          if (Math.random() < 0.01) {
            const zones = ["daycare", "housing", "autism", "medicaid", null];
            nickLocation = zones[Math.floor(Math.random() * zones.length)];
          }

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
            lastTick: now,
            isGameOver: newViews >= VIRAL_THRESHOLD,
            isVictory: newTotal >= TARGET_AMOUNT,
            activeEvent,
            eventEndTime,
            isPaused,
            nickShirleyLocation: nickLocation,
            unlockedAchievements: newAchievements,
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
        set({
          ...INITIAL_STATE,
          lastTick: Date.now(),
          gameStartTime: Date.now(),
          totalArrestCount: state.totalArrestCount + 1,
          prestigeBonuses: state.prestigeBonuses,
          unlockedAchievements: state.unlockedAchievements,
        });
      },
    }),
    {
      name: "minnesota-fraud-empire",
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        totalArrestCount: state.totalArrestCount,
        prestigeBonuses: state.prestigeBonuses,
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

    // Prestige bonuses
    const prestigeMultiplier = 1 + state.totalArrestCount * 0.1;

    return Math.floor(base * multiplier * prestigeMultiplier);
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

    // Prestige bonuses
    const prestigeMultiplier = 1 + state.totalArrestCount * 0.1;

    return total * prestigeMultiplier;
  };

  export const getViewsGain = (state: GameState, zone: Zone): number => {
    let base = zone.viewsPerClick;
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
      multiplier *= 2;
    }

    return Math.floor(base * multiplier);
  };

  export const getViewDecay = (state: GameState): number => {
    let total = 0;

    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;

      if (upgrade.effect.type === "viewDecay") {
        total += upgrade.effect.amount * owned;
      }
    });

    return total;
  };

  export const getThreatLevel = (views: number): GameState.ThreatLevel => {
    if (views >= 100_000_000) return "the-video";
    if (views >= 50_000_000) return "viral";
    if (views >= 10_000_000) return "national-story";
    if (views >= 1_000_000) return "regional-news";
    if (views >= 100_000) return "gaining-traction";
    if (views >= 10_000) return "local-blogger";
    return "safe";
  };

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

  export const getUpgradeCost = (upgrade: Upgrade, owned: number): number =>
    Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));

  export const checkAchievements = (state: GameState, achievements: string[]): void => {
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
    if (amount >= 1_000_000_000) return "$" + (amount / 1_000_000_000).toFixed(2) + "B";
    if (amount >= 1_000_000) return "$" + (amount / 1_000_000).toFixed(2) + "M";
    if (amount >= 1_000) return "$" + (amount / 1_000).toFixed(2) + "K";
    return "$" + amount.toFixed(0);
  };
}
