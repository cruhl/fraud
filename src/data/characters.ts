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
  // Main antagonist - Nick Shirley: real person, young white YouTuber journalist
  {
    id: "nick-shirley",
    name: "Nick Shirley",
    role: "Investigative Journalist",
    description:
      "Independent YouTuber whose viral 42-minute video exposed the scandal",
    image: "/assets/generated/characters/nick-shirley.webp",
    imagePrompt:
      "young white male early 20s, short brown hair, light stubble on chin, wearing casual grey hoodie, holding professional camera up to eye, intense focused expression, dramatic side lighting, dark moody background, visible brushstrokes",
  },

  // Trial screen characters
  {
    id: "expensive-lawyer",
    name: "Expensive Lawyer",
    role: "Defense Attorney",
    description: "High-priced attorney who might get you off",
    image: "/assets/generated/characters/expensive-lawyer.webp",
    imagePrompt:
      "distinguished white male 50s, slicked back silver hair, sharp features, tailored navy suit red silk tie, confident smirk, dramatic chiaroscuro lighting, rich warm tones, dark background, visible brushstrokes",
  },
  {
    id: "public-defender",
    name: "Public Defender",
    role: "Court-Appointed Attorney",
    description: "Overworked public defender with a stack of cases",
    image: "/assets/generated/characters/public-defender.webp",
    imagePrompt:
      "tired white female 40s, messy brown hair in bun, dark circles under eyes, glasses pushed up on forehead, wrinkled blouse loose tie, holding overflowing manila folders, exhausted expression, harsh fluorescent lighting effect, muted colors, visible brushstrokes",
  },
  {
    id: "federal-judge",
    name: "Federal Judge",
    role: "U.S. District Court",
    description: "The one who decides your fate",
    image: "/assets/generated/characters/federal-judge.webp",
    imagePrompt:
      "stern elderly white male 70s, thick white hair, deep wrinkles jowls, silver reading glasses, black judicial robes, holding wooden gavel, cold disapproving glare, dramatic overhead lighting, dark shadowy background, visible brushstrokes",
  },

  // Event characters
  {
    id: "fbi-agent",
    name: "FBI Agent",
    role: "Federal Investigator",
    description: "Part of the FBI surge into Minneapolis",
    image: "/assets/generated/characters/fbi-agent.webp",
    imagePrompt:
      "serious Black male 30s, short cropped hair, clean shaven, dark sunglasses hiding eyes, charcoal suit white shirt black tie, earpiece, stoic neutral expression, harsh direct lighting, dark blue background, visible brushstrokes",
  },
  {
    id: "dhs-official",
    name: "DHS Official",
    role: "Homeland Security",
    description: "Kristi Noem's strike team member",
    image: "/assets/generated/characters/dhs-official.webp",
    imagePrompt:
      "intimidating muscular white male 40s, military buzzcut, thick neck square jaw, cold blue eyes, black tactical vest with pouches, silver badge, arms crossed, threatening stare, harsh overhead lighting, concrete grey background, visible brushstrokes",
  },
  {
    id: "tim-walz",
    name: "Tim Walz",
    role: "Minnesota Governor",
    description: "Administration was 'too trusting'",
    image: "/assets/generated/characters/tim-walz.webp",
    imagePrompt:
      "white male 60, chubby round face soft jawline, full grey white hair swept to side, thin light grey rectangular glasses, clean shaven, big friendly smile showing teeth, dark suit white shirt, warm approachable midwestern dad look, warm lighting, neutral background, visible brushstrokes",
  },
  {
    id: "corrupt-inspector",
    name: "Corrupt Inspector",
    role: "State Compliance Officer",
    description: "Always finds children present... somehow",
    image: "/assets/generated/characters/corrupt-inspector.webp",
    imagePrompt:
      "sleazy white male 50s, thinning greasy combover, small beady eyes winking, bulbous red nose, cheap brown polyester suit, yellowed shirt crooked tie, holding clipboard, oily insincere smile, unflattering fluorescent lighting, beige background, visible brushstrokes",
  },

  // Victory/celebration characters
  {
    id: "fraud-mastermind",
    name: "Fraud Mastermind",
    role: "Player Character",
    description: "The player's avatar - a successful fraud operator",
    image: "/assets/generated/characters/fraud-mastermind.webp",
    imagePrompt:
      "powerful Somali male 40s, dark skin, short black hair greying temples, strong cheekbones, short goatee, expensive black suit, white shirt open collar showing gold chain, gold rings, holding lit cigar with smoke, supremely confident grin, dramatic golden side lighting, dark background, visible brushstrokes",
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
      "towering pile of cash and gold bars, champagne bottle exploding, golden confetti, dramatic spotlight from above, deep shadows, celebration excess wealth, rich golds and greens, thick visible brushstrokes, oil painting style",
    aspectRatio: "landscape_16_9",
  },
  {
    id: "trial-arrest",
    name: "Trial/Arrest Screen",
    description: "FBI caught you",
    image: "/assets/generated/screens/trial-arrest.webp",
    imagePrompt:
      "steel handcuffs clicking shut on wrists, red and blue police lights flashing in rain, wet pavement reflections, cold harsh lighting, noir atmosphere, despair and capture, visible brushstrokes, oil painting style",
    aspectRatio: "landscape_16_9",
  },
  {
    id: "trial-courtroom",
    name: "Courtroom Scene",
    description: "Federal trial in progress",
    image: "/assets/generated/screens/trial-courtroom.webp",
    imagePrompt:
      "grand federal courtroom interior from defendant view, dark wood paneling, elevated judge bench, American flag, empty jury box, warm afternoon light through tall windows, solemn oppressive atmosphere, visible brushstrokes, oil painting style",
    aspectRatio: "landscape_16_9",
  },
  {
    id: "verdict-guilty",
    name: "Guilty Verdict",
    description: "Convicted of fraud",
    image: "/assets/generated/screens/verdict-guilty.webp",
    imagePrompt:
      "gavel slamming down, looking through thick iron prison bars, harsh single overhead light, deep black shadows, doom imprisonment, stark simple composition, visible brushstrokes, oil painting style",
    aspectRatio: "square",
  },
  {
    id: "verdict-acquitted",
    name: "Acquittal",
    description: "Not guilty - you walked free",
    image: "/assets/generated/screens/verdict-acquitted.webp",
    imagePrompt:
      "massive wooden doors swinging wide open, brilliant golden sunlight flooding through, silhouette walking toward light arms raised in victory, dark interior contrasting bright exterior, freedom hope, visible brushstrokes, oil painting style",
    aspectRatio: "square",
  },
  {
    id: "game-header",
    name: "Game Header Background",
    description: "Main title area backdrop",
    image: "/assets/generated/screens/game-header.webp",
    imagePrompt:
      "conspiracy corkboard with photos connected by red string, newspaper clippings pinned up, wooden desk scattered with manila folders, green banker lamp casting warm glow, dark moody shadows, noir detective aesthetic, visible brushstrokes, oil painting style",
    aspectRatio: "landscape_16_9",
  },
];

export const getScreenArt = (id: string): ScreenArt | undefined =>
  SCREEN_ART.find((s) => s.id === id);
