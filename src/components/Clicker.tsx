import { useCallback, useState } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";

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

  const zone = ZONES.find((z) => z.id === activeZone);
  const clickValue = GameStore.getClickValue({
    ownedUpgrades,
    unlockedZones,
    activeZone,
    totalArrestCount: 0,
  } as never);

  const handleClick = useCallback(() => {
    if (isGameOver || isVictory || isPaused) return;

    click();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    // Add floating number
    const id = Date.now() + Math.random();
    const x = 50 + (Math.random() - 0.5) * 40;
    const y = 30 + (Math.random() - 0.5) * 20;
    setFloatingNumbers((prev) => [...prev, { id, value: clickValue, x, y }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 800);
  }, [click, clickValue, isGameOver, isVictory, isPaused]);

  const getButtonLabel = () => {
    switch (activeZone) {
      case "daycare":
        return { icon: "📋", text: "Submit", subtext: "Fake Attendance" };
      case "housing":
        return { icon: "🏠", text: "File", subtext: "Housing Voucher" };
      case "autism":
        return { icon: "📝", text: "Bill", subtext: "Therapy Session" };
      case "medicaid":
        return { icon: "💊", text: "Submit", subtext: "Medicaid Claim" };
      default:
        return { icon: "📋", text: "Submit", subtext: "Fraud" };
    }
  };

  const label = getButtonLabel();

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating numbers */}
      {floatingNumbers.map((num) => (
        <div
          key={num.id}
          className="absolute text-2xl font-bold text-yellow-400 animate-float-up pointer-events-none z-10"
          style={{ left: `${num.x}%`, top: `${num.y}%` }}
        >
          +{GameStore.formatMoney(num.value)}
        </div>
      ))}

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={isGameOver || isVictory || isPaused}
        className={`
          w-56 h-56 rounded-full
          flex flex-col items-center justify-center
          text-white font-bold
          select-none
          transition-all duration-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isAnimating ? "scale-95" : "hover:scale-105"}
        `}
        style={{
          background: zone
            ? `linear-gradient(145deg, ${zone.color}, ${zone.color}dd)`
            : "linear-gradient(145deg, #dc2626, #991b1b)",
          boxShadow: `0 6px 0 ${zone?.color}88, 0 8px 20px rgba(0,0,0,0.4)`,
        }}
      >
        <div className="text-5xl mb-2">{label.icon}</div>
        <div className="text-lg uppercase tracking-wider">{label.text}</div>
        <div className="text-sm uppercase tracking-widest opacity-80">{label.subtext}</div>
      </button>

      {/* Click instruction */}
      <div className="mt-4 text-gray-500 text-sm">
        {isPaused ? (
          <span className="text-yellow-500">Congressional hearing in progress...</span>
        ) : (
          `Click to commit fraud in ${zone?.name || "current zone"}`
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
}
