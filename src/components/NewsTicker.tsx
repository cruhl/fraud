import { useRef, useEffect, useState, useCallback } from "react";
import { useGameStore, type ThreatLevel } from "~/store/gameStore";
import { HEADLINES, type Headline } from "~/data/headlines";
import { ZONES } from "~/data/zones";

// Map zones to relevant headline categories (zone-specific first, then thematic)
const ZONE_TO_CATEGORIES: Record<string, Headline["category"][]> = {
  daycare: ["daycare", "nick-shirley", "state-response", "absurdist"],
  "food-program": ["food-program", "nick-shirley", "state-response", "scale"],
  housing: ["housing", "state-response", "absurdist", "whistleblower"],
  autism: ["autism", "absurdist", "state-response", "legal"],
  medicaid: ["medicaid", "absurdist", "state-response", "corruption"],
  "refugee-services": ["international", "federal", "corruption"],
  political: ["political", "corruption", "media"],
  "nonprofit-empire": ["nonprofit", "corruption", "international", "legal"],
  endgame: ["federal", "legal", "scale"],
  "shadow-banking": ["international", "federal", "corruption"],
  "state-capture": ["political", "corruption", "voter-fraud"],
};

// Map threat levels to prioritized categories
const THREAT_TO_CATEGORIES: Record<ThreatLevel, Headline["category"][]> = {
  safe: ["absurdist", "state-response"],
  "local-blogger": ["nick-shirley", "absurdist"],
  "gaining-traction": ["nick-shirley", "media"],
  "regional-news": ["media", "nick-shirley", "political"],
  "national-story": ["federal", "political", "media"],
  viral: ["federal", "legal", "scale"],
  "the-video": ["nick-shirley", "federal", "legal"],
};

// Shuffle array with seed for consistent but varied order
const shuffleWithSeed = <T,>(arr: T[], seed: number): T[] => {
  const result = [...arr];
  let currentSeed = seed;
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Generate headlines based on game state
const generateHeadlines = (
  activeZone: string,
  threatLevel: ThreatLevel,
  nickShirleyLocation: string | null,
  activeEvent: { effect: { type: string } } | null,
  seed: number
): string[] => {
  const prioritized: Headline[] = [];
  const used = new Set<string>();

  const addByCategory = (category: Headline["category"], count: number = 3) => {
    const categoryHeadlines = HEADLINES.filter(
      (h) => h.category === category && !used.has(h.text)
    );
    const shuffled = shuffleWithSeed(categoryHeadlines, seed + category.length);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      prioritized.push(shuffled[i]);
      used.add(shuffled[i].text);
    }
  };

  // 1. Add zone-specific headlines first
  const zoneCategories = ZONE_TO_CATEGORIES[activeZone] ?? [
    "absurdist",
    "state-response",
  ];
  const zoneSpecificCategory = zoneCategories[0];
  if (
    [
      "daycare",
      "food-program",
      "housing",
      "autism",
      "medicaid",
      "nonprofit",
    ].includes(zoneSpecificCategory)
  ) {
    addByCategory(zoneSpecificCategory as Headline["category"], 5);
  }
  zoneCategories.slice(1).forEach((cat) => addByCategory(cat, 2));

  // 2. If Nick Shirley is spotted somewhere, add his headlines
  if (nickShirleyLocation) {
    addByCategory("nick-shirley", 4);
    const zone = ZONES.find((z) => z.id === nickShirleyLocation);
    if (zone) {
      prioritized.unshift({
        text: `JUST IN: Nick Shirley spotted filming outside ${zone.name} facilities`,
        category: "nick-shirley",
      });
    }
  }

  // 3. Add threat-level appropriate headlines
  const threatCategories = THREAT_TO_CATEGORIES[threatLevel];
  threatCategories.forEach((cat) => addByCategory(cat, 2));

  // 4. If there's an active event, add contextual headlines
  if (activeEvent) {
    if (activeEvent.effect.type === "investigation") {
      addByCategory("federal", 3);
      addByCategory("legal", 2);
    } else if (activeEvent.effect.type === "viewMultiplier") {
      addByCategory("media", 2);
      addByCategory("nick-shirley", 2);
    } else if (activeEvent.effect.type === "incomeMultiplier") {
      addByCategory("state-response", 2);
    }
  }

  // 5. Fill remaining slots with varied content
  const remainingCategories: Headline["category"][] = [
    "scale",
    "absurdist",
    "whistleblower",
    "media",
    "legal",
  ];
  remainingCategories.forEach((cat) => addByCategory(cat, 1));

  // Ensure we have at least 8 headlines
  if (prioritized.length < 8) {
    const remaining = HEADLINES.filter((h) => !used.has(h.text));
    const shuffled = shuffleWithSeed(remaining, seed);
    for (let i = 0; prioritized.length < 12 && i < shuffled.length; i++) {
      prioritized.push(shuffled[i]);
    }
  }

  return prioritized.map((h) => h.text);
};

export function NewsTicker() {
  const activeZone = useGameStore((s) => s.activeZone);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const nickShirleyLocation = useGameStore((s) => s.nickShirleyLocation);
  const activeEvent = useGameStore((s) => s.activeEvent);

  // Store the stable headline list - only updates on full loop completion
  const [stableHeadlines, setStableHeadlines] = useState<string[]>(() =>
    generateHeadlines(
      activeZone,
      threatLevel,
      nickShirleyLocation,
      activeEvent,
      Date.now()
    )
  );

  // Track pending headlines that will be swapped in on next loop
  const pendingHeadlinesRef = useRef<string[] | null>(null);
  const animationRef = useRef<HTMLDivElement>(null);

  // Generate new headlines when state changes, but don't apply immediately
  const generateNewHeadlines = useCallback(() => {
    const newHeadlines = generateHeadlines(
      activeZone,
      threatLevel,
      nickShirleyLocation,
      activeEvent,
      Date.now()
    );
    pendingHeadlinesRef.current = newHeadlines;
  }, [activeZone, threatLevel, nickShirleyLocation, activeEvent]);

  // When game state changes, queue new headlines
  useEffect(() => {
    generateNewHeadlines();
  }, [generateNewHeadlines]);

  // Listen for animation iteration to swap headlines at a natural point
  useEffect(() => {
    const el = animationRef.current;
    if (!el) return;

    const handleIteration = () => {
      if (pendingHeadlinesRef.current) {
        setStableHeadlines(pendingHeadlinesRef.current);
        pendingHeadlinesRef.current = null;
      }
    };

    el.addEventListener("animationiteration", handleIteration);
    return () => el.removeEventListener("animationiteration", handleIteration);
  }, []);

  // Double for seamless loop
  const doubledHeadlines = [...stableHeadlines, ...stableHeadlines];

  // Calculate animation duration based on content length
  const totalLength = stableHeadlines.join("").length;
  const animationDuration = Math.max(40, Math.min(80, totalLength * 0.25));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-danger) 0%, #5C1F24 100%)",
        borderTop: "2px solid var(--color-danger-bright)",
        boxShadow: "0 -4px 20px rgba(139, 47, 53, 0.5)",
      }}
    >
      <div className="flex items-center">
        {/* Breaking news badge with live indicator */}
        <div
          className="relative flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 shrink-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, var(--color-danger-bright) 0%, var(--color-danger) 100%)",
            boxShadow: "4px 0 10px rgba(0,0,0,0.3)",
          }}
        >
          {/* Live indicator dot */}
          <div className="relative">
            <div
              className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-warning-flash"
              style={{
                background: "#ff4444",
                boxShadow: "0 0 8px #ff4444",
              }}
            />
            <div
              className="absolute inset-0 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-ping"
              style={{ background: "#ff4444", opacity: 0.5 }}
            />
          </div>

          <span
            className="text-[10px] md:text-sm uppercase tracking-widest font-bold text-white"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.1em",
            }}
          >
            <span className="hidden sm:inline">BREAKING</span>
            <span className="sm:hidden">LIVE</span>
          </span>
        </div>

        {/* Scrolling ticker - swaps headlines on animation loop for smooth transitions */}
        <div className="overflow-hidden flex-1">
          <div
            ref={animationRef}
            className="whitespace-nowrap py-1.5 md:py-2.5"
            style={{
              animation: `ticker ${animationDuration}s linear infinite`,
            }}
          >
            {doubledHeadlines.map((headline, i) => (
              <span key={i} className="inline-flex items-center mx-4 md:mx-6">
                <span
                  className="text-xs md:text-sm"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {headline}
                </span>
                <span
                  className="mx-4 md:mx-6 text-sm md:text-lg"
                  style={{ color: "var(--color-corruption)" }}
                >
                  ◆
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Right edge fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 md:w-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-danger) 100%)",
          }}
        />
      </div>
    </div>
  );
}
