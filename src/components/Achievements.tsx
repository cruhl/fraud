import { useMemo, useState } from "react";
import { useGameStore } from "~/store/gameStore";
import { ACHIEVEMENTS, type Achievement } from "~/data/achievements";

export function Achievements() {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const [isOpen, setIsOpen] = useState(false);

  const unlocked = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;

  const sortedAchievements = useMemo(
    () =>
      [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedAchievements.includes(a.id);
        const bUnlocked = unlockedAchievements.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
      }),
    [unlockedAchievements]
  );

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 flex items-center gap-2 z-20"
      >
        <span className="text-lg">🏆</span>
        <span className="text-sm text-gray-300">
          {unlocked}/{total}
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                <span>🏆</span> Achievements
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="text-sm text-gray-400 mb-4">
              {unlocked} of {total} unlocked
            </div>

            <div className="grid gap-2">
              {sortedAchievements.map((ach) => (
                <Achievements.Item
                  key={ach.id}
                  achievement={ach}
                  isUnlocked={unlockedAchievements.includes(ach.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export namespace Achievements {
  export type ItemProps = {
    achievement: Achievement;
    isUnlocked: boolean;
  };

  export function Item({ achievement, isUnlocked }: ItemProps) {
    return (
      <div
        className={`
          p-3 rounded-lg border flex items-center gap-3
          ${
            isUnlocked
              ? "bg-yellow-900/30 border-yellow-700"
              : "bg-gray-800/30 border-gray-800 opacity-50"
          }
        `}
      >
        <div
          className={`
            text-2xl w-10 h-10 flex items-center justify-center rounded-full
            ${isUnlocked ? "bg-yellow-800" : "bg-gray-800 grayscale"}
          `}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div
            className={`font-semibold ${isUnlocked ? "text-yellow-200" : "text-gray-500"}`}
          >
            {achievement.name}
          </div>
          <div className={`text-sm ${isUnlocked ? "text-gray-400" : "text-gray-600"}`}>
            {achievement.description}
          </div>
        </div>
        {isUnlocked && <div className="text-green-400 text-xl">✓</div>}
      </div>
    );
  }
}

