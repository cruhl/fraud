import { useMemo, useState, useEffect, useRef } from "react";
import { useGameStore } from "~/store/gameStore";
import { ACHIEVEMENTS, type Achievement } from "~/data/achievements";
import { playSound } from "~/hooks/useAudio";

export function Achievements({ inMenu = false }: Achievements.Props) {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const [isOpen, setIsOpen] = useState(false);

  const unlocked = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;
  const prevCountRef = useRef(unlocked);

  useEffect(() => {
    if (unlocked > prevCountRef.current) {
      playSound("achievement");
    }
    prevCountRef.current = unlocked;
  }, [unlocked]);

  const sortedAchievements = useMemo(
    () =>
      [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedAchievements.includes(a.id);
        const bUnlocked = unlockedAchievements.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
      }),
    [unlockedAchievements]
  );

  // Render as menu item
  if (inMenu) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        🏆 Achievements ({unlocked}/{total})
      </button>
    );
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-highlight)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
      >
        <span className="text-lg">🏆</span>
        <span className="text-sm font-mono" style={{ color: "var(--color-corruption)" }}>
          {unlocked}/{total}
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-xl animate-slide-in-up"
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
                      background: "var(--color-corruption)20",
                      border: "1px solid var(--color-corruption)40",
                    }}
                  >
                    <span className="text-xl md:text-2xl">🏆</span>
                  </div>
                  <div>
                    <h2
                      className="text-xl md:text-2xl tracking-wide"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-corruption)" }}
                    >
                      ACHIEVEMENTS
                    </h2>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      {unlocked} of {total} unlocked
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

            {/* Progress bar */}
            <div className="px-4 md:px-6 py-3" style={{ background: "var(--color-bg-primary)" }}>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border-card)" }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(unlocked / total) * 100}%`,
                    background: "linear-gradient(90deg, var(--color-corruption-dim), var(--color-money-bright))",
                  }}
                />
              </div>
            </div>

            {/* Achievements list */}
            <div className="px-4 md:px-6 py-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 160px)" }}>
              <div className="grid gap-2">
                {sortedAchievements.map((ach, index) => (
                  <Achievements.Item
                    key={ach.id}
                    achievement={ach}
                    isUnlocked={unlockedAchievements.includes(ach.id)}
                    delay={index * 30}
                  />
                ))}
              </div>
            </div>

            {/* Classified watermark */}
            <div
              className="absolute bottom-4 right-4 pointer-events-none opacity-5 hidden md:block"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "4rem",
                color: "var(--color-corruption)",
                transform: "rotate(-10deg)",
              }}
            >
              CLASSIFIED
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export namespace Achievements {
  export type Props = {
    inMenu?: boolean;
  };

  export type ItemProps = {
    achievement: Achievement;
    isUnlocked: boolean;
    delay?: number;
  };

  export function Item({ achievement, isUnlocked, delay = 0 }: ItemProps) {
    return (
      <div
        className="p-2 md:p-3 rounded-lg flex items-center gap-2 md:gap-3 transition-all animate-slide-in-right"
        style={{
          animationDelay: `${delay}ms`,
          background: isUnlocked
            ? "linear-gradient(135deg, var(--color-corruption)15, var(--color-bg-elevated))"
            : "var(--color-bg-primary)",
          border: `1px solid ${isUnlocked ? "var(--color-corruption-dim)" : "var(--color-border-card)"}`,
          opacity: isUnlocked ? 1 : 0.5,
        }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-xl md:text-2xl shrink-0"
          style={{
            background: isUnlocked ? "var(--color-corruption)25" : "var(--color-bg-card)",
            border: `1px solid ${isUnlocked ? "var(--color-corruption)40" : "var(--color-border-card)"}`,
            filter: isUnlocked ? "none" : "grayscale(1)",
          }}
        >
          {achievement.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm truncate"
            style={{
              color: isUnlocked ? "var(--color-corruption)" : "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.03em",
            }}
          >
            {achievement.name}
          </div>
          <div
            className="text-xs truncate"
            style={{ color: isUnlocked ? "var(--color-text-secondary)" : "var(--color-text-dim)" }}
          >
            {achievement.description}
          </div>
        </div>

        {/* Status */}
        {isUnlocked ? (
          <div
            className="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: "var(--color-money)20",
              color: "var(--color-money)",
            }}
          >
            ✓
          </div>
        ) : (
          <div
            className="shrink-0 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] uppercase tracking-wider"
            style={{
              background: "var(--color-border-card)",
              color: "var(--color-text-dim)",
              fontFamily: "var(--font-mono)",
            }}
          >
            LOCKED
          </div>
        )}
      </div>
    );
  }
}
