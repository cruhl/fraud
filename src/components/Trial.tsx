import { useState, useEffect } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { playSound } from "~/hooks/useAudio";
import { getScreenImageUrl, getCharacterImageUrl } from "~/lib/assets";

const TRIAL_ARREST_IMAGE = getScreenImageUrl("trial-arrest");
const LAWYER_IMAGE = getCharacterImageUrl("expensive-lawyer");
const PUBLIC_DEFENDER_IMAGE = getCharacterImageUrl("public-defender");

export function Trial() {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const viralViews = useGameStore((s) => s.viralViews);
  const money = useGameStore((s) => s.money);
  const prestige = useGameStore((s) => s.prestige);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const unlockTrialAchievement = useGameStore((s) => s.unlockTrialAchievement);

  const [phase, setPhase] = useState<Trial.Phase>("arrest");
  const [sentence, setSentence] = useState(0);
  const [lawyerCost, setLawyerCost] = useState(0);
  const [outcome, setOutcome] = useState<Trial.Outcome | null>(null);

  useEffect(() => {
    if (isGameOver && !isVictory) {
      setPhase("arrest");
      setSentence(0);
      setOutcome(null);
      playSound("gameOver");

      const baseYears = Math.min(28, Math.floor(totalEarned / 500_000));
      setSentence(Math.max(1, baseYears));
      setLawyerCost(Math.floor(money * 0.3));
      
      // Unlock "First Arrest" achievement
      unlockTrialAchievement("arrested");
      
      // Unlock "28 Years" achievement if max sentence
      if (baseYears >= 28) {
        unlockTrialAchievement("maxSentence");
      }
    }
  }, [isGameOver, isVictory, totalEarned, money, unlockTrialAchievement]);

  if (!isGameOver || isVictory) return null;

  const handleHireLawyer = () => {
    const roll = Math.random();
    if (roll < 0.15) {
      setOutcome("acquitted");
      unlockTrialAchievement("acquitted");
    } else if (roll < 0.5) {
      setSentence((s) => Math.max(1, s - Math.floor(s * 0.5)));
      setOutcome("reduced");
    } else {
      setOutcome("convicted");
    }
    setPhase("verdict");
  };

  const handlePublicDefender = () => {
    const roll = Math.random();
    if (roll < 0.05) {
      setOutcome("acquitted");
      unlockTrialAchievement("acquitted");
    } else if (roll < 0.2) {
      setSentence((s) => Math.max(1, s - Math.floor(s * 0.25)));
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.95)" }}
    >
      <div 
        className="max-w-lg w-full overflow-hidden rounded-xl animate-slide-in-up"
        style={{
          background: "linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-primary))",
          border: "3px solid var(--color-danger)",
          boxShadow: "0 0 60px rgba(139, 47, 53, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Court header with AI-generated background */}
        <div 
          className="px-6 py-5 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-danger), #5C1F24)",
          }}
        >
          {/* AI-generated arrest/trial background */}
          <div className="absolute inset-0 ai-image-screen">
            <img 
              src={TRIAL_ARREST_IMAGE}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.35 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          <div className="relative z-10">
            <div className="text-5xl mb-2">⚖️</div>
            <h2 
              className="text-2xl tracking-widest"
              style={{ fontFamily: "var(--font-display)", color: "white" }}
            >
              {phase === "arrest" && "FEDERAL INDICTMENT"}
              {phase === "trial" && "U.S. DISTRICT COURT"}
              {phase === "verdict" && "THE VERDICT"}
            </h2>
            <div 
              className="text-sm mt-1 opacity-80"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              District of Minnesota
            </div>
          </div>
        </div>

        <div className="p-6">
          {phase === "arrest" && (
            <>
              <div className="text-center mb-6">
                <p style={{ color: "var(--color-text-secondary)" }}>
                  Nick Shirley's investigation went viral with{" "}
                  <span 
                    className="font-bold"
                    style={{ color: "var(--color-danger-bright)" }}
                  >
                    {GameStore.formatViews(viralViews)} views
                  </span>
                </p>
                <p 
                  className="text-sm italic mt-2"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  "FBI executes search warrant after YouTuber's exposé"
                </p>
              </div>

              <div 
                className="rounded-lg p-4 mb-6 space-y-3"
                style={{
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border-card)",
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-muted)" }}>Total Stolen:</span>
                  <span 
                    className="font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}
                  >
                    {GameStore.formatMoney(totalEarned)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-muted)" }}>Fake Claims Filed:</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                    {fakeClaims.toLocaleString()}
                  </span>
                </div>
                <div 
                  className="flex justify-between pt-2 border-t"
                  style={{ borderColor: "var(--color-border-card)" }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>Facing:</span>
                  <span 
                    className="font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-danger-bright)" }}
                  >
                    {sentence} years federal prison
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPhase("trial")}
                className="w-full py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, var(--color-danger-bright), var(--color-danger))",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.1em",
                }}
              >
                FACE TRIAL →
              </button>
            </>
          )}

          {phase === "trial" && (
            <>
              <div className="text-center mb-6">
                <p style={{ color: "var(--color-text-secondary)" }}>
                  You're facing up to{" "}
                  <span 
                    className="font-bold"
                    style={{ color: "var(--color-danger-bright)" }}
                  >
                    {sentence} years
                  </span>{" "}
                  in federal prison
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  (The real maximum is 28 years - like Abdiaziz Farah got)
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleHireLawyer}
                  disabled={money < lawyerCost}
                  className="w-full p-4 rounded-lg text-left transition-all"
                  style={{
                    background: money >= lawyerCost ? "var(--color-bg-elevated)" : "var(--color-bg-primary)",
                    border: `1px solid ${money >= lawyerCost ? "var(--color-corruption-dim)" : "var(--color-border-card)"}`,
                    opacity: money >= lawyerCost ? 1 : 0.5,
                    cursor: money >= lawyerCost ? "pointer" : "not-allowed",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Lawyer portrait */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[var(--color-corruption-dim)] ai-image-character">
                      <img 
                        src={LAWYER_IMAGE}
                        alt="Expensive Lawyer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">💼</span>';
                          e.currentTarget.parentElement!.classList.add("flex", "items-center", "justify-center");
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Hire Expensive Lawyer
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        35% chance to reduce sentence, 15% acquittal
                      </div>
                    </div>
                    <div 
                      className="font-bold"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}
                    >
                      {GameStore.formatMoney(lawyerCost)}
                    </div>
                  </div>
                </button>

                <button
                  onClick={handlePublicDefender}
                  className="w-full p-4 rounded-lg text-left transition-all hover:bg-white/5"
                  style={{
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border-highlight)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Public defender portrait */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[var(--color-border-card)] ai-image-character">
                      <img 
                        src={PUBLIC_DEFENDER_IMAGE}
                        alt="Public Defender"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">📋</span>';
                          e.currentTarget.parentElement!.classList.add("flex", "items-center", "justify-center");
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Public Defender
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        15% chance to reduce, 5% acquittal
                      </div>
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: "var(--color-text-dim)" }}
                    >
                      FREE
                    </div>
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
                    <h3 
                      className="text-3xl mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "#4ade80" }}
                    >
                      NOT GUILTY!
                    </h3>
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      The jury believed the state inspectors who "found children present"
                    </p>
                    <p 
                      className="text-sm mt-2"
                      style={{ color: "var(--color-money)" }}
                    >
                      You keep 10% of your money!
                    </p>
                  </>
                ) : outcome === "reduced" ? (
                  <>
                    <div className="text-6xl mb-4">⚖️</div>
                    <h3 
                      className="text-2xl mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-corruption)" }}
                    >
                      GUILTY - REDUCED SENTENCE
                    </h3>
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Your lawyer cut a deal with prosecutors
                    </p>
                    <p 
                      className="text-xl mt-2"
                      style={{ color: "var(--color-viral)" }}
                    >
                      {sentence} years in federal prison
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">⛓️</div>
                    <h3 
                      className="text-3xl mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-danger-bright)" }}
                    >
                      GUILTY
                    </h3>
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Nick Shirley's video was played in court 47 times
                    </p>
                    <p 
                      className="text-xl mt-2"
                      style={{ color: "var(--color-danger-bright)" }}
                    >
                      {sentence} years in federal prison
                    </p>
                  </>
                )}
              </div>

              <div 
                className="rounded-lg p-4 mb-6 text-center"
                style={{
                  background: "var(--color-corruption)15",
                  border: "1px solid var(--color-corruption-dim)",
                }}
              >
                <div style={{ color: "var(--color-text-muted)" }}>
                  Each arrest gives you{" "}
                  <span style={{ color: "var(--color-corruption)" }}>income & view decay bonuses</span>{" "}
                  on your next run
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Next arrest bonus: +{GameStore.getNextPrestigeBonusPercent(totalArrestCount)}% income, +5% view decay
                </div>
              </div>

              <button
                onClick={handleAcceptSentence}
                className="w-full py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, var(--color-danger-bright), var(--color-viral))",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.1em",
                }}
              >
                {outcome === "acquitted"
                  ? "WALK FREE & START NEW EMPIRE"
                  : `SERVE ${sentence} YEARS & RESTART`}
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
