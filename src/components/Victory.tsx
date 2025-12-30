import { useGameStore, GameStore } from "~/store/gameStore";

export function Victory() {
  const isVictory = useGameStore((s) => s.isVictory);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const viralViews = useGameStore((s) => s.viralViews);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const prestige = useGameStore((s) => s.prestige);

  if (!isVictory) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full bg-gradient-to-br from-yellow-900 to-yellow-950 rounded-2xl border-2 border-yellow-500 shadow-2xl overflow-hidden">
        {/* Header with confetti */}
        <div className="relative bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-6 text-center overflow-hidden">
          {/* Animated confetti */}
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              {["🎉", "💰", "🏆", "💵", "⭐"][Math.floor(Math.random() * 5)]}
            </span>
          ))}

          <div className="relative z-10">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-bold text-white">
              YOU DID IT!
            </h2>
            <p className="text-yellow-200 mt-2">
              You stole the full $9 BILLION!
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">
              You've matched the estimated fraud total across all 14 Minnesota programs
            </p>
            <p className="text-sm text-yellow-400/80 italic">
              "Half of $18 billion in federal funds may have been defrauded, official says"
            </p>
          </div>

          {/* Final stats */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Total Stolen:</span>
              <span className="font-mono text-yellow-400">
                {GameStore.formatMoney(totalEarned)}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Fake Claims Filed:</span>
              <span className="font-mono">{fakeClaims.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Final Viral Views:</span>
              <span className="font-mono text-red-400">
                {GameStore.formatViews(viralViews)}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Zones Unlocked:</span>
              <span className="font-mono">{unlockedZones.length}/4</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Total Arrests:</span>
              <span className="font-mono">{totalArrestCount}</span>
            </div>
          </div>

          {/* Achievement unlocked */}
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 mb-6 text-center">
            <div className="text-sm text-yellow-400">🏆 Achievement Unlocked</div>
            <div className="font-bold text-yellow-200">The $9 Billion Club</div>
          </div>

          {/* Restart button */}
          <button
            onClick={prestige}
            className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-yellow-950 transition-all hover:scale-105"
          >
            Start New Empire (+10% bonus)
          </button>

          {totalArrestCount > 0 && (
            <div className="mt-4 text-center text-xs text-gray-500">
              Current prestige bonus: +{totalArrestCount * 10}% income
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

