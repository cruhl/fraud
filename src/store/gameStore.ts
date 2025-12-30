import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UPGRADES, type Upgrade } from "~/data/upgrades";
import { ZONES, type Zone } from "~/data/zones";
import { CREW_MEMBERS } from "~/data/crew";
import { type PoliticalEvent, getRandomEventForProgress } from "~/data/events";
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

export type ShredderMinigame = {
  id: number;
  startedAt: number;
  clicks: number;
  requiredClicks: number;
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
  nickFilmingProgress: number; // 0-100, builds when Nick is in player's zone
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

  // Shredder Minigame
  shredderMinigame: ShredderMinigame | null;
  lastShredderTime: number;

  // Crew System
  hiredCrew: string[];

  // Tutorial/Onboarding
  hasSeenTutorial: boolean;
  hasSeenNickWarning: boolean; // First time views hit 1M

  // Lifetime Stats
  lifetimeStats: LifetimeStats;

  // Timing
  lastTick: number;
  gameStartTime: number;

  // Zone specialization
  zoneEnteredTime: number;
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
  clickShredder: () => void;
  hireCrew: (crewId: string) => void;
  dismissTutorial: () => void;
  dismissNickWarning: () => void;
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
  nickFilmingProgress: 0,
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
  shredderMinigame: null,
  lastShredderTime: 0,
  hiredCrew: [],
  hasSeenTutorial: false,
  hasSeenNickWarning: false,
  lifetimeStats: INITIAL_LIFETIME_STATS,
  lastTick: Date.now(),
  gameStartTime: Date.now(),
  zoneEnteredTime: Date.now(),
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
        
        // Calculate zone cost with crew discount
        let zoneCost = zone.unlockCost;
        state.hiredCrew?.forEach((crewId) => {
          const crew = CREW_MEMBERS.find((c) => c.id === crewId);
          if (crew?.effect.type === "zoneDiscountPercent") {
            zoneCost = zoneCost * (1 - crew.effect.percent);
          }
        });
        
        if (state.money < zoneCost) return;

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
            money: s.money - zoneCost,
            unlockedZones: newZones,
            activeZone: zoneId,
            zoneEnteredTime: Date.now(),
            unlockedAchievements: newAchievements,
          };
        });
      },

      setActiveZone: (zoneId: string) => {
        const state = get();
        if (!state.unlockedZones.includes(zoneId)) return;
        // Reset zone entered time when switching zones (expertise resets)
        // Also reset Nick filming progress (switching zones interrupts filming)
        set({ activeZone: zoneId, zoneEnteredTime: Date.now(), nickFilmingProgress: 0 });
      },

      tick: () => {
        const state = get();
        // Stop ticking if game over (arrested) or victory modal is showing
        if (state.isGameOver) return;
        if (state.isVictory && !state.victoryDismissed) return;

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

          // Nick Shirley filming mechanics - declare early to use in view calculation
          let nickLocation = s.nickShirleyLocation;
          let nickFilmingProgress = s.nickFilmingProgress;
          let filmingViewSpike = 0;

          // Dynamic scaling based on progress (prevents late-game snowball)
          const rewardScale = GameStore.getRewardScale(s);
          const penaltyScale = GameStore.getPenaltyScale(s);

          // Random event trigger (0.08% chance per tick for balanced gameplay)
          let eventViewGain = 0;
          let eventViewReduction = 0;
          let eventMoneyBonus = 0;
          if (!activeEvent && Math.random() < 0.0008) {
            const newEvent = getRandomEventForProgress(s.totalEarned);
            activeEvent = newEvent;
            eventEndTime = now + newEvent.duration * 1000;
            // Apply immediate viewGain effect (scales up with progress - bigger target)
            if (newEvent.effect.type === "viewGain") {
              eventViewGain = newEvent.effect.amount * penaltyScale;
            }
            // Investigation effect: immediate view spike (scales up with progress)
            if (newEvent.effect.type === "investigation") {
              eventViewGain = newEvent.effect.viewGain * penaltyScale;
            }
            // View reduction effect: immediate view decrease
            if (newEvent.effect.type === "viewReduction") {
              eventViewReduction = newEvent.effect.amount;
            }
            // Money bonus effect: immediate money gain (scales down with progress)
            if (newEvent.effect.type === "moneyBonus") {
              const scaledFlat = newEvent.effect.flat * rewardScale;
              const scaledPercent = newEvent.effect.percent * rewardScale;
              eventMoneyBonus = scaledFlat + (s.totalEarned * scaledPercent);
            }
          }

          // Event modifiers (income bonuses scale down with progress)
          let viewMultiplier = 1;
          let incomeMultiplier = 1;
          if (activeEvent?.effect.type === "viewMultiplier") {
            viewMultiplier = activeEvent.effect.amount;
          }
          if (activeEvent?.effect.type === "incomeMultiplier") {
            // Scale the bonus portion: 1.5x becomes 1 + (0.5 * rewardScale)
            const baseBonus = activeEvent.effect.amount - 1;
            incomeMultiplier = 1 + (baseBonus * rewardScale);
          }
          // Investigation effect: reduced income + view spike already applied
          if (activeEvent?.effect.type === "investigation") {
            incomeMultiplier = activeEvent.effect.incomeMultiplier;
          }
          // Combo effect: both multipliers (scale income bonus portion)
          if (activeEvent?.effect.type === "combo") {
            const baseBonus = activeEvent.effect.incomeMultiplier - 1;
            incomeMultiplier = 1 + (baseBonus * rewardScale);
            viewMultiplier = activeEvent.effect.viewMultiplier;
          }

          const passiveGain = passiveIncome * delta * incomeMultiplier + eventMoneyBonus;

          // Random Nick Shirley location change (must happen before filming calculation)
          if (Math.random() < 0.01) {
            // Include all zones + null (not visible)
            const zoneIds = ZONES.map((z) => z.id);
            const locations: (string | null)[] = [...zoneIds, null];
            const newLocation = locations[Math.floor(Math.random() * locations.length)];
            
            // If Nick moves away, reset filming progress
            if (newLocation !== nickLocation && nickLocation === s.activeZone) {
              nickFilmingProgress = 0;
            }
            nickLocation = newLocation;
          }
          
          // Nick filming mechanic: builds when he's in player's zone
          if (nickLocation === s.activeZone) {
            // 10% per second = ~10 seconds to complete a segment
            nickFilmingProgress = Math.min(100, nickFilmingProgress + 10 * delta);
            
            // When filming completes, trigger segment upload!
            // View spike scales with progress (bigger target = more viral)
            if (nickFilmingProgress >= 100) {
              filmingViewSpike = 2_000_000 * penaltyScale; // +2M views (scaled)
              nickFilmingProgress = 0; // Reset for next segment
            }
          } else {
            // Not in player's zone, reset progress
            nickFilmingProgress = 0;
          }

          // Passive income generates views (0.05x rate for balanced late-game)
          const passiveViewGain =
            passiveIncome > 0 ? passiveIncome * 0.05 * delta * viewMultiplier : 0;
          
          // View decay always applies to reduce existing views
          // But cap so we never decay more than current views (prevent negative)
          const decayAmount = viewDecay * delta;
          const netViewChange = passiveViewGain - decayAmount + eventViewGain - eventViewReduction + filmingViewSpike;
          const viewCap = GameStore.getViewCap(s);
          const newViews = Math.min(
            viewCap,
            Math.max(0, s.viralViews + netViewChange)
          );
          const newThreatLevel = GameStore.getThreatLevel(newViews);
          const newMoney = s.money + passiveGain;
          const newTotal = s.totalEarned + (passiveGain > 0 ? passiveGain : 0);

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

          // Shredder minigame spawn logic
          let shredderMinigame = s.shredderMinigame;
          let lastShredderTime = s.lastShredderTime;
          let shredderViewPenalty = 0;
          const SHREDDER_VIEW_THRESHOLD = 50_000_000; // 50M views
          const SHREDDER_COOLDOWN = 60_000; // 60 seconds between shredder games
          
          // Check for shredder expiration (failure)
          if (shredderMinigame && now > shredderMinigame.expiresAt) {
            // Failed! +500K views penalty
            shredderViewPenalty = 500_000;
            shredderMinigame = null;
          }
          
          // Spawn shredder when views > 50M (5% chance per tick, with cooldown)
          const timeSinceLastShredder = now - lastShredderTime;
          if (
            !shredderMinigame && 
            newViews >= SHREDDER_VIEW_THRESHOLD && 
            timeSinceLastShredder >= SHREDDER_COOLDOWN &&
            Math.random() < 0.05
          ) {
            shredderMinigame = {
              id: now,
              startedAt: now,
              clicks: 0,
              requiredClicks: 15, // Need 15 clicks in 3 seconds
              expiresAt: now + 3000, // 3 seconds
            };
            lastShredderTime = now;
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

          // Apply shredder failure penalty to views
          const finalViews = Math.min(viewCap, Math.max(0, newViews + shredderViewPenalty));
          const finalThreatLevel = shredderViewPenalty > 0 
            ? GameStore.getThreatLevel(finalViews) 
            : newThreatLevel;

          return {
            money: newMoney,
            totalEarned: newTotal,
            viralViews: finalViews,
            threatLevel: finalThreatLevel,
            maxThreatLevelReached: GameStore.maxThreatLevel(
              s.maxThreatLevelReached,
              finalThreatLevel
            ),
            lastTick: now,
            isGameOver: finalViews >= VIRAL_THRESHOLD,
            isVictory: newTotal >= TARGET_AMOUNT,
            activeEvent,
            eventEndTime,
            isPaused,
            nickShirleyLocation: nickLocation,
            nickFilmingProgress,
            unlockedAchievements: newAchievements,
            goldenClaim,
            lastGoldenClaimTime:
              goldenClaim && goldenClaim.id === now
                ? now
                : s.lastGoldenClaimTime,
            shredderMinigame,
            lastShredderTime,
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
          
          // Scale rewards/penalties based on progress
          const rewardScale = GameStore.getRewardScale(s);
          const penaltyScale = GameStore.getPenaltyScale(s);
          
          if (event.effect.type === "viewGain") {
            viralViews += event.effect.amount * penaltyScale;
          }
          // Investigation effect: immediate view spike (scales with progress)
          if (event.effect.type === "investigation") {
            viralViews += event.effect.viewGain * penaltyScale;
          }
          // View reduction effect
          if (event.effect.type === "viewReduction") {
            viralViews = Math.max(0, viralViews - event.effect.amount);
          }
          // Money bonus effect (scales down with progress to prevent snowball)
          if (event.effect.type === "moneyBonus") {
            const scaledFlat = event.effect.flat * rewardScale;
            const scaledPercent = event.effect.percent * rewardScale;
            const bonus = scaledFlat + (totalEarned * scaledPercent);
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
          zoneEnteredTime: Date.now(),
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
          nickFilmingProgress: 0,
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
          const rewardScale = GameStore.getRewardScale(s);
          let moneyBonus = 0;
          let viewsReduction = 0;
          let discountEndTime = s.discountEndTime;

          switch (claim.type) {
            case "money":
              // 25x click value + 2% of total earned (min $1000), boosted by multiplier
              // Scales down with progress to prevent late-game snowball
              const clickBonus = GameStore.getClickValue(s) * 25 * rewardScale;
              const percentBonus = Math.max(1000, s.totalEarned * 0.02) * rewardScale;
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

      clickShredder: () => {
        const state = get();
        if (!state.shredderMinigame) return;
        
        const now = Date.now();
        const shredder = state.shredderMinigame;
        const newClicks = shredder.clicks + 1;
        
        // Check if succeeded (reached required clicks)
        if (newClicks >= shredder.requiredClicks) {
          // Success! -500K views
          const viewReduction = 500_000;
          const newViews = Math.max(0, state.viralViews - viewReduction);
          set({
            shredderMinigame: null,
            viralViews: newViews,
            threatLevel: GameStore.getThreatLevel(newViews),
          });
          return;
        }
        
        // Still clicking
        set({
          shredderMinigame: { ...shredder, clicks: newClicks },
        });
      },

      hireCrew: (crewId: string) => {
        const state = get();
        const crew = CREW_MEMBERS.find((c) => c.id === crewId);
        if (!crew) return;
        if (state.hiredCrew.includes(crewId)) return;
        
        // Apply zone discount if we have that crew member
        let cost = crew.cost;
        const hasZoneDiscount = state.hiredCrew.some((id) => {
          const c = CREW_MEMBERS.find((m) => m.id === id);
          return c?.effect.type === "zoneDiscountPercent";
        });
        if (hasZoneDiscount) {
          const discountCrew = CREW_MEMBERS.find(
            (c) => state.hiredCrew.includes(c.id) && c.effect.type === "zoneDiscountPercent"
          );
          if (discountCrew && discountCrew.effect.type === "zoneDiscountPercent") {
            cost = cost * (1 - discountCrew.effect.percent);
          }
        }
        
        if (state.money < cost) return;
        
        set({
          money: state.money - cost,
          hiredCrew: [...state.hiredCrew, crewId],
        });
      },

      dismissTutorial: () => {
        set({ hasSeenTutorial: true });
      },

      dismissNickWarning: () => {
        set({ hasSeenNickWarning: true });
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
          zoneEnteredTime: Date.now(),
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
          zoneEnteredTime: Date.now(),
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

// Zone expertise time threshold: 5 minutes in milliseconds
const ZONE_EXPERTISE_TIME_MS = 5 * 60 * 1000;
const ZONE_EXPERTISE_BONUS = 1.15; // +15% income bonus

export namespace GameStore {
  // Check if player has zone expertise (5+ minutes in current zone)
  export const hasZoneExpertise = (state: GameState): boolean => {
    const timeInZone = Date.now() - (state.zoneEnteredTime ?? Date.now());
    return timeInZone >= ZONE_EXPERTISE_TIME_MS;
  };

  // Get zone expertise multiplier (1.15 if expert, 1 otherwise)
  export const getZoneExpertiseBonus = (state: GameState): number => {
    return hasZoneExpertise(state) ? ZONE_EXPERTISE_BONUS : 1;
  };

  // ============================================
  // DYNAMIC SCALING - Balance rewards/penalties with progress
  // ============================================

  // Progress ratio: 0 at start, 1 at $9B victory threshold
  export const getProgressRatio = (state: GameState): number =>
    Math.min(1, state.totalEarned / TARGET_AMOUNT);

  // Rewards scale DOWN as you progress (prevents late-game snowball)
  // 100% at start → 30% at victory threshold
  export const getRewardScale = (state: GameState): number =>
    1 - (getProgressRatio(state) * 0.7);

  // Penalties scale UP as you progress (bigger target = more scrutiny)
  // 100% at start → 150% at victory threshold
  export const getPenaltyScale = (state: GameState): number =>
    1 + (getProgressRatio(state) * 0.5);

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
    const zoneExpertiseBonus = getZoneExpertiseBonus(state);

    // Victory bonus: +20% income if player has won before
    const victoryBonus = state.lifetimeStats?.fastestWinTime ? 1.2 : 1;

    return Math.floor(base * multiplier * prestigeMultiplier * victoryBonus * allBonusMultiplier * zoneExpertiseBonus);
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
    const zoneExpertiseBonus = getZoneExpertiseBonus(state);

    // Victory bonus: +20% income if player has won before
    const victoryBonus = state.lifetimeStats?.fastestWinTime ? 1.2 : 1;

    return total * prestigeMultiplier * victoryBonus * allBonusMultiplier * zoneExpertiseBonus;
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
      // Extra filming bonus when he's actively recording in your zone
      if (state.nickFilmingProgress > 0) {
        multiplier *= 2; // 2x views while being filmed
      }
    }

    // Crew member view reduction
    state.hiredCrew?.forEach((crewId) => {
      const crew = CREW_MEMBERS.find((c) => c.id === crewId);
      if (crew?.effect.type === "viewGainReduction") {
        multiplier *= 1 - crew.effect.percent;
      }
    });

    // Cap reduction at 85% - always get at least 15% of base views per click
    multiplier = Math.max(multiplier, 0.15);

    return Math.floor(base * multiplier);
  };

  export const getViewDecay = (state: GameState): number => {
    // Base decay of 1000/sec to help balance view accumulation
    let total = 1000;
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

    // Crew member view decay bonus
    let crewDecayBonus = 0;
    state.hiredCrew?.forEach((crewId) => {
      const crew = CREW_MEMBERS.find((c) => c.id === crewId);
      if (crew?.effect.type === "viewDecayBonus") {
        crewDecayBonus += crew.effect.amount;
      }
    });

    return (total + crewDecayBonus) * multiplier * prestigeDecayBonus;
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
    
    // Add crew acquittal bonus
    bonus += getCrewAcquittalBonus(state);
    
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

  // Get total view reduction percentage (0-1 where 1 = 100% reduction)
  // Capped at 95% to match the actual reduction cap in getViewsGain
  export const getViewReductionPercent = (state: GameState): number => {
    let multiplier = 1;
    
    // Reduction from upgrades
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (upgrade.effect.type === "viewReduction") {
        multiplier *= Math.pow(1 - upgrade.effect.amount, owned);
      }
    });
    
    // Crew member view reduction
    state.hiredCrew?.forEach((crewId) => {
      const crew = CREW_MEMBERS.find((c) => c.id === crewId);
      if (crew?.effect.type === "viewGainReduction") {
        multiplier *= 1 - crew.effect.percent;
      }
    });
    
    // Cap at 85% reduction (matching getViewsGain minimum multiplier of 0.15)
    return Math.min(1 - multiplier, 0.85);
  };

  // Get total click multiplier
  export const getClickMultiplier = (state: GameState): number => {
    let multiplier = 1;
    UPGRADES.forEach((upgrade) => {
      const owned = state.ownedUpgrades[upgrade.id] ?? 0;
      if (owned === 0) return;
      if (!state.unlockedZones.includes(upgrade.zone)) return;
      if (upgrade.effect.type === "clickMultiplier") {
        multiplier *= Math.pow(upgrade.effect.amount, owned);
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
   * Uses logarithmic scaling for claims to prevent instant max in late game
   */
  export const getEvidenceStrength = (state: GameState): number => {
    // Views: 60% weight, scales linearly to 80M
    const viewsComponent = (state.viralViews / 80_000_000) * 0.6;
    
    // Claims: 40% weight, uses logarithmic scaling
    // log10(1000) = 3, log10(100000) = 5, log10(10000000) = 7
    // Scale so 1000 claims = 0.1, 100K = 0.25, 10M = 0.4
    const claimsLog = state.fakeClaims > 0 ? Math.log10(state.fakeClaims) : 0;
    const claimsComponent = Math.min(0.4, (claimsLog / 17.5) * 0.4); // 17.5 = log10 of ~31 billion
    
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
  /**
   * Get zone unlock cost with crew discount applied
   */
  export const getZoneCost = (state: GameState, zone: Zone): number => {
    let cost = zone.unlockCost;
    state.hiredCrew?.forEach((crewId) => {
      const crew = CREW_MEMBERS.find((c) => c.id === crewId);
      if (crew?.effect.type === "zoneDiscountPercent") {
        cost = cost * (1 - crew.effect.percent);
      }
    });
    return Math.floor(cost);
  };

  /**
   * Get acquittal bonus from hired crew members
   */
  export const getCrewAcquittalBonus = (state: GameState): number => {
    let bonus = 0;
    state.hiredCrew?.forEach((crewId) => {
      const crew = CREW_MEMBERS.find((c) => c.id === crewId);
      if (crew?.effect.type === "trialAcquittalBonus") {
        bonus += crew.effect.percent;
      }
    });
    return bonus;
  };

  export const getExpensiveLawyerAcquittalChance = (
    evidenceStrength: number, 
    trialBonus: number
  ): number => {
    // Base 12% at low evidence, down to 5% at high evidence
    const baseChance = 0.12 - evidenceStrength * 0.07;
    // Cap at 85% - investing in legal defense should pay off!
    return Math.min(0.85, baseChance + trialBonus);
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
    // Cap at 50% - public defender gets half the bonus effectiveness
    return Math.min(0.50, baseChance + trialBonus * 0.5);
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
