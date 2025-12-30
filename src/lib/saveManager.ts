import { useGameStore, type GameState } from "~/store/gameStore";

const SAVE_PREFIX = "minnesota-fraud-save-";
const CURRENT_SAVE_KEY = "minnesota-fraud-empire";

export type SaveMetadata = {
  name: string;
  timestamp: number;
  totalEarned: number;
  viralViews: number;
  activeZone: string;
  unlockedZones: number;
};

export type SaveData = {
  metadata: SaveMetadata;
  state: GameState;
};

/**
 * Get the storage key for a named save
 */
const getSaveKey = (name: string): string => `${SAVE_PREFIX}${name}`;

/**
 * List all saved games
 */
export const listSaves = (): SaveMetadata[] => {
  const saves: SaveMetadata[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(SAVE_PREFIX)) continue;
    
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      
      const data: SaveData = JSON.parse(raw);
      saves.push(data.metadata);
    } catch {
      // Skip corrupted saves
      console.warn(`Corrupted save: ${key}`);
    }
  }
  
  // Sort by timestamp, newest first
  return saves.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Save the current game to a named slot
 */
export const saveGame = (name: string): SaveMetadata => {
  const state = useGameStore.getState();
  
  // Extract only the state properties we want to save (not the action functions)
  const stateToSave: GameState = {
    money: state.money,
    totalEarned: state.totalEarned,
    fakeClaims: state.fakeClaims,
    viralViews: state.viralViews,
    nickShirleyLocation: state.nickShirleyLocation,
    nickFilmingProgress: state.nickFilmingProgress,
    threatLevel: state.threatLevel,
    maxThreatLevelReached: state.maxThreatLevelReached,
    isGameOver: state.isGameOver,
    isVictory: state.isVictory,
    victoryDismissed: state.victoryDismissed,
    isArrested: state.isArrested,
    isPaused: state.isPaused,
    activeZone: state.activeZone,
    unlockedZones: state.unlockedZones,
    ownedUpgrades: state.ownedUpgrades,
    activeEvent: state.activeEvent,
    eventEndTime: state.eventEndTime,
    unlockedAchievements: state.unlockedAchievements,
    totalArrestCount: state.totalArrestCount,
    prestigeBonuses: state.prestigeBonuses,
    goldenClaim: state.goldenClaim,
    lastGoldenClaimTime: state.lastGoldenClaimTime,
    discountEndTime: state.discountEndTime,
    shredderMinigame: state.shredderMinigame,
    lastShredderTime: state.lastShredderTime,
    hiredCrew: state.hiredCrew,
    hasSeenTutorial: state.hasSeenTutorial,
    hasSeenNickWarning: state.hasSeenNickWarning,
    lifetimeStats: state.lifetimeStats,
    lastTick: state.lastTick,
    gameStartTime: state.gameStartTime,
    zoneEnteredTime: state.zoneEnteredTime,
  };
  
  const metadata: SaveMetadata = {
    name,
    timestamp: Date.now(),
    totalEarned: state.totalEarned,
    viralViews: state.viralViews,
    activeZone: state.activeZone,
    unlockedZones: state.unlockedZones.length,
  };
  
  const saveData: SaveData = {
    metadata,
    state: stateToSave,
  };
  
  localStorage.setItem(getSaveKey(name), JSON.stringify(saveData));
  console.log(`💾 Game saved: "${name}"`);
  
  return metadata;
};

/**
 * Load a saved game by name
 */
export const loadGame = (name: string): boolean => {
  const key = getSaveKey(name);
  const raw = localStorage.getItem(key);
  
  if (!raw) {
    console.error(`Save not found: "${name}"`);
    return false;
  }
  
  try {
    const data: SaveData = JSON.parse(raw);
    
    // Load the state into the store
    useGameStore.setState({
      ...data.state,
      lastTick: Date.now(), // Reset tick timer to avoid time jumps
    });
    
    console.log(`📂 Game loaded: "${name}"`);
    return true;
  } catch (e) {
    console.error(`Failed to load save "${name}":`, e);
    return false;
  }
};

/**
 * Delete a saved game
 */
export const deleteSave = (name: string): boolean => {
  const key = getSaveKey(name);
  
  if (!localStorage.getItem(key)) {
    console.error(`Save not found: "${name}"`);
    return false;
  }
  
  localStorage.removeItem(key);
  console.log(`🗑️ Save deleted: "${name}"`);
  return true;
};

/**
 * Rename a saved game
 */
export const renameSave = (oldName: string, newName: string): boolean => {
  const oldKey = getSaveKey(oldName);
  const raw = localStorage.getItem(oldKey);
  
  if (!raw) {
    console.error(`Save not found: "${oldName}"`);
    return false;
  }
  
  try {
    const data: SaveData = JSON.parse(raw);
    data.metadata.name = newName;
    
    localStorage.setItem(getSaveKey(newName), JSON.stringify(data));
    localStorage.removeItem(oldKey);
    
    console.log(`📝 Save renamed: "${oldName}" → "${newName}"`);
    return true;
  } catch (e) {
    console.error(`Failed to rename save:`, e);
    return false;
  }
};

/**
 * Export a save as a downloadable JSON file
 */
export const exportSave = (name: string): void => {
  const key = getSaveKey(name);
  const raw = localStorage.getItem(key);
  
  if (!raw) {
    // Export current game if no name specified
    const currentRaw = localStorage.getItem(CURRENT_SAVE_KEY);
    if (!currentRaw) {
      console.error("No save to export");
      return;
    }
  }
  
  const data = raw ?? localStorage.getItem(CURRENT_SAVE_KEY);
  if (!data) return;
  
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `minnesota-fraud-${name || "current"}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log(`📤 Save exported: "${name || "current"}"`);
};

/**
 * Import a save from a JSON string
 */
export const importSave = (jsonString: string, name: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    
    // Check if it's a raw Zustand persist format or our save format
    const isZustandFormat = data.state && !data.metadata;
    
    if (isZustandFormat) {
      // Convert Zustand persist format to our format
      const state = data.state as GameState;
      const metadata: SaveMetadata = {
        name,
        timestamp: Date.now(),
        totalEarned: state.totalEarned,
        viralViews: state.viralViews,
        activeZone: state.activeZone,
        unlockedZones: state.unlockedZones.length,
      };
      const saveData: SaveData = { metadata, state };
      localStorage.setItem(getSaveKey(name), JSON.stringify(saveData));
    } else if (data.metadata && data.state) {
      // Our save format
      data.metadata.name = name;
      localStorage.setItem(getSaveKey(name), JSON.stringify(data));
    } else {
      console.error("Invalid save format");
      return false;
    }
    
    console.log(`📥 Save imported: "${name}"`);
    return true;
  } catch (e) {
    console.error("Failed to import save:", e);
    return false;
  }
};

/**
 * Quick save to a numbered slot
 */
export const quickSave = (slot: number = 1): SaveMetadata => 
  saveGame(`Quick Save ${slot}`);

/**
 * Quick load from a numbered slot
 */
export const quickLoad = (slot: number = 1): boolean => 
  loadGame(`Quick Save ${slot}`);

