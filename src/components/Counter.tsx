import { useMemo } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";

export function Counter() {
  const money = useGameStore((s) => s.money);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const activeZone = useGameStore((s) => s.activeZone);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);

  const passiveIncome = useMemo(
    () =>
      GameStore.getPassiveIncome({
        ownedUpgrades,
        unlockedZones,
        totalArrestCount: 0,
      } as never),
    [ownedUpgrades, unlockedZones]
  );

  const clickValue = useMemo(
    () =>
      GameStore.getClickValue({
        ownedUpgrades,
        unlockedZones,
        activeZone,
        totalArrestCount: 0,
      } as never),
    [ownedUpgrades, unlockedZones, activeZone]
  );

  const progress = (totalEarned / GameStore.TARGET) * 100;
  const zone = ZONES.find((z) => z.id === activeZone);

  return (
    <div className="text-center space-y-4">
      {/* Main money display */}
      <div className="relative">
        <div className="text-5xl font-bold text-yellow-400 font-mono tracking-tight">
          {GameStore.formatMoney(money)}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Fraudulently Acquired Funds
        </div>
      </div>

      {/* Progress to goal */}
      <div className="max-w-md mx-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to $9 Billion</span>
          <span>{progress.toFixed(6)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-lg font-mono text-white">
            {GameStore.formatMoney(clickValue)}
          </div>
          <div className="text-xs text-gray-500">Per Click</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-lg font-mono text-white">
            {GameStore.formatMoney(passiveIncome)}/s
          </div>
          <div className="text-xs text-gray-500">Passive</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-lg font-mono text-white">
            {fakeClaims.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Fake Claims</div>
        </div>
      </div>

      {/* Zone indicator */}
      {zone && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
          style={{ backgroundColor: zone.color + "30", color: zone.color }}
        >
          <span>{zone.icon}</span>
          <span>{zone.name}</span>
        </div>
      )}

      {/* Satirical counter */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="text-green-400">
          <span className="text-gray-500">Reported:</span>{" "}
          <span className="font-mono">{(fakeClaims * 3).toLocaleString()} children</span>
        </div>
        <div className="text-red-400">
          <span className="text-gray-500">Actual:</span>{" "}
          <span className="font-mono">0 children</span>
        </div>
      </div>
    </div>
  );
}
