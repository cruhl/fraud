import { useState, useEffect, useCallback, useMemo } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { playSound } from "~/hooks/useAudio";

export function GoldenClaim() {
  const goldenClaim = useGameStore((s) => s.goldenClaim);
  const clickGoldenClaim = useGameStore((s) => s.clickGoldenClaim);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const viralViews = useGameStore((s) => s.viralViews);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const activeZone = useGameStore((s) => s.activeZone);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);
  const [isCaught, setIsCaught] = useState(false);
  const [particles, setParticles] = useState<GoldenClaim.Particle[]>([]);

  const handleClick = useCallback(() => {
    if (!goldenClaim) return;

    clickGoldenClaim();
    playSound("goldenClaim");
    setIsCaught(true);

    // Create explosion particles
    const newParticles: GoldenClaim.Particle[] = Array.from({ length: 12 }).map(
      (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 80 + Math.random() * 60;
        return {
          id: i,
          emoji: ["💵", "💰", "💴", "💸", "✨"][Math.floor(Math.random() * 5)],
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
        };
      }
    );
    setParticles(newParticles);

    setTimeout(() => {
      setIsCaught(false);
      setParticles([]);
    }, 600);
  }, [goldenClaim, clickGoldenClaim]);

  useEffect(() => {
    setIsCaught(false);
  }, [goldenClaim?.x, goldenClaim?.y]);

  // Calculate the actual bonus based on golden claim type (matching gameStore logic)
  const bonusDisplay = useMemo(() => {
    if (!goldenClaim) return { text: "", icon: "💰" };
    
    const clickValue = GameStore.getClickValue({
      ownedUpgrades,
      unlockedZones,
      activeZone,
      totalArrestCount,
      lifetimeStats,
    } as never);
    
    switch (goldenClaim.type) {
      case "money": {
        const clickBonus = clickValue * 25;
        const percentBonus = Math.max(1000, totalEarned * 0.02);
        return { 
          text: `+${GameStore.formatMoney(clickBonus + percentBonus)}`,
          icon: "💰"
        };
      }
      case "views": {
        const viewsReduction = Math.min(500_000, Math.max(10_000, viralViews * 0.05));
        return { 
          text: `-${GameStore.formatViews(viewsReduction)} views`,
          icon: "📉"
        };
      }
      case "discount":
        return { 
          text: "25% OFF (30s)",
          icon: "🏷️"
        };
    }
  }, [goldenClaim, ownedUpgrades, unlockedZones, activeZone, totalArrestCount, lifetimeStats, totalEarned, viralViews]);

  if (!goldenClaim) return null;

  return (
    <>
      {/* Main golden claim */}
      <button
        onClick={handleClick}
        className={`
          fixed z-30 cursor-pointer transition-all
          ${
            isCaught
              ? "scale-150 opacity-0"
              : "animate-golden-float hover:scale-110"
          }
        `}
        style={{
          left: `${goldenClaim.x}%`,
          top: `${goldenClaim.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Spotlight effect */}
        <div
          className="absolute inset-0 -z-10 animate-golden-pulse pointer-events-none"
          style={{
            width: "150px",
            height: "150px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, rgba(201, 162, 39, 0.1) 40%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Document/envelope design */}
        <div
          className="relative animate-golden-pulse"
          style={{
            width: "80px",
            height: "100px",
            background:
              "linear-gradient(135deg, var(--color-money-bright), var(--color-corruption))",
            borderRadius: "4px",
            boxShadow:
              "0 8px 30px rgba(201, 162, 39, 0.5), 0 0 60px rgba(201, 162, 39, 0.3)",
            border: "2px solid var(--color-money)",
          }}
        >
          {/* Envelope flap */}
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2"
            style={{
              width: "0",
              height: "0",
              borderLeft: "40px solid transparent",
              borderRight: "40px solid transparent",
              borderBottom: "20px solid var(--color-money-bright)",
            }}
          />

          {/* PRIORITY stamp */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ transform: "rotate(-10deg)" }}
          >
            <div
              className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded"
              style={{
                background: "var(--color-danger)",
                color: "white",
                fontFamily: "var(--font-mono)",
              }}
            >
              PRIORITY
            </div>
            <div
              className="mt-1 text-2xl"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              {bonusDisplay.icon}
            </div>
          </div>

          {/* Shine effect */}
          <div
            className="absolute inset-0 rounded pointer-events-none overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Bonus label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div
            className="px-2 py-1 rounded text-xs font-bold"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-money)",
              color: "var(--color-money-bright)",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
            }}
          >
            {bonusDisplay.text}
          </div>
        </div>

        {/* Click prompt */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div
            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap"
            style={{
              background: "var(--color-bg-primary)",
              border: "1px solid var(--color-corruption-dim)",
              color: "var(--color-corruption)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ← CLICK →
          </div>
        </div>
      </button>

      {/* Explosion particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed text-2xl pointer-events-none animate-particle-burst z-40"
          style={
            {
              left: `${goldenClaim.x}%`,
              top: `${goldenClaim.y}%`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </div>
      ))}
    </>
  );
}

export namespace GoldenClaim {
  export type Particle = {
    id: number;
    emoji: string;
    tx: number;
    ty: number;
  };
}
