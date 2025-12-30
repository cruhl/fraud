import { useCallback, useState, useRef, useEffect } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";
import { playSound, type SoundType } from "~/hooks/useAudio";
import { getZoneImageUrl } from "~/lib/assets";

// Helper to select click sound based on click value
const getClickSound = (clickValue: number): SoundType => {
  if (clickValue >= 1_000_000) return "clickLarge";
  if (clickValue >= 10_000) return "clickMedium";
  return "click";
};

// Zone-themed particle colors
const ZONE_PARTICLES: Record<string, string[]> = {
  daycare: ["#f59e0b", "#fbbf24", "#fcd34d", "#10b981"],
  housing: ["#3b82f6", "#60a5fa", "#93c5fd", "#c9a227"],
  autism: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#c9a227"],
  medicaid: ["#ec4899", "#f472b6", "#f9a8d4", "#c9a227"],
  political: ["#c9a227", "#e5b82a", "#fcd34d", "#8b7635"],
  "food-program": ["#22c55e", "#4ade80", "#86efac", "#c9a227"],
  endgame: ["#c4a44b", "#8b7635", "#fbbf24", "#f59e0b"],
};

export function Clicker() {
  const click = useGameStore((s) => s.click);
  const activeZone = useGameStore((s) => s.activeZone);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const victoryDismissed = useGameStore((s) => s.victoryDismissed);
  const isPaused = useGameStore((s) => s.isPaused);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<Clicker.FloatingNumber[]>([]);
  const [inkSplatters, setInkSplatters] = useState<Clicker.InkSplatter[]>([]);
  const [shockwaves, setShockwaves] = useState<Clicker.Shockwave[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [stampImprints, setStampImprints] = useState<Clicker.StampImprint[]>([]);
  const [colorParticles, setColorParticles] = useState<Clicker.ColorParticle[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const comboTimeoutRef = useRef<number | null>(null);

  const zone = ZONES.find((z) => z.id === activeZone);
  const clickValue = GameStore.getClickValue({
    ownedUpgrades,
    unlockedZones,
    activeZone,
    totalArrestCount: 0,
  } as never);

  const [particles, setParticles] = useState<Clicker.Particle[]>([]);

  // Reset combo when it times out
  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (isGameOver || isVictory || isPaused) return;

    click();
    playSound(getClickSound(clickValue));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // Track combo
    setComboCount((prev) => prev + 1);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = window.setTimeout(() => setComboCount(0), 800);

    // Add shockwave effect
    const shockwaveId = Date.now() + Math.random();
    setShockwaves((prev) => [...prev, { id: shockwaveId }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((s) => s.id !== shockwaveId));
    }, 500);

    // Screen flash for big clicks ($1M+)
    if (clickValue >= 1_000_000) {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 150);
    }

    // Add stamp imprint ghost
    const imprintId = Date.now() + Math.random();
    setStampImprints((prev) => [...prev, { id: imprintId }]);
    setTimeout(() => {
      setStampImprints((prev) => prev.filter((s) => s.id !== imprintId));
    }, 800);

    // Add floating number with wiggle
    const id = Date.now() + Math.random();
    const x = 50 + (Math.random() - 0.5) * 40;
    const y = 30 + (Math.random() - 0.5) * 20;
    const rotation = (Math.random() - 0.5) * 20;
    setFloatingNumbers((prev) => [...prev, { id, value: clickValue, x, y, rotation }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 1000);

    // Add ink splatters (more on big clicks)
    const splatterId = Date.now() + Math.random();
    const splatterCount = clickValue >= 1_000_000 ? 6 : clickValue >= 10_000 ? 4 : 3;
    const splatters: Clicker.InkSplatter[] = Array.from({ length: splatterCount }).map((_, i) => ({
      id: splatterId + i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 80,
      size: 15 + Math.random() * 30,
      rotation: Math.random() * 360,
    }));
    setInkSplatters((prev) => [...prev, ...splatters]);
    setTimeout(() => {
      setInkSplatters((prev) => prev.filter((s) => !splatters.some((ns) => ns.id === s.id)));
    }, 400);

    // Add zone-colored particles with spiral motion
    const zoneColors = ZONE_PARTICLES[activeZone] || ZONE_PARTICLES.daycare;
    const colorParticleCount = clickValue >= 1_000_000 ? 16 : clickValue >= 10_000 ? 12 : 8;
    const batchId = Date.now();
    const newColorParticles: Clicker.ColorParticle[] = Array.from({ length: colorParticleCount }).map((_, i) => {
      const angle = (i / colorParticleCount) * Math.PI * 2 + Math.random() * 0.3;
      const distance = 60 + Math.random() * 80;
      return {
        id: batchId + Math.random() + i,
        color: zoneColors[Math.floor(Math.random() * zoneColors.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        rotation: 360 + Math.random() * 360,
        size: 4 + Math.random() * 6,
      };
    });
    setColorParticles((prev) => [...prev, ...newColorParticles]);
    setTimeout(() => {
      setColorParticles((prev) => prev.filter((p) => !newColorParticles.some((np) => np.id === p.id)));
    }, 700);

    // Add emoji particles with spiral
    const newParticles: Clicker.Particle[] = [];
    const particleCount = clickValue >= 1_000_000 ? 12 : 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 60 + Math.random() * 60;
      newParticles.push({
        id: batchId + Math.random() + i + 1000,
        emoji: ["💵", "💰", "📄", "💸", "🧾", "📋", "✨", "💎"][Math.floor(Math.random() * 8)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        rotation: 180 + Math.random() * 360,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 700);
  }, [click, clickValue, isGameOver, isVictory, isPaused, activeZone]);

  const getStampContent = () => {
    switch (activeZone) {
      case "daycare":
        return { icon: "📋", text: "APPROVED", subtext: "ATTENDANCE VERIFIED" };
      case "housing":
        return { icon: "🏠", text: "APPROVED", subtext: "VOUCHER ISSUED" };
      case "autism":
        return { icon: "📝", text: "APPROVED", subtext: "THERAPY BILLED" };
      case "medicaid":
        return { icon: "💊", text: "APPROVED", subtext: "CLAIM PROCESSED" };
      case "political":
        return { icon: "🏛️", text: "APPROVED", subtext: "FUNDS ALLOCATED" };
      case "endgame":
        return { icon: "🕸️", text: "APPROVED", subtext: "TRANSFER COMPLETE" };
      default:
        return { icon: "📋", text: "APPROVED", subtext: "FRAUD COMMITTED" };
    }
  };

  const stamp = getStampContent();
  const zoneImageUrl = getZoneImageUrl(activeZone);

  return (
    <div className="relative flex flex-col items-center overflow-visible pt-12 md:pt-14">
      {/* Zone background image - visible on all sizes */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
        style={{ zIndex: -1 }}
      >
        <img 
          src={zoneImageUrl}
          alt=""
          className="w-full h-full object-cover ai-image-zone"
          style={{
            opacity: 0.15,
            filter: "blur(2px) saturate(0.7)",
          }}
        />
        {/* Dark overlay to ensure button readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 20%, rgba(8, 9, 13, 0.9) 70%)",
          }}
        />
      </div>
      
      {/* Combo counter - positioned outside main flow to prevent clipping */}
      {comboCount > 2 && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 animate-combo-pop pointer-events-none z-50 whitespace-nowrap"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: comboCount > 10 ? "1.5rem" : "1.25rem",
            color: comboCount > 10 ? "var(--color-viral-bright)" : "var(--color-corruption)",
            textShadow: `0 0 20px ${comboCount > 10 ? "var(--color-viral)" : "var(--color-corruption)"}`,
          }}
        >
          {comboCount}x COMBO!
        </div>
      )}

      {/* Ink splatters - zone colored */}
      {inkSplatters.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full animate-ink-splatter pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, ${zone?.color || "rgba(139, 47, 53, 1)"}80 0%, transparent 70%)`,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
          }}
        />
      ))}


      {/* Floating numbers with wiggle */}
      {floatingNumbers.map((num) => (
        <div
          key={num.id}
          className="absolute font-mono text-lg md:text-2xl font-bold animate-float-wiggle pointer-events-none z-10"
          style={{
            left: `${num.x}%`,
            top: `${num.y}%`,
            color: "var(--color-money-bright)",
            textShadow: `0 2px 10px rgba(201, 162, 39, 0.6), 0 0 20px rgba(201, 162, 39, 0.4)`,
            transform: `rotate(${num.rotation}deg)`,
          }}
        >
          +{GameStore.formatMoney(num.value)}
        </div>
      ))}

      {/* Main stamp button - responsive sizing */}
      <div className="relative">
        {/* Handle shadow */}
        <div
          className="absolute -inset-4 -top-8 rounded-t-xl blur-xl pointer-events-none hidden md:block"
          style={{
            background: "radial-gradient(ellipse at center bottom, rgba(0,0,0,0.4) 0%, transparent 70%)",
          }}
        />

        <button
          onClick={handleClick}
          disabled={isGameOver || (isVictory && !victoryDismissed) || isPaused}
          className={`
            relative rounded-2xl overflow-visible
            w-36 h-36 md:w-48 md:h-48 lg:w-52 lg:h-52
            flex flex-col items-center justify-center
            font-display text-white font-bold
            select-none cursor-pointer
            transition-all duration-100
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isAnimating ? "animate-stamp-thunk" : "hover:translate-y-[-2px] active:translate-y-[4px]"}
          `}
          style={{
            background: `linear-gradient(145deg, ${zone?.color || "#8B2F35"}, ${zone?.color ? zone.color + "cc" : "#5C1F24"})`,
            boxShadow: isAnimating
              ? `0 4px 0 ${zone?.color ? zone.color + "66" : "#3D1518"}, 0 6px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15)`
              : `0 8px 0 ${zone?.color ? zone.color + "66" : "#3D1518"}, 0 12px 30px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.15)`,
            border: `3px solid ${zone?.color ? zone.color + "88" : "#5C1F24"}`,
            transform: isAnimating ? "translateY(6px)" : undefined,
          }}
        >
          {/* Screen flash for big clicks */}
          {screenFlash && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-visible"
            >
              <div
                className="animate-screen-flash"
                style={{
                  width: "400px",
                  height: "400px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${zone?.color || "var(--color-money-bright)"}60, ${zone?.color || "var(--color-money-bright)"}20 40%, transparent 70%)`,
                }}
              />
            </div>
          )}

          {/* Shockwave rings */}
          {shockwaves.map((s) => (
            <div
              key={s.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-visible"
            >
              <div
                className="animate-shockwave"
                style={{
                  width: "300px",
                  height: "300px",
                  borderRadius: "50%",
                  border: `4px solid ${zone?.color || "var(--color-money)"}`,
                }}
              />
            </div>
          ))}

          {/* Stamp imprint ghosts */}
          {stampImprints.map((s) => (
            <div
              key={s.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-5 overflow-visible"
            >
              <div
                className="animate-stamp-imprint"
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  border: `3px solid ${zone?.color || "var(--color-money)"}60`,
                  background: `radial-gradient(circle, ${zone?.color || "var(--color-money)"}15, transparent 70%)`,
                }}
              />
            </div>
          ))}

          {/* Zone-colored particles */}
          {colorParticles.map((p) => (
            <div
              key={p.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible"
            >
              <div
                className="animate-spiral-burst"
                style={
                  {
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    background: p.color,
                    boxShadow: `0 0 ${p.size}px ${p.color}`,
                    "--tx": `${p.tx}px`,
                    "--ty": `${p.ty}px`,
                    "--rot": `${p.rotation}deg`,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}

          {/* Emoji particles with spiral */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible text-base md:text-xl"
            >
              <div
                className="animate-spiral-burst"
                style={
                  {
                    "--tx": `${p.tx}px`,
                    "--ty": `${p.ty}px`,
                    "--rot": `${p.rotation}deg`,
                  } as React.CSSProperties
                }
              >
                {p.emoji}
              </div>
            </div>
          ))}

          {/* Glossy shine effect */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* Circular stamp face - responsive */}
          <div
            className="relative w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full flex flex-col items-center justify-center border-3 md:border-4"
            style={{
              background: "rgba(0,0,0,0.3)",
              borderColor: "rgba(255,255,255,0.2)",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {/* Inner ring */}
            <div
              className="absolute inset-1.5 md:inset-2 rounded-full border-2"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            />

            {/* Stamp content */}
            <div className="text-2xl md:text-3xl lg:text-4xl mb-0.5 md:mb-1 drop-shadow-lg">{stamp.icon}</div>
            <div
              className="text-lg md:text-xl lg:text-2xl tracking-widest"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {stamp.text}
            </div>
            <div
              className="text-[8px] md:text-[10px] tracking-wider opacity-80 mt-0.5 md:mt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {stamp.subtext}
            </div>
          </div>

          {/* Zone indicator dot */}
          {zone && (
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap"
              style={{
                background: zone.color,
                boxShadow: `0 2px 10px ${zone.color}66`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {zone.name}
            </div>
          )}
        </button>
      </div>

      {/* Click instruction - hidden on mobile */}
      <div
        className="mt-6 md:mt-8 text-xs md:text-sm hidden sm:block"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-serif)",
        }}
      >
        {isPaused ? (
          <span style={{ color: "var(--color-corruption)" }}>⏸ Congressional hearing in progress...</span>
        ) : (
          <>
            <span style={{ color: "var(--color-text-dim)" }}>Click to </span>
            <span style={{ color: "var(--color-corruption)" }}>stamp fraudulent claims</span>
          </>
        )}
      </div>
    </div>
  );
}

export namespace Clicker {
  export type FloatingNumber = {
    id: number;
    value: number;
    x: number;
    y: number;
    rotation: number;
  };

  export type Particle = {
    id: number;
    emoji: string;
    tx: number;
    ty: number;
    rotation: number;
  };

  export type InkSplatter = {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
  };

  export type Shockwave = {
    id: number;
  };

  export type StampImprint = {
    id: number;
  };

  export type ColorParticle = {
    id: number;
    color: string;
    tx: number;
    ty: number;
    rotation: number;
    size: number;
  };
}
