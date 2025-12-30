import { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);
  const [timePlayed, setTimePlayed] = useState(0);

  // Animation states
  const [moneyPop, setMoneyPop] = useState(false);
  const [passiveFloaters, setPassiveFloaters] = useState<
    Counter.PassiveFloater[]
  >([]);
  const [incomeTick, setIncomeTick] = useState(false);
  const prevMoneyRef = useRef(money);
  const popTimeoutRef = useRef<number | null>(null);

  // Track money changes for animations - debounced to prevent flickering
  useEffect(() => {
    if (money > prevMoneyRef.current) {
      // Only trigger pop if not already popping (debounce)
      if (!popTimeoutRef.current) {
        setMoneyPop(true);
        popTimeoutRef.current = window.setTimeout(() => {
          setMoneyPop(false);
          popTimeoutRef.current = null;
        }, 200);
      }
    }
    prevMoneyRef.current = money;
  }, [money]);

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
        totalArrestCount,
        lifetimeStats,
      } as never),
    [ownedUpgrades, unlockedZones, totalArrestCount, lifetimeStats]
  );

  // Calculate trial acquittal bonus
  const trialBonus = useMemo(
    () =>
      GameStore.getTrialAcquittalBonus({
        ownedUpgrades,
        unlockedZones,
      } as Parameters<typeof GameStore.getTrialAcquittalBonus>[0]),
    [ownedUpgrades, unlockedZones]
  );

  // Add passive income floaters periodically
  const addPassiveFloater = useCallback(() => {
    if (passiveIncome <= 0) return;
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40;
    setPassiveFloaters((prev) => [...prev, { id, value: passiveIncome, x }]);
    setTimeout(() => {
      setPassiveFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
    // Trigger income tick glow
    setIncomeTick(true);
    setTimeout(() => setIncomeTick(false), 500);
  }, [passiveIncome]);

  // Periodically spawn passive floaters when passive income exists
  useEffect(() => {
    if (passiveIncome <= 0) return;
    const interval = setInterval(addPassiveFloater, 1000);
    return () => clearInterval(interval);
  }, [passiveIncome, addPassiveFloater]);

  const clickValue = useMemo(
    () =>
      GameStore.getClickValue({
        ownedUpgrades,
        unlockedZones,
        activeZone,
        totalArrestCount,
        lifetimeStats,
      } as never),
    [ownedUpgrades, unlockedZones, activeZone, totalArrestCount, lifetimeStats]
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
        style={{ opacity: 0.02 }}
      >
        <div
          className="text-6xl font-display tracking-[0.3em] rotate-[-15deg] whitespace-nowrap"
          style={{ color: "var(--color-danger)" }}
        >
          CONFIDENTIAL
        </div>
      </div>

      {/* Document header */}
      <div
        className="flex items-center justify-between border-b pb-3"
        style={{ borderColor: "var(--color-border-card)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span
            className="text-xs uppercase tracking-[0.15em]"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
            }}
          >
            Financial Summary
          </span>
        </div>
        <div
          className="text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5"
          style={{
            background: "linear-gradient(180deg, var(--color-bg-elevated), var(--color-bg-primary))",
            border: "1px solid var(--color-border-card)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ opacity: 0.6 }}>⏱</span>
          {formatTime(timePlayed)}
        </div>
      </div>

      {/* Main money display - styled as ledger entry */}
      <div className="relative text-center py-5">
        {/* Passive income micro-floaters */}
        {passiveFloaters.map((f) => (
          <div
            key={f.id}
            className="absolute animate-micro-float pointer-events-none z-20"
            style={{
              left: `${f.x}%`,
              top: "20%",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--color-money-bright)",
              textShadow: "0 0 12px rgba(212, 180, 92, 0.6)",
            }}
          >
            +{GameStore.formatMoney(f.value)}
          </div>
        ))}

        {/* Decorative horizontal line */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, var(--color-corruption-dim) 30%, var(--color-corruption-dim) 70%, transparent 100%)",
            opacity: 0.15,
          }}
        />
        
        <div
          className="text-[10px] uppercase tracking-[0.2em] mb-3"
          style={{
            color: "var(--color-text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ opacity: 0.7 }}>💰</span> Available Funds
        </div>
        <div
          className={`text-5xl font-semibold tracking-tight ${
            moneyPop ? "animate-value-pop" : ""
          }`}
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-money-bright)",
            textShadow: moneyPop
              ? "0 0 50px rgba(212, 180, 92, 0.7), 0 0 80px rgba(212, 180, 92, 0.4)"
              : "0 0 40px rgba(212, 180, 92, 0.35)",
            transition: "text-shadow 0.2s ease-out",
          }}
        >
          {GameStore.formatMoney(money)}
        </div>
        {/* Show total earned as secondary info */}
        <div
          className="text-xs mt-3 flex items-center justify-center gap-2"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>{GameStore.formatMoney(totalEarned)} total</span>
          <span style={{ color: "var(--color-border-highlight)" }}>•</span>
          <span style={{ color: progress >= 100 ? "var(--color-money)" : "var(--color-text-muted)" }}>
            {progress >= 100
              ? "🎯 TARGET ACHIEVED"
              : `${progress.toFixed(1)}% of $9B`}
          </span>
        </div>
      </div>

      {/* Progress bar - styled as filing progress */}
      <div className="px-1">
        <div
          className="flex justify-between text-[9px] mb-1.5"
          style={{
            color: "var(--color-text-dim)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
          }}
        >
          <span className="uppercase">Fraud Progress</span>
          <span style={{ color: progress >= 50 ? "var(--color-money)" : "var(--color-text-dim)" }}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div
          className="relative h-5 rounded-md overflow-hidden"
          style={{
            background: "linear-gradient(180deg, var(--color-bg-primary), rgba(0,0,0,0.4))",
            border: "1px solid var(--color-border-card)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {/* Milestone markers */}
          {milestones.map((m) => (
            <div
              key={m.pct}
              className="absolute top-0 bottom-0 w-px z-10"
              style={{
                left: `${m.pct}%`,
                background:
                  progress >= m.pct
                    ? "var(--color-money-bright)"
                    : "var(--color-border-highlight)",
                opacity: progress >= m.pct ? 0.8 : 0.4,
              }}
            />
          ))}
          {/* Progress fill */}
          <div
            className="h-full transition-all duration-300 relative"
            style={{
              width: `${Math.min(100, progress)}%`,
              background: `linear-gradient(90deg, var(--color-corruption-deep) 0%, var(--color-corruption) 50%, var(--color-money-bright) 100%)`,
              boxShadow: progress > 10 ? "0 0 20px rgba(212, 180, 92, 0.4)" : undefined,
            }}
          >
            {/* Inner shimmer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)",
              }}
            />
          </div>
          {/* Gloss effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
            }}
          />
        </div>
        {/* Milestone labels */}
        <div
          className="flex justify-between text-[8px] mt-1.5 px-0.5"
          style={{
            color: "var(--color-text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>$0</span>
          {milestones.map((m) => (
            <span
              key={m.pct}
              style={{
                marginLeft: `${m.pct - 15}%`,
                color: progress >= m.pct ? "var(--color-money)" : undefined,
                fontWeight: progress >= m.pct ? 600 : 400,
              }}
            >
              {m.label}
            </span>
          ))}
          <span style={{ color: progress >= 100 ? "var(--color-money-bright)" : undefined }}>$9B</span>
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
          pulse={incomeTick && passiveIncome > 0}
        />
        <Counter.StatField
          label="CLAIMS FILED"
          value={fakeClaims.toLocaleString()}
          icon="📋"
        />
      </div>

      {/* Legal Defense Indicator - only shown when player has trial bonus upgrades */}
      {trialBonus > 0 && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-md border"
          style={{
            background: "linear-gradient(135deg, rgba(74, 222, 128, 0.08), var(--color-bg-elevated))",
            borderColor: "rgba(74, 222, 128, 0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <div>
              <div
                className="text-xs uppercase tracking-wider font-semibold"
                style={{ color: "#4ade80", fontFamily: "var(--font-mono)" }}
              >
                Legal Defense
              </div>
              <div
                className="text-[10px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Acquittal chance bonus
              </div>
            </div>
          </div>
          <div
            className="text-lg font-bold"
            style={{
              color: "#4ade80",
              fontFamily: "var(--font-mono)",
              textShadow: "0 0 12px rgba(74, 222, 128, 0.4)",
            }}
          >
            +{Math.round(trialBonus * 100)}%
          </div>
        </div>
      )}

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
          <span style={{ color: "#4ade80" }}>
            {(fakeClaims * 3).toLocaleString()} children
          </span>
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
    pulse?: boolean;
  };

  export type PassiveFloater = {
    id: number;
    value: number;
    x: number;
  };

  export function StatField({
    label,
    value,
    icon,
    highlight,
    pulse,
  }: StatFieldProps) {
    return (
      <div
        className={`relative p-3 rounded-lg border overflow-hidden transition-all ${
          pulse ? "animate-income-tick" : ""
        }`}
        style={{
          background: highlight 
            ? "linear-gradient(145deg, var(--color-bg-elevated), var(--color-corruption)08)"
            : "linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-primary))",
          borderColor: highlight
            ? "var(--color-corruption-dim)"
            : "var(--color-border-card)",
          boxShadow: highlight
            ? "0 0 20px rgba(212, 180, 92, 0.12), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      >
        {/* Field label */}
        <div
          className="text-[8px] uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1"
          style={{
            color: "var(--color-text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ opacity: 0.7 }}>{icon}</span> {label}
        </div>
        {/* Field value */}
        <div
          className={`text-lg font-medium transition-transform ${
            pulse ? "animate-value-pop" : ""
          }`}
          style={{
            fontFamily: "var(--font-mono)",
            color: highlight
              ? "var(--color-money-bright)"
              : "var(--color-text-primary)",
            textShadow: pulse 
              ? "0 0 20px rgba(212, 180, 92, 0.6)" 
              : highlight 
                ? "0 0 12px rgba(212, 180, 92, 0.2)" 
                : undefined,
          }}
        >
          {value}
        </div>
        {/* Top edge highlight */}
        {highlight && (
          <div
            className="absolute top-0 left-2 right-2 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-corruption-dim), transparent)",
            }}
          />
        )}
        {/* Corner fold effect */}
        <div
          className="absolute top-0 right-0 w-4 h-4"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, var(--color-bg-primary) 50%)",
          }}
        />
      </div>
    );
  }
}
