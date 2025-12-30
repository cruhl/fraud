import { useCallback, useState } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { CREW_MEMBERS, type CrewMember } from "~/data/crew";
import { getCharacterImageUrl } from "~/lib/assets";
import { playSound } from "~/hooks/useAudio";

function CrewCard({ crew, isHired, canAfford, onHire }: {
  crew: CrewMember;
  isHired: boolean;
  canAfford: boolean;
  onHire: () => void;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const imageUrl = getCharacterImageUrl(crew.imageId);

  return (
    <div
      className={`relative p-3 rounded-lg transition-all ${isHovering && !isHired ? "scale-105" : ""}`}
      style={{
        background: isHired
          ? "linear-gradient(135deg, rgba(74, 222, 128, 0.15), var(--color-bg-elevated))"
          : "var(--color-bg-elevated)",
        border: `1px solid ${isHired ? "rgba(74, 222, 128, 0.5)" : "var(--color-border-card)"}`,
        boxShadow: isHired ? "0 0 15px rgba(74, 222, 128, 0.2)" : undefined,
        opacity: !isHired && !canAfford ? 0.6 : 1,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex gap-3">
        {/* Portrait */}
        <div
          className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2"
          style={{
            borderColor: isHired ? "#4ade80" : "var(--color-border-highlight)",
            boxShadow: isHired ? "0 0 10px rgba(74, 222, 128, 0.4)" : undefined,
          }}
        >
          <img
            src={imageUrl}
            alt={crew.name}
            className="w-full h-full object-cover"
            style={{
              filter: isHired ? "none" : canAfford ? "saturate(0.7)" : "grayscale(0.8)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl flex items-center justify-center h-full bg-black/30">👤</span>`;
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-sm truncate"
              style={{
                color: isHired ? "#4ade80" : "var(--color-text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {crew.name}
            </span>
            {isHired && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                style={{
                  background: "rgba(74, 222, 128, 0.2)",
                  color: "#4ade80",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ✓ HIRED
              </span>
            )}
          </div>
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
          >
            {crew.role}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {crew.description}
          </div>
        </div>
      </div>

      {/* Hire button or cost */}
      {!isHired && (
        <button
          onClick={onHire}
          disabled={!canAfford}
          className="w-full mt-3 py-2 rounded-lg transition-all"
          style={{
            background: canAfford
              ? "linear-gradient(135deg, var(--color-corruption), var(--color-corruption-dim))"
              : "var(--color-bg-primary)",
            border: `1px solid ${canAfford ? "var(--color-corruption)" : "var(--color-border-card)"}`,
            color: canAfford ? "white" : "var(--color-text-dim)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            cursor: canAfford ? "pointer" : "not-allowed",
          }}
        >
          {canAfford ? "HIRE" : "LOCKED"} — {GameStore.formatMoney(crew.cost)}
        </button>
      )}
    </div>
  );
}

export function CrewPanel() {
  const money = useGameStore((s) => s.money);
  const hiredCrew = useGameStore((s) => s.hiredCrew);
  const hireCrew = useGameStore((s) => s.hireCrew);

  const handleHire = useCallback((crewId: string) => {
    playSound("purchase");
    hireCrew(crewId);
  }, [hireCrew]);

  const hiredCount = hiredCrew?.length ?? 0;
  const totalCount = CREW_MEMBERS.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-display)" }}
        >
          🤝 Your Crew
        </div>
        <div
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: hiredCount > 0 ? "rgba(74, 222, 128, 0.15)" : "var(--color-bg-primary)",
            color: hiredCount > 0 ? "#4ade80" : "var(--color-text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {hiredCount}/{totalCount} HIRED
        </div>
      </div>

      {/* Crew grid */}
      <div className="space-y-2">
        {CREW_MEMBERS.map((crew) => {
          const isHired = hiredCrew?.includes(crew.id) ?? false;
          const canAfford = money >= crew.cost;
          
          return (
            <CrewCard
              key={crew.id}
              crew={crew}
              isHired={isHired}
              canAfford={canAfford}
              onHire={() => handleHire(crew.id)}
            />
          );
        })}
      </div>

      {/* Active bonuses summary */}
      {hiredCount > 0 && (
        <div
          className="p-3 rounded-lg"
          style={{
            background: "rgba(74, 222, 128, 0.1)",
            border: "1px solid rgba(74, 222, 128, 0.3)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "#4ade80", fontFamily: "var(--font-mono)" }}
          >
            ✓ ACTIVE BONUSES
          </div>
          <div className="flex flex-wrap gap-2">
            {(hiredCrew ?? []).map((crewId) => {
              const crew = CREW_MEMBERS.find((c) => c.id === crewId);
              if (!crew) return null;
              
              let effectText = "";
              switch (crew.effect.type) {
                case "viewGainReduction":
                  effectText = `-${(crew.effect.percent * 100).toFixed(0)}% views`;
                  break;
                case "viewDecayBonus":
                  effectText = `+${(crew.effect.amount / 1000).toFixed(0)}K decay/s`;
                  break;
                case "trialAcquittalBonus":
                  effectText = `+${(crew.effect.percent * 100).toFixed(0)}% acquittal`;
                  break;
                case "zoneDiscountPercent":
                  effectText = `-${(crew.effect.percent * 100).toFixed(0)}% zone costs`;
                  break;
              }
              
              return (
                <div
                  key={crewId}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {effectText}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

