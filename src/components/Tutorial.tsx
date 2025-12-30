import { useState, useEffect, useRef } from "react";
import { useGameStore } from "~/store/gameStore";
import { getCharacterImageUrl } from "~/lib/assets";
import { playSound } from "~/hooks/useAudio";

const NICK_SHIRLEY_IMAGE = getCharacterImageUrl("nick-shirley");

type TutorialStep = {
  title: string;
  description: string;
  icon: string;
  highlight?: string;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to the Fraud Empire",
    description: "You're running a network of fake nonprofits in Minnesota. Click to file fraudulent claims and steal federal funds!",
    icon: "💰",
  },
  {
    title: "Watch Your Views",
    description: "Nick Shirley is an investigative journalist tracking your fraud. The 👁️ Viral Views meter shows how much attention you're getting. If it hits 100M, you're ARRESTED!",
    icon: "📷",
    highlight: "views",
  },
  {
    title: "Unlock New Zones",
    description: "Each zone is a different fraud scheme. Unlock new zones to increase your income, but beware—bigger schemes attract more views!",
    icon: "🏠",
    highlight: "zones",
  },
  {
    title: "Buy Upgrades",
    description: "Upgrades boost your income and can reduce your viral exposure. Some even help you survive arrest!",
    icon: "⬆️",
    highlight: "upgrades",
  },
  {
    title: "Catch Golden Claims",
    description: "Golden floating icons appear randomly. Click them for bonus money, view reduction, or temporary discounts!",
    icon: "✨",
  },
  {
    title: "Hire Your Crew",
    description: "Recruit corrupt officials, lawyers, and political allies. Each crew member provides a permanent passive bonus.",
    icon: "🤝",
    highlight: "crew",
  },
  {
    title: "Reach $9 Billion",
    description: "Steal enough money to hit $9 billion before getting arrested. That's the real amount that went missing in Minnesota. Good luck!",
    icon: "🎯",
  },
];

export function Tutorial() {
  const hasSeenTutorial = useGameStore((s) => s.hasSeenTutorial);
  const dismissTutorial = useGameStore((s) => s.dismissTutorial);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Don't show if already seen
  if (hasSeenTutorial || !isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    playSound("click");
    if (isLastStep) {
      dismissTutorial();
      setIsVisible(false);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    playSound("click");
    dismissTutorial();
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="relative max-w-md w-full rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "2px solid var(--color-corruption)",
          boxShadow: "0 0 40px rgba(183, 134, 53, 0.3)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 text-center"
          style={{
            background: "linear-gradient(180deg, var(--color-corruption)20, transparent)",
          }}
        >
          <span className="text-4xl">{step.icon}</span>
          <h2
            className="text-xl font-bold mt-2"
            style={{
              color: "var(--color-corruption)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
            }}
          >
            {step.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p
            className="text-center leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i === currentStep 
                  ? "var(--color-corruption)" 
                  : i < currentStep 
                    ? "var(--color-corruption-dim)"
                    : "var(--color-bg-primary)",
                transform: i === currentStep ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 rounded-lg transition-all hover:opacity-80"
            style={{
              background: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-card)",
              color: "var(--color-text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}
          >
            SKIP
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 rounded-lg transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--color-corruption), var(--color-corruption-dim))",
              border: "1px solid var(--color-corruption)",
              color: "white",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              boxShadow: "0 4px 15px rgba(183, 134, 53, 0.3)",
            }}
          >
            {isLastStep ? "START STEALING" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Nick Shirley Warning - shows when views hit 1M for first time
 */
export function NickWarning() {
  const viralViews = useGameStore((s) => s.viralViews);
  const hasSeenNickWarning = useGameStore((s) => s.hasSeenNickWarning);
  const dismissNickWarning = useGameStore((s) => s.dismissNickWarning);
  const [isVisible, setIsVisible] = useState(false);
  const hasFiredRef = useRef(false);

  // Trigger when views first hit 1M (only fire once)
  useEffect(() => {
    if (viralViews >= 1_000_000 && !hasSeenNickWarning && !hasFiredRef.current) {
      hasFiredRef.current = true;
      setIsVisible(true);
      playSound("event");
    }
  }, [viralViews, hasSeenNickWarning]);

  const handleDismiss = () => {
    playSound("click");
    dismissNickWarning();
    setIsVisible(false);
  };

  if (!isVisible || hasSeenNickWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="relative max-w-sm w-full rounded-xl overflow-hidden animate-shake"
        style={{
          background: "linear-gradient(135deg, #2a0a0a, #1a0505)",
          border: "2px solid var(--color-danger-bright)",
          boxShadow: "0 0 50px rgba(139, 47, 53, 0.5)",
        }}
      >
        {/* Nick's portrait */}
        <div className="flex justify-center pt-6">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-4 animate-warning-flash"
            style={{
              borderColor: "var(--color-danger-bright)",
              boxShadow: "0 0 25px rgba(139, 47, 53, 0.6)",
            }}
          >
            <img
              src={NICK_SHIRLEY_IMAGE}
              alt="Nick Shirley"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl flex items-center justify-center h-full bg-black">📷</span>';
              }}
            />
          </div>
        </div>

        {/* Warning header */}
        <div className="text-center pt-4">
          <div
            className="inline-block px-3 py-1 rounded-full animate-pulse"
            style={{
              background: "var(--color-danger)",
              color: "white",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
            }}
          >
            ⚠️ WARNING ⚠️
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2
            className="text-xl font-bold mb-3"
            style={{
              color: "var(--color-danger-bright)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
            }}
          >
            NICK SHIRLEY IS WATCHING
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Your fraud has hit <strong style={{ color: "var(--color-danger-bright)" }}>1 MILLION views</strong>. 
            Investigative journalist Nick Shirley is now tracking your operations.
          </p>
          <p
            className="text-sm mt-3 leading-relaxed"
            style={{ color: "var(--color-text-dim)" }}
          >
            If views hit 100M, he'll release his video and you'll be <strong>ARRESTED</strong>. 
            Buy upgrades that increase view decay to stay under the radar!
          </p>
        </div>

        {/* Dismiss button */}
        <div className="p-4 pt-0">
          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-lg transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--color-danger), #5c1f24)",
              border: "1px solid var(--color-danger-bright)",
              color: "white",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              boxShadow: "0 4px 15px rgba(139, 47, 53, 0.3)",
            }}
          >
            I'LL BE CAREFUL
          </button>
        </div>
      </div>
    </div>
  );
}

