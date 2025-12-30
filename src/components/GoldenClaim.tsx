import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const [colorParticles, setColorParticles] = useState<GoldenClaim.ColorParticle[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [sparkles, setSparkles] = useState<GoldenClaim.Sparkle[]>([]);
  const warningPlayedRef = useRef(false);

  // Ambient sparkles around the golden claim
  useEffect(() => {
    if (!goldenClaim || isCaught) return;
    
    const addSparkle = () => {
      const id = Date.now() + Math.random();
      const sparkle: GoldenClaim.Sparkle = {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setSparkles((prev) => [...prev.slice(-5), sparkle]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 600);
    };
    
    const interval = setInterval(addSparkle, 300);
    return () => clearInterval(interval);
  }, [goldenClaim, isCaught]);

  const handleClick = useCallback(() => {
    if (!goldenClaim) return;

    // Play special sound for discount claims
    if (goldenClaim.type === "discount") {
      playSound("discountActive");
    } else {
      playSound("goldenClaim");
    }
    
    clickGoldenClaim();
    setIsCaught(true);
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 200);

    // Create emoji explosion particles (more of them)
    const newParticles: GoldenClaim.Particle[] = Array.from({ length: 20 }).map(
      (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 100 + Math.random() * 80;
        return {
          id: i,
          emoji: ["💵", "💰", "💴", "💸", "✨", "⭐", "💎", "🪙", "💫"][Math.floor(Math.random() * 9)],
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          rot: Math.random() * 720,
        };
      }
    );
    setParticles(newParticles);

    // Create colored glowing particles
    const goldenColors = ["#fbbf24", "#f59e0b", "#eab308", "#fcd34d", "#ffffff"];
    const newColorParticles: GoldenClaim.ColorParticle[] = Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
      const distance = 60 + Math.random() * 100;
      return {
        id: Date.now() + i,
        color: goldenColors[Math.floor(Math.random() * goldenColors.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 6 + Math.random() * 8,
      };
    });
    setColorParticles(newColorParticles);

    setTimeout(() => {
      setIsCaught(false);
      setParticles([]);
      setColorParticles([]);
    }, 700);
  }, [goldenClaim, clickGoldenClaim]);

  useEffect(() => {
    setIsCaught(false);
    warningPlayedRef.current = false;
  }, [goldenClaim?.x, goldenClaim?.y]);

  // Timer warning sound when golden claim is about to expire (last 2 seconds)
  useEffect(() => {
    if (!goldenClaim || warningPlayedRef.current) return;
    
    const timeLeft = goldenClaim.expiresAt - Date.now();
    if (timeLeft <= 2000 && timeLeft > 0) {
      playSound("timerWarning");
      warningPlayedRef.current = true;
    } else if (timeLeft > 2000) {
      // Set a timeout to play warning at the right time
      const warningTimer = setTimeout(() => {
        if (!warningPlayedRef.current) {
          playSound("timerWarning");
          warningPlayedRef.current = true;
        }
      }, timeLeft - 2000);
      return () => clearTimeout(warningTimer);
    }
  }, [goldenClaim]);

  // Calculate golden claim boost multiplier
  const goldenBoostMultiplier = useMemo(() => {
    return GameStore.getGoldenClaimMultiplier({
      ownedUpgrades,
      unlockedZones,
    } as Parameters<typeof GameStore.getGoldenClaimMultiplier>[0]);
  }, [ownedUpgrades, unlockedZones]);

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
      {/* Screen flash on collection */}
      {screenFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-50 animate-screen-flash"
          style={{
            background: "radial-gradient(circle at center, rgba(251, 191, 36, 0.4), transparent 70%)",
          }}
        />
      )}

      {/* Colored glowing particles */}
      {colorParticles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none animate-spiral-burst z-40"
          style={{
            left: `${goldenClaim.x}%`,
            top: `${goldenClaim.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": "360deg",
          } as React.CSSProperties}
        />
      ))}

      {/* Main golden claim */}
      <button
        onClick={handleClick}
        className={`
          fixed z-30 cursor-pointer transition-all
          ${
            isCaught
              ? "animate-golden-grabbed"
              : "animate-golden-float hover:scale-110"
          }
        `}
        style={{
          left: `${goldenClaim.x}%`,
          top: `${goldenClaim.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Ambient sparkles */}
        {!isCaught && sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute pointer-events-none animate-sparkle text-sm"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            ✨
          </div>
        ))}

        {/* Spotlight effect - enhanced */}
        <div
          className="absolute inset-0 -z-10 animate-golden-pulse pointer-events-none"
          style={{
            width: "180px",
            height: "180px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(201, 162, 39, 0.5) 0%, rgba(201, 162, 39, 0.2) 30%, rgba(201, 162, 39, 0.05) 50%, transparent 70%)",
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

        {/* Bonus label with boost indicator */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-money)",
              color: "var(--color-money-bright)",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
            }}
          >
            <span>{bonusDisplay.text}</span>
            {goldenBoostMultiplier > 1 && (
              <span
                className="px-1 py-0.5 rounded text-[9px]"
                style={{
                  background: "var(--color-corruption)30",
                  color: "var(--color-corruption)",
                }}
              >
                ×{goldenBoostMultiplier.toFixed(1)}
              </span>
            )}
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

      {/* Explosion particles with spiral */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed text-2xl pointer-events-none animate-spiral-burst z-40"
          style={
            {
              left: `${goldenClaim.x}%`,
              top: `${goldenClaim.y}%`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rot}deg`,
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
    rot: number;
  };

  export type ColorParticle = {
    id: number;
    color: string;
    tx: number;
    ty: number;
    size: number;
  };

  export type Sparkle = {
    id: number;
    x: number;
    y: number;
  };
}
