import { useGameStore, GameStore } from "~/store/gameStore";
import { getCharacterImageUrl } from "~/lib/assets";

// Nick Shirley character portrait URL
const NICK_SHIRLEY_IMAGE = getCharacterImageUrl("nick-shirley");

export function ViralMeter() {
  const viralViews = useGameStore((s) => s.viralViews);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const activeZone = useGameStore((s) => s.activeZone);

  const progress = (viralViews / GameStore.VIRAL_LIMIT) * 100;
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
  const isDanger = progress >= 50;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Nick Shirley portrait with animation */}
          <div 
            className={`relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ai-image-character ${isNickHere ? "animate-warning-flash" : ""}`}
            style={{
              background: threat.bgColor,
              border: `2px solid ${threat.color}`,
              boxShadow: isHighThreat ? `0 0 15px ${threat.color}50` : undefined,
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
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Nick Shirley's Investigation
            </div>
            <div 
              className="text-xs"
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
            className="font-mono text-lg font-bold"
            style={{ 
              color: isDanger ? threat.color : "var(--color-text-primary)",
              textShadow: isHighThreat ? `0 0 10px ${threat.color}` : undefined,
            }}
          >
            {GameStore.formatViews(viralViews)}
          </div>
          <div 
            className="text-[10px] uppercase tracking-wider"
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
          className="h-6 rounded-full overflow-hidden relative"
          style={{
            background: "var(--color-bg-primary)",
            border: `2px solid ${isHighThreat ? threat.color : "var(--color-border-card)"}`,
            boxShadow: isHighThreat 
              ? `inset 0 2px 10px rgba(0,0,0,0.5), 0 0 20px ${threat.color}30`
              : "inset 0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {/* Gauge tick marks */}
          <div className="absolute inset-0 flex justify-between px-1 items-center pointer-events-none">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div 
                key={tick}
                className="w-px h-2"
                style={{ 
                  background: progress >= tick ? threat.color : "var(--color-border-highlight)",
                  opacity: 0.5,
                }}
              />
            ))}
          </div>

          {/* Gauge fill */}
          <div
            className="h-full transition-all duration-300 relative"
            style={{ 
              width: `${Math.min(100, progress)}%`,
              background: `linear-gradient(90deg, #4ade80, ${threat.color})`,
              boxShadow: isHighThreat ? `0 0 10px ${threat.color}` : undefined,
            }}
          >
            {/* Gloss effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
              }}
            />
          </div>

          {/* Warning lights */}
          {isHighThreat && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <div 
                className="w-2 h-2 rounded-full animate-warning-flash"
                style={{ background: threat.color, boxShadow: `0 0 5px ${threat.color}` }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-warning-flash"
                style={{ 
                  background: threat.color, 
                  boxShadow: `0 0 5px ${threat.color}`,
                  animationDelay: "0.25s",
                }}
              />
            </div>
          )}
        </div>

        {/* Scale labels */}
        <div 
          className="flex justify-between text-[9px] mt-1 px-1"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          <span>SAFE</span>
          <span style={{ color: progress >= 50 ? "#f97316" : undefined }}>DANGER</span>
          <span style={{ color: "var(--color-danger)" }}>GAME OVER</span>
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
    </div>
  );
}
