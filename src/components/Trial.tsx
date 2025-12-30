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
  const prestigeWithSeizure = useGameStore((s) => s.prestigeWithSeizure);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const unlockTrialAchievement = useGameStore((s) => s.unlockTrialAchievement);

  const [phase, setPhase] = useState<Trial.Phase>("arrest");
  const [sentence, setSentence] = useState(0);
  const [lawyerCost, setLawyerCost] = useState(0);
  const [outcome, setOutcome] = useState<Trial.Outcome | null>(null);
  const [evidenceStrength, setEvidenceStrength] = useState(0);

  useEffect(() => {
    if (isGameOver && !isVictory) {
      setPhase("arrest");
      setOutcome(null);
      playSound("gameOver");

      // Calculate evidence strength
      const state = useGameStore.getState();
      const evidence = GameStore.getEvidenceStrength(state);
      setEvidenceStrength(evidence);
      
      // Calculate sentence based on earnings and evidence (~$1.5M per year)
      const calculatedSentence = GameStore.calculateSentence(totalEarned, evidence);
      setSentence(calculatedSentence);
      
      // Lawyer cost: 20% of money, min $100K, max $50M
      setLawyerCost(GameStore.getLawyerCost(money));
      
      // Unlock "First Arrest" achievement
      unlockTrialAchievement("arrested");
      
      // Unlock "28 Years" achievement if max sentence
      if (calculatedSentence >= 28) {
        unlockTrialAchievement("maxSentence");
      }
    }
  }, [isGameOver, isVictory, totalEarned, money, unlockTrialAchievement]);

  // Trial shows whenever player is caught (100M views), even after victory
  if (!isGameOver) return null;

  // Get trial bonus from upgrades
  const state = useGameStore.getState();
  const trialBonus = GameStore.getTrialAcquittalBonus(state);
  
  // Federal-realistic odds based on evidence strength
  const expensiveLawyerAcquitChance = GameStore.getExpensiveLawyerAcquittalChance(evidenceStrength, trialBonus);
  const publicDefenderAcquitChance = GameStore.getPublicDefenderAcquittalChance(evidenceStrength, trialBonus);
  const expensiveLawyerReduction = GameStore.getExpensiveLawyerReduction(evidenceStrength);
  const publicDefenderReduction = GameStore.getPublicDefenderReduction(evidenceStrength);
  
  // Calculate projected seizure amounts for UI
  const seizureRate = GameStore.getSeizureRate(sentence);
  const projectedSeizure = Math.floor(money * seizureRate);
  const projectedKeep = money - projectedSeizure;

  const handleHireLawyer = () => {
    const roll = Math.random();
    let newOutcome: Trial.Outcome;
    
    // Expensive lawyer: 5-12% acquittal, then check for reduction
    if (roll < expensiveLawyerAcquitChance) {
      newOutcome = "acquitted";
      unlockTrialAchievement("acquitted");
      playSound("verdictGood");
    } else if (roll < expensiveLawyerAcquitChance + 0.40) {
      // 40% chance of reduced sentence
      const reduction = expensiveLawyerReduction;
      setSentence((s) => Math.max(1, Math.floor(s * (1 - reduction))));
      newOutcome = "reduced";
      playSound("verdictGood");
    } else {
      newOutcome = "convicted";
      playSound("verdictBad");
    }
    setOutcome(newOutcome);
    setPhase("verdict");
  };

  const handlePublicDefender = () => {
    const roll = Math.random();
    let newOutcome: Trial.Outcome;
    
    // Public defender: 2-5% acquittal, then check for reduction
    if (roll < publicDefenderAcquitChance) {
      newOutcome = "acquitted";
      unlockTrialAchievement("acquitted");
      playSound("verdictGood");
    } else if (roll < publicDefenderAcquitChance + 0.20) {
      // 20% chance of reduced sentence
      const reduction = publicDefenderReduction;
      setSentence((s) => Math.max(1, Math.floor(s * (1 - reduction))));
      newOutcome = "reduced";
      playSound("verdictGood");
    } else {
      newOutcome = "convicted";
      playSound("verdictBad");
    }
    setOutcome(newOutcome);
    setPhase("verdict");
  };

  const handleAcceptSentence = () => {
    prestigeWithSeizure(sentence, outcome === "acquitted");
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

              {/* Evidence Strength Meter */}
              <div 
                className="rounded-lg p-3 mb-4"
                style={{
                  background: evidenceStrength >= 0.6 
                    ? "rgba(139, 47, 53, 0.2)" 
                    : evidenceStrength >= 0.3 
                      ? "rgba(234, 179, 8, 0.15)" 
                      : "rgba(74, 222, 128, 0.1)",
                  border: `1px solid ${evidenceStrength >= 0.6 
                    ? "var(--color-danger)" 
                    : evidenceStrength >= 0.3 
                      ? "var(--color-viral)" 
                      : "#4ade80"}`,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className="text-sm font-bold"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    CASE STRENGTH
                  </span>
                  <span 
                    className="text-sm font-bold"
                    style={{ 
                      fontFamily: "var(--font-mono)",
                      color: evidenceStrength >= 0.6 
                        ? "var(--color-danger-bright)" 
                        : evidenceStrength >= 0.3 
                          ? "var(--color-viral)" 
                          : "#4ade80"
                    }}
                  >
                    {GameStore.getEvidenceLabel(evidenceStrength)}
                  </span>
                </div>
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${evidenceStrength * 100}%`,
                      background: evidenceStrength >= 0.6 
                        ? "linear-gradient(90deg, var(--color-danger), var(--color-danger-bright))" 
                        : evidenceStrength >= 0.3 
                          ? "linear-gradient(90deg, #eab308, var(--color-viral))" 
                          : "linear-gradient(90deg, #22c55e, #4ade80)"
                    }}
                  />
                </div>
                <div 
                  className="text-xs mt-1 text-center"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  {GameStore.formatViews(viralViews)} viral views + {fakeClaims.toLocaleString()} fake claims
                </div>
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
                  <span style={{ color: "var(--color-text-muted)" }}>Current Assets:</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}>
                    {GameStore.formatMoney(money)}
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
                <div 
                  className="flex justify-between text-sm"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  <span>Projected Asset Seizure:</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-danger)" }}>
                    {GameStore.formatMoney(projectedSeizure)} ({Math.round(seizureRate * 100)}%)
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound("trialGavel");
                  setPhase("trial");
                }}
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
              <div className="text-center mb-4">
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
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Federal conviction rate: ~93% (Abdiaziz Farah got 28 years)
                </p>
              </div>

              {/* What you'll keep info */}
              <div 
                className="rounded-lg p-3 mb-4 text-center"
                style={{
                  background: "rgba(74, 222, 128, 0.1)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                }}
              >
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  IF CONVICTED ({sentence} yrs) → Keep {GameStore.formatMoney(projectedKeep)} ({Math.round((1 - seizureRate) * 100)}%)
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{ color: "#4ade80" }}
                >
                  Your zones & upgrades are preserved (connections persist)
                </div>
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
                        className="text-xs space-y-0.5"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <div>
                          <span style={{ color: "#4ade80" }}>{Math.round(expensiveLawyerAcquitChance * 100)}%</span> acquittal
                          {trialBonus > 0 && <span style={{ color: "var(--color-money)" }}> (+{Math.round(trialBonus * 100)}%)</span>}
                          {" · "}
                          <span style={{ color: "var(--color-corruption)" }}>40%</span> reduce by {Math.round(expensiveLawyerReduction * 100)}%
                        </div>
                        <div style={{ color: "var(--color-text-dim)" }}>
                          Reduced → ~{Math.floor(sentence * (1 - expensiveLawyerReduction))} yrs, keep {GameStore.formatMoney(Math.floor(money * (1 - GameStore.getSeizureRate(Math.floor(sentence * (1 - expensiveLawyerReduction))))))}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="font-bold text-right"
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
                        className="text-xs space-y-0.5"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <div>
                          <span style={{ color: "#4ade80" }}>{Math.round(publicDefenderAcquitChance * 100)}%</span> acquittal
                          {trialBonus > 0 && <span style={{ color: "var(--color-money)" }}> (+{Math.round(trialBonus * 0.5 * 100)}%)</span>}
                          {" · "}
                          <span style={{ color: "var(--color-corruption)" }}>20%</span> reduce by {Math.round(publicDefenderReduction * 100)}%
                        </div>
                        <div style={{ color: "var(--color-text-dim)" }}>
                          Reduced → ~{Math.floor(sentence * (1 - publicDefenderReduction))} yrs, keep {GameStore.formatMoney(Math.floor(money * (1 - GameStore.getSeizureRate(Math.floor(sentence * (1 - publicDefenderReduction))))))}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="text-sm font-bold"
                      style={{ color: "#4ade80" }}
                    >
                      FREE
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}

          {phase === "verdict" && (() => {
            const finalSeizureRate = outcome === "acquitted" ? 0 : GameStore.getSeizureRate(sentence);
            const finalSeizure = Math.floor(money * finalSeizureRate);
            const finalKeep = money - finalSeizure;
            
            return (
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
                        className="text-lg mt-2 font-bold"
                        style={{ color: "var(--color-money)" }}
                      >
                        You keep everything: {GameStore.formatMoney(money)}
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

                {/* Asset seizure breakdown */}
                {outcome !== "acquitted" && (
                  <div 
                    className="rounded-lg p-4 mb-4 space-y-2"
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border-card)",
                    }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--color-text-muted)" }}>Assets Seized:</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-danger)" }}>
                        -{GameStore.formatMoney(finalSeizure)} ({Math.round(finalSeizureRate * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>You Keep:</span>
                      <span 
                        className="font-bold"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}
                      >
                        {GameStore.formatMoney(finalKeep)}
                      </span>
                    </div>
                    <div 
                      className="text-xs pt-2 border-t text-center"
                      style={{ borderColor: "var(--color-border-card)", color: "#4ade80" }}
                    >
                      ✓ All zones & upgrades preserved
                    </div>
                  </div>
                )}

                <div 
                  className="rounded-lg p-4 mb-6 text-center"
                  style={{
                    background: "var(--color-corruption)15",
                    border: "1px solid var(--color-corruption-dim)",
                  }}
                >
                  <div style={{ color: "var(--color-text-muted)" }}>
                    Arrest #{totalArrestCount + 1} gives you{" "}
                    <span style={{ color: "var(--color-corruption)" }}>permanent bonuses</span>
                  </div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    +{GameStore.getNextPrestigeBonusPercent(totalArrestCount)}% income, +5% view decay on all future runs
                  </div>
                </div>

                <button
                  onClick={handleAcceptSentence}
                  className="w-full py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: outcome === "acquitted" 
                      ? "linear-gradient(135deg, #22c55e, #4ade80)"
                      : "linear-gradient(135deg, var(--color-danger-bright), var(--color-viral))",
                    color: "white",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {outcome === "acquitted"
                    ? "WALK FREE & CONTINUE"
                    : `SERVE ${sentence} YEARS & CONTINUE`}
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export namespace Trial {
  export type Phase = "arrest" | "trial" | "verdict";
  export type Outcome = "acquitted" | "reduced" | "convicted";
}
