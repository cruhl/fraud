import { HEADLINES } from "~/data/headlines";

export function NewsTicker() {
  // Double the headlines for seamless loop
  const headlineTexts = HEADLINES.map((h) => h.text);
  const doubledHeadlines = [...headlineTexts, ...headlineTexts];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-900 border-t-2 border-red-700 overflow-hidden z-30">
      <div className="flex items-center">
        {/* Breaking news badge */}
        <div className="bg-red-600 px-4 py-2 font-bold text-white text-sm uppercase tracking-wider shrink-0 z-10">
          Breaking News
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap py-2">
            {doubledHeadlines.map((headline, i) => (
              <span key={i} className="text-white text-sm mx-8">
                {headline}
                <span className="mx-8 text-red-400">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
