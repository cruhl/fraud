import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useGameStore } from "~/store/gameStore";
import { ACHIEVEMENTS, type Achievement } from "~/data/achievements";
import { playSound } from "~/hooks/useAudio";

// Toast notification type
type AchievementToast = {
  id: string;
  achievement: Achievement;
  exiting: boolean;
  particles: { id: number; emoji: string; tx: number; ty: number; rot: number }[];
};

export function Achievements({ inMenu = false }: Achievements.Props) {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const viralViews = useGameStore((s) => s.viralViews);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);

  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<AchievementToast[]>([]);
  const [screenGlow, setScreenGlow] = useState(false);

  // Current progress values for achievement tracking
  const progressValues = useMemo(() => ({
    totalEarned,
    viralViews,
    fakeClaims,
    prestigeLevel: totalArrestCount,
    goldenClaimsCaught: lifetimeStats?.goldenClaimsCaught ?? 0,
    prestigeEarned: lifetimeStats?.totalMoneyEarned ?? 0,
  }), [totalEarned, viralViews, fakeClaims, totalArrestCount, lifetimeStats]);

  const unlocked = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;
  const prevCountRef = useRef(unlocked);
  const prevUnlockedRef = useRef<string[]>(unlockedAchievements);

  // Show toast when new achievement unlocked
  const showAchievementToast = useCallback((achievement: Achievement) => {
    const confettiEmojis = ["🎉", "✨", "⭐", "🏆", "💫"];
    const particles = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
      tx: (Math.random() - 0.5) * 100,
      ty: -40 - Math.random() * 40,
      rot: Math.random() * 360,
    }));

    const toast: AchievementToast = {
      id: achievement.id,
      achievement,
      exiting: false,
      particles,
    };

    setToasts((prev) => [...prev, toast]);
    setScreenGlow(true);
    setTimeout(() => setScreenGlow(false), 500);

    // Start exit animation after 3 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === achievement.id ? { ...t, exiting: true } : t))
      );
    }, 3000);

    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== achievement.id));
    }, 3400);
  }, []);

  useEffect(() => {
    if (unlocked > prevCountRef.current) {
      playSound("achievement");
      
      // Find the newly unlocked achievements
      const newlyUnlocked = unlockedAchievements.filter(
        (id) => !prevUnlockedRef.current.includes(id)
      );
      
      // Show toast for each new achievement
      newlyUnlocked.forEach((id) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (achievement) showAchievementToast(achievement);
      });
    }
    prevCountRef.current = unlocked;
    prevUnlockedRef.current = unlockedAchievements;
  }, [unlocked, unlockedAchievements, showAchievementToast]);

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
      {/* Screen edge glow on achievement */}
      {screenGlow && (
        <div
          className="fixed inset-0 pointer-events-none z-40 animate-screen-flash"
          style={{
            boxShadow: "inset 0 0 100px rgba(196, 164, 75, 0.4)",
          }}
        />
      )}

      {/* Achievement toast notifications */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative pointer-events-auto ${
              toast.exiting ? "animate-toast-exit" : "animate-toast-enter"
            }`}
            style={{
              background: "linear-gradient(135deg, var(--color-bg-elevated), var(--color-bg-card))",
              border: "2px solid var(--color-corruption)",
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(196, 164, 75, 0.3)",
              minWidth: "280px",
            }}
          >
            {/* Confetti particles */}
            {toast.particles.map((p) => (
              <div
                key={p.id}
                className="absolute text-lg pointer-events-none animate-confetti-burst"
                style={{
                  left: "50%",
                  top: "50%",
                  "--tx": `${p.tx}px`,
                  "--ty": `${p.ty}px`,
                  "--rot": `${p.rot}deg`,
                } as React.CSSProperties}
              >
                {p.emoji}
              </div>
            ))}

            {/* Shimmer effect */}
            <div
              className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>

            {/* Toast content */}
            <div className="flex items-center gap-3 relative z-10">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg text-2xl animate-rubberband"
                style={{
                  background: "var(--color-corruption)30",
                  border: "1px solid var(--color-corruption)50",
                }}
              >
                {toast.achievement.icon}
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--color-money)", fontFamily: "var(--font-mono)" }}
                >
                  🏆 Achievement Unlocked!
                </div>
                <div
                  className="font-semibold"
                  style={{ color: "var(--color-corruption)", fontFamily: "var(--font-display)" }}
                >
                  {toast.achievement.name}
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {toast.achievement.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
          className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-xl animate-slide-in-up z-[101]"
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
                    progressValues={progressValues}
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

  export type ProgressValues = {
    totalEarned: number;
    viralViews: number;
    fakeClaims: number;
    prestigeLevel: number;
    goldenClaimsCaught: number;
    prestigeEarned: number;
  };

  export type ItemProps = {
    achievement: Achievement;
    isUnlocked: boolean;
    progressValues: ProgressValues;
    delay?: number;
  };

  // Helper to calculate progress for numeric achievement conditions
  function getProgress(condition: Achievement["condition"], values: ProgressValues): { current: number; target: number; percent: number } | null {
    switch (condition.type) {
      case "totalEarned":
        return { current: values.totalEarned, target: condition.amount, percent: Math.min(100, (values.totalEarned / condition.amount) * 100) };
      case "viralViews":
        return { current: values.viralViews, target: condition.amount, percent: Math.min(100, (values.viralViews / condition.amount) * 100) };
      case "fakeClaims":
        return { current: values.fakeClaims, target: condition.amount, percent: Math.min(100, (values.fakeClaims / condition.amount) * 100) };
      case "prestigeLevel":
        return { current: values.prestigeLevel, target: condition.level, percent: Math.min(100, (values.prestigeLevel / condition.level) * 100) };
      case "goldenClaimsCaught":
        return { current: values.goldenClaimsCaught, target: condition.amount, percent: Math.min(100, (values.goldenClaimsCaught / condition.amount) * 100) };
      case "prestigeEarned":
        return { current: values.prestigeEarned, target: condition.amount, percent: Math.min(100, (values.prestigeEarned / condition.amount) * 100) };
      default:
        return null; // Non-numeric conditions
    }
  }

  // Format large numbers for display
  function formatProgressNumber(num: number): string {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  export function Item({ achievement, isUnlocked, progressValues, delay = 0 }: ItemProps) {
    const progress = !isUnlocked ? getProgress(achievement.condition, progressValues) : null;

    return (
      <div
        className="p-2 md:p-3 rounded-lg flex flex-col gap-1.5 transition-all animate-slide-in-right"
        style={{
          animationDelay: `${delay}ms`,
          background: isUnlocked
            ? "linear-gradient(135deg, var(--color-corruption)15, var(--color-bg-elevated))"
            : "var(--color-bg-primary)",
          border: `1px solid ${isUnlocked ? "var(--color-corruption-dim)" : "var(--color-border-card)"}`,
          opacity: isUnlocked ? 1 : 0.6,
        }}
      >
        <div className="flex items-center gap-2 md:gap-3">
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

        {/* Progress bar for locked achievements with numeric conditions */}
        {!isUnlocked && progress && !achievement.secret && (
          <div className="flex items-center gap-2 pl-12 md:pl-14">
            <div 
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--color-border-card)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress.percent}%`,
                  background: progress.percent >= 75 
                    ? "linear-gradient(90deg, var(--color-corruption-dim), var(--color-money))"
                    : progress.percent >= 50
                      ? "linear-gradient(90deg, var(--color-corruption-dim), var(--color-corruption))"
                      : "var(--color-corruption-dim)",
                }}
              />
            </div>
            <span
              className="text-[9px] shrink-0"
              style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
            >
              {formatProgressNumber(progress.current)}/{formatProgressNumber(progress.target)}
            </span>
          </div>
        )}
      </div>
    );
  }
}
