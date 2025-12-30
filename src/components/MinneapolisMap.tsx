import { useCallback, useMemo, useState } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";
import { UPGRADES } from "~/data/upgrades";
import { playSound } from "~/hooks/useAudio";
import { getCharacterImageUrl } from "~/lib/assets";

const NICK_SHIRLEY_IMAGE = getCharacterImageUrl("nick-shirley");


type ZoneStats = {
  upgradesOwned: number;
  totalUpgrades: number;
  passiveIncome: number;
};

function useZoneStats(): Record<string, ZoneStats> {
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);

  return useMemo(() => {
    const stats: Record<string, ZoneStats> = {};

    for (const zone of ZONES) {
      const zoneUpgrades = UPGRADES.filter((u) => u.zone === zone.id);
      let upgradesOwned = 0;
      let passiveIncome = 0;

      for (const upgrade of zoneUpgrades) {
        const owned = ownedUpgrades[upgrade.id] ?? 0;
        if (owned > 0) upgradesOwned += owned;

        if (unlockedZones.includes(zone.id) && owned > 0) {
          if (upgrade.effect.type === "passiveIncome") {
            passiveIncome += upgrade.effect.amount * owned;
          }
        }
      }

      stats[zone.id] = {
        upgradesOwned,
        totalUpgrades: zoneUpgrades.length,
        passiveIncome,
      };
    }

    return stats;
  }, [ownedUpgrades, unlockedZones]);
}

export function MinneapolisMap() {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const setActiveZone = useGameStore((s) => s.setActiveZone);
  const unlockZone = useGameStore((s) => s.unlockZone);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const zoneStats = useZoneStats();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneClick = useCallback(
    (zoneId: string, isUnlocked: boolean, canAfford: boolean) => {
      if (isUnlocked) {
        if (zoneId !== activeZone) {
          playSound("zoneSwitch");
        }
        setActiveZone(zoneId);
      } else if (canAfford) {
        unlockZone(zoneId);
        playSound("zoneUnlock");
      }
    },
    [setActiveZone, unlockZone, activeZone]
  );

  const zonePositions: Record<string, MinneapolisMap.Position> = useMemo(
    () => ({
      daycare: { x: 35, y: 25 },
      housing: { x: 65, y: 30 },
      autism: { x: 25, y: 55 },
      medicaid: { x: 75, y: 55 },
      political: { x: 50, y: 75 },
      endgame: { x: 50, y: 45 },
    }),
    []
  );

  return (
    <div 
      className="relative h-80 rounded-lg overflow-hidden"
      style={{
        background: "var(--color-bg-primary)",
        border: "2px solid var(--color-border-card)",
      }}
    >
      {/* Crime scene aesthetic background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 45%, rgba(196, 164, 75, 0.15) 0%, transparent 40%),
            linear-gradient(rgba(42, 48, 64, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42, 48, 64, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 30px 30px, 30px 30px",
        }}
      />

      {/* Investigation strings between zones */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        {unlockedZones.length > 1 && (
          <>
            {/* Draw connecting lines between unlocked zones */}
            {unlockedZones.map((zoneId, i) => {
              if (i === 0) return null;
              const prevZoneId = unlockedZones[i - 1];
              const pos1 = zonePositions[prevZoneId];
              const pos2 = zonePositions[zoneId];
              if (!pos1 || !pos2) return null;
              return (
                <line
                  key={`${prevZoneId}-${zoneId}`}
                  x1={`${pos1.x}%`}
                  y1={`${pos1.y}%`}
                  x2={`${pos2.x}%`}
                  y2={`${pos2.y}%`}
                  stroke="var(--color-corruption)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
          </>
        )}
      </svg>

      {/* Zone pins */}
      {ZONES.map((zone) => {
        const pos = zonePositions[zone.id];
        if (!pos) return null;

        const isUnlocked = unlockedZones.includes(zone.id);
        const isActive = activeZone === zone.id;
        const canAfford = money >= zone.unlockCost;
        const isNickHere = nickShirleyLocation === zone.id;

        return (
          <button
            key={zone.id}
            onClick={() => handleZoneClick(zone.id, isUnlocked, canAfford)}
            onMouseEnter={() => setHoveredZone(zone.id)}
            onMouseLeave={() => setHoveredZone(null)}
            disabled={!isUnlocked && !canAfford}
            className={`
              absolute transition-all duration-200 group
              ${isUnlocked ? "cursor-pointer" : canAfford ? "cursor-pointer" : "cursor-not-allowed"}
            `}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: hoveredZone === zone.id || isActive ? 20 : isNickHere ? 15 : 10,
            }}
          >
            {/* Nick Shirley portrait indicator */}
            {isNickHere && (
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce z-20"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(139, 47, 53, 0.8))",
                }}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-red-500">
                    <img 
                      src={NICK_SHIRLEY_IMAGE}
                      alt="Nick Shirley"
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.currentTarget.style.display = "none"; 
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">📷</span>';
                      }}
                    />
                  </div>
                  <div 
                    className="absolute inset-0 animate-ping rounded-full"
                    style={{ background: "rgba(139, 47, 53, 0.5)" }}
                  />
                </div>
              </div>
            )}

            {/* Pin/marker */}
            <div
              className={`
                relative flex flex-col items-center transition-transform
                ${isActive ? "scale-110" : "hover:scale-110"}
              `}
            >
              {/* Pin head */}
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all"
                style={{
                  background: isUnlocked
                    ? `linear-gradient(135deg, ${zone.color}, ${zone.color}cc)`
                    : canAfford
                      ? "linear-gradient(135deg, var(--color-corruption-dim), var(--color-bg-elevated))"
                      : "var(--color-bg-card)",
                  border: `2px solid ${isActive ? zone.color : isUnlocked ? `${zone.color}88` : "var(--color-border-card)"}`,
                  boxShadow: isActive
                    ? `0 0 20px ${zone.color}60, 0 4px 12px rgba(0,0,0,0.4)`
                    : isNickHere
                      ? "0 0 20px rgba(139, 47, 53, 0.6), 0 4px 12px rgba(0,0,0,0.4)"
                      : "0 4px 12px rgba(0,0,0,0.3)",
                  filter: !isUnlocked && !canAfford ? "grayscale(0.8)" : "none",
                  opacity: !isUnlocked && !canAfford ? 0.5 : 1,
                }}
              >
                {zone.icon}
                
                {/* Active indicator ring */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ 
                      border: `2px solid ${zone.color}`,
                      opacity: 0.4,
                    }}
                  />
                )}
              </div>

              {/* Pin point */}
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: `8px solid ${isUnlocked ? zone.color : "var(--color-border-card)"}`,
                }}
              />

              {/* Zone label with stats */}
              <div
                className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-[10px] transition-all pointer-events-none"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: `1px solid ${isActive ? zone.color : "var(--color-border-card)"}`,
                  color: isUnlocked ? zone.color : "var(--color-text-muted)",
                  fontFamily: "var(--font-display)",
                  zIndex: hoveredZone === zone.id ? 50 : 1,
                  boxShadow: hoveredZone === zone.id 
                    ? `0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px ${zone.color}40` 
                    : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {zone.name}
                {!isUnlocked && (
                  <span 
                    className="ml-1"
                    style={{ 
                      color: canAfford ? "var(--color-money)" : "var(--color-text-dim)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ({GameStore.formatMoney(zone.unlockCost)})
                  </span>
                )}
                
                {/* Stats row - visible on hover only */}
                {isUnlocked && hoveredZone === zone.id && (
                  <div 
                    className="flex items-center gap-1.5 mt-1 text-[9px]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span style={{ color: "var(--color-money)" }}>
                      💰{GameStore.formatMoney(zone.baseClickValue)}
                    </span>
                    <span style={{ color: "var(--color-text-dim)" }}>•</span>
                    <span style={{ color: "var(--color-danger-bright)" }}>
                      👁️{(zone.viewsPerClick / 1000).toFixed(zone.viewsPerClick >= 10000 ? 0 : 1)}K
                    </span>
                    {zoneStats[zone.id]?.passiveIncome > 0 && (
                      <>
                        <span style={{ color: "var(--color-text-dim)" }}>•</span>
                        <span style={{ color: "#10b981" }}>
                          ⚡{GameStore.formatMoney(zoneStats[zone.id].passiveIncome)}/s
                        </span>
                      </>
                    )}
                    {zoneStats[zone.id]?.upgradesOwned > 0 && (
                      <>
                        <span style={{ color: "var(--color-text-dim)" }}>•</span>
                        <span style={{ color: zone.color }}>
                          ⬆️{zoneStats[zone.id].upgradesOwned}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Locked/unlocked stamp */}
              {!isUnlocked && (
                <div 
                  className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.5 rounded rotate-12"
                  style={{
                    background: canAfford ? "var(--color-money)30" : "var(--color-danger)30",
                    color: canAfford ? "var(--color-money)" : "var(--color-danger-bright)",
                    fontFamily: "var(--font-mono)",
                    border: `1px solid ${canAfford ? "var(--color-money)" : "var(--color-danger)"}40`,
                  }}
                >
                  {canAfford ? "UNLOCK" : "🔒"}
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Map legend */}
      <div 
        className="absolute bottom-2 left-2 px-3 py-2 rounded text-[10px] space-y-1"
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-card)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--color-money)" }}
          />
          <span style={{ color: "var(--color-text-muted)" }}>Active Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📷</span>
          <span style={{ color: "var(--color-danger-bright)" }}>Nick Shirley</span>
        </div>
      </div>

      {/* Investigation label */}
      <div 
        className="absolute top-2 right-2 px-2 py-1 rounded text-[9px] uppercase tracking-wider"
        style={{
          background: "var(--color-danger)20",
          color: "var(--color-danger-bright)",
          fontFamily: "var(--font-mono)",
        }}
      >
        🔍 Investigation Map
      </div>
    </div>
  );
}

export namespace MinneapolisMap {
  export type Position = { x: number; y: number };
}
