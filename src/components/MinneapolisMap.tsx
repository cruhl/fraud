import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";

export function MinneapolisMap() {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const setActiveZone = useGameStore((s) => s.setActiveZone);
  const unlockZone = useGameStore((s) => s.unlockZone);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const viralViews = useGameStore((s) => s.viralViews);
  const threatLevel = useGameStore((s) => s.threatLevel);

  // Zone positions on map (percentages)
  const zonePositions: Record<string, { x: number; y: number; width: number; height: number }> = {
    daycare: { x: 35, y: 30, width: 25, height: 30 },
    housing: { x: 55, y: 25, width: 20, height: 25 },
    autism: { x: 15, y: 55, width: 30, height: 25 },
    medicaid: { x: 50, y: 55, width: 35, height: 30 },
  };

  const isHighThreat = threatLevel === "viral" || threatLevel === "the-video";

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Mississippi River (stylized) */}
      <div
        className="absolute w-4 bg-blue-900/50 blur-sm"
        style={{
          left: "78%",
          top: 0,
          bottom: 0,
          transform: "skewX(-5deg)",
        }}
      />

      {/* Title */}
      <div className="absolute top-2 left-3 text-xs font-mono text-gray-500">
        MINNEAPOLIS FRAUD MAP
      </div>

      {/* Threat indicator */}
      <div
        className={`absolute top-2 right-3 text-xs font-mono px-2 py-0.5 rounded ${
          isHighThreat
            ? "bg-red-900 text-red-300 animate-pulse"
            : "bg-gray-800 text-gray-400"
        }`}
      >
        {GameStore.formatViews(viralViews)} views
      </div>

      {/* Zone areas */}
      {ZONES.map((zone) => {
        const pos = zonePositions[zone.id];
        const isUnlocked = unlockedZones.includes(zone.id);
        const isActive = activeZone === zone.id;
        const canAfford = money >= zone.unlockCost;
        const isNickHere = nickShirleyLocation === zone.id;

        return (
          <button
            key={zone.id}
            onClick={() =>
              isUnlocked ? setActiveZone(zone.id) : canAfford && unlockZone(zone.id)
            }
            disabled={!isUnlocked && !canAfford}
            className={`
              absolute rounded-lg transition-all duration-300
              flex flex-col items-center justify-center
              ${isActive ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}
              ${!isUnlocked && !canAfford ? "opacity-30 cursor-not-allowed" : "hover:scale-105"}
              ${isNickHere ? "animate-pulse" : ""}
            `}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${pos.width}%`,
              height: `${pos.height}%`,
              backgroundColor: isUnlocked ? zone.color + "40" : "#1f2937",
              borderWidth: "2px",
              borderStyle: isUnlocked ? "solid" : "dashed",
              borderColor: isUnlocked
                ? isActive
                  ? zone.color
                  : zone.color + "80"
                : canAfford
                  ? "#4b5563"
                  : "#374151",
            }}
          >
            {/* Nick Shirley camera icon */}
            {isNickHere && (
              <div className="absolute -top-2 -right-2 text-lg z-10 animate-bounce">
                📷
              </div>
            )}

            {/* Zone icon */}
            <span className="text-2xl mb-1">{zone.icon}</span>

            {/* Zone name */}
            <span
              className={`text-xs font-bold text-center leading-tight ${
                isUnlocked ? "text-white" : "text-gray-500"
              }`}
            >
              {zone.name}
            </span>

            {/* Unlock cost */}
            {!isUnlocked && (
              <span
                className={`text-[10px] mt-1 ${
                  canAfford ? "text-yellow-400" : "text-gray-600"
                }`}
              >
                {GameStore.formatMoney(zone.unlockCost)}
              </span>
            )}

            {/* Active indicator */}
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-white text-gray-900 px-1 rounded font-bold">
                ACTIVE
              </span>
            )}
          </button>
        );
      })}

      {/* Nick Shirley icon (when not in a zone) */}
      {!nickShirleyLocation && (
        <div
          className="absolute text-xl animate-nick-walking"
          style={{ left: "5%", bottom: "10%" }}
        >
          🎥
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 text-[9px] text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500/50 rounded" />
          <span>Unlocked</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 border border-dashed border-gray-500 rounded" />
          <span>Locked</span>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute bottom-2 right-2 text-gray-600 text-xs">
        ↑N
      </div>
    </div>
  );
}

