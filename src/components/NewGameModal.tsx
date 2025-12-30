import { useState } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";

type NewGameModalProps = {
  inMenu?: boolean;
};

export function NewGameModal({ inMenu = false }: NewGameModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState<"fresh" | "full" | null>(null);
  
  const newGame = useGameStore((s) => s.newGame);
  const fullReset = useGameStore((s) => s.fullReset);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);

  const handleFreshStart = () => {
    if (confirmingReset === "fresh") {
      newGame();
      setShowModal(false);
      setConfirmingReset(null);
    } else {
      setConfirmingReset("fresh");
    }
  };

  const handleFullReset = () => {
    if (confirmingReset === "full") {
      fullReset();
      setShowModal(false);
      setConfirmingReset(null);
    } else {
      setConfirmingReset("full");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setConfirmingReset(null);
  };

  // Button that appears in menu or header
  const triggerButton = inMenu ? (
    <button
      onClick={() => setShowModal(true)}
      className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
      style={{ color: "var(--color-text-primary)" }}
    >
      🎮 New Game
    </button>
  ) : (
    <button
      onClick={() => setShowModal(true)}
      className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-highlight)",
        color: "var(--color-text-muted)",
      }}
      title="Start New Game"
    >
      🎮 New
    </button>
  );

  if (!showModal) return triggerButton;

  return (
    <>
      {triggerButton}
      
      {/* Modal overlay */}
      <div
        className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-fade-in"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={handleClose}
      >
        <div
          className="max-w-md w-full overflow-hidden rounded-xl animate-slide-in-up"
          style={{
            background: "linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-primary))",
            border: "2px solid var(--color-border-highlight)",
            boxShadow: "0 0 60px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 text-center"
            style={{
              background: "linear-gradient(135deg, var(--color-corruption), var(--color-corruption-dim))",
            }}
          >
            <div className="text-4xl mb-2">🎮</div>
            <h2
              className="text-xl tracking-widest"
              style={{ fontFamily: "var(--font-display)", color: "white" }}
            >
              NEW GAME OPTIONS
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Current progress summary */}
            <div
              className="rounded-lg p-4 space-y-2 text-sm"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-card)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-display)" }}
              >
                Current Progress
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Total Earned (this run):</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}>
                  {GameStore.formatMoney(totalEarned)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Prestige Level:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-corruption)" }}>
                  {totalArrestCount} arrest{totalArrestCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Achievements:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                  {unlockedAchievements.length} unlocked
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Lifetime Earnings:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-money-bright)" }}>
                  {GameStore.formatMoney(lifetimeStats?.totalMoneyEarned ?? 0)}
                </span>
              </div>
            </div>

            {/* Fresh Start option */}
            <button
              onClick={handleFreshStart}
              className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.01]"
              style={{
                background: confirmingReset === "fresh" 
                  ? "var(--color-corruption)30" 
                  : "var(--color-bg-elevated)",
                border: `2px solid ${confirmingReset === "fresh" ? "var(--color-corruption)" : "var(--color-border-highlight)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                    {confirmingReset === "fresh" ? "CLICK AGAIN TO CONFIRM" : "FRESH START"}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Reset game progress but <span style={{ color: "var(--color-corruption)" }}>keep achievements & prestige bonuses</span>
                  </div>
                  {totalArrestCount > 0 && (
                    <div className="text-xs mt-1" style={{ color: "var(--color-corruption-dim)" }}>
                      You'll keep your +{GameStore.getPrestigeBonusPercent(totalArrestCount)}% income bonus
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Full Reset option */}
            <button
              onClick={handleFullReset}
              className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.01]"
              style={{
                background: confirmingReset === "full"
                  ? "var(--color-danger)30"
                  : "var(--color-bg-elevated)",
                border: `2px solid ${confirmingReset === "full" ? "var(--color-danger)" : "var(--color-border-card)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💀</span>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: confirmingReset === "full" ? "var(--color-danger-bright)" : "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                    {confirmingReset === "full" ? "ARE YOU SURE? CLICK AGAIN" : "FULL RESET"}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    <span style={{ color: "var(--color-danger)" }}>Wipe everything</span> - achievements, prestige, all stats
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--color-text-dim)" }}>
                    Start completely fresh like a new player
                  </div>
                </div>
              </div>
            </button>

            {/* Cancel button */}
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg font-bold transition-all"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-card)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

