import { useCallback, useState, useMemo, useEffect } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";
import { UPGRADES } from "~/data/upgrades";
import { playSound } from "~/hooks/useAudio";
import { getZoneImageUrl, getCharacterImageUrl } from "~/lib/assets";

const NICK_SHIRLEY_IMAGE = getCharacterImageUrl("nick-shirley");

// Confetti particle type for unlock celebrations
type ConfettiParticle = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  rotation: number;
  emoji: string;
};

type ZoneStats = {
  upgradesOwned: number;
  totalUpgrades: number;
  passiveIncome: number;
  clickBonus: number;
  viewReduction: number;
};

// Calculate zone-specific stats
function useZoneStats(): Record<string, ZoneStats> {
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);

  return useMemo(() => {
    const stats: Record<string, ZoneStats> = {};

    for (const zone of ZONES) {
      const zoneUpgrades = UPGRADES.filter((u) => u.zone === zone.id);
      let upgradesOwned = 0;
      let passiveIncome = 0;
      let clickBonus = 0;
      let viewReduction = 0;

      for (const upgrade of zoneUpgrades) {
        const owned = ownedUpgrades[upgrade.id] ?? 0;
        if (owned > 0) upgradesOwned += owned;

        if (unlockedZones.includes(zone.id) && owned > 0) {
          if (upgrade.effect.type === "passiveIncome") {
            passiveIncome += upgrade.effect.amount * owned;
          } else if (upgrade.effect.type === "clickBonus") {
            clickBonus += upgrade.effect.amount * owned;
          } else if (upgrade.effect.type === "viewReduction") {
            viewReduction += upgrade.effect.amount * owned * 100;
          }
        }
      }

      stats[zone.id] = {
        upgradesOwned,
        totalUpgrades: zoneUpgrades.length,
        passiveIncome,
        clickBonus,
        viewReduction: Math.min(viewReduction, 95), // Cap display at 95%
      };
    }

    return stats;
  }, [ownedUpgrades, unlockedZones]);
}

// Calculate risk rating for a zone (views per dollar earned)
function getZoneRiskRating(zone: (typeof ZONES)[0]): {
  level: "LOW" | "MED" | "HIGH" | "EXTREME";
  color: string;
  ratio: number;
} {
  // Ratio = views per click / dollars per click (views per dollar)
  const ratio = zone.viewsPerClick / zone.baseClickValue;

  if (ratio < 5) return { level: "LOW", color: "#4ade80", ratio };
  if (ratio < 15) return { level: "MED", color: "#facc15", ratio };
  if (ratio < 50) return { level: "HIGH", color: "#f97316", ratio };
  return { level: "EXTREME", color: "#ef4444", ratio };
}

// Stat badge component for zone cards
function ZoneStat({
  icon,
  value,
  label,
  color,
  glow = false,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  glow?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
        boxShadow: glow ? `0 0 8px ${color}30` : undefined,
      }}
    >
      <span>{icon}</span>
      <span style={{ color, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
        {value}
      </span>
      <span style={{ color: "var(--color-text-dim)", fontSize: "8px" }}>
        {label}
      </span>
    </div>
  );
}

// Time threshold for zone expertise: 5 minutes
const ZONE_EXPERTISE_TIME_MS = 5 * 60 * 1000;

export function ZoneSelector({ compact = false }: ZoneSelector.Props) {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const setActiveZone = useGameStore((s) => s.setActiveZone);
  const unlockZone = useGameStore((s) => s.unlockZone);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const nickFilmingProgress = useGameStore((s) => s.nickFilmingProgress);
  const zoneEnteredTime = useGameStore((s) => s.zoneEnteredTime);
  const [showLocked, setShowLocked] = useState(false);
  const zoneStats = useZoneStats();

  // Track expertise status with periodic updates
  const [hasExpertise, setHasExpertise] = useState(false);
  const [expertiseProgress, setExpertiseProgress] = useState(0);

  // Update expertise status every second
  useEffect(() => {
    const updateExpertise = () => {
      const now = Date.now();
      const timeInZone = now - (zoneEnteredTime ?? now);
      setHasExpertise(timeInZone >= ZONE_EXPERTISE_TIME_MS);
      setExpertiseProgress(
        Math.min(100, (timeInZone / ZONE_EXPERTISE_TIME_MS) * 100)
      );
    };

    updateExpertise();
    const interval = setInterval(updateExpertise, 1000);
    return () => clearInterval(interval);
  }, [zoneEnteredTime]);

  // Juice effect states
  const [unlockingZone, setUnlockingZone] = useState<string | null>(null);
  const [confettiParticles, setConfettiParticles] = useState<
    ConfettiParticle[]
  >([]);
  const [switchingZone, setSwitchingZone] = useState<string | null>(null);
  const [zoneSwitchFlash, setZoneSwitchFlash] = useState<string | null>(null);

  const handleZoneClick = useCallback(
    (zoneId: string, isUnlocked: boolean, canAfford: boolean) => {
      if (isUnlocked) {
        if (zoneId !== activeZone) {
          playSound("zoneSwitch");
          // Trigger switch animation
          setSwitchingZone(zoneId);
          const zone = ZONES.find((z) => z.id === zoneId);
          if (zone) setZoneSwitchFlash(zone.color);
          setTimeout(() => setSwitchingZone(null), 300);
          setTimeout(() => setZoneSwitchFlash(null), 200);
          setActiveZone(zoneId);
        }
      } else if (canAfford) {
        // Trigger unlock celebration!
        setUnlockingZone(zoneId);
        playSound("zoneUnlock");

        // Create confetti burst
        const zone = ZONES.find((z) => z.id === zoneId);
        const confettiColors = zone
          ? [
              zone.color,
              "var(--color-money)",
              "var(--color-corruption)",
              "#ffffff",
            ]
          : ["#fbbf24", "#10b981", "#3b82f6", "#f59e0b"];
        const confettiEmojis = ["🎉", "✨", "💰", "🔓", "⭐", "💵"];
        const newConfetti: ConfettiParticle[] = Array.from({ length: 20 }).map(
          (_, i) => ({
            id: Date.now() + i,
            x: 30 + Math.random() * 40,
            y: 40 + Math.random() * 20,
            tx: (Math.random() - 0.5) * 150,
            ty: -80 - Math.random() * 60,
            color:
              confettiColors[Math.floor(Math.random() * confettiColors.length)],
            rotation: Math.random() * 720,
            emoji:
              confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
          })
        );
        setConfettiParticles(newConfetti);

        // Clear effects
        setTimeout(() => setUnlockingZone(null), 600);
        setTimeout(() => setConfettiParticles([]), 800);

        unlockZone(zoneId);
      }
    },
    [setActiveZone, unlockZone, activeZone]
  );

  const activeZoneData = ZONES.find((z) => z.id === activeZone);
  const unlockedZonesList = ZONES.filter((z) => unlockedZones.includes(z.id));
  const lockedZonesList = ZONES.filter((z) => !unlockedZones.includes(z.id));
  const affordableLockedCount = lockedZonesList.filter(
    (z) => money >= z.unlockCost
  ).length;

  // Find next zone to unlock (first locked zone we can't afford, or first affordable if any)
  const nextZone =
    lockedZonesList.find((z) => money < z.unlockCost) ?? lockedZonesList[0];
  const nextZoneProgress = nextZone
    ? Math.min(100, (money / nextZone.unlockCost) * 100)
    : 100;

  // Compact mobile view
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Next Zone Progress - compact */}
        {nextZone && (
          <div
            className="p-2 rounded-lg"
            style={{
              background: "var(--color-bg-primary)",
              border: "1px dashed var(--color-border-card)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{nextZone.icon}</span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{
                    color: "var(--color-text-dim)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Next: {nextZone.name}
                </div>
              </div>
              <div
                className="text-[10px]"
                style={{
                  color:
                    nextZoneProgress >= 100
                      ? "var(--color-money)"
                      : "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {nextZoneProgress.toFixed(0)}%
              </div>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--color-bg-elevated)" }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${nextZoneProgress}%`,
                  background:
                    nextZoneProgress >= 100
                      ? "var(--color-money)"
                      : nextZone.color,
                }}
              />
            </div>
          </div>
        )}

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
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: activeZoneData.color,
                    }}
                  >
                    {activeZoneData.name}
                  </span>
                  {hasExpertise && (
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded animate-glow-pulse"
                      style={{
                        background: "rgba(250, 204, 21, 0.2)",
                        color: "#facc15",
                        fontFamily: "var(--font-mono)",
                        border: "1px solid rgba(250, 204, 21, 0.4)",
                      }}
                    >
                      <span className="text-[9px]">⭐ EXPERT +15%</span>
                    </div>
                  )}
                  {nickShirleyLocation === activeZone && (
                    <div className="flex flex-col gap-0.5">
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded animate-warning-flash"
                        style={{
                          background: "var(--color-danger)",
                          color: "white",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-white/50">
                          <img
                            src={NICK_SHIRLEY_IMAGE}
                            alt="Nick"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.parentElement!.textContent = "📷";
                            }}
                          />
                        </div>
                        <span className="text-[9px]">
                          FILMING {nickFilmingProgress.toFixed(0)}%
                        </span>
                      </div>
                      {/* Filming progress bar */}
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(139, 47, 53, 0.3)" }}
                      >
                        <div
                          className="h-full transition-all duration-200"
                          style={{
                            width: `${nickFilmingProgress}%`,
                            background:
                              nickFilmingProgress > 75
                                ? "linear-gradient(90deg, #ef4444, #dc2626)"
                                : "linear-gradient(90deg, #f97316, #ef4444)",
                            boxShadow:
                              nickFilmingProgress > 75
                                ? "0 0 8px #ef4444"
                                : undefined,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Zone stats row */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <ZoneStat
                    icon="💰"
                    value={GameStore.formatMoney(activeZoneData.baseClickValue)}
                    label="/clk"
                    color="var(--color-money)"
                    glow
                  />
                  <ZoneStat
                    icon="👁️"
                    value={`${(activeZoneData.viewsPerClick / 1000).toFixed(
                      1
                    )}K`}
                    label="views"
                    color="var(--color-danger-bright)"
                  />
                  {zoneStats[activeZoneData.id]?.upgradesOwned > 0 && (
                    <ZoneStat
                      icon="⬆️"
                      value={`${zoneStats[activeZoneData.id].upgradesOwned}/${
                        zoneStats[activeZoneData.id].totalUpgrades
                      }`}
                      label="ups"
                      color={activeZoneData.color}
                    />
                  )}
                  {zoneStats[activeZoneData.id]?.passiveIncome > 0 && (
                    <ZoneStat
                      icon="⚡"
                      value={GameStore.formatMoney(
                        zoneStats[activeZoneData.id].passiveIncome
                      )}
                      label="/s"
                      color="#10b981"
                      glow
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other unlocked zones - compact row with stats */}
        {unlockedZonesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {unlockedZonesList
              .filter((z) => z.id !== activeZone)
              .map((zone) => {
                const stats = zoneStats[zone.id];
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneClick(zone.id, true, false)}
                    className="shrink-0 p-2 rounded-lg flex flex-col gap-1 transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${zone.color}10, var(--color-bg-elevated))`,
                      border: `1px solid ${zone.color}40`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{zone.icon}</span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: zone.color }}
                      >
                        {zone.name}
                      </span>
                      {nickShirleyLocation === zone.id && (
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-red-500 shrink-0 animate-pulse">
                          <img
                            src={NICK_SHIRLEY_IMAGE}
                            alt="Nick"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.parentElement!.textContent = "📷";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Mini stats */}
                    <div
                      className="flex gap-1 text-[8px]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <span style={{ color: "var(--color-money)" }}>
                        {GameStore.formatMoney(zone.baseClickValue)}
                      </span>
                      <span style={{ color: "var(--color-text-dim)" }}>•</span>
                      <span style={{ color: "var(--color-danger-bright)" }}>
                        {(zone.viewsPerClick / 1000).toFixed(0)}K👁️
                      </span>
                      {stats?.passiveIncome > 0 && (
                        <>
                          <span style={{ color: "var(--color-text-dim)" }}>
                            •
                          </span>
                          <span style={{ color: "#10b981" }}>
                            ⚡{GameStore.formatMoney(stats.passiveIncome)}/s
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
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
                🔒 {lockedZonesList.length} locked zone
                {lockedZonesList.length !== 1 ? "s" : ""}
                {affordableLockedCount > 0 && (
                  <span style={{ color: "var(--color-money)" }}>
                    {" "}
                    ({affordableLockedCount} affordable)
                  </span>
                )}
              </span>
              <span>{showLocked ? "▲" : "▼"}</span>
            </button>

            {showLocked && (
              <div className="mt-2 space-y-2">
                {lockedZonesList.map((zone) => {
                  const canAfford = money >= zone.unlockCost;
                  const risk = getZoneRiskRating(zone);
                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneClick(zone.id, false, canAfford)}
                      disabled={!canAfford}
                      className="w-full p-2 rounded-lg flex flex-col gap-1.5 text-left"
                      style={{
                        background: canAfford
                          ? "var(--color-bg-elevated)"
                          : "var(--color-bg-primary)",
                        border: `1px ${canAfford ? "solid" : "dashed"} ${
                          canAfford
                            ? "var(--color-corruption-dim)"
                            : "var(--color-border-card)"
                        }`,
                        opacity: canAfford ? 1 : 0.6,
                        cursor: canAfford ? "pointer" : "not-allowed",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xl"
                          style={{
                            filter: canAfford ? "none" : "grayscale(0.8)",
                          }}
                        >
                          {zone.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs font-semibold truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {zone.name}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{
                              color: canAfford
                                ? "var(--color-money)"
                                : "var(--color-text-dim)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {GameStore.formatMoney(zone.unlockCost)}
                          </div>
                        </div>
                        <span
                          className="text-[9px] uppercase px-1.5 py-0.5 rounded"
                          style={{
                            background: canAfford
                              ? "var(--color-money)20"
                              : "var(--color-danger)20",
                            color: canAfford
                              ? "var(--color-money)"
                              : "var(--color-danger-bright)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {canAfford ? "UNLOCK" : "LOCKED"}
                        </span>
                      </div>
                      {/* Preview stats for locked zones */}
                      <div className="flex gap-1.5 pl-7">
                        <ZoneStat
                          icon="💰"
                          value={GameStore.formatMoney(zone.baseClickValue)}
                          label="/clk"
                          color="var(--color-money)"
                        />
                        <ZoneStat
                          icon="👁️"
                          value={`${(zone.viewsPerClick / 1000).toFixed(
                            zone.viewsPerClick >= 10000 ? 0 : 1
                          )}K`}
                          label=""
                          color="var(--color-danger-bright)"
                        />
                        <ZoneStat
                          icon="⚠️"
                          value={risk.level}
                          label="risk"
                          color={risk.color}
                        />
                      </div>
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
    <div className="space-y-3 relative">
      {/* Zone switch color flash */}
      {zoneSwitchFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-20 animate-screen-flash rounded-lg"
          style={{
            background: `radial-gradient(circle at center, ${zoneSwitchFlash}40, transparent 70%)`,
          }}
        />
      )}

      {/* Unlock confetti particles */}
      {confettiParticles.map((p) => (
        <div
          key={p.id}
          className="absolute text-xl pointer-events-none z-30 animate-confetti-burst"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rotation}deg`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </div>
      ))}

      {/* Next Zone Progress Indicator */}
      {nextZone && (
        <div
          className="p-3 rounded-lg"
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-card)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{nextZone.icon}</span>
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  NEXT ZONE
                </div>
                <div
                  className="text-sm"
                  style={{
                    color: nextZone.color,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {nextZone.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-dim)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {GameStore.formatMoney(money)} /{" "}
                {GameStore.formatMoney(nextZone.unlockCost)}
              </div>
              <div
                className="text-[10px]"
                style={{
                  color:
                    nextZoneProgress >= 100
                      ? "var(--color-money)"
                      : "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {nextZoneProgress.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-card)",
            }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${nextZoneProgress}%`,
                background:
                  nextZoneProgress >= 100
                    ? `linear-gradient(90deg, var(--color-money), ${nextZone.color})`
                    : `linear-gradient(90deg, ${nextZone.color}60, ${nextZone.color})`,
                boxShadow:
                  nextZoneProgress >= 100
                    ? `0 0 8px var(--color-money)`
                    : undefined,
              }}
            />
          </div>

          {nextZoneProgress >= 100 && (
            <div
              className="mt-2 text-center text-xs animate-glow-pulse"
              style={{
                color: "var(--color-money)",
                fontFamily: "var(--font-mono)",
              }}
            >
              ✓ READY TO UNLOCK
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {ZONES.map((zone) => {
          const isUnlocked = unlockedZones.includes(zone.id);
          const isActive = activeZone === zone.id;
          const canAfford = money >= zone.unlockCost;
          const isNickHere = nickShirleyLocation === zone.id;

          const isUnlocking = unlockingZone === zone.id;
          const isSwitching = switchingZone === zone.id;

          return (
            <button
              key={zone.id}
              onClick={() => handleZoneClick(zone.id, isUnlocked, canAfford)}
              disabled={!isUnlocked && !canAfford}
              className={`relative text-left transition-all duration-200 group ${
                isUnlocking ? "animate-vault-unlock" : ""
              } ${isSwitching ? "animate-zone-switch" : ""}`}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${zone.color}25, var(--color-bg-elevated))`
                  : isUnlocked
                  ? "var(--color-bg-elevated)"
                  : "var(--color-bg-primary)",
                borderRadius: "8px 8px 4px 4px",
                border: isUnlocking
                  ? `2px solid ${zone.color}`
                  : isActive
                  ? `2px solid ${zone.color}`
                  : isUnlocked
                  ? "1px solid var(--color-border-highlight)"
                  : canAfford
                  ? "1px dashed var(--color-corruption-dim)"
                  : "1px dashed var(--color-border-card)",
                opacity: !isUnlocked && !canAfford ? 0.5 : 1,
                cursor: !isUnlocked && !canAfford ? "not-allowed" : "pointer",
                boxShadow: isUnlocking
                  ? `0 0 40px ${zone.color}80, inset 0 0 20px ${zone.color}30`
                  : isActive
                  ? `0 4px 20px ${zone.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : undefined,
              }}
            >
              {/* Light sweep on unlock */}
              {isUnlocking && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg">
                  <div
                    className="absolute inset-0 animate-light-sweep"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${zone.color}60 50%, transparent 100%)`,
                      width: "50%",
                    }}
                  />
                </div>
              )}
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

              {/* Nick Shirley portrait indicator */}
              {isNickHere && (
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full overflow-hidden z-10 animate-bounce border-2"
                  style={{
                    borderColor: "var(--color-danger-bright)",
                    boxShadow: "0 2px 8px rgba(139, 47, 53, 0.6)",
                  }}
                >
                  <img
                    src={NICK_SHIRLEY_IMAGE}
                    alt="Nick Shirley filming"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML =
                        '<span class="text-lg">📷</span>';
                      e.currentTarget.parentElement!.classList.add(
                        "flex",
                        "items-center",
                        "justify-center",
                        "bg-black/50"
                      );
                    }}
                  />
                </div>
              )}

              {/* Filming warning with progress for active zone */}
              {isNickHere && (
                <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
                  <div
                    className="text-[8px] px-1.5 py-0.5 rounded animate-warning-flash"
                    style={{
                      background: "var(--color-danger)",
                      color: "white",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    FILMING{" "}
                    {isActive ? `${nickFilmingProgress.toFixed(0)}%` : ""}
                  </div>
                  {/* Filming progress bar (only for active zone) */}
                  {isActive && nickFilmingProgress > 0 && (
                    <div
                      className="w-16 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      <div
                        className="h-full transition-all duration-200"
                        style={{
                          width: `${nickFilmingProgress}%`,
                          background:
                            nickFilmingProgress > 75
                              ? "linear-gradient(90deg, #ef4444, #dc2626)"
                              : "linear-gradient(90deg, #f97316, #ef4444)",
                          boxShadow:
                            nickFilmingProgress > 75
                              ? "0 0 6px #ef4444"
                              : undefined,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Background zone image (visible when unlocked) */}
              {isUnlocked && zone.imagePrompt && (
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none ai-image-zone"
                  style={{ opacity: 0.5, zIndex: 0 }}
                >
                  <img
                    src={getZoneImageUrl(zone.id)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Gradient overlay to keep text readable */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.7) 100%)",
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div
                className="p-3 relative z-10"
                style={{ isolation: "isolate" }}
              >
                <div className="flex items-center gap-2">
                  {/* Zone icon/image thumbnail */}
                  <div
                    className="text-2xl w-14 h-14 flex items-center justify-center rounded-lg shrink-0 overflow-hidden"
                    style={{
                      background: isUnlocked
                        ? `${zone.color}25`
                        : "var(--color-bg-primary)",
                      border: `2px solid ${
                        isUnlocked
                          ? `${zone.color}60`
                          : "var(--color-border-card)"
                      }`,
                      boxShadow: isUnlocked
                        ? `0 2px 8px ${zone.color}30`
                        : undefined,
                    }}
                  >
                    <img
                      src={getZoneImageUrl(zone.id)}
                      alt={zone.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: isUnlocked
                          ? "brightness(1.1) contrast(1.05)"
                          : "grayscale(0.6) brightness(0.7)",
                        imageRendering: "auto",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.textContent = zone.icon;
                      }}
                    />
                  </div>

                  {/* Zone info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-sm truncate"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: isUnlocked
                            ? zone.color
                            : "var(--color-text-muted)",
                          letterSpacing: "0.03em",
                          textShadow: isUnlocked
                            ? "0 1px 2px rgba(0,0,0,0.6)"
                            : undefined,
                        }}
                      >
                        {zone.name}
                      </span>
                    </div>
                    {isUnlocked ? (
                      <div
                        className="text-[10px] truncate"
                        style={{
                          color: "var(--color-text-secondary)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        {zone.description.split(" - ")[0]}
                      </div>
                    ) : (
                      <div
                        className="text-[10px]"
                        style={{
                          color: canAfford
                            ? "var(--color-money)"
                            : "var(--color-text-dim)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {GameStore.formatMoney(zone.unlockCost)} to unlock
                      </div>
                    )}
                  </div>
                </div>

                {/* Zone stats row */}
                {isUnlocked &&
                  (() => {
                    const risk = getZoneRiskRating(zone);
                    return (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <ZoneStat
                          icon="💰"
                          value={GameStore.formatMoney(zone.baseClickValue)}
                          label="/clk"
                          color="var(--color-money)"
                          glow={isActive}
                        />
                        <ZoneStat
                          icon="👁️"
                          value={`${(zone.viewsPerClick / 1000).toFixed(
                            zone.viewsPerClick >= 10000 ? 0 : 1
                          )}K`}
                          label=""
                          color="var(--color-danger-bright)"
                        />
                        {/* Risk rating indicator */}
                        <ZoneStat
                          icon="⚠️"
                          value={risk.level}
                          label="risk"
                          color={risk.color}
                        />
                        {zoneStats[zone.id]?.upgradesOwned > 0 && (
                          <ZoneStat
                            icon="⬆️"
                            value={`${zoneStats[zone.id].upgradesOwned}`}
                            label="ups"
                            color={zone.color}
                          />
                        )}
                        {zoneStats[zone.id]?.passiveIncome > 0 && (
                          <ZoneStat
                            icon="⚡"
                            value={GameStore.formatMoney(
                              zoneStats[zone.id].passiveIncome
                            )}
                            label="/s"
                            color="#10b981"
                            glow={isActive}
                          />
                        )}
                      </div>
                    );
                  })()}

                {/* Status stamp */}
                <div className="mt-2 flex items-center justify-between">
                  {isActive ? (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"
                        style={{
                          background: `${zone.color}50`,
                          color: zone.color,
                          fontFamily: "var(--font-mono)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        }}
                      >
                        <span className="animate-pulse">●</span> ACTIVE
                      </div>
                      {hasExpertise ? (
                        <div
                          className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 animate-glow-pulse"
                          style={{
                            background: "rgba(250, 204, 21, 0.2)",
                            color: "#facc15",
                            fontFamily: "var(--font-mono)",
                            border: "1px solid rgba(250, 204, 21, 0.4)",
                          }}
                        >
                          ⭐ EXPERT +15%
                        </div>
                      ) : (
                        expertiseProgress > 0 && (
                          <div
                            className="text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1"
                            style={{
                              background: "rgba(250, 204, 21, 0.1)",
                              color: "rgba(250, 204, 21, 0.6)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            ⭐ {expertiseProgress.toFixed(0)}%
                          </div>
                        )
                      )}
                    </div>
                  ) : isUnlocked ? (
                    <div
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "var(--color-text-secondary)",
                        fontFamily: "var(--font-mono)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
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
                      🔒 LOCKED
                    </div>
                  )}

                  {/* Corner fold */}
                  {isUnlocked && (
                    <div
                      className="w-4 h-4"
                      style={{
                        background: `linear-gradient(135deg, transparent 50%, ${zone.color}30 50%)`,
                      }}
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
