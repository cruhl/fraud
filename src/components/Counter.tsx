import { useMemo, useState, useEffect } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { ZONES } from "~/data/zones";

export function Counter() {
  const money = useGameStore((s) => s.money);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const fakeClaims = useGameStore((s) => s.fakeClaims);
  const activeZone = useGameStore((s) => s.activeZone);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const gameStartTime = useGameStore((s) => s.gameStartTime);
  const [timePlayed, setTimePlayed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimePlayed(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStartTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const passiveIncome = useMemo(
    () =>
      GameStore.getPassiveIncome({
        ownedUpgrades,
        unlockedZones,
        totalArrestCount: 0,
      } as never),
    [ownedUpgrades, unlockedZones]
  );

  const clickValue = useMemo(
    () =>
      GameStore.getClickValue({
        ownedUpgrades,
        unlockedZones,
        activeZone,
        totalArrestCount: 0,
      } as never),
    [ownedUpgrades, unlockedZones, activeZone]
  );

  const progress = (totalEarned / GameStore.TARGET) * 100;
  const zone = ZONES.find((z) => z.id === activeZone);

  const milestones = [
    { pct: 25, label: "$2.25B" },
    { pct: 50, label: "$4.5B" },
    { pct: 75, label: "$6.75B" },
  ];

  return (
    <div className="relative space-y-5">
      {/* Confidential watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{ opacity: 0.03 }}
      >
        <div 
          className="text-6xl font-display tracking-[0.3em] rotate-[-15deg] whitespace-nowrap"
          style={{ color: "var(--color-danger)" }}
        >
          CONFIDENTIAL
        </div>
      </div>

      {/* Document header */}
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--color-border-card)" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span 
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
          >
            Financial Summary
          </span>
        </div>
        <div 
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{ 
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-muted)",
          }}
        >
          ⏱ {formatTime(timePlayed)}
        </div>
      </div>

      {/* Main money display - styled as ledger entry */}
      <div className="relative text-center py-4">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, var(--color-corruption) 50%, transparent 100%)
            `,
            backgroundSize: "100% 1px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div 
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          Total Fraudulent Funds Acquired
        </div>
        <div 
          className="text-5xl font-bold tracking-tight"
          style={{ 
            fontFamily: "var(--font-mono)",
            color: "var(--color-money-bright)",
            textShadow: "0 0 30px rgba(201, 162, 39, 0.3)",
          }}
        >
          {GameStore.formatMoney(money)}
        </div>
        <div 
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {progress >= 100 ? "🎯 TARGET ACHIEVED" : `${progress.toFixed(4)}% of $9B target`}
        </div>
      </div>

      {/* Progress bar - styled as filing progress */}
      <div className="px-2">
        <div 
          className="flex justify-between text-[10px] mb-1"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          <span>FRAUD PROGRESS</span>
          <span>{progress.toFixed(2)}%</span>
        </div>
        <div 
          className="relative h-4 rounded-sm overflow-hidden"
          style={{ 
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-card)",
          }}
        >
          {/* Milestone markers */}
          {milestones.map((m) => (
            <div
              key={m.pct}
              className="absolute top-0 bottom-0 w-px"
              style={{ 
                left: `${m.pct}%`,
                background: progress >= m.pct ? "var(--color-money)" : "var(--color-border-highlight)",
              }}
            />
          ))}
          {/* Progress fill */}
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, progress)}%`,
              background: `linear-gradient(90deg, var(--color-corruption-dim), var(--color-money-bright))`,
              boxShadow: "0 0 10px rgba(201, 162, 39, 0.4)",
            }}
          />
          {/* Gloss effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
            }}
          />
        </div>
        {/* Milestone labels */}
        <div 
          className="flex justify-between text-[9px] mt-1 px-1"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          <span>$0</span>
          {milestones.map((m) => (
            <span 
              key={m.pct} 
              style={{ 
                marginLeft: `${m.pct - 15}%`,
                color: progress >= m.pct ? "var(--color-money)" : undefined,
              }}
            >
              {m.label}
            </span>
          ))}
          <span>$9B</span>
        </div>
      </div>

      {/* Stats grid - styled as form fields */}
      <div className="grid grid-cols-3 gap-2">
        <Counter.StatField 
          label="PER CLICK"
          value={GameStore.formatMoney(clickValue)}
          icon="👆"
        />
        <Counter.StatField 
          label="PASSIVE"
          value={`${GameStore.formatMoney(passiveIncome)}/s`}
          icon="⚡"
          highlight={passiveIncome > 0}
        />
        <Counter.StatField 
          label="CLAIMS FILED"
          value={fakeClaims.toLocaleString()}
          icon="📋"
        />
      </div>

      {/* Zone indicator - styled as department badge */}
      {zone && (
        <div 
          className="flex items-center justify-center gap-2 py-2 rounded-md border"
          style={{ 
            background: `${zone.color}15`,
            borderColor: `${zone.color}40`,
          }}
        >
          <span className="text-lg">{zone.icon}</span>
          <div>
            <div 
              className="text-xs uppercase tracking-wider"
              style={{ color: zone.color, fontFamily: "var(--font-display)" }}
            >
              {zone.name}
            </div>
            <div 
              className="text-[10px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Active Fraud Zone
            </div>
          </div>
        </div>
      )}

      {/* Satirical counter - styled as official report */}
      <div 
        className="flex justify-between text-xs px-3 py-2 rounded border"
        style={{ 
          background: "var(--color-bg-primary)",
          borderColor: "var(--color-border-card)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div>
          <span style={{ color: "var(--color-text-dim)" }}>REPORTED: </span>
          <span style={{ color: "#4ade80" }}>{(fakeClaims * 3).toLocaleString()} children</span>
        </div>
        <div 
          className="w-px"
          style={{ background: "var(--color-border-card)" }}
        />
        <div>
          <span style={{ color: "var(--color-text-dim)" }}>ACTUAL: </span>
          <span style={{ color: "var(--color-danger)" }}>0 children</span>
        </div>
      </div>
    </div>
  );
}

export namespace Counter {
  export type StatFieldProps = {
    label: string;
    value: string;
    icon: string;
    highlight?: boolean;
  };

  export function StatField({ label, value, icon, highlight }: StatFieldProps) {
    return (
      <div 
        className="relative p-3 rounded-md border overflow-hidden"
        style={{ 
          background: "var(--color-bg-elevated)",
          borderColor: highlight ? "var(--color-corruption-dim)" : "var(--color-border-card)",
          boxShadow: highlight ? "0 0 15px rgba(196, 164, 75, 0.15)" : undefined,
        }}
      >
        {/* Field label */}
        <div 
          className="text-[9px] uppercase tracking-wider mb-1"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          {icon} {label}
        </div>
        {/* Field value */}
        <div 
          className="text-lg font-semibold"
          style={{ 
            fontFamily: "var(--font-mono)",
            color: highlight ? "var(--color-money-bright)" : "var(--color-text-primary)",
          }}
        >
          {value}
        </div>
        {/* Corner fold effect */}
        <div 
          className="absolute top-0 right-0 w-3 h-3"
          style={{
            background: "linear-gradient(135deg, transparent 50%, var(--color-bg-primary) 50%)",
          }}
        />
      </div>
    );
  }
}
