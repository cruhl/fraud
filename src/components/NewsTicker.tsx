import { HEADLINES } from "~/data/headlines";

export function NewsTicker() {
  const headlineTexts = HEADLINES.map((h) => h.text);
  const doubledHeadlines = [...headlineTexts, ...headlineTexts];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--color-danger) 0%, #5C1F24 100%)",
        borderTop: "2px solid var(--color-danger-bright)",
        boxShadow: "0 -4px 20px rgba(139, 47, 53, 0.5)",
      }}
    >
      <div className="flex items-center">
        {/* Breaking news badge with live indicator */}
        <div
          className="relative flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 shrink-0 z-10"
          style={{
            background: "linear-gradient(90deg, var(--color-danger-bright) 0%, var(--color-danger) 100%)",
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
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}
          >
            <span className="hidden sm:inline">BREAKING</span>
            <span className="sm:hidden">LIVE</span>
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap py-1.5 md:py-2.5">
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
                <span className="mx-4 md:mx-6 text-sm md:text-lg" style={{ color: "var(--color-corruption)" }}>
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
            background: "linear-gradient(90deg, transparent 0%, var(--color-danger) 100%)",
          }}
        />
      </div>
    </div>
  );
}
