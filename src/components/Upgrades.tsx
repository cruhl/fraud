import { useMemo, useCallback, useState, useEffect } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { getUpgradesForZone, type Upgrade } from "~/data/upgrades";
import { UPGRADES } from "~/data/upgrades";
import { playSound } from "~/hooks/useAudio";

export function Upgrades() {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const discountEndTime = useGameStore((s) => s.discountEndTime);

  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountTimeLeft, setDiscountTimeLeft] = useState(0);

  useEffect(() => {
    const checkDiscount = () => {
      if (discountEndTime && Date.now() < discountEndTime) {
        setIsDiscountActive(true);
        setDiscountTimeLeft(Math.ceil((discountEndTime - Date.now()) / 1000));
      } else {
        setIsDiscountActive(false);
        setDiscountTimeLeft(0);
      }
    };
    checkDiscount();
    const interval = setInterval(checkDiscount, 100);
    return () => clearInterval(interval);
  }, [discountEndTime]);

  const zoneUpgrades = useMemo(() => getUpgradesForZone(activeZone), [activeZone]);

  const endgameUpgrades = useMemo(
    () => UPGRADES.filter((u) => u.zone === "endgame"),
    []
  );

  const showEndgame = unlockedZones.includes("endgame");

  return (
    <div className="space-y-4">
      {/* Catalog header */}
      <div 
        className="flex items-center justify-between pb-3 border-b"
        style={{ borderColor: "var(--color-border-card)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <h2 
            className="text-lg tracking-widest"
            style={{ 
              fontFamily: "var(--font-display)", 
              color: "var(--color-text-primary)",
              letterSpacing: "0.15em",
            }}
          >
            PROCUREMENT
          </h2>
        </div>
        <div 
          className="text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-md"
          style={{ 
            background: "linear-gradient(180deg, var(--color-bg-primary), rgba(0,0,0,0.3))",
            border: "1px solid var(--color-border-card)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Zone Assets
        </div>
      </div>

      {/* Discount banner with countdown */}
      {isDiscountActive && (
        <div 
          className={`flex items-center justify-between py-2 px-3 rounded-md ${discountTimeLeft <= 5 ? "animate-warning-flash" : "animate-glow-pulse"}`}
          style={{
            background: "linear-gradient(90deg, var(--color-corruption-dim), var(--color-money), var(--color-corruption-dim))",
            color: "var(--color-bg-primary)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
          }}
        >
          <span>🏷️ 25% OFF ALL REQUISITIONS</span>
          <span 
            className="font-bold px-2 py-0.5 rounded"
            style={{
              background: discountTimeLeft <= 5 ? "rgba(139, 47, 53, 0.8)" : "rgba(0,0,0,0.3)",
              color: discountTimeLeft <= 5 ? "white" : "var(--color-bg-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
            }}
          >
            ⏱ {discountTimeLeft}s
          </span>
        </div>
      )}

      {/* Zone upgrades */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {zoneUpgrades.map((upgrade, index) => (
          <Upgrades.Item
            key={upgrade.id}
            upgrade={upgrade}
            owned={ownedUpgrades[upgrade.id] ?? 0}
            money={money}
            onBuy={buyUpgrade}
            discountActive={isDiscountActive}
            delay={index * 50}
          />
        ))}
      </div>

      {/* Endgame section */}
      {showEndgame && (
        <>
          <div 
            className="flex items-center gap-2 pt-4 pb-2 border-t"
            style={{ borderColor: "var(--color-corruption-dim)" }}
          >
            <span className="text-lg">🕸️</span>
            <h2 
              className="text-lg tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-corruption)" }}
            >
              THE NETWORK
            </h2>
            <div 
              className="ml-auto text-[9px] uppercase px-2 py-0.5 rounded"
              style={{ 
                background: "var(--color-corruption)20",
                color: "var(--color-corruption)",
                fontFamily: "var(--font-mono)",
              }}
            >
              CLASSIFIED
            </div>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {endgameUpgrades.map((upgrade, index) => (
              <Upgrades.Item
                key={upgrade.id}
                upgrade={upgrade}
                owned={ownedUpgrades[upgrade.id] ?? 0}
                money={money}
                onBuy={buyUpgrade}
                discountActive={isDiscountActive}
                delay={index * 50}
                isEndgame
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export namespace Upgrades {
  export type ItemProps = {
    upgrade: Upgrade;
    owned: number;
    money: number;
    onBuy: (id: string) => void;
    discountActive?: boolean;
    delay?: number;
    isEndgame?: boolean;
  };

  export type Particle = {
    id: number;
    x: number;
    y: number;
    tx: number;
    ty: number;
    rot: number;
    emoji: string;
  };

  export function Item({
    upgrade,
    owned,
    money,
    onBuy,
    discountActive = false,
    delay = 0,
    isEndgame = false,
  }: ItemProps) {
    const cost = useMemo(
      () => GameStore.getUpgradeCost(upgrade, owned, discountActive),
      [upgrade, owned, discountActive]
    );
    const isMaxed = upgrade.maxQuantity !== undefined && owned >= upgrade.maxQuantity;
    const canAfford = money >= cost && !isMaxed;
    const [justBought, setJustBought] = useState(false);
    const [showAcquiredStamp, setShowAcquiredStamp] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [countBounce, setCountBounce] = useState(false);
    const [flashHighlight, setFlashHighlight] = useState(false);

    const handleBuy = useCallback(() => {
      onBuy(upgrade.id);
      playSound("purchase");
      
      // Trigger all juice effects
      setJustBought(true);
      setShowAcquiredStamp(true);
      setCountBounce(true);
      setFlashHighlight(true);
      
      // Create particle burst
      const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 30 + Math.random() * 40,
        tx: (Math.random() - 0.5) * 80,
        ty: -30 - Math.random() * 40,
        rot: Math.random() * 360,
        emoji: ["💵", "✨", "💰", "📋", "✓"][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);
      
      // Clear effects
      setTimeout(() => setJustBought(false), 350);
      setTimeout(() => setShowAcquiredStamp(false), 600);
      setTimeout(() => setParticles([]), 600);
      setTimeout(() => setCountBounce(false), 300);
      setTimeout(() => setFlashHighlight(false), 200);
    }, [onBuy, upgrade.id]);

    return (
      <button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`
          w-full p-3 rounded-md text-left transition-all duration-200 relative overflow-hidden group
          ${justBought ? "animate-purchase-punch" : canAfford ? "hover:animate-breathe" : ""}
        `}
        style={{
          animationDelay: `${delay}ms`,
          background: flashHighlight
            ? `linear-gradient(135deg, ${isEndgame ? "var(--color-corruption)" : "var(--color-money)"}30, var(--color-bg-elevated))`
            : canAfford 
              ? isEndgame 
                ? "linear-gradient(135deg, var(--color-corruption)15, var(--color-bg-elevated))"
                : "var(--color-bg-elevated)"
              : "var(--color-bg-primary)",
          border: `1px solid ${flashHighlight
            ? isEndgame ? "var(--color-corruption)" : "var(--color-money)"
            : canAfford 
              ? isEndgame 
                ? "var(--color-corruption-dim)" 
                : "var(--color-border-highlight)"
              : "var(--color-border-card)"
          }`,
          opacity: canAfford ? 1 : 0.6,
          cursor: canAfford ? "pointer" : "not-allowed",
          boxShadow: flashHighlight
            ? `0 0 30px ${isEndgame ? "rgba(196, 164, 75, 0.5)" : "rgba(201, 162, 39, 0.5)"}`
            : canAfford 
              ? isEndgame
                ? "0 0 20px rgba(196, 164, 75, 0.15)"
                : "0 2px 8px rgba(0,0,0,0.2)"
              : undefined,
        }}
      >
        {/* Purchase particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute text-lg pointer-events-none animate-confetti-burst z-20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rot}deg`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))}

        {/* ACQUIRED stamp overlay */}
        {showAcquiredStamp && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div
              className="animate-acquire-stamp"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                color: isEndgame ? "var(--color-corruption)" : "var(--color-money)",
                textShadow: `0 0 20px ${isEndgame ? "var(--color-corruption)" : "var(--color-money)"}`,
                letterSpacing: "0.15em",
                whiteSpace: "nowrap",
              }}
            >
              ✓ ACQUIRED
            </div>
          </div>
        )}

        {/* Hover glow effect */}
        {canAfford && !justBought && (
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${isEndgame ? "var(--color-corruption)" : "var(--color-money)"}20 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Status indicator */}
        <div 
          className="absolute top-2 right-2 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            fontFamily: "var(--font-mono)",
            background: isMaxed 
              ? "var(--color-corruption)20" 
              : canAfford 
                ? "var(--color-money)20" 
                : "var(--color-danger)20",
            color: isMaxed 
              ? "var(--color-corruption)" 
              : canAfford 
                ? "var(--color-money)" 
                : "var(--color-danger-bright)",
          }}
        >
          {isMaxed ? "SOLD OUT" : canAfford ? "IN STOCK" : "LOCKED"}
        </div>

        {/* Main content */}
        <div className="flex items-start gap-3">
          {/* Icon/Image */}
          <div 
            className={`text-2xl w-10 h-10 flex items-center justify-center rounded-md shrink-0 transition-transform ${justBought ? "animate-rubberband" : ""}`}
            style={{
              background: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-card)",
            }}
          >
            {upgrade.icon}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-12">
            {/* Name and count */}
            <div className="flex items-center gap-2">
              <span 
                className="font-semibold text-sm truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {upgrade.name}
              </span>
              {owned > 0 && (
                <span 
                  className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${countBounce ? "animate-rubberband" : ""}`}
                  style={{ 
                    background: isMaxed ? "var(--color-corruption)20" : "var(--color-money)20",
                    color: isMaxed ? "var(--color-corruption)" : "var(--color-money)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {upgrade.maxQuantity !== undefined 
                    ? `${owned}/${upgrade.maxQuantity}` 
                    : `×${owned}`}
                </span>
              )}
            </div>

            {/* Effect description */}
            <div 
              className="text-xs mt-0.5"
              style={{ 
                color: isEndgame ? "var(--color-corruption)" : "#4ade80",
                fontFamily: "var(--font-mono)",
              }}
            >
              {upgrade.description}
            </div>

            {/* Cumulative effect total for stacking upgrades */}
            {owned > 1 && (
              <div
                className="text-[10px] mt-0.5"
                style={{ 
                  color: "var(--color-text-muted)", 
                  fontFamily: "var(--font-mono)" 
                }}
              >
                {upgrade.effect.type === "passiveIncome" && (
                  <>= ${(upgrade.effect.amount * owned).toLocaleString()}/s total</>
                )}
                {upgrade.effect.type === "clickBonus" && (
                  <>= +${(upgrade.effect.amount * owned).toLocaleString()}/click total</>
                )}
                {upgrade.effect.type === "viewDecay" && (
                  <>= -{(upgrade.effect.amount * owned).toLocaleString()} views/s total</>
                )}
                {upgrade.effect.type === "clickMultiplier" && (
                  <>= ×{Math.pow(upgrade.effect.amount, owned).toFixed(2)} total</>
                )}
                {upgrade.effect.type === "viewReduction" && (
                  <>= -{Math.round((1 - Math.pow(1 - upgrade.effect.amount, owned)) * 100)}% views total</>
                )}
                {upgrade.effect.type === "viewDecayMultiplier" && (
                  <>= ×{Math.pow(upgrade.effect.amount, owned).toFixed(2)} decay total</>
                )}
              </div>
            )}

            {/* Flavor text */}
            <div 
              className="text-[10px] mt-1 italic truncate"
              style={{ color: "var(--color-text-dim)" }}
            >
              "{upgrade.flavorText}"
            </div>
          </div>
        </div>

        {/* Price tag */}
        <div 
          className="mt-2 pt-2 border-t flex items-center justify-between"
          style={{ borderColor: "var(--color-border-card)" }}
        >
          <span 
            className="text-[9px] uppercase tracking-wider"
            style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
          >
            {isMaxed ? "STATUS" : "REQUISITION COST"}
          </span>
          <span 
            className="font-bold"
            style={{ 
              fontFamily: "var(--font-mono)",
              color: isMaxed 
                ? "var(--color-corruption)" 
                : canAfford 
                  ? "var(--color-money-bright)" 
                  : "var(--color-text-muted)",
              textShadow: canAfford && !isMaxed ? "0 0 10px rgba(201, 162, 39, 0.3)" : undefined,
            }}
          >
            {isMaxed ? "✓ ACQUIRED" : GameStore.formatMoney(cost)}
          </span>
        </div>

        {/* Purchased stamp overlay */}
        {owned > 0 && !showAcquiredStamp && (
          <div 
            className="absolute top-1/2 right-3 -translate-y-1/2 rotate-[-15deg] pointer-events-none opacity-10"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              color: "var(--color-money)",
              letterSpacing: "0.1em",
            }}
          >
            OWNED
          </div>
        )}
      </button>
    );
  }
}
