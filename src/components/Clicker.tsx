import { useCallback, useState } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";
import { playSound } from "~/hooks/useAudio";

export function Clicker() {
  const click = useGameStore((s) => s.click);
  const activeZone = useGameStore((s) => s.activeZone);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const isPaused = useGameStore((s) => s.isPaused);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<Clicker.FloatingNumber[]>([]);
  const [inkSplatters, setInkSplatters] = useState<Clicker.InkSplatter[]>([]);

  const zone = ZONES.find((z) => z.id === activeZone);
  const clickValue = GameStore.getClickValue({
    ownedUpgrades,
    unlockedZones,
    activeZone,
    totalArrestCount: 0,
  } as never);

  const [particles, setParticles] = useState<Clicker.Particle[]>([]);

  const handleClick = useCallback(() => {
    if (isGameOver || isVictory || isPaused) return;

    click();
    playSound("click");
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // Add floating number
    const id = Date.now() + Math.random();
    const x = 50 + (Math.random() - 0.5) * 40;
    const y = 30 + (Math.random() - 0.5) * 20;
    setFloatingNumbers((prev) => [...prev, { id, value: clickValue, x, y }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 800);

    // Add ink splatters
    const splatterId = Date.now() + Math.random();
    const splatters: Clicker.InkSplatter[] = Array.from({ length: 3 }).map((_, i) => ({
      id: splatterId + i,
      x: 50 + (Math.random() - 0.5) * 60,
      y: 50 + (Math.random() - 0.5) * 60,
      size: 10 + Math.random() * 20,
      rotation: Math.random() * 360,
    }));
    setInkSplatters((prev) => [...prev, ...splatters]);
    setTimeout(() => {
      setInkSplatters((prev) => prev.filter((s) => !splatters.some((ns) => ns.id === s.id)));
    }, 400);

    // Add particles
    const newParticles: Clicker.Particle[] = [];
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      newParticles.push({
        id: Date.now() + Math.random(),
        emoji: ["💵", "💰", "📄", "💸", "🧾", "📋"][Math.floor(Math.random() * 6)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);
  }, [click, clickValue, isGameOver, isVictory, isPaused]);

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

  return (
    <div className="relative flex flex-col items-center">
      {/* Ink splatters */}
      {inkSplatters.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full animate-ink-splatter pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "radial-gradient(circle, rgba(139, 47, 53, 0.6) 0%, rgba(139, 47, 53, 0) 70%)",
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-base md:text-xl pointer-events-none animate-particle-burst"
          style={
            {
              left: "50%",
              top: "50%",
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </div>
      ))}

      {/* Floating numbers */}
      {floatingNumbers.map((num) => (
        <div
          key={num.id}
          className="absolute font-mono text-lg md:text-2xl font-bold animate-float-up pointer-events-none z-10"
          style={{
            left: `${num.x}%`,
            top: `${num.y}%`,
            color: "var(--color-money-bright)",
            textShadow: "0 2px 10px rgba(201, 162, 39, 0.5)",
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
          disabled={isGameOver || isVictory || isPaused}
          className={`
            relative rounded-2xl
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
  };

  export type Particle = {
    id: number;
    emoji: string;
    tx: number;
    ty: number;
  };

  export type InkSplatter = {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
  };
}
