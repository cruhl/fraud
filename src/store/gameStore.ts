import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UPGRADES, type Upgrade } from "~/data/upgrades";
import { ZONES, type Zone } from "~/data/zones";
import { type PoliticalEvent, getRandomEvent } from "~/data/events";
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
  victoryDismissed: boolean;
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
  /** New seizure-based prestige: keeps zones/upgrades, seizes money based on sentence */
  prestigeWithSeizure: (sentence: number, wasAcquitted: boolean) => void;
  dismissVictory: () => void;
  clickGoldenClaim: () => void;
  dismissGoldenClaim: () => void;
  unlockTrialAchievement: (type: "arrested" | "acquitted" | "maxSentence") => void;
  newGame: () => void;
  fullReset: () => void;
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
  victoryDismissed: false,
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
        if (state.isGameOver || state.isPaused) return;

        set((s) => {
          const zone = ZONES.find((z) => z.id === s.activeZone);
          if (!zone) return s;

          // Apply investigation income multiplier if active
          let incomeMultiplier = 1;
          if (s.activeEvent?.effect.type === "investigation") {
            incomeMultiplier = s.activeEvent.effect.incomeMultiplier;
          }

          const clickValue = Math.floor(GameStore.getClickValue(s) * incomeMultiplier);
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
        
        // Check if upgrade has reached max quantity
        if (upgrade.maxQuantity !== undefined && owned >= upgrade.maxQuantity) return;
        
        const discountActive = state.discountEndTime
          ? Date.now() < state.discountEndTime
          : false;
        const cost = GameStore.getUpgradeCost(upgrade, owned, discountActive);

        if (state.money < cost || state.isGameOver) return;

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
        if (state.isGameOver) return;

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

          // Random event trigger (0.08% chance per tick for balanced gameplay)
          let eventViewGain = 0;
          let eventViewReduction = 0;
          let eventMoneyBonus = 0;
          if (!activeEvent && Math.random() < 0.0008) {
            const newEvent = getRandomEvent();
            activeEvent = newEvent;
            eventEndTime = now + newEvent.duration * 1000;
            // Apply immediate viewGain effect
            if (newEvent.effect.type === "viewGain") {
              eventViewGain = newEvent.effect.amount;
            }
            // Investigation effect: immediate view spike
            if (newEvent.effect.type === "investigation") {
              eventViewGain = newEvent.effect.viewGain;
            }
            // View reduction effect: immediate view decrease
            if (newEvent.effect.type === "viewReduction") {
              eventViewReduction = newEvent.effect.amount;
            }
            // Money bonus effect: immediate money gain
            if (newEvent.effect.type === "moneyBonus") {
              eventMoneyBonus = newEvent.effect.flat + (s.totalEarned * newEvent.effect.percent);
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
          // Investigation effect: reduced income + view spike already applied
          if (activeEvent?.effect.type === "investigation") {
            incomeMultiplier = activeEvent.effect.incomeMultiplier;
          }
          // Combo effect: both multipliers
          if (activeEvent?.effect.type === "combo") {
            incomeMultiplier = activeEvent.effect.incomeMultiplier;
            viewMultiplier = activeEvent.effect.viewMultiplier;
          }

          const passiveGain = passiveIncome * delta * incomeMultiplier + eventMoneyBonus;

          // Passive income generates views (0.1x rate for balanced late-game)
          const passiveViewGain =
            passiveIncome > 0 ? passiveIncome * 0.1 * delta * viewMultiplier : 0;
          
          // Decay can only reduce passive view gains by up to 90% (always gain at least 10%)
          // This prevents "soft-lock" where decay upgrades completely zero out progress
          const effectiveDecay = Math.min(viewDecay * delta, passiveViewGain * 0.9);
          const netViewChange = passiveViewGain - effectiveDecay + eventViewGain - eventViewReduction;
          const viewCap = GameStore.getViewCap(s);
          const newViews = Math.min(
            viewCap,
            Math.max(0, s.viralViews + netViewChange)
          );
          const newThreatLevel = GameStore.getThreatLevel(newViews);
          const newMoney = s.money + passiveGain;
          const newTotal = s.totalEarned + (passiveGain > 0 ? passiveGain : 0);

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
          let money = s.money;
          let totalEarned = s.totalEarned;
          
          if (event.effect.type === "viewGain") {
            viralViews += event.effect.amount;
          }
          // Investigation effect: immediate view spike
          if (event.effect.type === "investigation") {
            viralViews += event.effect.viewGain;
          }
          // View reduction effect
          if (event.effect.type === "viewReduction") {
            viralViews = Math.max(0, viralViews - event.effect.amount);
          }
          // Money bonus effect
          if (event.effect.type === "moneyBonus") {
            const bonus = event.effect.flat + (totalEarned * event.effect.percent);
            money += bonus;
            totalEarned += bonus;
          }

          return {
            activeEvent: event,
            eventEndTime: now + event.duration * 1000,
            isPaused: false, // No more pausing - investigation still allows play
            viralViews,
            money,
            totalEarned,
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

      prestigeWithSeizure: (sentence: number, wasAcquitted: boolean) => {
        const state = get();
        const currentPrestigeStats = state.lifetimeStats ?? INITIAL_LIFETIME_STATS;
        
        // Calculate seizure rate based on sentence (0-90%)
        // 1 year → ~3% seized, 28 years → ~93% seized
        const seizureRate = wasAcquitted ? 0 : Math.min(0.93, sentence / 30);
        const moneyToKeep = Math.floor(state.money * (1 - seizureRate));
        
        const newStats = {
          ...currentPrestigeStats,
          timesArrested: (currentPrestigeStats.timesArrested ?? 0) + 1,
        };
        
        set({
          // Reset core game state
          money: moneyToKeep,
          totalEarned: moneyToKeep, // Start fresh tracking from what you kept
          fakeClaims: 0,
          viralViews: 0,
          nickShirleyLocation: null,
          threatLevel: "safe" as ThreatLevel,
          maxThreatLevelReached: "safe" as ThreatLevel,
          isGameOver: false,
          isVictory: false,
          victoryDismissed: false,
          isArrested: false,
          isPaused: false,
          
          // KEEP zones and upgrades (connections persist)
          activeZone: state.activeZone,
          unlockedZones: state.unlockedZones,
          ownedUpgrades: state.ownedUpgrades,
          
          // Reset events
          activeEvent: null,
          eventEndTime: null,
          
          // Keep achievements and prestige progress
          unlockedAchievements: state.unlockedAchievements,
          totalArrestCount: state.totalArrestCount + 1,
          prestigeBonuses: state.prestigeBonuses,
          
          // Reset golden claims
          goldenClaim: null,
          lastGoldenClaimTime: 0,
          discountEndTime: null,
          
          // Update lifetime stats
          lifetimeStats: newStats,
          
          // Reset timing
          lastTick: Date.now(),
          gameStartTime: Date.now(),
        });
      },

      dismissVictory: () => {
        set({ victoryDismissed: true });
      },

      clickGoldenClaim: () => {
        const state = get();
        if (!state.goldenClaim || state.isGameOver) return;

        const now = Date.now();
        if (now > state.goldenClaim.expiresAt) return;

        set((s) => {
          const claim = s.goldenClaim!;
          const goldenMultiplier = GameStore.getGoldenClaimMultiplier(s);
          let moneyBonus = 0;
          let viewsReduction = 0;
          let discountEndTime = s.discountEndTime;

          switch (claim.type) {
            case "money":
              // 25x click value + 2% of total earned (min $1000), boosted by multiplier
              const clickBonus = GameStore.getClickValue(s) * 25;
              const percentBonus = Math.max(1000, s.totalEarned * 0.02);
              moneyBonus = (clickBonus + percentBonus) * goldenMultiplier;
              break;
            case "views":
              // -5% of current views (min 10K, max 500K), boosted by multiplier
              viewsReduction = Math.min(
                500_000 * goldenMultiplier,
                Math.max(10_000, s.viralViews * 0.05 * goldenMultiplier)
              );
              break;
            case "discount":
              // 25% off upgrades for 30 seconds (duration boosted)
              discountEndTime = now + 30_000 * goldenMultiplier;
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

      newGame: () => {
        // Starts a fresh game but keeps achievements and prestige bonuses
        const state = get();
        set({
          ...INITIAL_STATE,
          lastTick: Date.now(),
          gameStartTime: Date.now(),
          totalArrestCount: state.totalArrestCount,
          prestigeBonuses: state.prestigeBonuses,
          unlockedAchievements: state.unlockedAchievements,
          lifetimeStats: state.lifetimeStats,
        });
      },

      fullReset: () => {
        // Completely wipes everything including achievements and prestige
        set({
          ...INITIAL_STATE,
          lastTick: Date.now(),
          gameStartTime: Date.now(),
          lifetimeStats: INITIAL_LIFETIME_STATS,
        });
      },
    }),
    {
      name: "minnesota-fraud-empire",
      // Persist full game state for progress saving
    }
  )
);

export namespace GameStore {
  // Get the allBonusMultiplier from luxury upgrades
  export const getAllBonusMultiplier = (state: GameState): number => {
    let multiplier = 1;
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (!state.unlockedZones.includes(upgrade.zone)) return;
      if (upgrade.effect.type === "allBonusMultiplier") {
        multiplier *= Math.pow(upgrade.effect.amount, owned);
      }
    });
    return multiplier;
  };

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
    const allBonusMultiplier = getAllBonusMultiplier(state);

    // Victory bonus: +20% income if player has won before
    const victoryBonus = state.lifetimeStats?.fastestWinTime ? 1.2 : 1;

    return Math.floor(base * multiplier * prestigeMultiplier * victoryBonus * allBonusMultiplier);
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
    const allBonusMultiplier = getAllBonusMultiplier(state);

    // Victory bonus: +20% income if player has won before
    const victoryBonus = state.lifetimeStats?.fastestWinTime ? 1.2 : 1;

    return total * prestigeMultiplier * victoryBonus * allBonusMultiplier;
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
    // Base decay of 500/sec to help balance view accumulation
    let total = 500;
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
        case "playTime":
          // Check if player has played for at least the specified time
          earned = Date.now() - state.gameStartTime >= ach.condition.minTimeMs;
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

  // Get trial acquittal bonus from upgrades
  export const getTrialAcquittalBonus = (state: GameState): number => {
    let bonus = 0;
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (!state.unlockedZones.includes(upgrade.zone)) return;
      if (upgrade.effect.type === "trialBonus") {
        bonus += upgrade.effect.acquittalChance * owned;
      }
    });
    return Math.min(0.8, bonus); // Cap at 80% bonus
  };

  // Get golden claim multiplier from upgrades
  export const getGoldenClaimMultiplier = (state: GameState): number => {
    let multiplier = 1;
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (!state.unlockedZones.includes(upgrade.zone)) return;
      if (upgrade.effect.type === "goldenClaimBoost") {
        multiplier *= Math.pow(upgrade.effect.multiplier, owned);
      }
    });
    return multiplier;
  };

  // ============================================
  // TRIAL SYSTEM - Evidence & Seizure Calculations
  // ============================================

  /**
   * Calculate evidence strength based on viral views and fake claims
   * Returns 0-1 where 1 = overwhelming evidence
   */
  export const getEvidenceStrength = (state: GameState): number => {
    const viewsComponent = (state.viralViews / 80_000_000) * 0.6; // 60% weight
    const claimsComponent = (state.fakeClaims / 5_000) * 0.4; // 40% weight
    return Math.min(1, viewsComponent + claimsComponent);
  };

  /**
   * Get evidence strength label for UI
   */
  export const getEvidenceLabel = (strength: number): string => {
    if (strength >= 0.8) return "OVERWHELMING";
    if (strength >= 0.6) return "STRONG";
    if (strength >= 0.4) return "MODERATE";
    if (strength >= 0.2) return "WEAK";
    return "MINIMAL";
  };

  /**
   * Calculate base sentence based on total earned (~$1.5M per year, max 28)
   * Evidence strength adds 0-25% to sentence
   */
  export const calculateSentence = (totalEarned: number, evidenceStrength: number): number => {
    const baseYears = Math.min(28, Math.ceil(totalEarned / 1_500_000));
    const evidenceModifier = 1 + evidenceStrength * 0.25;
    return Math.min(28, Math.max(1, Math.ceil(baseYears * evidenceModifier)));
  };

  /**
   * Calculate seizure rate based on sentence (0-93%)
   */
  export const getSeizureRate = (sentence: number): number => {
    return Math.min(0.93, sentence / 30);
  };

  /**
   * Get acquittal chance for expensive lawyer (5-12% based on evidence)
   */
  export const getExpensiveLawyerAcquittalChance = (
    evidenceStrength: number, 
    trialBonus: number
  ): number => {
    // Base 12% at low evidence, down to 5% at high evidence
    const baseChance = 0.12 - evidenceStrength * 0.07;
    return Math.min(0.25, baseChance + trialBonus); // Cap at 25%
  };

  /**
   * Get acquittal chance for public defender (2-5% based on evidence)
   */
  export const getPublicDefenderAcquittalChance = (
    evidenceStrength: number,
    trialBonus: number
  ): number => {
    // Base 5% at low evidence, down to 2% at high evidence
    const baseChance = 0.05 - evidenceStrength * 0.03;
    return Math.min(0.15, baseChance + trialBonus * 0.5); // Cap at 15%
  };

  /**
   * Get sentence reduction for expensive lawyer (40-60%)
   */
  export const getExpensiveLawyerReduction = (evidenceStrength: number): number => {
    // Better reduction when evidence is weaker
    return 0.60 - evidenceStrength * 0.20; // 60% at low evidence, 40% at high
  };

  /**
   * Get sentence reduction for public defender (15-30%)
   */
  export const getPublicDefenderReduction = (evidenceStrength: number): number => {
    // Better reduction when evidence is weaker
    return 0.30 - evidenceStrength * 0.15; // 30% at low evidence, 15% at high
  };

  /**
   * Calculate lawyer cost (20% of money, min $100K, max $50M)
   */
  export const getLawyerCost = (money: number): number => {
    return Math.min(50_000_000, Math.max(100_000, Math.floor(money * 0.20)));
  };
}
