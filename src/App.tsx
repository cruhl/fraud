import { useEffect, useState, useCallback } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import { Clicker } from "~/components/Clicker";
import { Counter } from "~/components/Counter";
import { Upgrades } from "~/components/Upgrades";
import { ViralMeter } from "~/components/ViralMeter";
import { ZoneSelector } from "~/components/ZoneSelector";
import { MinneapolisMap } from "~/components/MinneapolisMap";
import { EventBanner } from "~/components/EventBanner";
import { Trial } from "~/components/Trial";
import { Victory } from "~/components/Victory";
import { NewsTicker } from "~/components/NewsTicker";
import { Achievements } from "~/components/Achievements";
import { GoldenClaim } from "~/components/GoldenClaim";
import { StatsModal } from "~/components/StatsModal";
import { NewGameModal } from "~/components/NewGameModal";
import {
  isSoundEnabled,
  setSoundEnabled,
  MusicManager,
} from "~/hooks/useAudio";

type MobileTab = "play" | "zones" | "shop" | "stats";

export function App() {
  const tick = useGameStore((s) => s.tick);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const viralViews = useGameStore((s) => s.viralViews);
  const money = useGameStore((s) => s.money);
  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const unlockedZones = useGameStore((s) => s.unlockedZones);
  const activeZone = useGameStore((s) => s.activeZone);
  const isVictory = useGameStore((s) => s.isVictory);

  const [showMap, setShowMap] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [musicOn, setMusicOn] = useState(() => MusicManager.isEnabled());
  const [musicVolume, setMusicVolume] = useState(() =>
    MusicManager.getVolume()
  );
  const [isShaking, setIsShaking] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("play");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSound = useCallback(() => {
    const newValue = !soundOn;
    setSoundOn(newValue);
    setSoundEnabled(newValue);
  }, [soundOn]);

  const toggleMusic = useCallback(() => {
    const newValue = !musicOn;
    setMusicOn(newValue);
    MusicManager.setEnabled(newValue);
    if (newValue) {
      // Resume playing based on current game state
      const track = viralViews >= 50_000_000 ? "danger" : "normal";
      MusicManager.play(track);
    }
  }, [musicOn, viralViews]);

  const handleMusicVolume = useCallback((vol: number) => {
    setMusicVolume(vol);
    MusicManager.setVolume(vol);
  }, []);

  // Game loop
  useEffect(() => {
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [tick]);

  // Screen shake on event
  useEffect(() => {
    if (activeEvent) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeEvent?.id]);

  const hasEvent = !!activeEvent;
  const isHighDanger = viralViews >= 50_000_000;

  // Music track switching based on game state
  useEffect(() => {
    if (!MusicManager.isEnabled()) return;

    const track = isVictory ? "victory" : isHighDanger ? "danger" : "normal";

    MusicManager.play(track);
  }, [isVictory, isHighDanger]);

  const lifetimeStats = useGameStore((s) => s.lifetimeStats);
  
  const passiveIncome = GameStore.getPassiveIncome({
    ownedUpgrades,
    unlockedZones,
    totalArrestCount,
    lifetimeStats,
  } as never);

  const clickValue = GameStore.getClickValue({
    ownedUpgrades,
    unlockedZones,
    activeZone,
    totalArrestCount,
    lifetimeStats,
  } as never);

  return (
    <div
      className={`min-h-screen ${isShaking ? "animate-screen-shake" : ""}`}
      style={{
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-serif)",
        paddingBottom: "120px", // Space for news ticker + mobile nav
      }}
    >
      {/* Danger overlay at high viral views */}
      {isHighDanger && (
        <div
          className="fixed inset-0 pointer-events-none z-10 animate-pulse"
          style={{
            background:
              "linear-gradient(to top, rgba(139, 47, 53, 0.15), transparent 50%)",
            boxShadow: "inset 0 0 100px rgba(139, 47, 53, 0.25)",
          }}
        />
      )}

      {/* Event banner */}
      <EventBanner />

      {/* Compact Header */}
      <header
        className={`relative text-center py-3 md:py-6 border-b overflow-hidden ${
          hasEvent ? "mt-14" : ""
        }`}
        style={{
          borderColor: "var(--color-border-card)",
          background:
            "linear-gradient(180deg, var(--color-bg-card), var(--color-bg-primary))",
        }}
      >
        {/* Classified watermark - hidden on mobile */}
        <div
          className="absolute inset-0 items-center justify-center pointer-events-none overflow-hidden hidden md:flex"
          style={{ opacity: 0.03 }}
        >
          <div
            className="text-[10rem] whitespace-nowrap rotate-[-10deg]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-danger)",
              letterSpacing: "0.3em",
            }}
          >
            CLASSIFIED
          </div>
        </div>

        {/* Desktop header buttons - inside header for proper layout */}
        <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center gap-2">
          {/* Music Toggle + Volume */}
          <div
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-highlight)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={toggleMusic}
              className="text-lg px-1 hover:scale-105 transition-transform"
              title={musicOn ? "Music On" : "Music Off"}
            >
              {musicOn ? "🎵" : "🎵"}
            </button>
            {musicOn && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                className="w-16 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: "var(--color-border-highlight)" }}
                title={`Volume: ${Math.round(musicVolume * 100)}%`}
              />
            )}
            {/* SFX Toggle */}
            <button
              onClick={toggleSound}
              className="text-lg px-1 hover:scale-105 transition-transform"
              title={soundOn ? "SFX On" : "SFX Off"}
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>
          {/* New Game */}
          <NewGameModal />
          {/* Achievements */}
          <Achievements />
          {/* Stats */}
          <StatsModal />
        </div>

        {/* Main title */}
        <div className="relative z-10 px-12 md:px-4">
          <h1
            className="text-xl sm:text-3xl md:text-5xl lg:text-6xl tracking-wider"
            style={{
              fontFamily: "var(--font-display)",
              background:
                "linear-gradient(135deg, var(--color-danger-bright), var(--color-corruption), var(--color-money-bright))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            MINNESOTA FRAUD EMPIRE
          </h1>
          {/* Tagline */}
          <p
            className="mt-1 text-[10px] sm:text-xs md:text-sm tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
          >
            $9 Billion. 14 Programs. One YouTuber.
          </p>
          {/* Prestige badge - inline on mobile */}
          {totalArrestCount > 0 && (
            <div
              className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] md:text-xs"
              style={{
                background: "var(--color-corruption)20",
                border: "1px solid var(--color-corruption-dim)",
              }}
            >
              <span style={{ color: "var(--color-corruption)" }}>⭐</span>
              <span
                style={{
                  color: "var(--color-corruption)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                +{GameStore.getPrestigeBonusPercent(totalArrestCount)}% INCOME
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`fixed right-3 w-10 h-10 rounded-lg z-50 flex items-center justify-center md:hidden transition-all ${
          hasEvent ? "top-[70px]" : "top-3"
        }`}
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-highlight)",
        }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className={`fixed right-3 z-50 rounded-lg p-2 space-y-1 md:hidden ${
            hasEvent ? "top-[120px]" : "top-14"
          }`}
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-highlight)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          <button
            onClick={() => {
              toggleSound();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {soundOn ? "🔊" : "🔇"} SFX {soundOn ? "On" : "Off"}
          </button>
          <button
            onClick={() => {
              toggleMusic();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {musicOn ? "🎵" : "🎵"} Music {musicOn ? "On" : "Off"}
          </button>
          {musicOn && (
            <div className="px-4 py-2 flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Vol
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: "var(--color-border-highlight)" }}
              />
            </div>
          )}
          <NewGameModal inMenu />
          <StatsModal inMenu />
          <Achievements inMenu />
        </div>
      )}


      {/* Main game area */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_340px] gap-6 max-w-6xl mx-auto">
          {/* Left column */}
          <div className="space-y-4">
            {/* Clicker + Mini Counter row */}
            <div
              className="rounded-xl p-4"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bg-card), var(--color-bg-primary))",
                border: "1px solid var(--color-border-card)",
              }}
            >
              <div className="flex items-center gap-6">
                <Clicker />
                <div className="flex-1">
                  <Counter />
                </div>
              </div>
            </div>

            {/* Viral Meter */}
            <div
              className="rounded-xl p-4"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bg-card), var(--color-bg-primary))",
                border: "1px solid var(--color-border-card)",
              }}
            >
              <ViralMeter />
            </div>

            {/* Zone selector */}
            <div
              className="rounded-xl p-4"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bg-card), var(--color-bg-primary))",
                border: "1px solid var(--color-border-card)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <h3
                    className="text-sm uppercase tracking-widest"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Fraud Zones
                  </h3>
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs px-3 py-1 rounded"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-highlight)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {showMap ? "List View" : "Map View"}
                </button>
              </div>
              {showMap ? <MinneapolisMap /> : <ZoneSelector />}
            </div>
          </div>

          {/* Right column - Upgrades */}
          <aside
            className="rounded-xl p-4 h-fit sticky transition-all duration-300"
            style={{
              top: hasEvent ? "72px" : "16px",
              background:
                "linear-gradient(145deg, var(--color-bg-card), var(--color-bg-primary))",
              border: "1px solid var(--color-border-card)",
            }}
          >
            <Upgrades />
          </aside>
        </div>

        {/* MOBILE/TABLET LAYOUT */}
        <div className="lg:hidden space-y-3">
          {/* Clicker - Always visible on mobile */}
          <div
            className="rounded-xl p-4 flex flex-col items-center"
            style={{
              background:
                "linear-gradient(145deg, var(--color-bg-card), var(--color-bg-primary))",
              border: "1px solid var(--color-border-card)",
            }}
          >
            <Clicker />

            {/* Compact stats row */}
            <div
              className="w-full mt-4 grid grid-cols-3 gap-2 text-center"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div
                className="p-2 rounded"
                style={{
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border-card)",
                }}
              >
                <div
                  className="text-[10px] uppercase"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Balance
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--color-money-bright)" }}
                >
                  {GameStore.formatMoney(money)}
                </div>
              </div>
              <div
                className="p-2 rounded"
                style={{
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border-card)",
                }}
              >
                <div
                  className="text-[10px] uppercase"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Per Click
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {GameStore.formatMoney(clickValue)}
                </div>
              </div>
              <div
                className="p-2 rounded"
                style={{
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border-card)",
                }}
              >
                <div
                  className="text-[10px] uppercase"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Passive
                </div>
                <div
                  className="text-sm font-bold"
                  style={{
                    color:
                      passiveIncome > 0
                        ? "var(--color-money-bright)"
                        : "var(--color-text-muted)",
                  }}
                >
                  {GameStore.formatMoney(passiveIncome)}/s
                </div>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-card)",
            }}
          >
            {(["play", "zones", "shop", "stats"] as MobileTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className="flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  background:
                    mobileTab === tab
                      ? "var(--color-corruption)25"
                      : "transparent",
                  color:
                    mobileTab === tab
                      ? "var(--color-corruption)"
                      : "var(--color-text-muted)",
                  borderBottom:
                    mobileTab === tab
                      ? "2px solid var(--color-corruption)"
                      : "2px solid transparent",
                }}
              >
                {tab === "play" && "📊 "}
                {tab === "zones" && "🗺️ "}
                {tab === "shop" && "🛒 "}
                {tab === "stats" && "📹 "}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            className="rounded-xl p-4"
            style={{
              background:
                "linear-gradient(145deg, var(--color-bg-card), var(--color-bg-primary))",
              border: "1px solid var(--color-border-card)",
              minHeight: "200px",
            }}
          >
            {mobileTab === "play" && <Counter />}
            {mobileTab === "zones" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-sm uppercase tracking-widest"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Fraud Zones
                  </h3>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border-highlight)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {showMap ? "List" : "Map"}
                  </button>
                </div>
                {showMap ? <MinneapolisMap /> : <ZoneSelector compact />}
              </>
            )}
            {mobileTab === "shop" && <Upgrades />}
            {mobileTab === "stats" && <ViralMeter />}
          </div>
        </div>
      </main>

      {/* News ticker */}
      <NewsTicker />

      {/* Trial/Game over modal */}
      <Trial />

      {/* Victory screen */}
      <Victory />

      {/* Golden claim floating bonus */}
      <GoldenClaim />
    </div>
  );
}

export default App;
