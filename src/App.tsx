import { useEffect, useState } from "react";
import { useGameStore } from "~/store/gameStore";
import { Clicker } from "~/components/Clicker";
import { Counter } from "~/components/Counter";
import { Upgrades } from "~/components/Upgrades";
import { ViralMeter } from "~/components/ViralMeter";
import { ZoneSelector } from "~/components/ZoneSelector";
import { MinneapolisMap } from "~/components/MinneapolisMap";
import { EventBanner } from "~/components/EventBanner";
import { Trial } from "~/components/Trial";
import { Victory } from "~/components/Victory";
import { NewsTicker } from "~/components/NewsTicker";
import { Achievements } from "~/components/Achievements";

export function App() {
  const tick = useGameStore((s) => s.tick);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const [showMap, setShowMap] = useState(false);

  // Game loop
  useEffect(() => {
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [tick]);

  const hasEvent = !!activeEvent;

  return (
    <div className="min-h-screen pb-16 text-white">
      {/* Event banner */}
      <EventBanner />

      {/* Header */}
      <header
        className={`text-center py-6 border-b border-gray-800 bg-black/30 ${hasEvent ? "mt-16" : ""}`}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          🏚️ Minnesota Fraud Empire
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          $9 Billion. 14 Programs. One YouTuber. Can you steal it all before he finds you?
        </p>
        {totalArrestCount > 0 && (
          <p className="text-yellow-500 text-xs mt-1">
            ⭐ Prestige Bonus: +{totalArrestCount * 10}% income
          </p>
        )}
      </header>

      {/* Main game area */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 max-w-6xl mx-auto">
          {/* Left: Main game */}
          <div className="space-y-6">
            {/* Viral meter (Nick Shirley) */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <ViralMeter />
            </div>

            {/* Zone selector or Map */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Minneapolis Fraud Zones
                </h3>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs text-gray-500 hover:text-gray-300 underline"
                >
                  {showMap ? "List View" : "Map View"}
                </button>
              </div>
              {showMap ? <MinneapolisMap /> : <ZoneSelector />}
            </div>

            {/* Counter */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <Counter />
            </div>

            {/* Clicker */}
            <div className="flex justify-center py-4">
              <Clicker />
            </div>
          </div>

          {/* Right: Upgrades */}
          <aside className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 h-fit lg:sticky lg:top-4">
            <Upgrades />
          </aside>
        </div>
      </main>

      {/* Achievements button */}
      <Achievements />

      {/* News ticker */}
      <NewsTicker />

      {/* Trial/Game over modal */}
      <Trial />
      
      {/* Victory screen */}
      <Victory />
    </div>
  );
}

export default App;
