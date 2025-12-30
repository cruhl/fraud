import { useEffect, useState, useCallback, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { Clicker } from "~/components/Clicker";
import { Counter } from "~/components/Counter";
import { Upgrades } from "~/components/Upgrades";
import { ViralMeter } from "~/components/ViralMeter";
import { ZoneSelector } from "~/components/ZoneSelector";
import { MinneapolisMap } from "~/components/MinneapolisMap";
import { EventBanner } from "~/components/EventBanner";
import { Trial } from "~/components/Trial";
import { Victory } from "~/components/Victory";
import { NewsTicker } from "~/components/NewsTicker";
import { Achievements } from "~/components/Achievements";
import { GoldenClaim } from "~/components/GoldenClaim";
import { StatsModal } from "~/components/StatsModal";
import { NewGameModal } from "~/components/NewGameModal";
import {
  isSoundEnabled,
  setSoundEnabled,
  MusicManager,
  playSound,
  getSfxVolume,
  setSfxVolume,
} from "~/hooks/useAudio";
import { getCharacterImageUrl } from "~/lib/assets";

// Nick Shirley character portrait URL for mobile alert
const NICK_SHIRLEY_IMAGE = getCharacterImageUrl("nick-shirley");

type MobileTab = "play" | "zones" | "shop" | "stats";

export function App() {
  const tick = useGameStore((s) => s.tick);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const viralViews = useGameStore((s) => s.viralViews);
  const money = useGameStore((s) => s.money);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const activeZone = useGameStore((s) => s.activeZone);
  const isVictory = useGameStore((s) => s.isVictory);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);

  const [showMap, setShowMap] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [musicOn, setMusicOn] = useState(() => MusicManager.isEnabled());
  const [musicVolume, setMusicVolume] = useState(() =>
    MusicManager.getVolume()
  );
  const [sfxVolume, setSfxVolumeState] = useState(() => getSfxVolume());
  const [isShaking, setIsShaking] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("play");
  const [menuOpen, setMenuOpen] = useState(false);

  // Refs to track previous values for sound triggers
  const prevNickLocationRef = useRef<string | null>(null);
  const prevThreatLevelRef = useRef(threatLevel);

  const toggleSound = useCallback(() => {
    const newValue = !soundOn;
    setSoundOn(newValue);
    setSoundEnabled(newValue);
  }, [soundOn]);

  const toggleMusic = useCallback(() => {
    const newValue = !musicOn;
    setMusicOn(newValue);
    MusicManager.setEnabled(newValue);
    if (newValue) {
      // Resume playing based on current game state
      const track = viralViews >= 50_000_000 ? "danger" : "normal";
      MusicManager.play(track);
    }
  }, [musicOn, viralViews]);

  const handleMusicVolume = useCallback((vol: number) => {
    setMusicVolume(vol);
    MusicManager.setVolume(vol);
  }, []);

  const handleSfxVolume = useCallback((vol: number) => {
    setSfxVolumeState(vol);
    setSfxVolume(vol);
  }, []);

  // Game loop
  useEffect(() => {
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [tick]);

  // Debug: expose game state tools to window for debugging/balancing
  useEffect(() => {
    // Import save manager dynamically to avoid circular deps
    import("~/lib/saveManager").then((saveManager) => {
      const wSaves = window as unknown as {
        saveGame: typeof saveManager.saveGame;
        loadGame: typeof saveManager.loadGame;
        listSaves: typeof saveManager.listSaves;
        deleteSave: typeof saveManager.deleteSave;
        exportSave: typeof saveManager.exportSave;
        importSave: typeof saveManager.importSave;
      };
      wSaves.saveGame = saveManager.saveGame;
      wSaves.loadGame = saveManager.loadGame;
      wSaves.listSaves = saveManager.listSaves;
      wSaves.deleteSave = saveManager.deleteSave;
      wSaves.exportSave = saveManager.exportSave;
      wSaves.importSave = saveManager.importSave;
    });

    const w = window as unknown as {
      dumpGameState: () => Record<string, unknown>;
      injectState: (partial: Record<string, unknown>) => void;
      testScenarios: Record<string, () => void>;
      gameStore: typeof useGameStore;
    };

    w.gameStore = useGameStore;

    w.dumpGameState = () => {
      const state = useGameStore.getState();
      const dump = {
        money: state.money,
        totalEarned: state.totalEarned,
        fakeClaims: state.fakeClaims,
        viralViews: state.viralViews,
        nickShirleyLocation: state.nickShirleyLocation,
        threatLevel: state.threatLevel,
        maxThreatLevelReached: state.maxThreatLevelReached,
        activeZone: state.activeZone,
        unlockedZones: state.unlockedZones,
        ownedUpgrades: state.ownedUpgrades,
        activeEvent: state.activeEvent,
        eventEndTime: state.eventEndTime,
        isGameOver: state.isGameOver,
        isVictory: state.isVictory,
        isArrested: state.isArrested,
        isPaused: state.isPaused,
        unlockedAchievements: state.unlockedAchievements,
        totalArrestCount: state.totalArrestCount,
        prestigeBonuses: state.prestigeBonuses,
        goldenClaim: state.goldenClaim,
        discountEndTime: state.discountEndTime,
        lifetimeStats: state.lifetimeStats,
        gameStartTime: state.gameStartTime,
      };
      console.log("=== GAME STATE DUMP ===");
      console.log(JSON.stringify(dump, null, 2));
      return dump;
    };

    // Inject partial state for testing
    w.injectState = (partial: Record<string, unknown>) => {
      useGameStore.setState(partial);
      console.log("✅ State injected:", Object.keys(partial));
      w.dumpGameState();
    };

    // Predefined test scenarios for balance testing
    w.testScenarios = {
      // ============================================
      // PROGRESSION STAGES
      // ============================================

      // Fresh start: tutorial-like state
      freshStart: () =>
        w.injectState({
          money: 0,
          totalEarned: 0,
          fakeClaims: 0,
          viralViews: 0,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: {},
          totalArrestCount: 0,
          isGameOver: false,
          isVictory: false,
        }),

      // Early game: just started, basic upgrades
      earlyGame: () =>
        w.injectState({
          money: 5000,
          totalEarned: 10000,
          fakeClaims: 50,
          viralViews: 50000,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: { "misspelled-sign": 5, "phantom-toddlers": 2 },
        }),

      // First zone unlock: approaching food-program
      firstUnlock: () =>
        w.injectState({
          money: 45000,
          totalEarned: 80000,
          fakeClaims: 200,
          viralViews: 150000,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: {
            "misspelled-sign": 10,
            "phantom-toddlers": 5,
            "empty-building": 15,
            "tinted-windows": 3,
          },
        }),

      // Mid game: unlocked a few zones, moderate income
      midGame: () =>
        w.injectState({
          money: 500000,
          totalEarned: 5000000,
          fakeClaims: 500,
          viralViews: 5000000,
          activeZone: "food-program",
          unlockedZones: ["daycare", "food-program", "housing"],
          ownedUpgrades: {
            "misspelled-sign": 20,
            "phantom-toddlers": 10,
            "empty-building": 30,
            "ghost-meals": 15,
            "aimee-bock-method": 10,
            "complicit-inspector": 1,
          },
        }),

      // Late game: most zones unlocked, high passive income
      lateGame: () =>
        w.injectState({
          money: 50000000,
          totalEarned: 500000000,
          fakeClaims: 3000,
          viralViews: 20000000,
          activeZone: "political",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
          ],
          ownedUpgrades: {
            "misspelled-sign": 30,
            "phantom-toddlers": 15,
            "empty-building": 50,
            "tinted-windows": 20,
            "ghost-meals": 20,
            "aimee-bock-method": 40,
            "complicit-inspector": 1,
            "hud-contact": 3,
            "super-pac": 5,
            "media-suppression": 1,
          },
        }),

      // Endgame: near victory, testing final stretch
      endGame: () =>
        w.injectState({
          money: 100000000,
          totalEarned: 8000000000,
          fakeClaims: 10000,
          viralViews: 50000000,
          activeZone: "state-capture",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "misspelled-sign": 50,
            "phantom-toddlers": 25,
            "empty-building": 100,
            "tinted-windows": 30,
            "ghost-meals": 30,
            "aimee-bock-method": 60,
            "complicit-inspector": 1,
            "hud-contact": 5,
            "super-pac": 10,
            "media-suppression": 2,
            "lobbyist-army": 3,
            "governor-on-payroll": 2,
          },
        }),

      // All zones unlocked: diversified portfolio
      allZones: () =>
        w.injectState({
          money: 300000000,
          totalEarned: 3000000000,
          fakeClaims: 5000,
          viralViews: 30000000,
          activeZone: "endgame",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "empty-building": 50,
            "aimee-bock-method": 30,
            "super-pac": 8,
            "crypto-laundering": 1,
            "burner-phones": 3,
          },
        }),

      // ============================================
      // VIEW/THREAT LEVEL TESTING
      // ============================================

      // Near arrest: high views, testing danger zone
      nearArrest: () =>
        w.injectState({
          money: 10000000,
          totalEarned: 100000000,
          viralViews: 95000000,
          threatLevel: "the-video",
          maxThreatLevelReached: "the-video",
        }),

      // Just before viral: testing tension zone
      preTension: () =>
        w.injectState({
          money: 5000000,
          totalEarned: 50000000,
          viralViews: 9500000,
          threatLevel: "regional-news",
        }),

      // Just hit viral: 50M+ views
      viralThreshold: () =>
        w.injectState({
          money: 20000000,
          totalEarned: 200000000,
          viralViews: 50000000,
          threatLevel: "viral",
        }),

      // National story: 10M+ views
      nationalStory: () =>
        w.injectState({
          money: 8000000,
          totalEarned: 80000000,
          viralViews: 15000000,
          threatLevel: "national-story",
        }),

      // Max decay: testing decay cap with heavy decay upgrades
      maxDecay: () =>
        w.injectState({
          money: 20000000,
          totalEarned: 500000000,
          viralViews: 40000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "political",
            "endgame",
          ],
          ownedUpgrades: {
            "complicit-inspector": 1,
            "hud-contact": 5,
            "media-suppression": 3,
            "political-connections": 2,
            "media-fixer": 1,
            "numbered-accounts": 2,
          },
        }),

      // Rich but low views: testing view generation
      richLowViews: () =>
        w.injectState({
          money: 100000000,
          totalEarned: 1000000000,
          viralViews: 100000,
          threatLevel: "gaining-traction",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
          ],
          ownedUpgrades: {
            "super-pac": 10,
            "cultural-liaisons": 10,
            "aimee-bock-method": 50,
          },
        }),

      // ============================================
      // VIEW CAP TESTING
      // ============================================

      // With immunity deal (85M cap)
      immunityDeal: () =>
        w.injectState({
          money: 150000000,
          totalEarned: 2000000000,
          viralViews: 80000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
          ],
          ownedUpgrades: {
            "immunity-deal": 1,
            "super-pac": 5,
          },
        }),

      // With DOJ contact (75M cap)
      dojContact: () =>
        w.injectState({
          money: 700000000,
          totalEarned: 5000000000,
          viralViews: 70000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
          ],
          ownedUpgrades: {
            "doj-contact": 1,
            "immunity-deal": 1,
            "crypto-laundering": 1,
          },
        }),

      // Total immunity (50M cap) - maximum protection
      totalImmunity: () =>
        w.injectState({
          money: 2500000000,
          totalEarned: 7000000000,
          viralViews: 45000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "total-immunity": 1,
            "doj-contact": 1,
            "immunity-deal": 1,
            "governor-on-payroll": 3,
          },
        }),

      // Diplomatic credentials (40M cap) - ultimate protection
      diplomaticImmunity: () =>
        w.injectState({
          money: 8500000000,
          totalEarned: 8500000000,
          viralViews: 35000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "diplomatic-immunity": 1,
            "total-immunity": 1,
            "doj-contact": 1,
            "governor-on-payroll": 5,
            "permanent-majority": 2,
          },
        }),

      // ============================================
      // TRIAL & PRESTIGE TESTING
      // ============================================

      // Trigger immediate arrest
      triggerArrest: () =>
        w.injectState({
          viralViews: 100000001,
          isGameOver: true,
          isArrested: true,
          money: 50000000,
          totalEarned: 500000000,
          fakeClaims: 2000,
        }),

      // With trial bonuses (max acquittal chance)
      maxTrialBonus: () =>
        w.injectState({
          money: 500000000,
          totalEarned: 3000000000,
          viralViews: 99000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
          ],
          ownedUpgrades: {
            "offshore-lawyer-retainer": 1,
            "crisis-management-team": 1,
            "double-life": 1,
            "evidence-tampering": 1,
          },
        }),

      // Prestige level 1: first arrest completed
      prestige1: () =>
        w.injectState({
          money: 0,
          totalEarned: 0,
          fakeClaims: 0,
          viralViews: 0,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: {},
          totalArrestCount: 1,
          isGameOver: false,
          isVictory: false,
          lifetimeStats: {
            totalMoneyEarned: 100000000,
            totalClaimsFiled: 1000,
            totalGoldenClaimsCaught: 5,
            highestViralViews: 100000000,
            fastestWinTime: null,
            timesArrested: 1,
          },
        }),

      // Prestige level 3: veteran player
      prestige3: () =>
        w.injectState({
          money: 10000,
          totalEarned: 10000,
          fakeClaims: 50,
          viralViews: 20000,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: { "empty-building": 5 },
          totalArrestCount: 3,
          lifetimeStats: {
            totalMoneyEarned: 500000000,
            totalClaimsFiled: 5000,
            totalGoldenClaimsCaught: 25,
            highestViralViews: 100000000,
            fastestWinTime: null,
            timesArrested: 3,
          },
        }),

      // Prestige level 5: career criminal
      prestige5: () =>
        w.injectState({
          money: 50000,
          totalEarned: 50000,
          fakeClaims: 100,
          viralViews: 30000,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: { "empty-building": 10, "misspelled-sign": 8 },
          totalArrestCount: 5,
          lifetimeStats: {
            totalMoneyEarned: 2000000000,
            totalClaimsFiled: 15000,
            totalGoldenClaimsCaught: 50,
            highestViralViews: 100000000,
            fastestWinTime: 900000, // 15 min
            timesArrested: 5,
          },
        }),

      // ============================================
      // VICTORY TESTING
      // ============================================

      // Just before victory
      nearVictory: () =>
        w.injectState({
          money: 500000000,
          totalEarned: 8900000000,
          fakeClaims: 15000,
          viralViews: 40000000,
          activeZone: "state-capture",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "governor-on-payroll": 5,
            "permanent-majority": 3,
            "federal-appointment": 2,
          },
        }),

      // Trigger immediate victory
      triggerVictory: () =>
        w.injectState({
          money: 1000000000,
          totalEarned: 9000000001,
          isVictory: true,
          viralViews: 30000000,
        }),

      // Post-victory state (has won before)
      postVictory: () =>
        w.injectState({
          money: 0,
          totalEarned: 0,
          fakeClaims: 0,
          viralViews: 0,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: {},
          totalArrestCount: 0,
          isVictory: false,
          lifetimeStats: {
            totalMoneyEarned: 9500000000,
            totalClaimsFiled: 20000,
            totalGoldenClaimsCaught: 100,
            highestViralViews: 80000000,
            fastestWinTime: 1200000, // 20 min
            timesArrested: 2,
          },
        }),

      // ============================================
      // GOLDEN CLAIM TESTING
      // ============================================

      // Ready for golden claim (has multiplier upgrade)
      goldenClaimReady: () =>
        w.injectState({
          money: 200000000,
          totalEarned: 2000000000,
          viralViews: 20000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
          ],
          ownedUpgrades: {
            "golden-claim-mastery": 1,
            "super-pac": 5,
          },
          goldenClaim: null,
          lastGoldenClaimTime: 0, // Force spawn eligibility
        }),

      // With active golden claim (money type)
      activeGoldenMoney: () => {
        const now = Date.now();
        w.injectState({
          money: 100000000,
          totalEarned: 1000000000,
          viralViews: 15000000,
          goldenClaim: {
            id: now,
            type: "money",
            x: 50,
            y: 50,
            expiresAt: now + 10000, // 10 seconds
          },
        });
      },

      // With active golden claim (views type)
      activeGoldenViews: () => {
        const now = Date.now();
        w.injectState({
          money: 50000000,
          totalEarned: 500000000,
          viralViews: 60000000, // High views for testing reduction
          goldenClaim: {
            id: now,
            type: "views",
            x: 30,
            y: 70,
            expiresAt: now + 10000,
          },
        });
      },

      // With active golden claim (discount type)
      activeGoldenDiscount: () => {
        const now = Date.now();
        w.injectState({
          money: 80000000,
          totalEarned: 800000000,
          viralViews: 25000000,
          goldenClaim: {
            id: now,
            type: "discount",
            x: 70,
            y: 40,
            expiresAt: now + 10000,
          },
        });
      },

      // ============================================
      // ZONE-SPECIFIC TESTING
      // ============================================

      // Daycare only (starter zone max)
      daycareMax: () =>
        w.injectState({
          money: 35000,
          totalEarned: 35000,
          viralViews: 80000,
          activeZone: "daycare",
          unlockedZones: ["daycare"],
          ownedUpgrades: {
            "misspelled-sign": 15,
            "empty-building": 25,
            "phantom-toddlers": 10,
            "tinted-windows": 8,
            "fake-naptime-logs": 10,
            "emergency-children": 3,
            "complicit-inspector": 1,
            "shell-company": 1,
            "rotating-addresses": 5,
            "fake-fire-drill": 8,
          },
        }),

      // Medical fraud focus (autism + medicaid)
      medicalFraud: () =>
        w.injectState({
          money: 15000000,
          totalEarned: 100000000,
          viralViews: 8000000,
          activeZone: "medicaid",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
          ],
          ownedUpgrades: {
            "fake-diagnoses": 10,
            "session-templates": 8,
            "licensed-therapist": 1,
            "parent-signatures": 5,
            "pca-fraud": 8,
            "durable-equipment": 6,
            "prescription-kickbacks": 4,
            "political-connections": 1,
          },
        }),

      // Political focus
      politicalFocus: () =>
        w.injectState({
          money: 100000000,
          totalEarned: 800000000,
          viralViews: 25000000,
          activeZone: "political",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
          ],
          ownedUpgrades: {
            "super-pac": 10,
            "campaign-donations": 5,
            "lobbyist-army": 8,
            "media-suppression": 2,
            "friendly-judge": 2,
            "whistleblower-silencer": 1,
            "legislative-capture": 3,
            "wine-cellar": 1,
            "designer-suits": 1,
            "slush-fund": 1,
          },
        }),

      // Shadow banking focus
      shadowBankingFocus: () =>
        w.injectState({
          money: 500000000,
          totalEarned: 4000000000,
          viralViews: 35000000,
          activeZone: "shadow-banking",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
          ],
          ownedUpgrades: {
            "offshore-accounts": 5,
            "numbered-accounts": 3,
            "shell-corporations": 4,
            "swiss-bankers": 2,
            "yacht-party": 1,
            "kenya-hotel": 2,
            "turkey-real-estate": 2,
            "cryptocurrency-portfolio": 1,
            "double-life": 1,
          },
        }),

      // ============================================
      // LUXURY ITEMS TESTING
      // ============================================

      // All luxury items (test allBonusMultiplier stacking)
      allLuxury: () =>
        w.injectState({
          money: 1000000000,
          totalEarned: 6000000000,
          viralViews: 25000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "dubai-mansion": 1,
            "fleet-of-mercedes": 1,
            "private-jet": 1,
            "yacht-party": 1,
            "rolex-collection": 1,
            "art-collection": 1,
            "wine-cellar": 1,
            "gold-chains": 1,
            "designer-suits": 1,
            "cryptocurrency-portfolio": 1,
          },
        }),

      // ============================================
      // EDGE CASES
      // ============================================

      // Zero money with high earnings (spent it all)
      brokeButRich: () =>
        w.injectState({
          money: 0,
          totalEarned: 500000000,
          viralViews: 15000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
          ],
          ownedUpgrades: {
            "aimee-bock-method": 50,
            "fake-diagnoses": 20,
            "pca-fraud": 15,
          },
        }),

      // Nick Shirley in your zone
      nickInZone: () =>
        w.injectState({
          money: 10000000,
          totalEarned: 50000000,
          viralViews: 5000000,
          activeZone: "daycare",
          nickShirleyLocation: "daycare",
          unlockedZones: ["daycare", "food-program"],
        }),

      // Active discount (test upgrade pricing)
      activeDiscount: () => {
        const now = Date.now();
        w.injectState({
          money: 50000000,
          totalEarned: 200000000,
          viralViews: 10000000,
          discountEndTime: now + 30000, // 30 seconds
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
          ],
        });
      },

      // Many achievements unlocked
      achievementHunter: () =>
        w.injectState({
          money: 200000000,
          totalEarned: 1000000000,
          viralViews: 20000000,
          fakeClaims: 10000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
          ],
          ownedUpgrades: {
            "misspelled-sign": 1,
            "aimee-bock-method": 1,
            "crypto-laundering": 1,
            "state-senator": 1,
            "super-pac": 1,
            "lobbyist-army": 1,
          },
          unlockedAchievements: [
            "quality-learing",
            "licensed-for-99",
            "first-million",
            "ten-million",
            "fifty-million",
            "hundred-million",
            "food-program-unlocked",
            "housing-crisis",
            "spectrum-of-fraud",
            "full-medicaid",
            "refugee-unlocked",
            "political-machine",
            "local-news",
            "regional-story",
            "national-story",
            "aimee-bock-student",
            "super-pac-player",
            "lobbyist-connections",
            "hundred-claims",
            "thousand-claims",
          ],
          totalArrestCount: 2,
          lifetimeStats: {
            totalMoneyEarned: 2000000000,
            totalClaimsFiled: 15000,
            totalGoldenClaimsCaught: 30,
            highestViralViews: 90000000,
            fastestWinTime: null,
            timesArrested: 2,
          },
        }),

      // Speed run setup (high income, low views, lots of money)
      speedRunSetup: () =>
        w.injectState({
          money: 500000000,
          totalEarned: 2000000000,
          viralViews: 5000000,
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            // Max view reduction
            "misspelled-sign": 30,
            "tinted-windows": 20,
            "therapy-network": 1,
            "swiss-bankers": 1,
            "state-senator": 1,
            "media-empire": 1,
            // Max income
            "governor-on-payroll": 5,
            "permanent-majority": 3,
            "federal-appointment": 2,
            "international-connections": 3,
          },
          gameStartTime: Date.now(), // Reset timer
        }),

      // Careful criminal setup (win without high threat)
      carefulCriminal: () =>
        w.injectState({
          money: 300000000,
          totalEarned: 5000000000,
          viralViews: 8000000,
          threatLevel: "regional-news",
          maxThreatLevelReached: "regional-news",
          unlockedZones: [
            "daycare",
            "food-program",
            "housing",
            "autism",
            "medicaid",
            "refugee-services",
            "political",
            "nonprofit-empire",
            "endgame",
            "shadow-banking",
            "state-capture",
          ],
          ownedUpgrades: {
            "total-immunity": 1,
            "diplomatic-immunity": 1,
            "media-empire": 1,
            "governor-on-payroll": 5,
          },
        }),
    };

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("🎮 Debug helpers loaded:");
      console.log("  • dumpGameState() - dump current state as JSON");
      console.log("  • injectState({...}) - inject partial state");
      console.log("");
      console.log("📊 Test Scenarios (testScenarios.*):");
      console.log(
        "  PROGRESSION: freshStart, earlyGame, firstUnlock, midGame, lateGame, endGame, allZones"
      );
      console.log(
        "  VIEWS/THREAT: nearArrest, preTension, viralThreshold, nationalStory, maxDecay, richLowViews"
      );
      console.log(
        "  VIEW CAPS: immunityDeal, dojContact, totalImmunity, diplomaticImmunity"
      );
      console.log(
        "  TRIAL: triggerArrest, maxTrialBonus, prestige1, prestige3, prestige5"
      );
      console.log("  VICTORY: nearVictory, triggerVictory, postVictory");
      console.log(
        "  GOLDEN: goldenClaimReady, activeGoldenMoney, activeGoldenViews, activeGoldenDiscount"
      );
      console.log(
        "  ZONES: daycareMax, medicalFraud, politicalFocus, shadowBankingFocus"
      );
      console.log(
        "  SPECIAL: allLuxury, brokeButRich, nickInZone, activeDiscount, achievementHunter"
      );
      console.log("  STRATEGY: speedRunSetup, carefulCriminal");
      console.log("");
      console.log("  • gameStore.getState() / gameStore.setState({...})");
      console.log(
        "  • saveGame(name) / loadGame(name) / listSaves() / deleteSave(name)"
      );
    }
  }, []);

  // Screen shake on event
  useEffect(() => {
    if (activeEvent) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeEvent?.id]);

  // Nick Shirley alert sound when he enters the player's active zone
  useEffect(() => {
    if (
      nickShirleyLocation === activeZone &&
      nickShirleyLocation !== null &&
      prevNickLocationRef.current !== activeZone
    ) {
      playSound("nickNearby");
    }
    prevNickLocationRef.current = nickShirleyLocation;
  }, [nickShirleyLocation, activeZone]);

  // Threat level escalation sound
  useEffect(() => {
    const prevIndex = GameStore.THREAT_LEVEL_ORDER.indexOf(
      prevThreatLevelRef.current
    );
    const currentIndex = GameStore.THREAT_LEVEL_ORDER.indexOf(threatLevel);
    if (currentIndex > prevIndex && currentIndex >= 2) {
      // Play sound when threat escalates to "gaining-traction" or higher
      playSound("event");
    }
    prevThreatLevelRef.current = threatLevel;
  }, [threatLevel]);

  const hasEvent = !!activeEvent;
  const isHighDanger = viralViews >= 50_000_000;
  const isTension = viralViews >= 10_000_000 && viralViews < 50_000_000;
  const isGameOver = useGameStore((s) => s.isGameOver);

  // Music track switching based on game state
  useEffect(() => {
    if (!MusicManager.isEnabled()) return;

    // Trial gets its own music
    if (isGameOver && !isVictory) {
      MusicManager.play("trial");
      return;
    }

    // Victory, danger, tension, or normal based on views
    const track = isVictory
      ? "victory"
      : isHighDanger
      ? "danger"
      : isTension
      ? "tension"
      : "normal";

    MusicManager.play(track);
  }, [isVictory, isHighDanger, isTension, isGameOver]);

  const lifetimeStats = useGameStore((s) => s.lifetimeStats);

  const passiveIncome = GameStore.getPassiveIncome({
    ownedUpgrades,
    unlockedZones,
    totalArrestCount,
    lifetimeStats,
  } as never);

  const clickValue = GameStore.getClickValue({
    ownedUpgrades,
    unlockedZones,
    activeZone,
    totalArrestCount,
    lifetimeStats,
  } as never);

  return (
    <div
      className={`min-h-screen ${isShaking ? "animate-screen-shake" : ""}`}
      style={{
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-serif)",
        paddingBottom: "120px", // Space for news ticker + mobile nav
      }}
    >
      {/* Danger overlay at high viral views */}
      {isHighDanger && (
        <>
          {/* Bottom danger gradient */}
          <div
            className="fixed inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(139, 47, 53, 0.2) 0%, rgba(139, 47, 53, 0.08) 30%, transparent 60%)",
            }}
          />
          {/* Side vignettes */}
          <div
            className="fixed inset-0 pointer-events-none z-10"
            style={{
              boxShadow:
                "inset 0 0 150px rgba(139, 47, 53, 0.3), inset 0 0 80px rgba(139, 47, 53, 0.15)",
            }}
          />
          {/* Pulsing edge glow */}
          <div
            className="fixed inset-0 pointer-events-none z-10 animate-pulse"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(201, 68, 80, 0.1) 0%, transparent 50%)",
            }}
          />
        </>
      )}

      {/* Event banner */}
      <EventBanner />

      {/* Compact Header - Enhanced with depth */}
      <header
        className={`relative border-b overflow-hidden ${
          hasEvent ? "mt-14" : ""
        }`}
        style={{
          borderColor: "var(--color-border-card)",
          background:
            "linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 40%, var(--color-bg-primary) 100%)",
        }}
      >
        {/* Atmospheric top glow */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 10%, var(--color-corruption-dim) 50%, transparent 90%)",
          }}
        />

        {/* Classified watermark - hidden on mobile */}
        <div
          className="absolute inset-0 items-center justify-center pointer-events-none overflow-hidden hidden md:flex"
          style={{ opacity: 0.025 }}
        >
          <div
            className="text-[10rem] whitespace-nowrap rotate-[-10deg]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-danger)",
              letterSpacing: "0.3em",
            }}
          >
            CLASSIFIED
          </div>
        </div>

        {/* Subtle diagonal lines pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(212, 180, 92, 0.015) 4px, rgba(212, 180, 92, 0.015) 5px)",
          }}
        />

        {/* Header content - flex layout */}
        <div className="relative z-10 flex items-center justify-between px-3 md:px-6 py-4 md:py-5">
          {/* Left spacer for mobile menu button */}
          <div className="w-10 md:hidden" />

          {/* Center - Title */}
          <div className="flex-1 text-center">
            {/* Top decorative line */}
            <div
              className="hidden md:flex items-center justify-center gap-3 mb-2"
              style={{ color: "var(--color-text-dim)" }}
            >
              <div
                className="h-px w-12"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-border-highlight))",
                }}
              />
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                State of Minnesota
              </span>
              <div
                className="h-px w-12"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-border-highlight), transparent)",
                }}
              />
            </div>

            <h1
              className="text-lg sm:text-2xl md:text-4xl lg:text-5xl tracking-wider"
              style={{
                fontFamily: "var(--font-display)",
                background:
                  "linear-gradient(135deg, var(--color-danger-bright) 0%, var(--color-corruption) 40%, var(--color-money-bright) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 60px rgba(212, 180, 92, 0.15)",
              }}
            >
              <span className="md:hidden">MINNESOTA</span>
              <span className="hidden md:inline">FRAUD RUN</span>
            </h1>
            {/* Tagline - hidden on very small screens */}
            <p
              className="mt-1 text-[9px] sm:text-xs md:text-sm tracking-widest hidden xs:block"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
              }}
            >
              $9 Billion · 14 Programs · One YouTuber
            </p>
            {/* Prestige badge */}
            {totalArrestCount > 0 && (
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[9px] md:text-xs"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-corruption)15, var(--color-corruption)25)",
                  border: "1px solid var(--color-corruption-dim)",
                  boxShadow: "0 0 20px rgba(212, 180, 92, 0.1)",
                }}
              >
                <span style={{ color: "var(--color-money-bright)" }}>★</span>
                <span
                  style={{
                    color: "var(--color-corruption)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.05em",
                  }}
                >
                  PRESTIGE +
                  {GameStore.getPrestigeBonusPercent(totalArrestCount)}%
                </span>
              </div>
            )}
          </div>

          {/* Right - Desktop controls */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Music Toggle + Volume */}
            <div
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-highlight)",
              }}
            >
              <button
                onClick={toggleMusic}
                className="text-base hover:scale-105 transition-transform"
                title={musicOn ? "Music On" : "Music Off"}
              >
                🎵
              </button>
              {musicOn && (
                <>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={musicVolume}
                    onChange={(e) =>
                      handleMusicVolume(parseFloat(e.target.value))
                    }
                    className="w-14 h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: "var(--color-border-highlight)" }}
                    title={`Volume: ${Math.round(musicVolume * 100)}%`}
                  />
                  <button
                    onClick={() => MusicManager.skip()}
                    className="text-base hover:scale-105 transition-transform"
                    title="Skip Track"
                  >
                    ⏭️
                  </button>
                </>
              )}
              <button
                onClick={toggleSound}
                className="text-base hover:scale-105 transition-transform"
                title={soundOn ? "SFX On" : "SFX Off"}
              >
                {soundOn ? "🔊" : "🔇"}
              </button>
              {soundOn && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sfxVolume}
                  onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
                  className="w-14 h-1 rounded-full appearance-none cursor-pointer"
                  style={{ background: "var(--color-border-highlight)" }}
                  title={`SFX Volume: ${Math.round(sfxVolume * 100)}%`}
                />
              )}
            </div>
            <NewGameModal />
            <Achievements />
            <StatsModal />
          </div>
        </div>
      </header>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`fixed right-3 w-10 h-10 rounded-lg z-50 flex items-center justify-center md:hidden transition-all ${
          hasEvent ? "top-[70px]" : "top-3"
        }`}
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-highlight)",
        }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className={`fixed right-3 z-50 rounded-lg p-2 space-y-1 md:hidden ${
            hasEvent ? "top-[120px]" : "top-14"
          }`}
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-highlight)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          <button
            onClick={() => {
              toggleSound();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {soundOn ? "🔊" : "🔇"} SFX {soundOn ? "On" : "Off"}
          </button>
          {soundOn && (
            <div className="px-4 py-2 flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                SFX
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: "var(--color-border-highlight)" }}
              />
            </div>
          )}
          <button
            onClick={() => {
              toggleMusic();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {musicOn ? "🎵" : "🎵"} Music {musicOn ? "On" : "Off"}
          </button>
          {musicOn && (
            <div className="px-4 py-2 flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Music
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: "var(--color-border-highlight)" }}
              />
              <button
                onClick={() => MusicManager.skip()}
                className="text-base hover:scale-105 transition-transform"
                title="Skip Track"
              >
                ⏭️
              </button>
            </div>
          )}
          <NewGameModal inMenu />
          <StatsModal inMenu />
          <Achievements inMenu />
        </div>
      )}

      {/* Main game area */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] 2xl:grid-cols-[1fr_480px] gap-6 max-w-7xl mx-auto">
          {/* Left column */}
          <div className="space-y-5">
            {/* Clicker + Mini Counter row */}
            <div
              className="relative rounded-xl p-5 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 50%, var(--color-bg-primary) 100%)",
                border: "1px solid var(--color-border-card)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
              }}
            >
              {/* Subtle top edge glow */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 20%, var(--color-corruption-dim) 50%, transparent 80%)",
                }}
              />
              <div className="flex items-center gap-8">
                <Clicker />
                <div className="flex-1">
                  <Counter />
                </div>
              </div>
            </div>

            {/* Viral Meter */}
            <div
              className="relative rounded-xl p-5 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 50%, var(--color-bg-primary) 100%)",
                border: "1px solid var(--color-border-card)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 20%, var(--color-danger) 50%, transparent 80%)",
                  opacity: 0.5,
                }}
              />
              <ViralMeter />
            </div>

            {/* Zone selector */}
            <div
              className="relative rounded-xl p-5 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 50%, var(--color-bg-primary) 100%)",
                border: "1px solid var(--color-border-card)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 20%, var(--color-money) 50%, transparent 80%)",
                  opacity: 0.4,
                }}
              />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <h3
                    className="text-sm uppercase tracking-widest"
                    style={{
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    Fraud Zones
                  </h3>
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-highlight)",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {showMap ? "▤ List" : "◈ Map"}
                </button>
              </div>
              {showMap ? <MinneapolisMap /> : <ZoneSelector />}
            </div>
          </div>

          {/* Right column - Upgrades */}
          <aside
            className="relative rounded-xl p-5 h-fit sticky transition-all duration-300 overflow-hidden"
            style={{
              top: hasEvent ? "72px" : "16px",
              background:
                "linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 30%, var(--color-bg-primary) 100%)",
              border: "1px solid var(--color-border-card)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 10%, var(--color-corruption) 50%, transparent 90%)",
                opacity: 0.5,
              }}
            />
            <Upgrades />
          </aside>
        </div>

        {/* MOBILE/TABLET LAYOUT */}
        <div className="lg:hidden space-y-4">
          {/* Clicker - Always visible on mobile */}
          <div
            className="relative rounded-xl p-5 flex flex-col items-center overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 50%, var(--color-bg-primary) 100%)",
              border: "1px solid var(--color-border-card)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 20%, var(--color-corruption-dim) 50%, transparent 80%)",
              }}
            />
            <Clicker />

            {/* Compact stats row */}
            <div
              className="w-full mt-5 grid grid-cols-3 gap-2 text-center"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div
                className="p-2.5 rounded-lg"
                style={{
                  background:
                    "linear-gradient(180deg, var(--color-bg-primary), rgba(0,0,0,0.3))",
                  border: "1px solid var(--color-border-card)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Balance
                </div>
                <div
                  className="text-sm font-bold mt-0.5"
                  style={{
                    color: "var(--color-money-bright)",
                    textShadow: "0 0 20px rgba(212, 180, 92, 0.3)",
                  }}
                >
                  {GameStore.formatMoney(money)}
                </div>
              </div>
              <div
                className="p-2.5 rounded-lg"
                style={{
                  background:
                    "linear-gradient(180deg, var(--color-bg-primary), rgba(0,0,0,0.3))",
                  border: "1px solid var(--color-border-card)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Per Click
                </div>
                <div
                  className="text-sm font-bold mt-0.5"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {GameStore.formatMoney(clickValue)}
                </div>
              </div>
              <div
                className="p-2.5 rounded-lg"
                style={{
                  background:
                    "linear-gradient(180deg, var(--color-bg-primary), rgba(0,0,0,0.3))",
                  border: "1px solid var(--color-border-card)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Passive
                </div>
                <div
                  className="text-sm font-bold mt-0.5"
                  style={{
                    color:
                      passiveIncome > 0
                        ? "var(--color-money-bright)"
                        : "var(--color-text-muted)",
                    textShadow:
                      passiveIncome > 0
                        ? "0 0 20px rgba(212, 180, 92, 0.3)"
                        : undefined,
                  }}
                >
                  {GameStore.formatMoney(passiveIncome)}/s
                </div>
              </div>
            </div>

            {/* Mobile Nick Shirley Alert */}
            <div
              className="w-full mt-4 rounded-lg overflow-hidden"
              style={{
                background:
                  viralViews >= 50_000_000
                    ? "linear-gradient(90deg, rgba(185, 28, 28, 0.2), rgba(220, 38, 38, 0.15))"
                    : viralViews >= 10_000_000
                    ? "linear-gradient(90deg, rgba(249, 115, 22, 0.15), rgba(251, 146, 60, 0.1))"
                    : "linear-gradient(90deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.08))",
                border: `1px solid ${
                  viralViews >= 50_000_000
                    ? "rgba(220, 38, 38, 0.4)"
                    : viralViews >= 10_000_000
                    ? "rgba(249, 115, 22, 0.3)"
                    : "rgba(74, 222, 128, 0.2)"
                }`,
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                {/* Nick portrait */}
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${
                    nickShirleyLocation === activeZone
                      ? "animate-warning-flash"
                      : ""
                  }`}
                  style={{
                    border: `2px solid ${
                      viralViews >= 50_000_000
                        ? "#dc2626"
                        : viralViews >= 10_000_000
                        ? "#f97316"
                        : "#4ade80"
                    }`,
                    boxShadow:
                      nickShirleyLocation === activeZone
                        ? "0 0 12px rgba(220, 38, 38, 0.6)"
                        : undefined,
                  }}
                >
                  <img
                    src={NICK_SHIRLEY_IMAGE}
                    alt="Nick Shirley"
                    className="w-full h-full object-cover ai-image-character"
                  />
                </div>

                {/* Status text */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] uppercase tracking-wider font-semibold truncate"
                    style={{
                      fontFamily: "var(--font-display)",
                      color:
                        nickShirleyLocation === activeZone
                          ? "#dc2626"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {nickShirleyLocation === activeZone ? (
                      <span className="animate-warning-flash">
                        ⚠ FILMING YOUR ZONE!
                      </span>
                    ) : (
                      "Nick Shirley's Investigation"
                    )}
                  </div>
                  {/* Progress bar */}
                  <div
                    className="h-1.5 rounded-full mt-1 overflow-hidden"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (viralViews / GameStore.VIRAL_LIMIT) * 100
                        )}%`,
                        background:
                          viralViews >= 50_000_000
                            ? "linear-gradient(90deg, #dc2626, #b91c1c)"
                            : viralViews >= 10_000_000
                            ? "linear-gradient(90deg, #f97316, #fb923c)"
                            : "linear-gradient(90deg, #22c55e, #4ade80)",
                      }}
                    />
                  </div>
                </div>

                {/* Views count */}
                <div
                  className="text-right shrink-0"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <div
                    className="text-sm font-bold"
                    style={{
                      color:
                        viralViews >= 50_000_000
                          ? "#dc2626"
                          : viralViews >= 10_000_000
                          ? "#f97316"
                          : "var(--color-text-primary)",
                    }}
                  >
                    {GameStore.formatViews(viralViews)}
                  </div>
                  <div
                    className="text-[8px] uppercase"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    views
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-card)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            {(["play", "zones", "shop", "stats"] as MobileTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className="flex-1 py-3 text-[11px] uppercase tracking-wider font-semibold transition-all"
                style={{
                  fontFamily: "var(--font-display)",
                  background:
                    mobileTab === tab
                      ? "linear-gradient(180deg, var(--color-corruption)20, var(--color-corruption)10)"
                      : "transparent",
                  color:
                    mobileTab === tab
                      ? "var(--color-corruption)"
                      : "var(--color-text-muted)",
                  borderBottom:
                    mobileTab === tab
                      ? "2px solid var(--color-corruption)"
                      : "2px solid transparent",
                  boxShadow:
                    mobileTab === tab
                      ? "inset 0 -10px 20px rgba(212, 180, 92, 0.05)"
                      : undefined,
                }}
              >
                {tab === "play" && "📊 "}
                {tab === "zones" && "🗺️ "}
                {tab === "shop" && "🛒 "}
                {tab === "stats" && "📹 "}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            className="relative rounded-xl p-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 50%, var(--color-bg-primary) 100%)",
              border: "1px solid var(--color-border-card)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              minHeight: "220px",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 20%, var(--color-border-highlight) 50%, transparent 80%)",
              }}
            />
            {mobileTab === "play" && <Counter />}
            {mobileTab === "zones" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-sm uppercase tracking-widest"
                    style={{
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Fraud Zones
                  </h3>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs px-2.5 py-1 rounded-md transition-colors"
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border-highlight)",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {showMap ? "▤ List" : "◈ Map"}
                  </button>
                </div>
                {showMap ? <MinneapolisMap /> : <ZoneSelector compact />}
              </>
            )}
            {mobileTab === "shop" && <Upgrades />}
            {mobileTab === "stats" && <ViralMeter />}
          </div>
        </div>
      </main>

      {/* News ticker */}
      <NewsTicker />

      {/* Trial/Game over modal */}
      <Trial />

      {/* Victory screen */}
      <Victory />

      {/* Golden claim floating bonus */}
      <GoldenClaim />

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
