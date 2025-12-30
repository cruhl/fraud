import { useGameStore, GameStore } from "~/store/gameStore";

export function ViralMeter() {
  const viralViews = useGameStore((s) => s.viralViews);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const activeZone = useGameStore((s) => s.activeZone);

  const progress = (viralViews / GameStore.VIRAL_LIMIT) * 100;
  const isNickHere = nickShirleyLocation === activeZone;

  const getColor = (level: typeof threatLevel) => {
    switch (level) {
      case "safe":
        return "from-green-500 to-green-400";
      case "local-blogger":
        return "from-yellow-500 to-yellow-400";
      case "gaining-traction":
        return "from-orange-500 to-orange-400";
      case "regional-news":
        return "from-orange-600 to-red-400";
      case "national-story":
        return "from-red-500 to-red-400";
      case "viral":
        return "from-red-600 to-pink-500";
      case "the-video":
        return "from-red-700 to-red-600";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📹</span>
          <span className="text-sm font-semibold text-gray-300">
            Nick Shirley's Views
          </span>
          {isNickHere && (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded animate-pulse">
              FILMING YOUR ZONE!
            </span>
          )}
        </div>
        <span
          className={`font-mono text-lg ${
            threatLevel !== "safe" ? "text-red-400" : "text-gray-400"
          }`}
        >
          {GameStore.formatViews(viralViews)} views
        </span>
      </div>

      {/* Meter bar */}
      <div
        className={`h-4 bg-gray-800 rounded-full overflow-hidden border-2 ${
          threatLevel === "viral" || threatLevel === "the-video"
            ? "border-red-500 animate-pulse"
            : "border-gray-700"
        }`}
      >
        <div
          className={`h-full bg-gradient-to-r ${getColor(threatLevel)} transition-all duration-300`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Threat level indicator */}
      <div className="flex items-center justify-between text-xs">
        <span
          className={`${
            threatLevel !== "safe" ? "text-red-400" : "text-gray-500"
          }`}
        >
          {GameStore.getThreatMessage(threatLevel)}
        </span>
        <span className="text-gray-600">
          {GameStore.formatViews(GameStore.VIRAL_LIMIT)} = Game Over
        </span>
      </div>

      {/* Nick Shirley location */}
      {nickShirleyLocation && (
        <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/30 px-3 py-1.5 rounded">
          <span>📷</span>
          <span>
            Nick Shirley spotted in{" "}
            <span className="font-semibold capitalize">{nickShirleyLocation}</span> district
          </span>
        </div>
      )}
    </div>
  );
}

