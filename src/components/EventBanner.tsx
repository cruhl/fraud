import { useGameStore } from "~/store/gameStore";
import { useState, useEffect, useMemo, useRef } from "react";
import type { PoliticalEvent } from "~/data/events";
import { playSound } from "~/hooks/useAudio";

function getEventMultipliers(event: PoliticalEvent) {
  let incomeMultiplier = 1;
  let viewsMultiplier = 1;

  switch (event.effect.type) {
    case "incomeMultiplier":
      incomeMultiplier = event.effect.amount;
      break;
    case "viewMultiplier":
      viewsMultiplier = event.effect.amount;
      break;
    // viewGain and pauseFraud don't have multipliers
  }

  return { incomeMultiplier, viewsMultiplier };
}

export function EventBanner() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const eventEndTime = useGameStore((s) => s.eventEndTime);
  const [timeLeft, setTimeLeft] = useState(0);
  const prevEventIdRef = useRef<string | null>(null);

  // Play sound when a new event appears
  useEffect(() => {
    if (activeEvent && activeEvent.id !== prevEventIdRef.current) {
      playSound("event");
    }
    prevEventIdRef.current = activeEvent?.id ?? null;
  }, [activeEvent]);

  useEffect(() => {
    if (!eventEndTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, eventEndTime - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [eventEndTime]);

  const multipliers = useMemo(
    () => (activeEvent ? getEventMultipliers(activeEvent) : { incomeMultiplier: 1, viewsMultiplier: 1 }),
    [activeEvent]
  );

  if (!activeEvent) return null;

  const { incomeMultiplier, viewsMultiplier } = multipliers;
  const isGood = incomeMultiplier > 1 || viewsMultiplier < 1;
  const isUrgent = timeLeft <= 5;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-40 overflow-hidden
        ${isUrgent ? "animate-warning-flash" : ""}
      `}
      style={{
        background: isGood
          ? "linear-gradient(135deg, #1a5c2a, #0d3d18)"
          : "linear-gradient(135deg, var(--color-danger), #5C1F24)",
        borderBottom: `3px solid ${isGood ? "#4ade80" : "var(--color-danger-bright)"}`,
        boxShadow: isGood 
          ? "0 4px 30px rgba(74, 222, 128, 0.3)"
          : "0 4px 30px rgba(139, 47, 53, 0.4)",
      }}
    >
      {/* Hazard stripes for bad events */}
      {!isGood && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)",
          }}
        />
      )}

      <div className="relative flex items-center justify-between px-4 py-2.5">
        {/* Left: Alert indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Flashing indicator */}
          <div 
            className={`relative w-3 h-3 rounded-full ${isUrgent ? "animate-ping" : "animate-warning-flash"}`}
            style={{
              background: isGood ? "#4ade80" : "var(--color-danger-bright)",
              boxShadow: `0 0 10px ${isGood ? "#4ade80" : "var(--color-danger-bright)"}`,
            }}
          />
          
          {/* Alert label */}
          <div 
            className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold"
            style={{
              background: isGood ? "rgba(74, 222, 128, 0.2)" : "rgba(255,255,255,0.15)",
              color: isGood ? "#4ade80" : "white",
              fontFamily: "var(--font-mono)",
            }}
          >
            {isGood ? "OPPORTUNITY" : "⚠ ALERT"}
          </div>
        </div>

        {/* Center: Event info */}
        <div className="flex-1 px-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl">{activeEvent.icon}</span>
            <div>
              <div 
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
              >
                {activeEvent.title.toUpperCase()}
              </div>
              <div 
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {incomeMultiplier > 1 && (
                  <span style={{ color: "#4ade80" }}>
                    +{Math.round((incomeMultiplier - 1) * 100)}% income
                  </span>
                )}
                {incomeMultiplier < 1 && (
                  <span style={{ color: "#fbbf24" }}>
                    -{Math.round((1 - incomeMultiplier) * 100)}% income
                  </span>
                )}
                {incomeMultiplier !== 1 && viewsMultiplier !== 1 && (
                  <span className="mx-1">•</span>
                )}
                {viewsMultiplier > 1 && (
                  <span style={{ color: "#f87171" }}>
                    +{Math.round((viewsMultiplier - 1) * 100)}% viral views gain
                  </span>
                )}
                {viewsMultiplier < 1 && (
                  <span style={{ color: "#4ade80" }}>
                    -{Math.round((1 - viewsMultiplier) * 100)}% viral views gain
                  </span>
                )}
                {activeEvent.effect.type === "viewGain" && (
                  <span style={{ color: "#f87171" }}>
                    +{(activeEvent.effect.amount / 1_000_000).toFixed(1)}M views
                  </span>
                )}
                {activeEvent.effect.type === "pauseFraud" && (
                  <span style={{ color: "#fbbf24" }}>
                    Operations paused
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer */}
        <div 
          className="shrink-0 flex items-center gap-2 px-3 py-1 rounded"
          style={{
            background: "rgba(0,0,0,0.2)",
            border: `1px solid ${isUrgent ? "var(--color-danger-bright)" : "rgba(255,255,255,0.2)"}`,
          }}
        >
          <span 
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}
          >
            TIME
          </span>
          <span 
            className={`font-mono font-bold text-lg ${isUrgent ? "text-white" : ""}`}
            style={{ 
              color: isUrgent ? "white" : "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div 
        className="h-0.5 w-full"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        <div 
          className="h-full transition-all duration-100"
          style={{
            width: `${(timeLeft / activeEvent.duration) * 100}%`,
            background: isGood 
              ? "linear-gradient(90deg, #4ade80, #22c55e)"
              : "linear-gradient(90deg, #fbbf24, #ef4444)",
          }}
        />
      </div>
    </div>
  );
}
