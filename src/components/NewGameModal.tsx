import { useState, useCallback, useRef } from "react";
import { useGameStore, GameStore } from "~/store/gameStore";
import {
  listSaves,
  saveGame,
  loadGame,
  deleteSave,
  exportSave,
  importSave,
  type SaveMetadata,
} from "~/lib/saveManager";

type Tab = "saves" | "new-game";

type NewGameModalProps = {
  inMenu?: boolean;
};

export function NewGameModal({ inMenu = false }: NewGameModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("saves");
  const [confirmingReset, setConfirmingReset] = useState<"fresh" | "full" | null>(null);
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [newSaveName, setNewSaveName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const newGame = useGameStore((s) => s.newGame);
  const fullReset = useGameStore((s) => s.fullReset);
  const totalArrestCount = useGameStore((s) => s.totalArrestCount);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const lifetimeStats = useGameStore((s) => s.lifetimeStats);

  const refreshSaves = useCallback(() => {
    setSaves(listSaves());
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpen = () => {
    refreshSaves();
    setShowModal(true);
    setMessage(null);
    setConfirmingReset(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setConfirmingReset(null);
    setConfirmDelete(null);
    setNewSaveName("");
  };

  const handleSave = useCallback(() => {
    const name = newSaveName.trim() || `Save ${new Date().toLocaleString()}`;
    saveGame(name);
    setNewSaveName("");
    refreshSaves();
    showMessage(`Saved: "${name}"`, "success");
  }, [newSaveName, refreshSaves]);

  const handleLoad = useCallback((name: string) => {
    const success = loadGame(name);
    success
      ? showMessage(`Loaded: "${name}"`, "success")
      : showMessage(`Failed to load: "${name}"`, "error");
    if (success) handleClose();
  }, []);

  const handleDelete = useCallback((name: string) => {
    if (confirmDelete === name) {
      deleteSave(name);
      setConfirmDelete(null);
      refreshSaves();
      showMessage(`Deleted: "${name}"`, "success");
    } else {
      setConfirmDelete(name);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }, [confirmDelete, refreshSaves]);

  const handleExport = useCallback((name: string) => {
    exportSave(name);
    showMessage(`Exported: "${name}"`, "success");
  }, []);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const name = file.name.replace(/\.json$/, "").replace(/^minnesota-fraud-/, "");
      const success = importSave(content, name);
      success
        ? showMessage(`Imported: "${name}"`, "success")
        : showMessage("Failed to import save", "error");
      if (success) refreshSaves();
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [refreshSaves]);

  const formatTimestamp = (ts: number) => {
    const diffMs = Date.now() - ts;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handleFreshStart = () => {
    if (confirmingReset === "fresh") {
      newGame();
      handleClose();
    } else {
      setConfirmingReset("fresh");
    }
  };

  const handleFullReset = () => {
    if (confirmingReset === "full") {
      fullReset();
      handleClose();
    } else {
      setConfirmingReset("full");
    }
  };

  // Button that appears in menu or header
  const triggerButton = inMenu ? (
    <button
      onClick={handleOpen}
      className="w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2 cursor-pointer"
      style={{ color: "var(--color-text-primary)" }}
    >
      🎮 Game Menu
    </button>
  ) : (
    <button
      onClick={handleOpen}
      className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105 cursor-pointer"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-highlight)",
        color: "var(--color-text-muted)",
      }}
      title="Game Menu"
    >
      🎮 Menu
    </button>
  );

  if (!showModal) return triggerButton;

  return (
    <>
      {triggerButton}
      
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      
      {/* Modal overlay */}
      <div
        className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-fade-in"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={handleClose}
      >
        <div
          className="max-w-md w-full overflow-hidden rounded-xl animate-slide-in-up"
          style={{
            background: "linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-primary))",
            border: "2px solid var(--color-border-highlight)",
            boxShadow: "0 0 60px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 text-center"
            style={{
              background: "linear-gradient(135deg, var(--color-corruption), var(--color-corruption-dim))",
            }}
          >
            <div className="text-4xl mb-2">🎮</div>
            <h2
              className="text-xl tracking-widest"
              style={{ fontFamily: "var(--font-display)", color: "white" }}
            >
              GAME MENU
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: "var(--color-border-card)" }}>
            <button
              onClick={() => { setActiveTab("saves"); setConfirmingReset(null); }}
              className="flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-display)",
                color: activeTab === "saves" ? "var(--color-text-primary)" : "var(--color-text-muted)",
                background: activeTab === "saves" ? "var(--color-bg-elevated)" : "transparent",
                borderBottom: activeTab === "saves" ? "2px solid var(--color-corruption)" : "2px solid transparent",
              }}
            >
              💾 SAVES
            </button>
            <button
              onClick={() => { setActiveTab("new-game"); setConfirmDelete(null); }}
              className="flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-display)",
                color: activeTab === "new-game" ? "var(--color-text-primary)" : "var(--color-text-muted)",
                background: activeTab === "new-game" ? "var(--color-bg-elevated)" : "transparent",
                borderBottom: activeTab === "new-game" ? "2px solid var(--color-corruption)" : "2px solid transparent",
              }}
            >
              🔄 NEW GAME
            </button>
          </div>

          {/* Message banner */}
          {message && (
            <div
              className="px-4 py-2 text-sm font-medium text-center"
              style={{
                background: message.type === "success" ? "var(--color-success)20" : "var(--color-danger)20",
                color: message.type === "success" ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {message.text}
            </div>
          )}

          {/* Tab content */}
          <div className="p-4 space-y-3" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {activeTab === "saves" && (
              <>
                {/* Save current game */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSaveName}
                    onChange={(e) => setNewSaveName(e.target.value)}
                    placeholder="Save name (optional)"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border-card)",
                      color: "var(--color-text-primary)",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
                    style={{
                      background: "var(--color-success)",
                      color: "white",
                    }}
                  >
                    Save
                  </button>
                </div>

                {/* Import button */}
                <button
                  onClick={handleImport}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  📥 Import save from file
                </button>

                {/* Saves list */}
                {saves.length === 0 ? (
                  <div
                    className="py-6 text-center rounded-lg"
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border-card)",
                    }}
                  >
                    <div className="text-2xl mb-2">📁</div>
                    <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      No saved games yet
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {saves.map((save) => (
                      <div
                        key={save.name}
                        className="p-3 rounded-lg"
                        style={{
                          background: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border-card)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-semibold text-sm truncate"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {save.name}
                            </div>
                            <div
                              className="text-[10px] flex items-center gap-2"
                              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                            >
                              <span>{formatTimestamp(save.timestamp)}</span>
                              <span>•</span>
                              <span style={{ color: "var(--color-money)" }}>
                                {GameStore.formatMoney(save.totalEarned)}
                              </span>
                              <span>•</span>
                              <span>{save.unlockedZones} zones</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleLoad(save.name)}
                            className="flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all hover:scale-[1.02] cursor-pointer"
                            style={{
                              background: "var(--color-corruption)",
                              color: "white",
                            }}
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleExport(save.name)}
                            className="px-2 py-1.5 rounded text-xs transition-colors cursor-pointer"
                            style={{
                              background: "var(--color-bg-elevated)",
                              border: "1px solid var(--color-border-card)",
                              color: "var(--color-text-secondary)",
                            }}
                            title="Export"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => handleDelete(save.name)}
                            className="px-2 py-1.5 rounded text-xs transition-colors cursor-pointer"
                            style={{
                              background: confirmDelete === save.name ? "var(--color-danger)" : "var(--color-bg-elevated)",
                              border: `1px solid ${confirmDelete === save.name ? "var(--color-danger)" : "var(--color-border-card)"}`,
                              color: confirmDelete === save.name ? "white" : "var(--color-text-muted)",
                            }}
                            title="Delete"
                          >
                            {confirmDelete === save.name ? "Sure?" : "🗑️"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="text-center text-[10px] pt-2"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Saves stored in browser local storage
                </div>
              </>
            )}

            {activeTab === "new-game" && (
              <>
                {/* Current progress summary */}
                <div
                  className="rounded-lg p-4 space-y-2 text-sm"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-card)",
                  }}
                >
                  <div
                    className="text-xs uppercase tracking-wider mb-2"
                    style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-display)" }}
                  >
                    Current Progress
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Total Earned (this run):</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-money)" }}>
                      {GameStore.formatMoney(totalEarned)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Prestige Level:</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-corruption)" }}>
                      {totalArrestCount} arrest{totalArrestCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Achievements:</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                      {unlockedAchievements.length} unlocked
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Lifetime Earnings:</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-money-bright)" }}>
                      {GameStore.formatMoney(lifetimeStats?.totalMoneyEarned ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Fresh Start option */}
                <button
                  onClick={handleFreshStart}
                  className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: confirmingReset === "fresh" 
                      ? "var(--color-corruption)30" 
                      : "var(--color-bg-elevated)",
                    border: `2px solid ${confirmingReset === "fresh" ? "var(--color-corruption)" : "var(--color-border-highlight)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                        {confirmingReset === "fresh" ? "CLICK AGAIN TO CONFIRM" : "FRESH START"}
                      </div>
                      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Reset game progress but <span style={{ color: "var(--color-corruption)" }}>keep achievements & prestige bonuses</span>
                      </div>
                      {totalArrestCount > 0 && (
                        <div className="text-xs mt-1" style={{ color: "var(--color-corruption-dim)" }}>
                          You'll keep your +{GameStore.getPrestigeBonusPercent(totalArrestCount)}% income bonus
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Full Reset option */}
                <button
                  onClick={handleFullReset}
                  className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: confirmingReset === "full"
                      ? "var(--color-danger)30"
                      : "var(--color-bg-elevated)",
                    border: `2px solid ${confirmingReset === "full" ? "var(--color-danger)" : "var(--color-border-card)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💀</span>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: confirmingReset === "full" ? "var(--color-danger-bright)" : "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                        {confirmingReset === "full" ? "ARE YOU SURE? CLICK AGAIN" : "FULL RESET"}
                      </div>
                      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        <span style={{ color: "var(--color-danger)" }}>Wipe everything</span> - achievements, prestige, all stats
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--color-text-dim)" }}>
                        Start completely fresh like a new player
                      </div>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Cancel button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg font-bold transition-all cursor-pointer"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-card)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
