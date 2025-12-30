import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";

export function ZoneSelector() {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const setActiveZone = useGameStore((s) => s.setActiveZone);
  const unlockZone = useGameStore((s) => s.unlockZone);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);

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
              onClick={() =>
                isUnlocked ? setActiveZone(zone.id) : canAfford && unlockZone(zone.id)
              }
              disabled={!isUnlocked && !canAfford}
              className={`
                relative p-3 rounded-lg text-left transition-all border-2
                ${
                  isActive
                    ? "border-white bg-white/10"
                    : isUnlocked
                      ? "border-gray-600 bg-gray-800/50 hover:border-gray-400"
                      : canAfford
                        ? "border-dashed border-gray-500 bg-gray-800/30 hover:bg-gray-700/30"
                        : "border-dashed border-gray-700 bg-gray-900/30 opacity-50"
                }
              `}
              style={isActive ? { borderColor: zone.color } : undefined}
            >
              {/* Nick Shirley indicator */}
              {isNickHere && (
                <div className="absolute -top-1 -right-1 text-lg animate-bounce">
                  📷
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-2xl">{zone.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm truncate"
                    style={{ color: isUnlocked ? zone.color : undefined }}
                  >
                    {zone.name}
                  </div>
                  {isUnlocked ? (
                    <div className="text-xs text-gray-500 truncate">
                      {zone.description.split(" - ")[0]}
                    </div>
                  ) : (
                    <div className="text-xs text-yellow-500">
                      {GameStore.formatMoney(zone.unlockCost)} to unlock
                    </div>
                  )}
                </div>
              </div>

              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
                  style={{ backgroundColor: zone.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

