#!/usr/bin/env npx tsx
/**
 * Asset Generation Script for Minnesota Fraud Empire
 *
 * Usage:
 *   npx tsx scripts/generate-assets.ts [category]
 *
 * Categories:
 *   - screens   (Major game screens - highest impact)
 *   - characters (Character portraits)
 *   - zones     (Zone illustrations)
 *   - upgrades  (Upgrade icons)
 *   - all       (Generate everything)
 *
 * Requires FAL_KEY in .env file or environment
 */

import "dotenv/config";
import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import { ZONES } from "../src/data/zones";
import { UPGRADES } from "../src/data/upgrades";
import { CHARACTERS, SCREEN_ART } from "../src/data/characters";
import { STYLE_ANCHORS, NEGATIVE_PROMPT } from "../src/lib/fal";

// Configure Fal AI
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("❌ FAL_KEY environment variable is required");
  console.error(
    "Usage: FAL_KEY=your_key npx tsx scripts/generate-assets.ts [category]"
  );
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

// Output directories
const OUTPUT_BASE = path.join(process.cwd(), "public/assets/generated");
const OUTPUT_DIRS = {
  zones: path.join(OUTPUT_BASE, "zones"),
  upgrades: path.join(OUTPUT_BASE, "upgrades"),
  characters: path.join(OUTPUT_BASE, "characters"),
  screens: path.join(OUTPUT_BASE, "screens"),
  events: path.join(OUTPUT_BASE, "events"),
};

// Ensure output directories exist
Object.values(OUTPUT_DIRS).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

type ImageSize =
  | "square"
  | "landscape_4_3"
  | "landscape_16_9"
  | "portrait_4_3"
  | "portrait_16_9";

interface GenerationResult {
  id: string;
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Generate a single image using Fast SDXL (supports negative prompts)
 */
async function generateImage(
  prompt: string,
  outputPath: string,
  imageSize: ImageSize = "square"
): Promise<boolean> {
  try {
    console.log(`  🎨 Generating: ${path.basename(outputPath)}`);
    console.log(`     Prompt: ${prompt.slice(0, 80)}...`);

    const result = await fal.subscribe("fal-ai/fast-sdxl", {
      input: {
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        image_size: imageSize,
        num_images: 1,
      },
    });

    const data = result.data as { images: { url: string }[] };
    if (!data.images?.[0]?.url) {
      throw new Error("No image URL in response");
    }

    // Download the image
    const imageUrl = data.images[0].url;
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    console.log(`  ✅ Saved: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed: ${path.basename(outputPath)} - ${error}`);
    return false;
  }
}

/**
 * Generate screen artwork (highest priority)
 */
async function generateScreens(): Promise<GenerationResult[]> {
  console.log("\n📺 Generating Screen Artwork...\n");
  const results: GenerationResult[] = [];

  for (const screen of SCREEN_ART) {
    const outputPath = path.join(OUTPUT_DIRS.screens, `${screen.id}.webp`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  ⏭️  Skipping (exists): ${screen.id}`);
      results.push({ id: screen.id, success: true, path: outputPath });
      continue;
    }

    const fullPrompt = `${screen.imagePrompt}, ${STYLE_ANCHORS.screen}`;
    const aspectRatio =
      screen.aspectRatio === "landscape_16_9"
        ? ("landscape_16_9" as ImageSize)
        : screen.aspectRatio === "portrait_4_3"
        ? ("portrait_4_3" as ImageSize)
        : ("square" as ImageSize);

    const success = await generateImage(fullPrompt, outputPath, aspectRatio);
    results.push({
      id: screen.id,
      success,
      path: success ? outputPath : undefined,
    });

    // Rate limiting delay
    await delay(500);
  }

  return results;
}

/**
 * Generate character portraits
 */
async function generateCharacters(): Promise<GenerationResult[]> {
  console.log("\n👤 Generating Character Portraits...\n");
  const results: GenerationResult[] = [];

  for (const character of CHARACTERS) {
    const outputPath = path.join(
      OUTPUT_DIRS.characters,
      `${character.id}.webp`
    );

    if (fs.existsSync(outputPath)) {
      console.log(`  ⏭️  Skipping (exists): ${character.id}`);
      results.push({ id: character.id, success: true, path: outputPath });
      continue;
    }

    const fullPrompt = `${character.imagePrompt}, ${STYLE_ANCHORS.character}`;
    const success = await generateImage(fullPrompt, outputPath, "square");
    results.push({
      id: character.id,
      success,
      path: success ? outputPath : undefined,
    });

    await delay(500);
  }

  return results;
}

/**
 * Generate zone illustrations
 */
async function generateZones(): Promise<GenerationResult[]> {
  console.log("\n🗺️  Generating Zone Illustrations...\n");
  const results: GenerationResult[] = [];

  for (const zone of ZONES) {
    if (!zone.imagePrompt) continue;

    const outputPath = path.join(OUTPUT_DIRS.zones, `${zone.id}.webp`);

    if (fs.existsSync(outputPath)) {
      console.log(`  ⏭️  Skipping (exists): ${zone.id}`);
      results.push({ id: zone.id, success: true, path: outputPath });
      continue;
    }

    const fullPrompt = `${zone.imagePrompt}, ${STYLE_ANCHORS.zone}`;
    const success = await generateImage(
      fullPrompt,
      outputPath,
      "landscape_4_3"
    );
    results.push({
      id: zone.id,
      success,
      path: success ? outputPath : undefined,
    });

    await delay(500);
  }

  return results;
}

/**
 * Generate upgrade icons
 */
async function generateUpgrades(): Promise<GenerationResult[]> {
  console.log("\n🔧 Generating Upgrade Icons...\n");
  const results: GenerationResult[] = [];

  for (const upgrade of UPGRADES) {
    if (!upgrade.imagePrompt) continue;

    const outputPath = path.join(OUTPUT_DIRS.upgrades, `${upgrade.id}.webp`);

    if (fs.existsSync(outputPath)) {
      console.log(`  ⏭️  Skipping (exists): ${upgrade.id}`);
      results.push({ id: upgrade.id, success: true, path: outputPath });
      continue;
    }

    const fullPrompt = `${upgrade.imagePrompt}, ${STYLE_ANCHORS.upgrade}`;
    const success = await generateImage(fullPrompt, outputPath, "square");
    results.push({
      id: upgrade.id,
      success,
      path: success ? outputPath : undefined,
    });

    await delay(500);
  }

  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSummary(category: string, results: GenerationResult[]) {
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n📊 ${category} Summary:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total: ${results.length}`);
}

async function main() {
  const category = process.argv[2] || "all";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🎰 Minnesota Fraud Empire - Asset Generator");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Category: ${category}`);
  console.log(`  Output: ${OUTPUT_BASE}`);
  console.log("═══════════════════════════════════════════════════════════");

  const allResults: { [key: string]: GenerationResult[] } = {};

  switch (category) {
    case "screens":
      allResults.screens = await generateScreens();
      printSummary("Screens", allResults.screens);
      break;

    case "characters":
      allResults.characters = await generateCharacters();
      printSummary("Characters", allResults.characters);
      break;

    case "zones":
      allResults.zones = await generateZones();
      printSummary("Zones", allResults.zones);
      break;

    case "upgrades":
      allResults.upgrades = await generateUpgrades();
      printSummary("Upgrades", allResults.upgrades);
      break;

    case "all":
      // Generate in order of visual impact
      allResults.screens = await generateScreens();
      printSummary("Screens", allResults.screens);

      allResults.characters = await generateCharacters();
      printSummary("Characters", allResults.characters);

      allResults.zones = await generateZones();
      printSummary("Zones", allResults.zones);

      allResults.upgrades = await generateUpgrades();
      printSummary("Upgrades", allResults.upgrades);
      break;

    default:
      console.error(`\n❌ Unknown category: ${category}`);
      console.log(
        "Available categories: screens, characters, zones, upgrades, all"
      );
      process.exit(1);
  }

  // Final summary
  const totalSuccess = Object.values(allResults)
    .flat()
    .filter((r) => r.success).length;
  const totalFailed = Object.values(allResults)
    .flat()
    .filter((r) => !r.success).length;

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  🏁 Generation Complete!");
  console.log(`     Total Successful: ${totalSuccess}`);
  console.log(`     Total Failed: ${totalFailed}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Exit with error code if any failed
  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
