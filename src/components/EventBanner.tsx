import { useGameStore } from "~/store/gameStore";
import { useState, useEffect, useMemo, useRef } from "react";
import type { PoliticalEvent } from "~/data/events";
import { playSound } from "~/hooks/useAudio";
import { getCharacterImageUrl } from "~/lib/assets";
import { getCharacter } from "~/data/characters";

// Breaking news flash particle type
type NewsFlashParticle = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rot: number;
  emoji: string;
};

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
    case "investigation":
      incomeMultiplier = event.effect.incomeMultiplier;
      break;
    // viewGain doesn't have multipliers
  }

  return { incomeMultiplier, viewsMultiplier };
}

export function EventBanner() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const eventEndTime = useGameStore((s) => s.eventEndTime);
  const [timeLeft, setTimeLeft] = useState(0);
  const prevEventIdRef = useRef<string | null>(null);
  
  // Juice states
  const [isEntering, setIsEntering] = useState(false);
  const [showBreakingFlash, setShowBreakingFlash] = useState(false);
  const [flashParticles, setFlashParticles] = useState<NewsFlashParticle[]>([]);

  // Play sound and trigger entrance animation when a new event appears
  useEffect(() => {
    if (activeEvent && activeEvent.id !== prevEventIdRef.current) {
      playSound("event");
      
      // Trigger entrance animation
      setIsEntering(true);
      setShowBreakingFlash(true);
      
      // Create breaking news particles
      const breakingEmojis = ["📰", "⚡", "🔔", "📢", "❗"];
      const particles: NewsFlashParticle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        tx: (Math.random() - 0.5) * 60,
        ty: -20 - Math.random() * 30,
        rot: Math.random() * 180,
        emoji: breakingEmojis[Math.floor(Math.random() * breakingEmojis.length)],
      }));
      setFlashParticles(particles);
      
      setTimeout(() => setIsEntering(false), 400);
      setTimeout(() => setShowBreakingFlash(false), 300);
      setTimeout(() => setFlashParticles([]), 600);
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

  // Get character info if event has a character
  const character = useMemo(
    () => activeEvent?.character ? getCharacter(activeEvent.character) : null,
    [activeEvent?.character]
  );
  const characterImageUrl = activeEvent?.character ? getCharacterImageUrl(activeEvent.character) : null;

  if (!activeEvent) return null;

  const { incomeMultiplier, viewsMultiplier } = multipliers;
  // Determine if event is good for the player
  const isGood = incomeMultiplier > 1 || viewsMultiplier < 1 || 
    activeEvent?.effect.type === "moneyBonus" ||
    activeEvent?.effect.type === "viewReduction" ||
    (activeEvent?.effect.type === "combo" && (activeEvent.effect.incomeMultiplier > 1 || activeEvent.effect.viewMultiplier < 1));
  const isUrgent = timeLeft <= 5;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-40 overflow-hidden
        ${isEntering ? "animate-event-entrance" : ""}
        ${isUrgent && !isGood ? "animate-strobe-pulse" : ""}
      `}
      style={{
        background: isGood
          ? "linear-gradient(135deg, #1a5c2a, #0d3d18)"
          : "linear-gradient(135deg, var(--color-danger), #5C1F24)",
        borderBottom: `3px solid ${isGood ? "#4ade80" : "var(--color-danger-bright)"}`,
        boxShadow: isGood 
          ? "0 4px 30px rgba(74, 222, 128, 0.3)"
          : isUrgent 
            ? "0 4px 40px rgba(139, 47, 53, 0.6), inset 0 0 30px rgba(139, 47, 53, 0.3)"
            : "0 4px 30px rgba(139, 47, 53, 0.4)",
      }}
    >
      {/* Breaking news flash overlay */}
      {showBreakingFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-10 animate-screen-flash"
          style={{
            background: isGood 
              ? "rgba(74, 222, 128, 0.3)"
              : "rgba(255, 255, 255, 0.3)",
          }}
        />
      )}

      {/* Flash particles on entry */}
      {flashParticles.map((p) => (
        <div
          key={p.id}
          className="absolute text-lg pointer-events-none animate-confetti-burst z-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </div>
      ))}

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
        {/* Left: Character portrait or Alert indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Character portrait if present */}
          {character && characterImageUrl ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0"
                style={{
                  borderColor: isGood ? "#4ade80" : "var(--color-danger-bright)",
                  boxShadow: `0 0 12px ${isGood ? "rgba(74, 222, 128, 0.4)" : "rgba(139, 47, 53, 0.4)"}`,
                }}
              >
                <img 
                  src={characterImageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-xl">${activeEvent.icon}</span>`;
                    e.currentTarget.parentElement!.classList.add("flex", "items-center", "justify-center", "bg-black/30");
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <div 
                  className="text-[9px] uppercase tracking-wider font-bold leading-tight"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {character.role}
                </div>
                <div 
                  className="text-xs font-bold leading-tight"
                  style={{ color: "white" }}
                >
                  {character.name}
                </div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
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
              {/* Effect summary - render based on effect type */}
              <div 
                className="text-xs flex items-center justify-center gap-1.5 flex-wrap"
                style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-mono)" }}
              >
                {activeEvent.effect.type === "incomeMultiplier" && (
                  <span style={{ color: incomeMultiplier > 1 ? "#4ade80" : "#fbbf24" }}>
                    {incomeMultiplier > 1 ? "+" : "-"}
                    {Math.abs(Math.round((incomeMultiplier - 1) * 100))}% income
                  </span>
                )}
                {activeEvent.effect.type === "viewMultiplier" && (
                  <span style={{ color: viewsMultiplier < 1 ? "#4ade80" : "#f87171" }}>
                    {viewsMultiplier > 1 ? "+" : "-"}
                    {Math.abs(Math.round((viewsMultiplier - 1) * 100))}% views
                  </span>
                )}
                {activeEvent.effect.type === "viewGain" && (
                  <span style={{ color: "#f87171" }}>
                    +{(activeEvent.effect.amount / 1_000_000).toFixed(1)}M views
                  </span>
                )}
                {activeEvent.effect.type === "investigation" && (
                  <>
                    <span 
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{ background: "rgba(251, 191, 36, 0.2)", color: "#fbbf24" }}
                    >
                      🔍 UNDER INVESTIGATION
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#f87171" }}>
                      -{Math.round((1 - activeEvent.effect.incomeMultiplier) * 100)}% income
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#f87171" }}>
                      +{(activeEvent.effect.viewGain / 1_000).toFixed(0)}K views
                    </span>
                  </>
                )}
                {activeEvent.effect.type === "moneyBonus" && (
                  <span style={{ color: "#4ade80" }}>
                    💰 +${activeEvent.effect.flat >= 1_000_000 
                      ? (activeEvent.effect.flat / 1_000_000).toFixed(1) + "M" 
                      : (activeEvent.effect.flat / 1_000).toFixed(0) + "K"}
                    {activeEvent.effect.percent > 0 && ` + ${(activeEvent.effect.percent * 100).toFixed(1)}%`}
                  </span>
                )}
                {activeEvent.effect.type === "viewReduction" && (
                  <span style={{ color: "#4ade80" }}>
                    -{(activeEvent.effect.amount / 1_000_000).toFixed(1)}M views
                  </span>
                )}
                {activeEvent.effect.type === "combo" && (
                  <>
                    <span style={{ color: activeEvent.effect.incomeMultiplier > 1 ? "#4ade80" : "#fbbf24" }}>
                      {activeEvent.effect.incomeMultiplier > 1 ? "+" : "-"}
                      {Math.abs(Math.round((activeEvent.effect.incomeMultiplier - 1) * 100))}% income
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: activeEvent.effect.viewMultiplier < 1 ? "#4ade80" : "#f87171" }}>
                      {activeEvent.effect.viewMultiplier > 1 ? "+" : "-"}
                      {Math.abs(Math.round((activeEvent.effect.viewMultiplier - 1) * 100))}% views
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer */}
        <div 
          className={`shrink-0 flex items-center gap-2 px-3 py-1 rounded transition-all ${
            isUrgent ? "animate-wiggle" : ""
          }`}
          style={{
            background: isUrgent ? "rgba(185, 59, 66, 0.3)" : "rgba(0,0,0,0.2)",
            border: `1px solid ${isUrgent ? "var(--color-danger-bright)" : "rgba(255,255,255,0.2)"}`,
            boxShadow: isUrgent ? "0 0 15px rgba(185, 59, 66, 0.5)" : undefined,
          }}
        >
          <span 
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}
          >
            TIME
          </span>
          <span 
            className={`font-mono font-bold text-lg ${isUrgent ? "animate-timer-urgent" : ""}`}
            style={{ 
              color: isUrgent ? "white" : "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-mono)",
              textShadow: isUrgent ? "0 0 10px rgba(255,255,255,0.5)" : undefined,
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
