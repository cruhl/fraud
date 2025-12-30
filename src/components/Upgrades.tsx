import { useMemo, useCallback } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { UPGRADES, getUpgradesForZone, type Upgrade } from "~/data/upgrades";

export function Upgrades() {
  const money = useGameStore((s) => s.money);
  const activeZone = useGameStore((s) => s.activeZone);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  const zoneUpgrades = useMemo(
    () => getUpgradesForZone(activeZone),
    [activeZone]
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2">
        🛠️ Zone Upgrades
      </h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {zoneUpgrades.map((upgrade) => (
          <Upgrades.Item
            key={upgrade.id}
            upgrade={upgrade}
            owned={ownedUpgrades[upgrade.id] ?? 0}
            money={money}
            onBuy={buyUpgrade}
          />
        ))}
      </div>
    </div>
  );
}

export namespace Upgrades {
  export type ItemProps = {
    upgrade: Upgrade;
    owned: number;
    money: number;
    onBuy: (id: string) => void;
  };

  export function Item({ upgrade, owned, money, onBuy }: ItemProps) {
    const cost = useMemo(
      () => GameStore.getUpgradeCost(upgrade, owned),
      [upgrade, owned]
    );
    const canAfford = money >= cost;

    const handleBuy = useCallback(() => {
      onBuy(upgrade.id);
    }, [onBuy, upgrade.id]);

    return (
      <button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`
          w-full p-2.5 rounded-lg text-left transition-all border
          ${
            canAfford
              ? "bg-gray-800/80 border-gray-600 hover:bg-gray-700/80 hover:border-yellow-500 cursor-pointer"
              : "bg-gray-900/50 border-gray-800 opacity-50 cursor-not-allowed"
          }
        `}
      >
        <div className="flex items-start gap-2">
          <div className="text-xl">{upgrade.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-white text-sm">{upgrade.name}</span>
              {owned > 0 && (
                <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
                  x{owned}
                </span>
              )}
            </div>
            <div className="text-xs text-green-400">{upgrade.description}</div>
            <div className="text-xs text-gray-500 italic truncate">
              "{upgrade.flavorText}"
            </div>
          </div>
        </div>
        <div
          className={`mt-1.5 text-right font-mono text-sm ${
            canAfford ? "text-yellow-400" : "text-gray-600"
          }`}
        >
          {GameStore.formatMoney(cost)}
        </div>
      </button>
    );
  }
}
