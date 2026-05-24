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
  themeId: string;            // "royal" | "mafia" | "viking" | ...
  themeName?: string;         // "Royal" — human readable
  personalityId: string;      // "noble-king" | "tiny-tyrant" | ...
  personalityName?: string;
  personalityDesc?: string;   // short flavour line from UI
  traits?: string[];          // ["grumpy", "chaotic"]
  petName?: string;
};

const THEME_STYLE: Record<string, string> = {
  royal: "ornate baroque oil-painting style, regal velvet drapery, gold filigree, dramatic candlelight, crown jewels, museum-grade composition",
  mafia: "cinematic 1970s mafia film aesthetic, smoky speakeasy lighting, pinstripe suit, fedora hat, moody noir colour grade",
  viking: "epic Norse warrior style, fur cloak, braided beard or mane, snowy fjord backdrop, dramatic stormy lighting, battle paint",
  astronaut: "premium NASA-style astronaut portrait, reflective helmet visor showing nebula, deep-space backdrop, cinematic rim lighting",
  superhero: "modern comic-book superhero portrait, dynamic cape flowing in wind, city skyline behind, vivid saturated colours, heroic three-quarter pose",
  pirate: "swashbuckling pirate captain style, tricorn hat, ship deck at golden-hour sunset, sea spray, weathered leather coat",
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
    `Stylised cartoon caricature portrait of a ${pet}${input.petName ? ` named ${input.petName}` : ""}.`,
    `Scene & style: ${themeStyle}.`,
    `Character vibe: ${personality}.`,
    traitText ? `Additional personality traits: ${traitText}.` : "",
    `Keep the pet clearly recognisable — preserve breed, fur colour and markings from the reference photo.`,
    `High-quality digital illustration, premium gifting product art, square 1:1 composition, centred subject, clean background friendly to t-shirt / mug / poster printing.`,
    `No text, no watermarks, no logos.`,
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
