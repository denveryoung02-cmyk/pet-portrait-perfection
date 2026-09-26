import os, sys, json, time, base64, requests

API_KEY = os.environ["OPENAI_API_KEY"]
OUT_DIR = os.environ.get("OUT_DIR", ".")
os.makedirs(OUT_DIR, exist_ok=True)

GRAFFITI_PREFIX = (
    "Transform this pet photo into a vibrant graffiti street-art pop art portrait. "
    "Background: bold multicolor paint splatters and ink drips exploding around the subject "
    "on a black background. Every image must also include at least 2 hand-style graffiti "
    "elements layered near the subject — for example a spray-paint drip tag, a stencil symbol "
    "(heart, star, crown, or lightning bolt), or scribbled marker tags with gender-neutral words "
    "like LEGEND, LOYAL, ICON, STAR, MVP, TOP DOG, BEST FRIEND, HERO, or ONE OF A KIND. Do NOT "
    "use gender-specific words (no BOY, GIRL, KING, QUEEN, PRINCE, PRINCESS, SIR). Keep the pet's "
    "actual fur color, markings, and facial features accurate and recognizable. Poster-quality, "
    "high contrast, street-art style."
)

THEME_STYLE = {
    "royal": "ornate baroque portrait, regal velvet drapery, gold filigree, dramatic candlelight, crown jewels, museum-grade composition",
    "mafia": "playful mafia caricature scene, exaggerated cartoon action pose, stylized comic lighting, dramatic but cartoonish atmosphere, pinstripe suit, fedora, smoky speakeasy background",
    "viking": "dramatic portrait, epic Norse scene, rich earthy tones, stormy sky backdrop, museum-grade composition, fur cloak, battle-worn warrior",
    "astronaut": "rich digital portrait, deep space backdrop, dramatic rim lighting, museum-grade composition, reflective helmet visor, nebula colours",
    "superhero": "dramatic portrait, vivid rich colours, museum-grade composition, flowing cape, city skyline backdrop, heroic lighting, head-and-shoulders portrait",
    "pirate": "swashbuckling portrait, golden-hour warm tones, dramatic lighting, museum-grade composition, tricorn hat, ship deck background",
    "princess": "ornate baroque portrait, fairy tale castle backdrop, dramatic candlelight, flowing ball gown, delicate tiara, deep jewel tones, museum-grade composition, gold filigree details, cinematic lighting",
    "angel": "rich cinematic portrait, ethereal heavenly backdrop, dramatic rim lighting, white feathered wings, flower crown, deep golden atmosphere, museum-grade composition, moody divine light",
    "mermaid": "dramatic cinematic portrait, deep ocean backdrop, bioluminescent lighting, the pet's hind legs and paws transformed into a single flowing mermaid tail covered in iridescent scales and ending in a large fin — not a draped garment or decorative wrap, an actual anatomical tail replacing the hind legs, upper body and face otherwise unchanged and clearly recognisable, flowing hair, coral reef background, deep teal and gold tones, museum-grade composition",
    "wizard": "dramatic baroque portrait, enchanted dark forest backdrop, magical golden spell light, pointed hat, spell book, deep shadow and glow contrast, cinematic atmosphere, museum-grade composition",
    "ballerina": "rich cinematic portrait, dramatic stage spotlight, deep shadow contrast, elegant tutu, theatrical gold and deep red tones, museum-grade composition, painterly detail",
    "flower-crown": "ornate baroque portrait, golden meadow backdrop, dramatic warm candlelight tones, fresh flower crown, deep rich earth tones, cinematic lighting, museum-grade composition",
}

# (theme_id, pet, personality_hint) — varied species for visual variety, matching how
# the existing oil/pixar/comic demo art already varies species per image.
THEMES = [
    ("royal", "corgi", "regal, wise, slightly stuck-up expression, head held high"),
    ("mafia", "bulldog", "calm menace, half-smirk, untouchable confidence"),
    ("viking", "husky", "mid-roar battle pose, wild fur, fierce intensity"),
    ("astronaut", "tabby cat", "calm authoritative gaze, hand on visor, stars reflected"),
    ("superhero", "labrador", "noble heroic stance, looking toward sunrise, cape flowing"),
    ("pirate", "beagle", "wide-eyed greed, paws on gold coins, treasure pile"),
    ("princess", "poodle", "graceful elegant pose, tiara glinting, soft serene expression"),
    ("angel", "golden retriever puppy", "serene peaceful expression, wings spread softly, radiating kindness"),
    ("mermaid", "orange tabby cat", "curious adventurous gaze, swimming gracefully, discovering wonders"),
    ("wizard", "black cat", "ancient knowing gaze, long beard, staff glowing with power"),
    ("ballerina", "toy poodle", "perfect poised stance, en pointe, graceful elegant expression"),
    ("flower-crown", "french bulldog", "peaceful expression among flowers, harmonious with nature, content"),
]

def build_prompt(theme_id, pet, personality):
    theme_style = THEME_STYLE[theme_id]
    lines = [
        GRAFFITI_PREFIX,
        f"Subject: a {pet}, highly detailed.",
        f"Theme flavour on the pet itself (costume, props, attitude): {theme_style} — the background must stay the black paint-splatter graffiti background described above.",
        f"Character vibe: {personality}.",
        "Square 1:1 composition, centred subject, premium gifting product art.",
        "No watermarks, no logos.",
    ]
    return " ".join(lines)

def main():
    results = []
    for theme_id, pet, personality in THEMES:
        out_path = os.path.join(OUT_DIR, f"gen-graffiti-{theme_id}-v1.png")
        if os.path.exists(out_path):
            print(f"[skip] {theme_id} already exists")
            results.append((theme_id, "skipped"))
            continue
        prompt = build_prompt(theme_id, pet, personality)
        print(f"[gen] {theme_id} ({pet}) ...", flush=True)
        try:
            resp = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-image-2",
                    "prompt": prompt[:4000],
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "medium",
                },
                timeout=120,
            )
            if not resp.ok:
                print(f"[error] {theme_id}: {resp.status_code} {resp.text[:300]}")
                results.append((theme_id, f"error {resp.status_code}"))
                continue
            data = resp.json()
            b64 = data.get("data", [{}])[0].get("b64_json")
            url = data.get("data", [{}])[0].get("url")
            if b64:
                img_bytes = base64.b64decode(b64)
            elif url:
                img_bytes = requests.get(url, timeout=60).content
            else:
                print(f"[error] {theme_id}: no image data returned")
                results.append((theme_id, "no image data"))
                continue
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            print(f"[done] {theme_id} -> {out_path} ({len(img_bytes)} bytes)")
            results.append((theme_id, "ok"))
        except Exception as e:
            print(f"[error] {theme_id}: {e}")
            results.append((theme_id, f"exception {e}"))
        time.sleep(1)

    print("\n=== SUMMARY ===")
    for theme_id, status in results:
        print(f"{theme_id}: {status}")

if __name__ == "__main__":
    main()
