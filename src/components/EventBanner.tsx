import { useGameStore } from "~/store/gameStore";

export function EventBanner() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const eventEndTime = useGameStore((s) => s.eventEndTime);

  if (!activeEvent || !eventEndTime) return null;

  const now = Date.now();
  const remaining = Math.max(0, Math.ceil((eventEndTime - now) / 1000));

  const getEventColor = () => {
    switch (activeEvent.effect.type) {
      case "viewMultiplier":
        return activeEvent.effect.amount > 1
          ? "from-red-900 to-red-800 border-red-600"
          : "from-green-900 to-green-800 border-green-600";
      case "viewGain":
        return "from-red-900 to-orange-900 border-red-600";
      case "incomeMultiplier":
        return "from-yellow-900 to-yellow-800 border-yellow-600";
      case "pauseFraud":
        return "from-blue-900 to-blue-800 border-blue-600";
      case "nothing":
        return "from-gray-800 to-gray-700 border-gray-600";
    }
  };

  const getEffectText = () => {
    switch (activeEvent.effect.type) {
      case "viewMultiplier":
        const mult = activeEvent.effect.amount;
        return mult > 1
          ? `+${((mult - 1) * 100).toFixed(0)}% viral views gain`
          : `-${((1 - mult) * 100).toFixed(0)}% viral views gain`;
      case "viewGain":
        return `+${(activeEvent.effect.amount / 1_000_000).toFixed(1)}M views instantly!`;
      case "incomeMultiplier":
        return `${activeEvent.effect.amount}x income`;
      case "pauseFraud":
        return "All fraud operations paused";
      case "nothing":
        return "No actual effect";
    }
  };

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-gradient-to-r ${getEventColor()}
        border-b-2 px-4 py-2
      `}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{activeEvent.icon}</span>
          <div>
            <div className="font-bold text-white">{activeEvent.title}</div>
            <div className="text-sm text-gray-300">{activeEvent.description}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-white">{remaining}s</div>
          <div className="text-xs text-gray-400">{getEffectText()}</div>
        </div>
      </div>
    </div>
  );
}

