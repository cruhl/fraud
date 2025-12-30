/**
 * Asset URL management and path helpers for generated images
 */

// Base path for generated assets in public folder
const ASSETS_BASE = "/assets/generated";

export const ASSET_PATHS = {
  zones: `${ASSETS_BASE}/zones`,
  upgrades: `${ASSETS_BASE}/upgrades`,
  characters: `${ASSETS_BASE}/characters`,
  screens: `${ASSETS_BASE}/screens`,
  events: `${ASSETS_BASE}/events`,
} as const;

/**
 * Get the URL for a zone image
 */
export function getZoneImageUrl(zoneId: string): string {
  return `${ASSET_PATHS.zones}/${zoneId}.webp`;
}

/**
 * Get the URL for an upgrade icon
 */
export function getUpgradeImageUrl(upgradeId: string): string {
  return `${ASSET_PATHS.upgrades}/${upgradeId}.webp`;
}

/**
 * Get the URL for a character portrait
 */
export function getCharacterImageUrl(characterId: string): string {
  return `${ASSET_PATHS.characters}/${characterId}.webp`;
}

/**
 * Get the URL for a screen image (victory, trial, etc.)
 */
export function getScreenImageUrl(screenId: string): string {
  return `${ASSET_PATHS.screens}/${screenId}.webp`;
}

/**
 * Get the URL for an event image
 */
export function getEventImageUrl(eventId: string): string {
  return `${ASSET_PATHS.events}/${eventId}.webp`;
}

/**
 * Check if an image exists (for fallback to emoji)
 * Returns a promise that resolves to true if image loads, false otherwise
 */
export function imageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Preload an array of images
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve anyway to not block
          img.src = url;
        })
    )
  );
}

