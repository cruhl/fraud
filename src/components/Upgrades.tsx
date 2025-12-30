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

  useEffect(() => {
    const checkDiscount = () => {
      setIsDiscountActive(discountEndTime ? Date.now() < discountEndTime : false);
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
            className="text-lg tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            PROCUREMENT
          </h2>
        </div>
        <div 
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ 
            background: "var(--color-bg-primary)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Zone Assets
        </div>
      </div>

      {/* Discount banner */}
      {isDiscountActive && (
        <div 
          className="text-center py-2 px-3 rounded-md animate-glow-pulse"
          style={{
            background: "linear-gradient(90deg, var(--color-corruption-dim), var(--color-money), var(--color-corruption-dim))",
            color: "var(--color-bg-primary)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
          }}
        >
          🏷️ 25% OFF ALL REQUISITIONS
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
    const canAfford = money >= cost;
    const [justBought, setJustBought] = useState(false);

    const handleBuy = useCallback(() => {
      onBuy(upgrade.id);
      playSound("purchase");
      setJustBought(true);
      setTimeout(() => setJustBought(false), 300);
    }, [onBuy, upgrade.id]);

    return (
      <button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`
          w-full p-3 rounded-md text-left transition-all duration-200 relative overflow-hidden group
          ${justBought ? "animate-stamp" : ""}
        `}
        style={{
          animationDelay: `${delay}ms`,
          background: canAfford 
            ? isEndgame 
              ? "linear-gradient(135deg, var(--color-corruption)15, var(--color-bg-elevated))"
              : "var(--color-bg-elevated)"
            : "var(--color-bg-primary)",
          border: `1px solid ${canAfford 
            ? isEndgame 
              ? "var(--color-corruption-dim)" 
              : "var(--color-border-highlight)"
            : "var(--color-border-card)"
          }`,
          opacity: canAfford ? 1 : 0.6,
          cursor: canAfford ? "pointer" : "not-allowed",
          boxShadow: canAfford 
            ? isEndgame
              ? "0 0 20px rgba(196, 164, 75, 0.15)"
              : "0 2px 8px rgba(0,0,0,0.2)"
            : undefined,
        }}
      >
        {/* Hover glow effect */}
        {canAfford && (
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${isEndgame ? "var(--color-corruption)" : "var(--color-money)"}15 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Status indicator */}
        <div 
          className="absolute top-2 right-2 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            fontFamily: "var(--font-mono)",
            background: canAfford ? "var(--color-money)20" : "var(--color-danger)20",
            color: canAfford ? "var(--color-money)" : "var(--color-danger-bright)",
          }}
        >
          {canAfford ? "IN STOCK" : "LOCKED"}
        </div>

        {/* Main content */}
        <div className="flex items-start gap-3">
          {/* Icon/Image */}
          <div 
            className="text-2xl w-10 h-10 flex items-center justify-center rounded-md shrink-0"
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
                  className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                  style={{ 
                    background: "var(--color-money)20",
                    color: "var(--color-money)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  ×{owned}
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
            REQUISITION COST
          </span>
          <span 
            className="font-bold"
            style={{ 
              fontFamily: "var(--font-mono)",
              color: canAfford ? "var(--color-money-bright)" : "var(--color-text-muted)",
              textShadow: canAfford ? "0 0 10px rgba(201, 162, 39, 0.3)" : undefined,
            }}
          >
            {GameStore.formatMoney(cost)}
          </span>
        </div>

        {/* Purchased stamp overlay */}
        {owned > 0 && (
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
