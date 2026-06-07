# DALL-E 3 Content Policy Rejection

**Date**: 2026-06-04  
**Error**: "OpenAI rejected the prompt — try a different theme or personality"  
**Selected**: Mafia + Chaotic Gremlin + Energetic

---

## Generated Prompt (Current)

**Your selection**:
- Theme: **Mafia**
- Personality: **Chaotic Gremlin**
- Trait: **Energetic**

**Generated prompt** (from `buildPrompt()`):

```
Highly detailed oil-painting style portrait of a pet, rich painterly texture, professional portrait art.

Scene & style: rich cinematic oil-painting portrait style, dramatic noir lighting, deep shadows, moody atmosphere, painterly brush strokes, museum-grade composition, pinstripe suit, fedora, smoky speakeasy background.

Character vibe: wide manic eyes, unhinged grin, pure mayhem energy.

Additional personality traits: mid-action, ears flying, full kinetic motion.

Keep the pet clearly recognisable — preserve breed, fur colour and markings from the reference photo.

High-quality digital illustration, premium gifting product art, square 1:1 composition, centred subject, clean background friendly to t-shirt / mug / poster printing.

No text, no watermarks, no logos.
```

---

## Flagged Words (DALL-E 3 Content Policy)

DALL-E 3 has very strict content filters. These words likely triggered the rejection:

### From "chaotic-gremlin" personality:
- ❌ **"manic"** — mental health related
- ❌ **"unhinged"** — mental health related  
- ❌ **"mayhem"** — violence/chaos related

### From "mafia" theme:
- ⚠️ **"smoky speakeasy"** — alcohol/smoking (borderline)

### Context matters:
Even though this is clearly a **cute pet portrait** in a fictional/comedic context, DALL-E 3's automated filters don't understand context well. It sees "manic + unhinged + mayhem" and flags it as potentially harmful content.

---

## Why This Is a Problem

**DALL-E 3 Content Policy** prohibits:
- Violence or gore
- Hateful imagery
- Self-harm or suicide
- Mental health stigma
- Illegal activities (drugs, weapons)
- Harassment or bullying

**Our innocent pet portrait** contains:
- ✅ No actual violence (just a pet in a costume)
- ✅ No illegal activity (just fictional mafia theme)
- ❌ But uses words that TRIGGER the automated filter

**The filter is overly sensitive** and doesn't understand:
- It's a pet (not a person)
- It's comedic/fictional (not real crime)
- "Chaotic gremlin" is a playful internet meme

---

## Solution: Sanitize Prompts

We need to replace flagged words with DALL-E-friendly alternatives that still capture the vibe.

### Option 1: Sanitize Specific Words

**Replace**:
- "manic" → "playful"
- "unhinged" → "silly"
- "mayhem" → "mischief"
- "smoky speakeasy" → "vintage bar"

**New "chaotic-gremlin" prompt**:
```
wide playful eyes, silly grin, pure mischief energy
```

**New mafia theme**:
```
rich cinematic oil-painting portrait style, dramatic noir lighting, deep shadows, moody atmosphere, painterly brush strokes, museum-grade composition, pinstripe suit, fedora, vintage bar background
```

### Option 2: Full Personality Rewrites

Some personalities are inherently problematic for DALL-E 3:

**High risk** (likely to be rejected):
- ❌ "chaotic-gremlin" — "manic", "unhinged", "mayhem"
- ❌ "crime-boss" — "crime", "menace"
- ❌ "silent-assassin" — "assassin", "deadly"
- ❌ "tiny-but-violent" — "violent", "weapon"
- ❌ "cosmic-menace" — "menace", "ominous"
- ❌ "secret-villain" — "villain", "evil"
- ❌ "sea-monster-slayer" — "battle", "kraken"

**Medium risk** (might be rejected):
- ⚠️ "berserker" — "battle", "roar"
- ⚠️ "chaos-goblin" — "chaos", "manic"

**Safe** (no violence/crime words):
- ✅ "noble-king"
- ✅ "spoiled-royalty"
- ✅ "elegant-queen"
- ✅ "smooth-talker"
- ✅ "sleepy-warrior"
- ✅ "fearless-explorer"
- ✅ "space-commander"
- ✅ "city-protector"
- ✅ "treasure-hunter"
- ✅ "drunken-captain"

---

## Recommended Fixes

### Fix 1: Sanitize All Personalities (Quick)

Update `src/services/prompts.ts` to remove flagged words:

```typescript
const PERSONALITY_HINTS: Record<string, string> = {
  // ... safe ones unchanged ...
  
  // SANITIZED versions:
  "chaotic-gremlin": "wide playful eyes, silly grin, pure mischief energy",  // was: manic, unhinged, mayhem
  "crime-boss": "calm confident gaze, subtle smirk, untouchable presence",  // was: menace
  "silent-assassin": "narrowed eyes, mysterious posture, focused poise",  // was: deadly, shadow
  "tiny-but-violent": "small frame, fierce expression, oversized attitude",  // was: violent, weapon
  "cosmic-menace": "glowing mysterious eyes, dramatic backlighting, playful smirk",  // was: alien, ominous, devious
  "secret-villain": "sly side-glance, subtle knowing smirk, dramatic shadow",  // was: evil, ominous
  "sea-monster-slayer": "heroic adventure pose, harpoon raised, sea creature silhouette",  // was: battle, kraken
  "chaos-goblin": "playful grin, tongue out, items flying in background",  // was: manic
  "berserker": "powerful roaring pose, wild fur, fierce intensity",  // was: mid-roar battle
};

const THEME_STYLE: Record<string, string> = {
  // ... others unchanged ...
  
  mafia: "rich cinematic oil-painting portrait style, dramatic noir lighting, deep shadows, moody atmosphere, painterly brush strokes, museum-grade composition, pinstripe suit, fedora, vintage bar background",  // was: smoky speakeasy
};
```

### Fix 2: Add Pre-Generation Filter (Better)

Check the prompt before sending to DALL-E 3 and warn the user:

```typescript
// In generations.functions.ts, before calling DALL-E 3:

const FLAGGED_WORDS = [
  'manic', 'unhinged', 'mayhem', 'violent', 'weapon', 'assassin', 
  'menace', 'villain', 'evil', 'battle', 'deadly', 'crime'
];

function sanitizePrompt(prompt: string): string {
  let sanitized = prompt;
  
  // Replace flagged words
  sanitized = sanitized.replace(/\bmanic\b/gi, 'playful');
  sanitized = sanitized.replace(/\bunhinged\b/gi, 'silly');
  sanitized = sanitized.replace(/\bmayhem\b/gi, 'mischief');
  sanitized = sanitized.replace(/\bviolent\b/gi, 'fierce');
  sanitized = sanitized.replace(/\bweapon\b/gi, 'prop');
  sanitized = sanitized.replace(/\bassassin\b/gi, 'mysterious figure');
  sanitized = sanitized.replace(/\bmenace\b/gi, 'presence');
  sanitized = sanitized.replace(/\bvillain\b/gi, 'character');
  sanitized = sanitized.replace(/\bevil\b/gi, 'mischievous');
  sanitized = sanitized.replace(/\bbattle\b/gi, 'adventure');
  sanitized = sanitized.replace(/\bdeadly\b/gi, 'focused');
  sanitized = sanitized.replace(/\bcrime\b/gi, 'mystery');
  sanitized = sanitized.replace(/\bsmoky speakeasy\b/gi, 'vintage bar');
  
  return sanitized;
}

// Use it:
const enhancedPrompt = sanitizePrompt(`${prompt}\n\nPet details: ${petDescription}`);
```

### Fix 3: User Warning (Temporary)

Add a warning in the UI for high-risk personalities:

```typescript
// In upload.tsx, show warning:
if (['chaotic-gremlin', 'crime-boss', 'silent-assassin', 'tiny-but-violent'].includes(personalityId)) {
  toast.warning("Note: Some word combinations may be rejected by OpenAI. We'll auto-adjust if needed.");
}
```

---

## Immediate Workaround

**For testing right now**, try these safe combinations:

✅ **Mafia** + **Smooth Talker** + **Elegant**  
✅ **Royal** + **Noble King** + **Dramatic**  
✅ **Astronaut** + **Space Commander** + **Chaotic**  
✅ **Pirate** + **Treasure Hunter** + **Grumpy**  

These will NOT trigger DALL-E 3's content policy.

---

## Recommended Implementation Order

1. **Immediate**: Sanitize `PERSONALITY_HINTS` in `prompts.ts` (Fix 1)
2. **Short-term**: Add `sanitizePrompt()` function as safety net (Fix 2)
3. **Long-term**: Test all 24 personalities and create allowlist

---

## Testing Needed

After sanitizing, test these combinations:
- [ ] Mafia + Chaotic Gremlin + Energetic (your original)
- [ ] Viking + Berserker + Chaotic
- [ ] Superhero + Secret Villain + Dramatic
- [ ] Pirate + Sea Monster Slayer + Grumpy

All should work after sanitization.

---

## Summary

**Problem**: DALL-E 3 rejected "manic", "unhinged", "mayhem" in "chaotic-gremlin" personality

**Root Cause**: OpenAI's automated content filter is overly sensitive to violence/mental-health words

**Solution**: Replace flagged words with safe alternatives that preserve the creative vibe

**Impact**: ~7 personalities need sanitization, mafia theme needs minor update

**Next**: Implement Fix 1 (sanitize prompts.ts) and redeploy
