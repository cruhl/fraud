import { fal } from "@fal-ai/client";

// Configure Fal AI client
// The API key should be set via environment variable FAL_KEY
// For local development, you can also pass it directly to configure()
export function configureFal(apiKey?: string) {
  if (apiKey) {
    fal.config({ credentials: apiKey });
  }
  // If no key provided, fal-ai/client will look for FAL_KEY env var
}

export type ImageGenerationParams = {
  prompt: string;
  negativePrompt?: string;
  imageSize?:
    | "square"
    | "landscape_4_3"
    | "landscape_16_9"
    | "portrait_4_3"
    | "portrait_16_9";
  numImages?: number;
  seed?: number;
};

export type GeneratedImage = {
  url: string;
  width: number;
  height: number;
  content_type: string;
};

export type ImageGenerationResult = {
  images: GeneratedImage[];
  seed: number;
  prompt: string;
};

/**
 * Generate images using Fal AI's fast SDXL model
 * Good for quick iterations and testing
 */
export async function generateImageFast(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  const result = await fal.subscribe("fal-ai/fast-sdxl", {
    input: {
      prompt: params.prompt,
      negative_prompt:
        params.negativePrompt ?? "blurry, low quality, distorted, deformed",
      image_size: params.imageSize ?? "square",
      num_images: params.numImages ?? 1,
      seed: params.seed,
    },
  });

  return result.data as ImageGenerationResult;
}

/**
 * Generate high-quality images using Fal AI's FLUX model
 * Better quality but slower
 */
export async function generateImageFlux(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: params.prompt,
      image_size: params.imageSize ?? "square",
      num_images: params.numImages ?? 1,
      seed: params.seed,
    },
  });

  return result.data as ImageGenerationResult;
}

/**
 * Generate images with FLUX Pro for highest quality
 */
export async function generateImageFluxPro(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  const result = await fal.subscribe("fal-ai/flux-pro", {
    input: {
      prompt: params.prompt,
      image_size: params.imageSize ?? "square",
      num_images: params.numImages ?? 1,
      seed: params.seed,
    },
  });

  return result.data as ImageGenerationResult;
}

// ============================================
// SHARED STYLE CONSTANTS
// ============================================

// Lighting - consistent across all images
export const LIGHTING = {
  portrait:
    "soft diffused studio lighting from upper left at 45 degrees, subtle fill light from right, dark gradient background",
  scene: "warm golden hour side lighting, soft shadows, atmospheric haze",
  dramatic: "single harsh spotlight from above, deep shadows, high contrast",
} as const;

// Medium - oil painting style hides AI artifacts
export const MEDIUM =
  "modern oil painting, visible brushstrokes, rich color saturation, thick impasto texture";

// Background - keep simple to avoid artifacts
export const BACKGROUND = {
  portrait: "solid dark brown gradient background fading to black",
  scene: "atmospheric depth, soft focus background",
} as const;

// Negative prompt - block common issues
export const NEGATIVE_PROMPT =
  "text, words, letters, numbers, watermark, signature, blurry, deformed, disfigured, bad anatomy, extra limbs, cartoon, anime, 3d render, cgi, frame, border, grid, multiple images, collage, tiled, pattern, repeating";

// Combined style anchors using constants
export const STYLE_ANCHORS = {
  zone: `${MEDIUM}, ${LIGHTING.scene}, ${BACKGROUND.scene}`,
  upgrade: `${MEDIUM}, ${LIGHTING.dramatic}, solid black background`,
  character: `${MEDIUM}, ${LIGHTING.portrait}, ${BACKGROUND.portrait}`,
  screen: `${MEDIUM}, ${LIGHTING.dramatic}, ${BACKGROUND.scene}`,
} as const;

// Character base attributes - use in prompts
export const CHARACTER_BASE = {
  prefix: "single person portrait, head and shoulders",
  suffix: `${LIGHTING.portrait}, ${BACKGROUND.portrait}`,
} as const;

// Screen base attributes
export const SCREEN_BASE = {
  suffix: `${LIGHTING.dramatic}`,
} as const;

/**
 * Build a prompt with style anchors
 */
export function buildPrompt(
  basePrompt: string,
  style: keyof typeof STYLE_ANCHORS
): string {
  return `${basePrompt}, ${STYLE_ANCHORS[style]}`;
}

export { fal };
