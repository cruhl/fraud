import { useState, useCallback, useMemo } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";

export function StatsModal({ inMenu = false }: StatsModal.Props) {
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const hiredCrew = useGameStore((s) => s.hiredCrew);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Calculate current bonuses
  const currentBonuses = useMemo(() => {
    const pseudoState = {
      ownedUpgrades,
      unlockedZones,
      totalArrestCount,
      lifetimeStats,
      hiredCrew,
    } as Parameters<typeof GameStore.getViewDecay>[0];

    return {
      viewDecay: GameStore.getViewDecay(pseudoState),
      viewReduction: GameStore.getViewReductionPercent(pseudoState),
      clickMultiplier: GameStore.getClickMultiplier(pseudoState),
      goldenClaimMultiplier: GameStore.getGoldenClaimMultiplier(pseudoState),
      trialBonus: GameStore.getTrialAcquittalBonus(pseudoState),
      totalUpgrades: Object.values(ownedUpgrades).reduce((sum, n) => sum + n, 0),
    };
  }, [ownedUpgrades, unlockedZones, totalArrestCount, lifetimeStats, hiredCrew]);

  const handleHardReset = useCallback(() => {
    if (confirmReset) {
      localStorage.removeItem("minnesota-fraud-empire");
      window.location.reload();
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }, [confirmReset]);

  const stats = [
    {
      label: "Total Money Earned",
      value: GameStore.formatMoney(lifetimeStats.totalMoneyEarned),
      icon: "💰",
    },
    {
      label: "Fake Claims Filed",
      value: lifetimeStats.totalClaimsFiled.toLocaleString(),
      icon: "📋",
    },
    {
      label: "Golden Claims Caught",
      value: lifetimeStats.totalGoldenClaimsCaught.toLocaleString(),
      icon: "✨",
    },
    {
      label: "Highest Viral Views",
      value: GameStore.formatViews(lifetimeStats.highestViralViews),
      icon: "📷",
    },
    {
      label: "Times Arrested",
      value: lifetimeStats.timesArrested.toString(),
      icon: "⛓️",
    },
    {
      label: "Total Prestige Level",
      value: totalArrestCount.toString(),
      icon: "⭐",
    },
    {
      label: "Achievements Unlocked",
      value: `${unlockedAchievements.length}`,
      icon: "🏆",
    },
    {
      label: "Fastest Win",
      value: lifetimeStats.fastestWinTime
        ? GameStore.formatTimeMs(lifetimeStats.fastestWinTime)
        : "Not yet",
      icon: "⏱️",
    },
  ];

  // Render as menu item
  if (inMenu) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        📊 Statistics
      </button>
    );
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 rounded-lg text-lg transition-all hover:scale-105"
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-highlight)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
        title="Statistics"
      >
        📊
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-lg w-full overflow-hidden rounded-xl animate-slide-in-up"
            style={{
              background: "linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-primary))",
              border: "2px solid var(--color-border-highlight)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Document header */}
            <div
              className="px-4 md:px-6 py-3 md:py-4 border-b"
              style={{
                borderColor: "var(--color-border-card)",
                background: "var(--color-bg-card)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border-highlight)",
                    }}
                  >
                    <span className="text-xl md:text-2xl">📊</span>
                  </div>
                  <div>
                    <h2
                      className="text-lg md:text-xl tracking-wide"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
                    >
                      LIFETIME STATISTICS
                    </h2>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      Criminal Record Summary
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="p-4 md:p-6 space-y-2 md:space-y-3 max-h-[50vh] overflow-y-auto">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-lg md:text-xl">{stat.icon}</span>
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {stat.label}
                    </span>
                  </div>
                  <span
                    className="font-bold text-sm md:text-base"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Current Bonuses Section */}
            <div className="px-4 md:px-6">
              <div
                className="text-[10px] uppercase tracking-wider mb-2"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
              >
                Active Bonuses
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>View Decay</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
                  >
                    -{GameStore.formatViews(currentBonuses.viewDecay)}/s
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>View Reduction</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
                  >
                    -{Math.round(currentBonuses.viewReduction * 100)}%
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>Click Bonus</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}
                  >
                    {currentBonuses.clickMultiplier.toFixed(2)}x
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>Trial Defense</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
                  >
                    +{Math.round(currentBonuses.trialBonus * 100)}%
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>Golden Claims</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "#fbbf24" }}
                  >
                    {currentBonuses.goldenClaimMultiplier.toFixed(1)}x
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>Upgrades</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}
                  >
                    {currentBonuses.totalUpgrades}
                  </div>
                </div>
              </div>
            </div>

            {/* Prestige bonus info */}
            <div className="px-4 md:px-6 py-4">
              <div
                className="text-center p-3 md:p-4 rounded-lg"
                style={{
                  background: "var(--color-corruption)15",
                  border: "1px solid var(--color-corruption-dim)",
                }}
              >
                <div
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-corruption)", fontFamily: "var(--font-mono)" }}
                >
                  Current Prestige Bonus
                </div>
                <div
                  className="text-xl md:text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-money-bright)" }}
                >
                  +{GameStore.getPrestigeBonusPercent(totalArrestCount)}% Income
                </div>
                <div className="text-[10px] md:text-xs mt-1" style={{ color: "var(--color-text-dim)" }}>
                  Next arrest: +{GameStore.getNextPrestigeBonusPercent(totalArrestCount)}% bonus
                </div>
              </div>
            </div>

            {/* Save info */}
            <div
              className="text-center text-[10px] md:text-xs py-2 md:py-3 border-t"
              style={{
                borderColor: "var(--color-border-card)",
                color: "var(--color-text-dim)",
              }}
            >
              Progress auto-saves every 10 seconds
            </div>

            {/* Hard reset */}
            <div
              className="px-4 md:px-6 py-3 md:py-4 border-t"
              style={{
                borderColor: "var(--color-border-card)",
                background: "var(--color-bg-primary)",
              }}
            >
              <button
                onClick={handleHardReset}
                className="w-full py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all"
                style={{
                  background: confirmReset ? "var(--color-danger)" : "var(--color-bg-elevated)",
                  border: `1px solid ${confirmReset ? "var(--color-danger-bright)" : "var(--color-border-card)"}`,
                  color: confirmReset ? "white" : "var(--color-text-muted)",
                }}
              >
                {confirmReset ? "⚠️ Click again to confirm HARD RESET" : "Hard Reset (Delete All Data)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export namespace StatsModal {
  export type Props = {
    inMenu?: boolean;
  };
}
