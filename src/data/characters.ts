/**
 * Character definitions for AI-generated portraits
 * Style: Satirical political caricature, editorial cartoon aesthetic
 */

export type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
  /** AI-generated image path */
  image?: string;
  /** Prompt used for AI image generation */
  imagePrompt: string;
};

export const CHARACTERS: Character[] = [
  // Main antagonist
  {
    id: "nick-shirley",
    name: "Nick Shirley",
    role: "Investigative Journalist",
    description:
      "Independent YouTuber whose viral 42-minute video exposed the scandal",
    image: "/assets/generated/characters/nick-shirley.webp",
    imagePrompt:
      "young man with video camera, backwards baseball cap, intense focused eyes, trenchcoat, investigator searching for truth",
  },

  // Trial screen characters
  {
    id: "expensive-lawyer",
    name: "Expensive Lawyer",
    role: "Defense Attorney",
    description: "High-priced attorney who might get you off",
    image: "/assets/generated/characters/expensive-lawyer.webp",
    imagePrompt:
      "slick defense attorney, pinstripe suit, slicked back hair, confident smirk, expensive watch, leather briefcase",
  },
  {
    id: "public-defender",
    name: "Public Defender",
    role: "Court-Appointed Attorney",
    description: "Overworked public defender with a stack of cases",
    image: "/assets/generated/characters/public-defender.webp",
    imagePrompt:
      "exhausted lawyer, dark circles under eyes, loose tie, rumpled suit, overflowing folder of papers, coffee stains",
  },
  {
    id: "federal-judge",
    name: "Federal Judge",
    role: "U.S. District Court",
    description: "The one who decides your fate",
    image: "/assets/generated/characters/federal-judge.webp",
    imagePrompt:
      "stern elderly judge, black judicial robes, raised wooden gavel, American flag draped behind, piercing disapproving gaze",
  },

  // Event characters
  {
    id: "fbi-agent",
    name: "FBI Agent",
    role: "Federal Investigator",
    description: "Part of the FBI surge into Minneapolis",
    image: "/assets/generated/characters/fbi-agent.webp",
    imagePrompt:
      "stoic federal agent, dark suit and tie, reflective sunglasses, coiled earpiece, badge on belt, hands clasped",
  },
  {
    id: "dhs-official",
    name: "DHS Official",
    role: "Homeland Security",
    description: "Kristi Noem's strike team member",
    image: "/assets/generated/characters/dhs-official.webp",
    imagePrompt:
      "homeland security officer, tactical vest, radio on shoulder, stern expression, crew cut, folded arms",
  },
  {
    id: "tim-walz",
    name: "Tim Walz",
    role: "Minnesota Governor",
    description: "Administration was 'too trusting'",
    image: "/assets/generated/characters/tim-walz.webp",
    imagePrompt:
      "middle aged bald man with glasses, flannel shirt under blazer, nervous expression, hands raised defensively, sweating",
  },
  {
    id: "corrupt-inspector",
    name: "Corrupt Inspector",
    role: "State Compliance Officer",
    description: "Always finds children present... somehow",
    image: "/assets/generated/characters/corrupt-inspector.webp",
    imagePrompt:
      "sleazy bureaucrat, cheap suit, looking sideways, winking, clipboard tucked under arm, hand in pocket",
  },

  // Victory/celebration characters
  {
    id: "fraud-mastermind",
    name: "Fraud Mastermind",
    role: "Player Character",
    description: "The player's avatar - a successful fraud operator",
    image: "/assets/generated/characters/fraud-mastermind.webp",
    imagePrompt:
      "wealthy criminal boss, expensive three piece suit, gold rings, cigar, sitting on throne of stacked cash bundles, smug grin",
  },
];

export const getCharacter = (id: string): Character | undefined =>
  CHARACTERS.find((c) => c.id === id);

/**
 * Screen artwork definitions for major game screens
 */
export type ScreenArt = {
  id: string;
  name: string;
  description: string;
  /** AI-generated image path */
  image?: string;
  /** Prompt used for AI image generation */
  imagePrompt: string;
  /** Aspect ratio for generation */
  aspectRatio: "square" | "landscape_16_9" | "portrait_4_3";
};

export const SCREEN_ART: ScreenArt[] = [
  {
    id: "victory",
    name: "Victory Screen",
    description: "$9 Billion stolen - you win",
    image: "/assets/generated/screens/victory.webp",
    imagePrompt:
      "golden trophy overflowing with cash, money raining from above, spotlights, champagne bottles popping, confetti",
    aspectRatio: "landscape_16_9",
  },
  {
    id: "trial-arrest",
    name: "Trial/Arrest Screen",
    description: "FBI caught you",
    image: "/assets/generated/screens/trial-arrest.webp",
    imagePrompt:
      "steel handcuffs snapping closed on wrists, police lights flashing, federal agents in silhouette, dramatic shadows",
    aspectRatio: "landscape_16_9",
  },
  {
    id: "trial-courtroom",
    name: "Courtroom Scene",
    description: "Federal trial in progress",
    image: "/assets/generated/screens/trial-courtroom.webp",
    imagePrompt:
      "grand federal courtroom interior, wooden judge bench, American flag, empty witness stand, ceiling lights",
    aspectRatio: "landscape_16_9",
  },
  {
    id: "verdict-guilty",
    name: "Guilty Verdict",
    description: "Convicted of fraud",
    image: "/assets/generated/screens/verdict-guilty.webp",
    imagePrompt:
      "wooden gavel striking down hard, iron prison bars, heavy chains, dark ominous shadows closing in",
    aspectRatio: "square",
  },
  {
    id: "verdict-acquitted",
    name: "Acquittal",
    description: "Not guilty - you walked free",
    image: "/assets/generated/screens/verdict-acquitted.webp",
    imagePrompt:
      "courthouse doors swinging open wide, bright golden light streaming through, silhouette walking to freedom",
    aspectRatio: "square",
  },
  {
    id: "game-header",
    name: "Game Header Background",
    description: "Main title area backdrop",
    image: "/assets/generated/screens/game-header.webp",
    imagePrompt:
      "scattered manila folders and documents, red string connecting photos on corkboard, detective desk, magnifying glass",
    aspectRatio: "landscape_16_9",
  },
];

export const getScreenArt = (id: string): ScreenArt | undefined =>
  SCREEN_ART.find((s) => s.id === id);
