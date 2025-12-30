import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "~/store/gameStore";
import { playSound } from "~/hooks/useAudio";

export function Shredder() {
  const shredderMinigame = useGameStore((s) => s.shredderMinigame);
  const clickShredder = useGameStore((s) => s.clickShredder);
  const [timeLeft, setTimeLeft] = useState(3);
  const [isShaking, setIsShaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [lastClickId, setLastClickId] = useState<number | null>(null);

  // Track success/failure transitions
  useEffect(() => {
    if (shredderMinigame && lastClickId !== shredderMinigame.id) {
      setLastClickId(shredderMinigame.id);
      setShowSuccess(false);
      setShowFailure(false);
    } else if (!shredderMinigame && lastClickId !== null) {
      // Shredder was dismissed - check if it was success or failure
      // Success is handled in the component when clicks are met
      // Failure is when it expires (time runs out)
      setLastClickId(null);
    }
  }, [shredderMinigame, lastClickId]);

  // Timer countdown
  useEffect(() => {
    if (!shredderMinigame) return;

    const updateTimer = () => {
      const remaining = Math.max(0, shredderMinigame.expiresAt - Date.now());
      setTimeLeft(remaining / 1000);
      
      // Check for failure
      if (remaining <= 0) {
        setShowFailure(true);
        playSound("gameOver");
        setTimeout(() => setShowFailure(false), 1500);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);
    return () => clearInterval(interval);
  }, [shredderMinigame]);

  const handleClick = useCallback(() => {
    if (!shredderMinigame) return;
    
    playSound("click");
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 100);
    
    // Check if this click will complete the minigame
    if (shredderMinigame.clicks + 1 >= shredderMinigame.requiredClicks) {
      setShowSuccess(true);
      playSound("zoneUnlock");
      setTimeout(() => setShowSuccess(false), 1500);
    }
    
    clickShredder();
  }, [clickShredder, shredderMinigame]);

  // Show success message
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className="bg-green-900/90 border-2 border-green-400 rounded-xl p-6 animate-vault-unlock"
          style={{ boxShadow: "0 0 40px rgba(74, 222, 128, 0.6)" }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div 
              className="text-xl font-bold text-green-400"
              style={{ fontFamily: "var(--font-display)" }}
            >
              EVIDENCE SHREDDED!
            </div>
            <div 
              className="text-green-300 text-sm mt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              -500K Views
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show failure message
  if (showFailure) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className="bg-red-900/90 border-2 border-red-400 rounded-xl p-6 animate-shake"
          style={{ boxShadow: "0 0 40px rgba(239, 68, 68, 0.6)" }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <div 
              className="text-xl font-bold text-red-400"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FBI SEIZED DOCUMENTS!
            </div>
            <div 
              className="text-red-300 text-sm mt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              +500K Views
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shredderMinigame) return null;

  const progress = shredderMinigame.clicks / shredderMinigame.requiredClicks;
  const isUrgent = timeLeft < 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Pulsing border effect when urgent */}
      {isUrgent && (
        <div 
          className="absolute inset-0 pointer-events-none animate-strobe-pulse"
          style={{
            border: "8px solid var(--color-danger-bright)",
            opacity: 0.3,
          }}
        />
      )}

      <div 
        className={`relative p-6 rounded-xl max-w-sm w-full mx-4 ${isShaking ? "animate-shake" : ""}`}
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "2px solid var(--color-danger-bright)",
          boxShadow: `0 0 ${isUrgent ? 60 : 30}px rgba(139, 47, 53, ${isUrgent ? 0.8 : 0.5})`,
        }}
      >
        {/* Alert header */}
        <div className="text-center mb-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full animate-warning-flash"
            style={{
              background: "var(--color-danger)",
              color: "white",
            }}
          >
            <span className="text-lg">🚨</span>
            <span 
              className="text-xs uppercase tracking-wider font-bold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              FBI REVIEWING DOCUMENTS
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          <div 
            className={`text-4xl font-bold ${isUrgent ? "text-red-500 animate-timer-urgent" : "text-yellow-400"}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {timeLeft.toFixed(1)}s
          </div>
        </div>

        {/* Click counter */}
        <div className="text-center mb-4">
          <div 
            className="text-sm mb-1"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            {shredderMinigame.clicks} / {shredderMinigame.requiredClicks} documents shredded
          </div>
          
          {/* Progress bar */}
          <div 
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <div 
              className="h-full transition-all duration-100"
              style={{
                width: `${progress * 100}%`,
                background: progress < 0.5 
                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                  : progress < 0.8 
                    ? "linear-gradient(90deg, #f97316, #facc15)"
                    : "linear-gradient(90deg, #22c55e, #4ade80)",
              }}
            />
          </div>
        </div>

        {/* Big shred button */}
        <button
          onClick={handleClick}
          className="w-full py-4 rounded-lg transition-all active:scale-95 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #dc2626, #991b1b)",
            border: "3px solid #ef4444",
            color: "white",
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            letterSpacing: "0.1em",
            boxShadow: "0 4px 20px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          🗑️ CLICK TO SHRED! 🗑️
        </button>

        {/* Stakes info */}
        <div 
          className="mt-4 flex justify-center gap-4 text-xs"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <div className="text-green-400">
            ✓ Success: -500K views
          </div>
          <div className="text-red-400">
            ✗ Fail: +500K views
          </div>
        </div>
      </div>
    </div>
  );
}

