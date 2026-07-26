/**
 * Modular prompt-engineering system.
 *
 * Combines pet type + theme + personality + traits into a single
 * production-ready prompt for an image-generation model.
 *
 * Themes and personalities are intentionally typed as plain strings so the
 * caller can pass IDs sourced from anywhere (local data, themes table, etc.).
 */

export type GenerationInput = {
  petType?: string;           // "golden retriever", "tabby cat", "pet" (fallback)
  artStyleId?: string;        // "oil-painting" | "pixar-3d" | "comic-book"
  themeId: string;            // "royal" | "mafia" | "viking" | ...
  themeName?: string;         // "Royal" — human readable
  personalityId: string;      // "noble-king" | "tiny-tyrant" | ...
  personalityName?: string;
  personalityDesc?: string;   // short flavour line from UI
  traits?: string[];          // ["grumpy", "chaotic"]
  petName?: string;
  personalisationText?: string; // optional text to include on portrait (max 30 chars)
};

export const ART_STYLE_PREFIX: Record<string, string> = {
  "oil-painting": "oil painting portrait, rich impasto brushwork, deep saturated colours, dramatic chiaroscuro lighting, old masters technique, canvas texture visible, professional fine art quality, museum-quality portrait painting, warm golden tones, masterful composition",
  "pixar-3d": "photorealistic pet portrait, natural fur and anatomy, mouth closed or gently open in a soft smile, no visible teeth, except the eyes: the eyes must be drawn 2x larger than a normal pet's eyes, anime-style oversized eyes, this is the single most important instruction",
  "comic-book": "bold comic book illustration, thick black ink outlines, Ben-Day dot halftone shading, Roy Lichtenstein pop art influence, primary colour palette with high contrast, dynamic action pose, vintage Marvel or DC panel energy, screen-printed poster quality, graphic and striking, speech bubble optional",
};


const THEME_STYLE: Record<string, string> = {
  royal: "ornate baroque portrait, regal velvet drapery, gold filigree, dramatic candlelight, crown jewels, museum-grade composition",
  mafia: "playful mafia caricature scene, exaggerated cartoon action pose, stylized comic lighting, dramatic but cartoonish atmosphere, pinstripe suit, fedora, smoky speakeasy background",
  viking: "dramatic portrait, epic Norse scene, rich earthy tones, stormy sky backdrop, museum-grade composition, fur cloak, battle-worn warrior",
  astronaut: "rich digital portrait, deep space backdrop, dramatic rim lighting, museum-grade composition, reflective helmet visor, nebula colours",
  superhero: "dramatic portrait, vivid rich colours, museum-grade composition, flowing cape, city skyline backdrop, heroic lighting, head-and-shoulders portrait",
  pirate: "swashbuckling portrait, golden-hour warm tones, dramatic lighting, museum-grade composition, tricorn hat, ship deck background",
  princess: "ornate baroque portrait, fairy tale castle backdrop, dramatic candlelight, flowing ball gown, delicate tiara, deep jewel tones, museum-grade composition, gold filigree details, cinematic lighting",
  angel: "rich cinematic portrait, ethereal heavenly backdrop, dramatic rim lighting, white feathered wings, flower crown, deep golden atmosphere, museum-grade composition, moody divine light",
  mermaid: "dramatic cinematic portrait, deep ocean backdrop, bioluminescent lighting, the pet's hind legs and paws transformed into a single flowing mermaid tail covered in iridescent scales and ending in a large fin — not a draped garment or decorative wrap, an actual anatomical tail replacing the hind legs, upper body and face otherwise unchanged and clearly recognisable, flowing hair, coral reef background, deep teal and gold tones, museum-grade composition",
  wizard: "dramatic baroque portrait, enchanted dark forest backdrop, magical golden spell light, pointed hat, spell book, deep shadow and glow contrast, cinematic atmosphere, museum-grade composition",
  ballerina: "rich cinematic portrait, dramatic stage spotlight, deep shadow contrast, elegant tutu, theatrical gold and deep red tones, museum-grade composition, painterly detail",
  "flower-crown": "ornate baroque portrait, golden meadow backdrop, dramatic warm candlelight tones, fresh flower crown, deep rich earth tones, cinematic lighting, museum-grade composition",
};

const PERSONALITY_HINTS: Record<string, string> = {
  "noble-king": "regal, wise, slightly stuck-up expression, head held high",
  "spoiled-royalty": "pampered, demanding pout, snack just out of frame",
  "tiny-tyrant": "small but furious, comically oversized ego, intense glare",
  "elegant-queen": "effortlessly fabulous, graceful tilt of the head",
  "crime-boss": "calm menace, half-smirk, untouchable confidence",
  "silent-assassin": "narrowed eyes, in-shadow posture, deadly poise",
  "chaotic-gremlin": "wide manic eyes, unhinged grin, pure mayhem energy",
  "smooth-talker": "charming half-smile, sunglasses or slick fur, ladies-man energy",
  berserker: "mid-roar battle pose, wild fur, fierce intensity",
  "sleepy-warrior": "powerful but heavy-lidded, mighty yawn vibes",
  "tiny-but-violent": "small frame, furious expression, weapon comically oversized",
  "fearless-explorer": "bold gaze toward horizon, wind-blown fur, hero pose",
  "space-commander": "calm authoritative gaze, hand on visor, stars reflected",
  "lost-in-space": "wide confused eyes, drifting weightlessly, gentle bewilderment",
  "galactic-genius": "thoughtful expression, holographic equations floating",
  "cosmic-menace": "glowing alien eyes, ominous backlighting, devious smirk",
  "city-protector": "noble heroic stance, looking toward sunrise, cape flowing",
  "clumsy-hero": "mid-stumble but determined, slightly askew costume",
  "overconfident-legend": "exaggerated muscle pose, smug grin",
  "secret-villain": "sly side-glance, subtle evil smirk, ominous shadow",
  "treasure-hunter": "wide-eyed greed, paws on gold coins, treasure pile",
  "drunken-captain": "wobbly grin, mug raised, jolly tilt",
  "chaos-goblin": "manic grin, tongue out, items flying in background",
  "sea-monster-slayer": "dramatic battle pose, harpoon raised, kraken silhouette",
  "royal-princess": "graceful elegant pose, tiara glinting, soft serene expression",
  "adventurous-princess": "determined gaze, holding sword, ready for adventure",
  "shy-princess": "gentle timid expression, hiding behind flowers, sweet demeanor",
  "rebel-princess": "confident rebellious smirk, breaking royal protocol, fierce energy",
  "gentle-angel": "serene peaceful expression, wings spread softly, radiating kindness",
  "mischievous-angel": "playful innocent grin, halo slightly askew, cheeky energy",
  "guardian-angel": "protective watchful stance, wings shielding, noble presence",
  "sleepy-angel": "drowsy content expression, resting on clouds, peaceful slumber",
  "ocean-explorer": "curious adventurous gaze, swimming gracefully, discovering wonders",
  "shy-mermaid": "timid peek from behind coral, gentle expression, hiding treasures",
  "singing-mermaid": "mouth open in song, musical notes floating, enchanting presence",
  "treasure-collector": "excited expression, surrounded by pearls and jewels, gleeful energy",
  "wise-wizard": "ancient knowing gaze, long beard, staff glowing with power",
  "clumsy-wizard": "surprised expression, spell backfiring, stars and sparks flying",
  "dark-wizard": "mysterious shadowy presence, dramatic lighting, ominous power",
  "young-wizard": "eager studious expression, reading spell book, learning magic",
  "prima-ballerina": "perfect poised stance, en pointe, graceful elegant expression",
  "playful-dancer": "mid-twirl, joyful expression, carefree movement",
  "graceful-swan": "elegant swan-like pose, serene beauty, refined posture",
  "energetic-dancer": "dynamic jumping pose, full of energy, unstoppable motion",
  "nature-lover": "peaceful expression among flowers, harmonious with nature, content",
  "free-spirit": "wind-blown carefree pose, wild and free, joyful abandon",
  "garden-keeper": "nurturing gentle expression, tending to blooms, loving care",
  "sunset-dreamer": "gazing at horizon, lost in beauty, peaceful contemplation",
};

const TRAIT_HINTS: Record<string, string> = {
  funny: "comedically exaggerated, goofy energy",
  grumpy: "permanent scowl, judging eyes",
  energetic: "mid-action, ears flying, full kinetic motion",
  lazy: "lounging, eyes half-closed, supreme contentment",
  chaotic: "surrounding visual mayhem, wind, motion lines",
  elegant: "graceful posture, soft refined lighting",
  dramatic: "theatrical lighting, opera-poster composition",
  mischievous: "sly side-eye, hidden contraband paw",
};

export function buildPrompt(input: GenerationInput): string {
  const pet = input.petType?.trim() || "pet";
  const artStylePrefix = input.artStyleId ? ART_STYLE_PREFIX[input.artStyleId] ?? "" : ART_STYLE_PREFIX["oil-painting"];
  const themeStyle = THEME_STYLE[input.themeId] ?? `${input.themeName ?? input.themeId} themed caricature`;
  const personality =
    PERSONALITY_HINTS[input.personalityId] ??
    input.personalityDesc ??
    input.personalityName ??
    input.personalityId;
  const traitText =
    input.traits && input.traits.length
      ? input.traits.map((t) => TRAIT_HINTS[t] ?? t).join(", ")
      : "";

  const lines = [
    `${artStylePrefix}, highly detailed portrait of a ${pet}, professional portrait art${input.petName ? `, named ${input.petName}` : ""}.`,
    `Scene & style: ${themeStyle}.`,
    `Character vibe: ${personality}.`,
    traitText ? `Additional personality traits: ${traitText}.` : "",
    input.personalisationText ? `Include the text "${input.personalisationText}" elegantly integrated into the composition, styled to match the theme (e.g., on a banner, plaque, or decorative element).` : "",
    `Keep the pet clearly recognisable — preserve breed, fur colour and markings from the reference photo.`,
    `High-quality digital illustration, premium gifting product art, square 1:1 composition, centred subject, clean background friendly to t-shirt / mug / poster printing.`,
    input.personalisationText ? "" : `No text, no watermarks, no logos.`,
  ].filter(Boolean);

  return lines.join(" ");
}

/** Quick label used in UI / logs without leaking the full prompt. */
export function describePrompt(input: GenerationInput): string {
  const parts = [
    input.themeName ?? input.themeId,
    input.personalityName ?? input.personalityId,
    ...(input.traits ?? []),
  ];
  return parts.join(" · ");
}
