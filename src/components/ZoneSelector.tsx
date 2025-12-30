import { useCallback, useState } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";
import { playSound } from "~/hooks/useAudio";
import { getZoneImageUrl } from "~/lib/assets";

export function ZoneSelector({ compact = false }: ZoneSelector.Props) {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const setActiveZone = useGameStore((s) => s.setActiveZone);
  const unlockZone = useGameStore((s) => s.unlockZone);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const [showLocked, setShowLocked] = useState(false);

  const handleZoneClick = useCallback(
    (zoneId: string, isUnlocked: boolean, canAfford: boolean) => {
      if (isUnlocked) {
        setActiveZone(zoneId);
      } else if (canAfford) {
        unlockZone(zoneId);
        playSound("zoneUnlock");
      }
    },
    [setActiveZone, unlockZone]
  );

  const activeZoneData = ZONES.find((z) => z.id === activeZone);
  const unlockedZonesList = ZONES.filter((z) => unlockedZones.includes(z.id));
  const lockedZonesList = ZONES.filter((z) => !unlockedZones.includes(z.id));
  const affordableLockedCount = lockedZonesList.filter((z) => money >= z.unlockCost).length;

  // Compact mobile view
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Active zone - prominent */}
        {activeZoneData && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${activeZoneData.color}25, var(--color-bg-elevated))`,
              border: `2px solid ${activeZoneData.color}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                style={{ background: `${activeZoneData.color}30` }}
              >
                {activeZoneData.icon}
              </div>
              <div className="flex-1">
                <div
                  className="font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: activeZoneData.color }}
                >
                  {activeZoneData.name}
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {activeZoneData.description.split(" - ")[0]}
                </div>
              </div>
              {nickShirleyLocation === activeZone && (
                <div
                  className="text-xs px-2 py-1 rounded animate-warning-flash"
                  style={{ background: "var(--color-danger)", color: "white", fontFamily: "var(--font-mono)" }}
                >
                  📷 FILMING
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other unlocked zones - compact row */}
        {unlockedZonesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {unlockedZonesList
              .filter((z) => z.id !== activeZone)
              .map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneClick(zone.id, true, false)}
                  className="shrink-0 p-2 rounded-lg flex items-center gap-2 transition-colors"
                  style={{
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <span className="text-xl">{zone.icon}</span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {zone.name}
                  </span>
                  {nickShirleyLocation === zone.id && <span className="text-sm">📷</span>}
                </button>
              ))}
          </div>
        )}

        {/* Locked zones summary */}
        {lockedZonesList.length > 0 && (
          <div>
            <button
              onClick={() => setShowLocked(!showLocked)}
              className="w-full p-2 rounded-lg flex items-center justify-between text-sm"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px dashed var(--color-border-card)",
                color: "var(--color-text-muted)",
              }}
            >
              <span>
                🔒 {lockedZonesList.length} locked zone{lockedZonesList.length !== 1 ? "s" : ""}
                {affordableLockedCount > 0 && (
                  <span style={{ color: "var(--color-money)" }}> ({affordableLockedCount} affordable)</span>
                )}
              </span>
              <span>{showLocked ? "▲" : "▼"}</span>
            </button>

            {showLocked && (
              <div className="mt-2 space-y-2">
                {lockedZonesList.map((zone) => {
                  const canAfford = money >= zone.unlockCost;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneClick(zone.id, false, canAfford)}
                      disabled={!canAfford}
                      className="w-full p-2 rounded-lg flex items-center gap-2 text-left"
                      style={{
                        background: canAfford ? "var(--color-bg-elevated)" : "var(--color-bg-primary)",
                        border: `1px ${canAfford ? "solid" : "dashed"} ${canAfford ? "var(--color-corruption-dim)" : "var(--color-border-card)"}`,
                        opacity: canAfford ? 1 : 0.6,
                        cursor: canAfford ? "pointer" : "not-allowed",
                      }}
                    >
                      <span className="text-xl" style={{ filter: canAfford ? "none" : "grayscale(0.8)" }}>
                        {zone.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                          {zone.name}
                        </div>
                        <div className="text-[10px]" style={{ color: canAfford ? "var(--color-money)" : "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}>
                          {GameStore.formatMoney(zone.unlockCost)}
                        </div>
                      </div>
                      <span
                        className="text-[9px] uppercase px-1.5 py-0.5 rounded"
                        style={{
                          background: canAfford ? "var(--color-money)20" : "var(--color-danger)20",
                          color: canAfford ? "var(--color-money)" : "var(--color-danger-bright)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {canAfford ? "UNLOCK" : "LOCKED"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full desktop view
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {ZONES.map((zone) => {
          const isUnlocked = unlockedZones.includes(zone.id);
          const isActive = activeZone === zone.id;
          const canAfford = money >= zone.unlockCost;
          const isNickHere = nickShirleyLocation === zone.id;

          return (
            <button
              key={zone.id}
              onClick={() => handleZoneClick(zone.id, isUnlocked, canAfford)}
              disabled={!isUnlocked && !canAfford}
              className="relative text-left transition-all duration-200 group"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${zone.color}25, var(--color-bg-elevated))`
                  : isUnlocked
                    ? "var(--color-bg-elevated)"
                    : "var(--color-bg-primary)",
                borderRadius: "8px 8px 4px 4px",
                border: isActive
                  ? `2px solid ${zone.color}`
                  : isUnlocked
                    ? "1px solid var(--color-border-highlight)"
                    : canAfford
                      ? "1px dashed var(--color-corruption-dim)"
                      : "1px dashed var(--color-border-card)",
                opacity: !isUnlocked && !canAfford ? 0.5 : 1,
                cursor: !isUnlocked && !canAfford ? "not-allowed" : "pointer",
                boxShadow: isActive
                  ? `0 4px 20px ${zone.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : undefined,
              }}
            >
              {/* Folder tab top edge */}
              <div
                className="absolute -top-px left-4 right-4 h-0.5"
                style={{
                  background: isActive
                    ? zone.color
                    : isUnlocked
                      ? "var(--color-border-highlight)"
                      : "transparent",
                }}
              />

              {/* Nick Shirley camera indicator */}
              {isNickHere && (
                <div
                  className="absolute -top-2 -right-2 text-lg z-10 animate-bounce"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
                >
                  📷
                </div>
              )}

              {/* Filming warning */}
              {isNickHere && (
                <div
                  className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded animate-warning-flash"
                  style={{
                    background: "var(--color-danger)",
                    color: "white",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  FILMING
                </div>
              )}

              {/* Background zone image (visible when unlocked) */}
              {isUnlocked && zone.imagePrompt && (
                <div 
                  className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none ai-image-zone"
                  style={{ opacity: 0.4 }}
                >
                  <img 
                    src={getZoneImageUrl(zone.id)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  {/* Gradient overlay to keep text readable */}
                  <div 
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-3 relative z-10">
                <div className="flex items-center gap-2">
                  {/* Zone icon/image */}
                  <div
                    className={`text-2xl w-14 h-14 flex items-center justify-center rounded-lg shrink-0 overflow-hidden ${zone.imagePrompt ? "ai-image-surveillance" : ""}`}
                    style={{
                      background: isUnlocked ? `${zone.color}20` : "var(--color-bg-primary)",
                      border: `2px solid ${isUnlocked ? `${zone.color}60` : "var(--color-border-card)"}`,
                      boxShadow: isUnlocked ? `0 2px 8px ${zone.color}30` : undefined,
                    }}
                  >
                    {zone.imagePrompt ? (
                      <img 
                        src={getZoneImageUrl(zone.id)}
                        alt={zone.name}
                        className="w-full h-full object-cover"
                        style={{ filter: isUnlocked ? "brightness(1.1) contrast(1.05)" : "grayscale(0.6) brightness(0.7)" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.textContent = zone.icon;
                        }}
                      />
                    ) : (
                      zone.icon
                    )}
                  </div>

                  {/* Zone info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-sm truncate"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: isUnlocked ? zone.color : "var(--color-text-muted)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {zone.name}
                    </div>
                    {isUnlocked ? (
                      <div className="text-[10px] truncate" style={{ color: "var(--color-text-dim)" }}>
                        {zone.description.split(" - ")[0]}
                      </div>
                    ) : (
                      <div
                        className="text-[10px] font-mono"
                        style={{ color: canAfford ? "var(--color-money)" : "var(--color-text-dim)" }}
                      >
                        {GameStore.formatMoney(zone.unlockCost)} to unlock
                      </div>
                    )}
                  </div>
                </div>

                {/* Status stamp */}
                <div className="mt-2 flex items-center justify-between">
                  {isActive ? (
                    <div
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: `${zone.color}30`,
                        color: zone.color,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ● ACTIVE
                    </div>
                  ) : isUnlocked ? (
                    <div
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: "var(--color-bg-primary)",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      UNLOCKED
                    </div>
                  ) : canAfford ? (
                    <div
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded animate-glow-pulse"
                      style={{
                        background: "var(--color-money)20",
                        color: "var(--color-money)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      CLICK TO UNLOCK
                    </div>
                  ) : (
                    <div
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: "var(--color-danger)20",
                        color: "var(--color-danger-bright)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      LOCKED
                    </div>
                  )}

                  {/* Corner fold */}
                  {isUnlocked && (
                    <div
                      className="w-4 h-4"
                      style={{ background: `linear-gradient(135deg, transparent 50%, ${zone.color}30 50%)` }}
                    />
                  )}
                </div>
              </div>

              {/* Active indicator bar */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
                  style={{ background: zone.color }}
                />
              )}

              {/* Hover glow */}
              {isUnlocked && !isActive && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${zone.color}10 0%, transparent 70%)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export namespace ZoneSelector {
  export type Props = {
    compact?: boolean;
  };
}
