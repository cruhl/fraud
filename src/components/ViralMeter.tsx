import { useState, useMemo } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { getCharacterImageUrl } from "~/lib/assets";

// Nick Shirley character portrait URL
const NICK_SHIRLEY_IMAGE = getCharacterImageUrl("nick-shirley");

export function ViralMeter() {
  const viralViews = useGameStore((s) => s.viralViews);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const activeZone = useGameStore((s) => s.activeZone);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const hiredCrew = useGameStore((s) => s.hiredCrew);

  const [showModifiers, setShowModifiers] = useState(false);

  // Calculate modifier values for the panel
  const modifiers = useMemo(() => {
    const pseudoState = {
      ownedUpgrades,
      unlockedZones,
      totalArrestCount,
      lifetimeStats,
      activeEvent,
      nickShirleyLocation,
      hiredCrew,
    } as Parameters<typeof GameStore.getViewDecay>[0];

    const viewDecay = GameStore.getViewDecay(pseudoState);
    const viewCap = GameStore.getViewCap(pseudoState);
    const passiveIncome = GameStore.getPassiveIncome(pseudoState);
    const passiveViews = passiveIncome * 0.05; // Views generated from passive income
    const prestigeDecayBonus = totalArrestCount * 5; // Percentage bonus
    const isNickFilming = nickShirleyLocation === activeZone;
    const hasViewCapUpgrade = viewCap < GameStore.VIRAL_LIMIT;
    const viewReduction = GameStore.getViewReductionPercent(pseudoState);
    const clickMultiplier = GameStore.getClickMultiplier(pseudoState);
    const goldenClaimMultiplier = GameStore.getGoldenClaimMultiplier(pseudoState);
    const trialBonus = GameStore.getTrialAcquittalBonus(pseudoState);

    return {
      viewDecay,
      viewCap,
      passiveViews,
      prestigeDecayBonus,
      isNickFilming,
      hasViewCapUpgrade,
      viewReduction,
      clickMultiplier,
      goldenClaimMultiplier,
      trialBonus,
    };
  }, [ownedUpgrades, unlockedZones, totalArrestCount, lifetimeStats, activeEvent, nickShirleyLocation, activeZone, hiredCrew]);

  // Use logarithmic scale so progress matches threat level perception
  // Thresholds: 10K, 100K, 1M, 10M, 50M, 95M, 100M
  const logProgress = (() => {
    if (viralViews <= 0) return 0;
    const minLog = Math.log10(10_000); // 10K = start of danger
    const maxLog = Math.log10(GameStore.VIRAL_LIMIT); // 100M
    const currentLog = Math.log10(Math.max(viralViews, 1));
    // Map to 0-100 range, with 0-10K compressed to first 5%
    if (viralViews < 10_000) return (viralViews / 10_000) * 5;
    return 5 + ((currentLog - minLog) / (maxLog - minLog)) * 95;
  })();
  const progress = logProgress;
  const isNickHere = nickShirleyLocation === activeZone;

  const getThreatConfig = (level: typeof threatLevel) => {
    switch (level) {
      case "safe":
        return { color: "#4ade80", bgColor: "#4ade8020", label: "LOW" };
      case "local-blogger":
        return { color: "#facc15", bgColor: "#facc1520", label: "CAUTION" };
      case "gaining-traction":
        return { color: "#fb923c", bgColor: "#fb923c20", label: "ELEVATED" };
      case "regional-news":
        return { color: "#f97316", bgColor: "#f9731620", label: "HIGH" };
      case "national-story":
        return { color: "#ef4444", bgColor: "#ef444420", label: "SEVERE" };
      case "viral":
        return { color: "#dc2626", bgColor: "#dc262620", label: "CRITICAL" };
      case "the-video":
        return { color: "#b91c1c", bgColor: "#b91c1c30", label: "TERMINAL" };
    }
  };

  const threat = getThreatConfig(threatLevel);
  const isHighThreat = threatLevel === "viral" || threatLevel === "the-video";
  // Danger threshold: regional-news or higher (1M+ views = ~52.5% on log scale)
  const isDanger = viralViews >= 1_000_000;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Nick Shirley portrait with animation */}
          <div 
            className={`relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ai-image-character ${isNickHere ? "animate-warning-flash" : ""}`}
            style={{
              background: threat.bgColor,
              border: `2px solid ${threat.color}`,
              boxShadow: isHighThreat 
                ? `0 0 20px ${threat.color}60, 0 0 40px ${threat.color}30` 
                : `0 4px 12px rgba(0,0,0,0.3)`,
            }}
          >
            <img 
              src={NICK_SHIRLEY_IMAGE} 
              alt="Nick Shirley"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">📹</span>';
              }}
            />
            {/* Lens flare effect when filming */}
            {isNickHere && (
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{ 
                  background: `radial-gradient(circle, ${threat.color}40 0%, transparent 70%)`,
                }}
              />
            )}
          </div>

          <div>
            <div 
              className="text-sm font-semibold tracking-wide"
              style={{ 
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.05em",
              }}
            >
              Nick Shirley's Investigation
            </div>
            <div 
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isNickHere ? (
                <span className="animate-warning-flash" style={{ color: threat.color }}>
                  ⚠ FILMING YOUR ZONE!
                </span>
              ) : (
                GameStore.getThreatMessage(threatLevel)
              )}
            </div>
          </div>
        </div>

        {/* View counter */}
        <div className="text-right">
          <div 
            className="text-xl font-semibold"
            style={{ 
              fontFamily: "var(--font-mono)",
              color: isDanger ? threat.color : "var(--color-text-primary)",
              textShadow: isHighThreat 
                ? `0 0 15px ${threat.color}, 0 0 30px ${threat.color}80` 
                : isDanger 
                  ? `0 0 10px ${threat.color}50`
                  : undefined,
            }}
          >
            {GameStore.formatViews(viralViews)}
          </div>
          <div 
            className="text-[9px] uppercase tracking-[0.15em]"
            style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
          >
            views
          </div>
        </div>
      </div>

      {/* Vintage gauge meter */}
      <div className="relative">
        {/* Gauge background */}
        <div 
          className="h-7 rounded-lg overflow-hidden relative"
          style={{
            background: "linear-gradient(180deg, var(--color-bg-primary), rgba(0,0,0,0.4))",
            border: `2px solid ${isHighThreat ? threat.color : "var(--color-border-card)"}`,
            boxShadow: isHighThreat 
              ? `inset 0 2px 10px rgba(0,0,0,0.5), 0 0 25px ${threat.color}40`
              : "inset 0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {/* Gauge tick marks - positioned at threat level thresholds (log scale) */}
          {/* 10K=5%, 100K=29%, 1M=52.5%, 10M=76%, 50M=92%, 100M=100% */}
          <div className="absolute inset-0 items-center pointer-events-none">
            {[
              { pos: 5, label: "10K" },
              { pos: 29, label: "100K" },
              { pos: 52.5, label: "1M" },
              { pos: 76, label: "10M" },
              { pos: 92, label: "50M" },
            ].map((tick) => (
              <div 
                key={tick.pos}
                className="absolute w-px h-4 top-1/2 -translate-y-1/2 z-10"
                style={{ 
                  left: `${tick.pos}%`,
                  background: progress >= tick.pos ? threat.color : "var(--color-border-highlight)",
                  opacity: progress >= tick.pos ? 0.8 : 0.4,
                }}
              />
            ))}
          </div>

          {/* Gauge fill - clips the full gradient */}
          <div
            className="h-full transition-all duration-300 relative overflow-hidden"
            style={{ 
              width: `${Math.min(100, progress)}%`,
              boxShadow: isHighThreat ? `0 0 15px ${threat.color}` : undefined,
            }}
          >
            {/* Full-width gradient that gets revealed by parent clip */}
            <div 
              className="absolute inset-0"
              style={{
                width: `${100 / Math.max(progress, 1) * 100}%`,
                background: "linear-gradient(90deg, #4ade80 0%, #facc15 30%, #fb923c 50%, #f97316 65%, #ef4444 80%, #dc2626 90%, #b91c1c 100%)",
              }}
            />
            {/* Inner gloss effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)",
              }}
            />
          </div>

          {/* Warning lights */}
          {isHighThreat && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5 z-20">
              <div 
                className="w-2.5 h-2.5 rounded-full animate-warning-flash"
                style={{ background: threat.color, boxShadow: `0 0 8px ${threat.color}` }}
              />
              <div 
                className="w-2.5 h-2.5 rounded-full animate-warning-flash"
                style={{ 
                  background: threat.color, 
                  boxShadow: `0 0 8px ${threat.color}`,
                  animationDelay: "0.25s",
                }}
              />
            </div>
          )}
        </div>

        {/* Scale labels - aligned with log scale thresholds */}
        <div 
          className="relative text-[8px] mt-1.5 h-4"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
        >
          <span className="absolute left-0" style={{ color: "#22c55e" }}>SAFE</span>
          <span className="absolute" style={{ left: "29%", color: progress >= 29 ? "#facc15" : undefined }}>CAUTION</span>
          <span className="absolute" style={{ left: "52.5%", transform: "translateX(-50%)", color: progress >= 52.5 ? "#f97316" : undefined }}>DANGER</span>
          <span className="absolute right-0" style={{ color: "var(--color-danger-bright)" }}>ARREST</span>
        </div>
      </div>

      {/* Threat level indicator */}
      <div 
        className="flex items-center justify-between px-3 py-2 rounded"
        style={{
          background: threat.bgColor,
          border: `1px solid ${threat.color}40`,
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${isHighThreat ? "animate-warning-flash" : ""}`}
            style={{ 
              background: threat.color,
              boxShadow: `0 0 8px ${threat.color}`,
            }}
          />
          <span 
            className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: threat.color, fontFamily: "var(--font-mono)" }}
          >
            THREAT LEVEL: {threat.label}
          </span>
        </div>
        <span 
          className="text-[10px]"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
        >
          {GameStore.formatViews(GameStore.VIRAL_LIMIT)} = ARREST
        </span>
      </div>

      {/* Nick Shirley location tracker */}
      {nickShirleyLocation && (
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded border"
          style={{
            background: "var(--color-bg-primary)",
            borderColor: "var(--color-corruption-dim)",
          }}
        >
          <span className="text-lg">📷</span>
          <span 
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Nick Shirley spotted in{" "}
            <span 
              className="font-semibold capitalize"
              style={{ color: "var(--color-corruption)" }}
            >
              {nickShirleyLocation}
            </span>{" "}
            district
          </span>
          {isNickHere && (
            <span 
              className="ml-auto text-[9px] px-2 py-0.5 rounded animate-warning-flash"
              style={{
                background: "var(--color-danger)",
                color: "white",
                fontFamily: "var(--font-mono)",
              }}
            >
              YOUR ZONE!
            </span>
          )}
        </div>
      )}

      {/* Collapsible Active Modifiers Panel */}
      <div
        className="rounded border overflow-hidden"
        style={{
          background: "var(--color-bg-primary)",
          borderColor: "var(--color-border-card)",
        }}
      >
        {/* Toggle header */}
        <button
          onClick={() => setShowModifiers(!showModifiers)}
          className="w-full flex items-center justify-between px-3 py-2 transition-colors hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🔬</span>
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}
            >
              Active Modifiers
            </span>
          </div>
          <span
            className="text-xs transition-transform"
            style={{ 
              color: "var(--color-text-dim)",
              transform: showModifiers ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </button>

        {/* Modifiers content */}
        {showModifiers && (
          <div
            className="px-3 pb-3 space-y-1.5 border-t animate-slide-in-down"
            style={{ borderColor: "var(--color-border-card)" }}
          >
            {/* View Decay */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                ↓ View Decay
              </span>
              <span
                className="text-xs font-semibold"
                style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
              >
                -{GameStore.formatViews(modifiers.viewDecay)}/sec
              </span>
            </div>

            {/* View Cap (only show if player has cap upgrade) */}
            {modifiers.hasViewCapUpgrade && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ⛔ View Cap
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
                >
                  {GameStore.formatViews(modifiers.viewCap)} (protected)
                </span>
              </div>
            )}

            {/* Passive Views (only show if player has passive income) */}
            {modifiers.passiveViews > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ⚡ Passive Views
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-viral)" }}
                >
                  +{GameStore.formatViews(Math.floor(modifiers.passiveViews))}/sec
                </span>
              </div>
            )}

            {/* Prestige Decay Bonus (only show if player has been arrested) */}
            {modifiers.prestigeDecayBonus > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  🔄 Prestige Bonus
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-corruption)" }}
                >
                  +{modifiers.prestigeDecayBonus}% decay ({totalArrestCount} arrest{totalArrestCount !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            {/* Nick Filming Warning */}
            {modifiers.isNickFilming && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  📷 Nick Filming
                </span>
                <span
                  className="text-xs font-semibold animate-warning-flash"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-danger-bright)" }}
                >
                  +50% views (!)
                </span>
              </div>
            )}

            {/* View Reduction (only show if player has reduction upgrades) */}
            {modifiers.viewReduction > 0.01 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  🛡️ View Reduction
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
                >
                  -{Math.round(modifiers.viewReduction * 100)}% per click
                </span>
              </div>
            )}

            {/* Click Multiplier (only show if > 1) */}
            {modifiers.clickMultiplier > 1.01 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  💰 Click Multiplier
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}
                >
                  {modifiers.clickMultiplier.toFixed(2)}x
                </span>
              </div>
            )}

            {/* Golden Claim Multiplier (only show if > 1) */}
            {modifiers.goldenClaimMultiplier > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ✨ Golden Claims
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "#fbbf24" }}
                >
                  {modifiers.goldenClaimMultiplier.toFixed(1)}x rewards
                </span>
              </div>
            )}

            {/* Trial Acquittal Bonus (only show if > 0) */}
            {modifiers.trialBonus > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ⚖️ Legal Defense
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
                >
                  +{Math.round(modifiers.trialBonus * 100)}% acquittal
                </span>
              </div>
            )}

            {/* Empty state */}
            {modifiers.viewDecay <= 1000 && 
             !modifiers.hasViewCapUpgrade && 
             modifiers.passiveViews === 0 && 
             modifiers.prestigeDecayBonus === 0 && 
             !modifiers.isNickFilming &&
             modifiers.viewReduction <= 0.01 &&
             modifiers.clickMultiplier <= 1.01 &&
             modifiers.goldenClaimMultiplier <= 1 &&
             modifiers.trialBonus <= 0 && (
              <div 
                className="text-xs text-center py-2"
                style={{ color: "var(--color-text-dim)" }}
              >
                No active modifiers yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
