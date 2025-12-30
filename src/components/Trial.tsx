import { useState, useEffect } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";

export function Trial() {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const viralViews = useGameStore((s) => s.viralViews);
  const money = useGameStore((s) => s.money);
  const prestige = useGameStore((s) => s.prestige);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);

  const [phase, setPhase] = useState<Trial.Phase>("arrest");
  const [sentence, setSentence] = useState(0);
  const [lawyerCost, setLawyerCost] = useState(0);
  const [outcome, setOutcome] = useState<Trial.Outcome | null>(null);

  useEffect(() => {
    if (isGameOver && !isVictory) {
      setPhase("arrest");
      setSentence(0);
      setOutcome(null);

      // Calculate base sentence based on how much was stolen
      const baseYears = Math.min(28, Math.floor(totalEarned / 1_000_000));
      setSentence(baseYears);

      // Lawyer cost scales with money
      setLawyerCost(Math.floor(money * 0.5));
    }
  }, [isGameOver, isVictory, totalEarned, money]);

  if (!isGameOver || isVictory) return null;

  const handleHireLawyer = () => {
    // 30% chance to reduce sentence, 10% chance for acquittal
    const roll = Math.random();
    if (roll < 0.1) {
      setOutcome("acquitted");
    } else if (roll < 0.4) {
      setSentence((s) => Math.max(1, s - Math.floor(s * 0.5)));
      setOutcome("reduced");
    } else {
      setOutcome("convicted");
    }
    setPhase("verdict");
  };

  const handlePublicDefender = () => {
    // 5% chance for acquittal, mostly full sentence
    const roll = Math.random();
    if (roll < 0.05) {
      setOutcome("acquitted");
    } else if (roll < 0.15) {
      setSentence((s) => Math.max(1, s - 2));
      setOutcome("reduced");
    } else {
      setOutcome("convicted");
    }
    setPhase("verdict");
  };

  const handleAcceptSentence = () => {
    prestige();
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border-2 border-red-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-900 px-6 py-4 text-center">
          <div className="text-4xl mb-2">⚖️</div>
          <h2 className="text-2xl font-bold text-white">
            {phase === "arrest" && "YOU'VE BEEN ARRESTED"}
            {phase === "trial" && "TRIAL IN PROGRESS"}
            {phase === "verdict" && "THE VERDICT"}
          </h2>
        </div>

        <div className="p-6">
          {phase === "arrest" && (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-300 mb-4">
                  Nick Shirley's video about your operation went viral with{" "}
                  <span className="text-red-400 font-bold">
                    {GameStore.formatViews(viralViews)} views
                  </span>
                </p>
                <p className="text-gray-400 text-sm italic">
                  "FBI executes search warrant after YouTuber's exposé"
                </p>
              </div>

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
                  <span>Facing:</span>
                  <span className="font-mono text-red-400">{sentence} years</span>
                </div>
              </div>

              <button
                onClick={() => setPhase("trial")}
                className="w-full py-3 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white transition-all"
              >
                Face Trial →
              </button>
            </>
          )}

          {phase === "trial" && (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-300 mb-2">
                  You're facing up to <span className="text-red-400 font-bold">{sentence} years</span> in federal prison
                </p>
                <p className="text-gray-500 text-sm">
                  (The real maximum is 28 years - like Abdiaziz Farah got)
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleHireLawyer}
                  disabled={money < lawyerCost}
                  className={`
                    w-full p-4 rounded-lg text-left transition-all border
                    ${
                      money >= lawyerCost
                        ? "bg-gray-800 border-yellow-600 hover:bg-gray-700"
                        : "bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">💼 Hire Expensive Lawyer</div>
                      <div className="text-sm text-gray-400">
                        30% chance to reduce sentence, 10% acquittal
                      </div>
                    </div>
                    <div className="text-yellow-400 font-mono">
                      {GameStore.formatMoney(lawyerCost)}
                    </div>
                  </div>
                </button>

                <button
                  onClick={handlePublicDefender}
                  className="w-full p-4 rounded-lg text-left transition-all border bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <div className="font-bold text-white">📋 Public Defender</div>
                  <div className="text-sm text-gray-400">
                    5% chance for acquittal, mostly full sentence
                  </div>
                </button>
              </div>
            </>
          )}

          {phase === "verdict" && (
            <>
              <div className="text-center mb-6">
                {outcome === "acquitted" ? (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">
                      NOT GUILTY!
                    </h3>
                    <p className="text-gray-300">
                      The jury believed the state inspectors who "found children present"
                    </p>
                    <p className="text-sm text-yellow-400 mt-2">
                      You keep 10% of your money!
                    </p>
                  </>
                ) : outcome === "reduced" ? (
                  <>
                    <div className="text-6xl mb-4">⚖️</div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                      GUILTY - Reduced Sentence
                    </h3>
                    <p className="text-gray-300">
                      Your lawyer cut a deal with prosecutors
                    </p>
                    <p className="text-xl text-orange-400 mt-2">
                      {sentence} years in federal prison
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">⛓️</div>
                    <h3 className="text-2xl font-bold text-red-400 mb-2">
                      GUILTY
                    </h3>
                    <p className="text-gray-300">
                      Nick Shirley's video was played in court 47 times
                    </p>
                    <p className="text-xl text-red-400 mt-2">
                      {sentence} years in federal prison
                    </p>
                  </>
                )}
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="text-center text-gray-400 text-sm">
                  Each arrest gives you <span className="text-yellow-400">+10% income</span> on your next run
                </div>
                <div className="text-center text-gray-500 text-xs mt-1">
                  Current total: {totalArrestCount + 1} arrests = +{(totalArrestCount + 1) * 10}% bonus
                </div>
              </div>

              <button
                onClick={handleAcceptSentence}
                className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white transition-all"
              >
                {outcome === "acquitted"
                  ? "Walk Free & Start New Empire"
                  : `Serve ${sentence} Years & Restart`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export namespace Trial {
  export type Phase = "arrest" | "trial" | "verdict";
  export type Outcome = "acquitted" | "reduced" | "convicted";
}

