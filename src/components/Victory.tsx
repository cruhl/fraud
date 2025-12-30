import { useEffect, useState, useMemo } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { playSound } from "~/hooks/useAudio";
import { getScreenImageUrl } from "~/lib/assets";
import { ZONES } from "~/data/zones";

const VICTORY_IMAGE = getScreenImageUrl("victory");

// Pre-generate sparkle positions (static, doesn't need to change)
const SPARKLE_EMOJIS = ["🎉", "💰", "🏆", "💵", "⭐", "✨"];

export function Victory() {
  const isVictory = useGameStore((s) => s.isVictory);
  const victoryDismissed = useGameStore((s) => s.victoryDismissed);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const viralViews = useGameStore((s) => s.viralViews);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const prestige = useGameStore((s) => s.prestige);
  const dismissVictory = useGameStore((s) => s.dismissVictory);
  const [particles, setParticles] = useState<Victory.Particle[]>([]);

  // Pre-generate sparkle data once
  const sparkles = useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1 + Math.random(),
      emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
    })), 
  []);

  useEffect(() => {
    if (isVictory) {
      playSound("victory");
      // Create falling money/document particles
      const newParticles: Victory.Particle[] = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        emoji: ["💵", "💰", "📄", "💸", "🧾", "💴"][Math.floor(Math.random() * 6)],
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      }));
      setParticles(newParticles);
    }
  }, [isVictory]);

  const isGameOver = useGameStore((s) => s.isGameOver);

  // Don't show victory screen if player is arrested (trial takes precedence)
  if (!isVictory || victoryDismissed || isGameOver) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in overflow-hidden"
      style={{ background: "rgba(0,0,0,0.9)" }}
    >
      {/* Falling money particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-3xl pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: "-50px",
            animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      <div 
        className="max-w-lg w-full overflow-hidden rounded-xl animate-slide-in-up relative"
        style={{
          background: "linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-primary))",
          border: "3px solid var(--color-money)",
          boxShadow: "0 0 80px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Victory header with AI-generated artwork or gold gradient fallback */}
        <div 
          className="relative px-6 py-8 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-corruption), var(--color-money-bright), var(--color-corruption))",
          }}
        >
          {/* AI-generated victory background image */}
          <div className="absolute inset-0 ai-image-screen">
            <img 
              src={VICTORY_IMAGE}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.4 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>

          {/* Animated sparkles */}
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            >
              {s.emoji}
            </span>
          ))}

          <div className="relative z-10">
            <div className="text-7xl mb-3">🏆</div>
            <h2 
              className="text-4xl tracking-widest"
              style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--color-bg-primary)",
                textShadow: "2px 2px 0 rgba(255,255,255,0.3)",
              }}
            >
              VICTORY!
            </h2>
            <p 
              className="text-lg mt-2"
              style={{ color: "rgba(0,0,0,0.7)" }}
            >
              You stole the full $9 BILLION!
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p style={{ color: "var(--color-text-secondary)" }}>
              You've matched the estimated fraud total across all 14 Minnesota programs
            </p>
            <p 
              className="text-sm italic mt-2"
              style={{ color: "var(--color-corruption)" }}
            >
              "Half of $18 billion in federal funds may have been defrauded, official says"
            </p>
          </div>

          {/* Final stats */}
          <div 
            className="rounded-lg p-4 mb-6 space-y-3"
            style={{
              background: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-card)",
            }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-muted)" }}>Total Stolen:</span>
              <span 
                className="font-bold"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-money-bright)" }}
              >
                {GameStore.formatMoney(totalEarned)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-muted)" }}>Fake Claims Filed:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                {fakeClaims.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-muted)" }}>Final Viral Views:</span>
              <span 
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-danger-bright)" }}
              >
                {GameStore.formatViews(viralViews)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-muted)" }}>Zones Unlocked:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                {unlockedZones.length}/{ZONES.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-muted)" }}>Total Arrests:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                {totalArrestCount}
              </span>
            </div>
          </div>

          {/* Achievement unlocked */}
          <div 
            className="rounded-lg p-4 mb-6 text-center animate-glow-pulse"
            style={{
              background: "var(--color-money)15",
              border: "1px solid var(--color-money)",
            }}
          >
            <div 
              className="text-sm uppercase tracking-wider mb-1"
              style={{ color: "var(--color-money)", fontFamily: "var(--font-mono)" }}
            >
              🏆 Achievement Unlocked
            </div>
            <div 
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-money-bright)" }}
            >
              THE $9 BILLION CLUB
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={dismissVictory}
              className="flex-1 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02]"
              style={{
                background: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.05em",
                border: "2px solid var(--color-money)",
              }}
            >
              KEEP PLAYING
            </button>
            <button
              onClick={prestige}
              className="flex-1 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, var(--color-money), var(--color-corruption))",
                color: "var(--color-bg-primary)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 20px rgba(201, 162, 39, 0.4)",
              }}
            >
              NEW EMPIRE (+{GameStore.getNextPrestigeBonusPercent(totalArrestCount)}%)
            </button>
          </div>

          {totalArrestCount > 0 && (
            <div 
              className="mt-4 text-center text-xs"
              style={{ color: "var(--color-text-dim)" }}
            >
              Current prestige bonus: +{GameStore.getPrestigeBonusPercent(totalArrestCount)}% income
            </div>
          )}
        </div>
      </div>

      {/* CSS for falling animation */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export namespace Victory {
  export type Particle = {
    id: number;
    emoji: string;
    x: number;
    delay: number;
    duration: number;
  };
}
