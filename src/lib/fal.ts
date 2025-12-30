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

// Style anchors for consistent generation
// Simple oil painting style - hides AI artifacts, consistent across all assets
export const STYLE_ANCHORS = {
  zone: "oil painting, dark moody palette, visible brushstrokes, muted colors, atmospheric",
  upgrade: "oil painting, dark background, single object, visible brushstrokes, muted gold tones",
  character: "oil painting portrait, dark background, rembrandt lighting, visible brushstrokes",
  screen: "oil painting, dramatic composition, dark palette, visible brushstrokes, cinematic",
} as const;

// Negative prompt to block common AI issues
export const NEGATIVE_PROMPT = "text, words, letters, numbers, watermark, signature, blurry, deformed, disfigured, bad anatomy, extra limbs, cartoon, anime, 3d render, cgi";

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
