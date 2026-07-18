/**
 * Hero Pack generation pipeline (Phase 2).
 *
 * Triggered fire-and-forget right after an order becomes paid (see
 * recordPaidOrder() call sites in src/server.ts and fulfillment.functions.ts).
 * Produces one hero_profiles row (playful text content) and four
 * adventure_pack_assets rows (hd_portrait, phone_wallpaper, character_card,
 * hero_certificate) for a single paid order, keyed on the order's primary
 * (digital_download) generation — never the bundle-extra generations.
 *
 * Idempotency: hero_profiles.order_id is unique. The very first thing this
 * function does is attempt to claim that row via upsert+ignoreDuplicates; if
 * another invocation already claimed it (recordPaidOrder legitimately fires
 * from both the Stripe webhook and the success-page confirm flow), this
 * invocation exits immediately.
 *
 * Each of the four assets is generated and status-tracked independently
 * (pending -> processing -> completed/failed) so one failure (e.g. the
 * certificate) never blocks the others or the hero-profile text itself.
 */
// Satori's default build bundles its Yoga (flexbox) layout engine as a
// base64-encoded WASM string and compiles it from raw bytes at first use —
// disallowed under the Workers sandbox. The standalone build instead takes a
// precompiled WebAssembly.Module via `init()`, same shape as resvg below.
import satori, { init as initSatoriYoga } from "satori/standalone";
import satoriYogaWasmModule from "satori/yoga.wasm?module";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasmModule from "@resvg/resvg-wasm/index_bg.wasm?module";
import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { CloudflareEnv } from "@/lib/env.server";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

// Brand palette — lifted directly from design-reference/Pawtoons-Hero-Pack-Reveal-Prototype.html
const NAVY = "#0c1f33";
const NAVY_DEEP = "#081522";
const GOLD = "#d8b872";
const GOLD_SOFT = "#f0dfae";
const CREAM = "#f6f1e4";
const MUTED = "#9aa9bb";

// Flavour labels only, all equally premium — assigned in code (never by the
// LLM) so no pet can ever land on a rank that reads as lesser than another's.
const ADVENTURE_RANKS = ["Legendary Guardian", "Mythic Explorer", "Royal Companion", "Elite Adventurer"];

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;
const CERT_WIDTH = 1400;
const CERT_HEIGHT = 990;
const WALLPAPER_WIDTH = 1080;
const WALLPAPER_HEIGHT = 2340; // ~9:19.5 phone-screen aspect ratio
const WALLPAPER_TOP_SAFE_ZONE = 420; // px reserved above the portrait for lock-screen clock/notifications

// ---- resvg WASM init: once per isolate, via static import (Workers can't
// compile WASM from raw bytes at request time). Mirrors @cf-wasm/photon's own
// `?module` + init pattern, already proven in this codebase (watermark.server.ts).
let resvgReady: Promise<void> | null = null;
function ensureResvgReady(): Promise<void> {
  if (!resvgReady) resvgReady = initWasm(resvgWasmModule);
  return resvgReady;
}

let satoriYogaReady: Promise<void> | null = null;
function ensureSatoriYogaReady(): Promise<void> {
  if (!satoriYogaReady) satoriYogaReady = initSatoriYoga(satoriYogaWasmModule);
  return satoriYogaReady;
}

// ---- Fonts: fetched once per isolate and cached. No font binaries are
// bundled in the repo — these are the app's existing Google Fonts (Cormorant
// Garamond 500/600, Inter 400/500), resolved to their stable WOFF URLs
// (satori supports TTF/OTF/WOFF, not WOFF2). Google's gstatic URLs are
// immutable once published.
const FONT_URLS = {
  cormorant500: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_s06GnA.woff",
  cormorant600: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_iE9GnA.woff",
  inter400: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZs.woff",
  inter500: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZs.woff",
};

type SatoriFont = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: "normal" };

let fontsPromise: Promise<SatoriFont[]> | null = null;
async function loadFonts(): Promise<SatoriFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetchFontBuffer(FONT_URLS.cormorant500),
      fetchFontBuffer(FONT_URLS.cormorant600),
      fetchFontBuffer(FONT_URLS.inter400),
      fetchFontBuffer(FONT_URLS.inter500),
    ]).then(([cormorant500, cormorant600, inter400, inter500]) => [
      { name: "Cormorant Garamond", data: cormorant500, weight: 500 as const, style: "normal" as const },
      { name: "Cormorant Garamond", data: cormorant600, weight: 600 as const, style: "normal" as const },
      { name: "Inter", data: inter400, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data: inter500, weight: 500 as const, style: "normal" as const },
    ]);
  }
  return fontsPromise;
}

async function fetchFontBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}): ${url}`);
  return res.arrayBuffer();
}

type HeroContent = {
  heroName: string;
  adventureClass: string;
  specialAbility: string;
  favouriteSnack: string;
  adventureRank: string;
  missionStatement: string;
  achievementBadge: string;
  originStory: string;
};

const HERO_CONTENT_SYSTEM_PROMPT = `You write short, warm, playful "trading card" hero profiles for a paid pet-portrait keepsake called the Pawtoons Hero Pack. Non-negotiable rules:
- Flattering, never mocking. Humour targets lovable habits (stealing socks, hunting treats, heroic napping), never the pet's appearance or anything that could read as unkind.
- Specific over generic: "can detect a treat bag rustle from three rooms away" beats "loves treats."
- No real people, no trademarked characters or franchises.
- Family-friendly, gentle humour only. Assume this will be screenshotted and shared — nothing that reads oddly out of context.
- Register is clever, not childish. The buyer is an adult who loves their pet, not a child playing a game.
- Respond with strict JSON only, no markdown, no commentary, matching exactly this shape:
{"hero_name": string, "adventure_class": string, "special_ability": string, "favourite_snack": string, "mission_statement": string, "achievement_badge": string, "origin_story": string}
"origin_story" is 2-3 short narrative sentences that set a heroic, playful tone (style example: "In a world of squeaky toys and forbidden socks, one dog rises."). "achievement_badge" is a short 2-4 word fun title (example: "Sock Thief"). Do not include a rank or tier field of any kind — that is assigned separately.`;

async function generateHeroContent(petName: string, artStyleOrTheme: string, env: CloudflareEnv): Promise<HeroContent> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured.");

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 500,
      messages: [
        { role: "system", content: HERO_CONTENT_SYSTEM_PROMPT },
        { role: "user", content: `Pet name: ${petName}. Portrait art style/theme: ${artStyleOrTheme}. Generate the hero profile JSON now.` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI chat completions error (${res.status})`);

  const data: any = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenAI did not return content.");

  const parsed = JSON.parse(raw);
  const required = ["hero_name", "adventure_class", "special_ability", "favourite_snack", "mission_statement", "achievement_badge", "origin_story"];
  for (const key of required) {
    if (typeof parsed[key] !== "string" || !parsed[key].trim()) {
      throw new Error(`OpenAI response missing/invalid field: ${key}`);
    }
  }

  return {
    heroName: parsed.hero_name,
    adventureClass: parsed.adventure_class,
    specialAbility: parsed.special_ability,
    favouriteSnack: parsed.favourite_snack,
    adventureRank: ADVENTURE_RANKS[Math.floor(Math.random() * ADVENTURE_RANKS.length)],
    missionStatement: parsed.mission_statement,
    achievementBadge: parsed.achievement_badge,
    originStory: parsed.origin_story,
  };
}

export async function generateHeroPack(orderId: string, primaryGenerationId: string, env: CloudflareEnv): Promise<void> {
  // 1. Idempotency claim. hero_profiles.order_id is unique; an ignored
  // conflict means another invocation (webhook vs. success-page confirm, or
  // a retry) already owns this order's pack.
  const { data: claimed, error: claimErr } = await supabaseAdmin
    .from("hero_profiles")
    .upsert({ order_id: orderId, primary_generation_id: primaryGenerationId }, { onConflict: "order_id", ignoreDuplicates: true })
    .select("id, pack_number")
    .maybeSingle();

  if (claimErr) {
    console.error("[hero-pack] failed to claim hero_profiles row:", { orderId, error: claimErr });
    return;
  }
  if (!claimed) {
    console.log("[hero-pack] order already claimed, skipping:", { orderId });
    return;
  }
  const packNumber = claimed.pack_number as number;

  // 2. Load context: the primary generation's clean image path + art style,
  // and the pet's name.
  const { data: gen, error: genErr } = await supabaseAdmin
    .from("generations")
    .select("uploaded_image_id, art_style, theme, clean_path")
    .eq("id", primaryGenerationId)
    .single();
  if (genErr || !gen?.clean_path) {
    console.error("[hero-pack] primary generation missing or has no clean_path:", { orderId, primaryGenerationId, error: genErr });
    return;
  }

  let petName = "Your pet";
  if (gen.uploaded_image_id) {
    const { data: img } = await supabaseAdmin.from("uploaded_images").select("pet_name").eq("id", gen.uploaded_image_id).single();
    if (img?.pet_name) petName = img.pet_name;
  }
  const artStyleOrTheme = gen.art_style ?? gen.theme ?? "portrait";

  // 3. Text content — best-effort. HD portrait/wallpaper don't need it; card
  // and certificate do, and are recorded as failed below if this fails.
  let content: HeroContent | null = null;
  try {
    content = await generateHeroContent(petName, artStyleOrTheme, env);
  } catch (err) {
    console.error("[hero-pack] text generation failed:", { orderId, primaryGenerationId, error: err instanceof Error ? err.message : err });
  }

  const profileUpdate = content
    ? {
        pet_name: petName,
        hero_name: content.heroName,
        adventure_class: content.adventureClass,
        special_ability: content.specialAbility,
        favourite_snack: content.favouriteSnack,
        adventure_rank: content.adventureRank,
        mission_statement: content.missionStatement,
        achievement_badge: content.achievementBadge,
        origin_story: content.originStory,
      }
    : { pet_name: petName };
  const { error: profileUpdateErr } = await supabaseAdmin.from("hero_profiles").update(profileUpdate).eq("order_id", orderId);
  if (profileUpdateErr) {
    console.error("[hero-pack] failed to save hero profile content:", { orderId, error: profileUpdateErr });
  }

  // 4. Clean (unwatermarked) source image — every derived asset needs it
  // except hd_portrait (which just references the existing path).
  let cleanImageBytes: Uint8Array | null = null;
  try {
    const { data: blob, error: dlErr } = await supabaseAdmin.storage.from("caricatures-clean").download(gen.clean_path);
    if (dlErr || !blob) throw new Error(dlErr?.message ?? "no blob returned");
    cleanImageBytes = new Uint8Array(await blob.arrayBuffer());
  } catch (err) {
    console.error("[hero-pack] failed to download clean image; wallpaper/card/certificate will be marked failed:", {
      orderId,
      primaryGenerationId,
      cleanPath: gen.clean_path,
      error: err instanceof Error ? err.message : err,
    });
  }

  // 5. Assets — independent, one failure doesn't block the others.
  await Promise.allSettled([
    createHdPortraitAsset(orderId, primaryGenerationId, gen.clean_path),
    cleanImageBytes
      ? createPhoneWallpaperAsset(orderId, primaryGenerationId, cleanImageBytes)
      : recordFailedAsset(orderId, primaryGenerationId, "phone_wallpaper"),
    content && cleanImageBytes
      ? createCharacterCardAsset(orderId, primaryGenerationId, cleanImageBytes, content, packNumber)
      : recordFailedAsset(orderId, primaryGenerationId, "character_card"),
    content && cleanImageBytes
      ? createHeroCertificateAsset(orderId, primaryGenerationId, cleanImageBytes, content)
      : recordFailedAsset(orderId, primaryGenerationId, "hero_certificate"),
  ]);
}

async function recordFailedAsset(orderId: string, primaryGenerationId: string, assetType: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("adventure_pack_assets")
    .insert({ order_id: orderId, primary_generation_id: primaryGenerationId, asset_type: assetType, status: "failed" });
  if (error) console.error(`[hero-pack] ${assetType}: failed to record failed-state row:`, { orderId, error });
}

// No new storage, no rendering — just points at the primary generation's
// existing private clean_path. Phase 3 (reveal page) signs a fresh URL at
// request time, same helper confirmCheckout already uses (signCleanDownloadUrl).
async function createHdPortraitAsset(orderId: string, primaryGenerationId: string, cleanPath: string): Promise<void> {
  const { error } = await supabaseAdmin.from("adventure_pack_assets").insert({
    order_id: orderId,
    primary_generation_id: primaryGenerationId,
    asset_type: "hd_portrait",
    storage_path: cleanPath,
    public_url: null,
    status: "completed",
  });
  if (error) console.error("[hero-pack] hd_portrait insert failed:", { orderId, error });
}

// Shared bookkeeping for the three generated assets: create a `processing`
// row, run the generator, upload the PNG to hero-pack-assets, then mark
// completed/failed. Isolated per asset so one failure never touches the others.
async function generateAndStoreAsset(opts: {
  orderId: string;
  primaryGenerationId: string;
  assetType: "phone_wallpaper" | "character_card" | "hero_certificate";
  storageFileName: string;
  generate: () => Promise<Uint8Array>;
}): Promise<void> {
  const { orderId, primaryGenerationId, assetType, storageFileName, generate } = opts;

  const { data: row, error: insErr } = await supabaseAdmin
    .from("adventure_pack_assets")
    .insert({ order_id: orderId, primary_generation_id: primaryGenerationId, asset_type: assetType, status: "processing" })
    .select("id")
    .single();
  if (insErr || !row) {
    console.error(`[hero-pack] ${assetType}: failed to create row:`, { orderId, error: insErr });
    return;
  }

  try {
    const pngBytes = await generate();
    const storagePath = `${orderId}/${storageFileName}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("hero-pack-assets")
      .upload(storagePath, pngBytes, { contentType: "image/png", upsert: true });
    if (upErr) throw new Error(`upload failed: ${upErr.message}`);

    const { data: pub } = supabaseAdmin.storage.from("hero-pack-assets").getPublicUrl(storagePath);
    const { error: updErr } = await supabaseAdmin
      .from("adventure_pack_assets")
      .update({ storage_path: storagePath, public_url: pub.publicUrl, status: "completed", updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) console.error(`[hero-pack] ${assetType}: failed to mark completed:`, { orderId, error: updErr });
  } catch (err) {
    console.error(`[hero-pack] ${assetType} generation failed:`, { orderId, error: err instanceof Error ? err.message : err });
    const { error: updErr } = await supabaseAdmin
      .from("adventure_pack_assets")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) console.error(`[hero-pack] ${assetType}: failed to mark failed (after generation failure):`, { orderId, error: updErr });
  }
}

async function createPhoneWallpaperAsset(orderId: string, primaryGenerationId: string, cleanImageBytes: Uint8Array): Promise<void> {
  await generateAndStoreAsset({
    orderId,
    primaryGenerationId,
    assetType: "phone_wallpaper",
    storageFileName: "phone-wallpaper.png",
    generate: async () => buildPhoneWallpaper(cleanImageBytes),
  });
}

async function createCharacterCardAsset(
  orderId: string,
  primaryGenerationId: string,
  cleanImageBytes: Uint8Array,
  content: HeroContent,
  packNumber: number,
): Promise<void> {
  await generateAndStoreAsset({
    orderId,
    primaryGenerationId,
    assetType: "character_card",
    storageFileName: "character-card.png",
    generate: () => renderPngFromSatori(buildCardVNode(toPngDataUri(cleanImageBytes), content, packNumber), CARD_WIDTH, CARD_HEIGHT),
  });
}

async function createHeroCertificateAsset(
  orderId: string,
  primaryGenerationId: string,
  cleanImageBytes: Uint8Array,
  content: HeroContent,
): Promise<void> {
  await generateAndStoreAsset({
    orderId,
    primaryGenerationId,
    assetType: "hero_certificate",
    storageFileName: "hero-certificate.png",
    generate: () => renderPngFromSatori(buildCertificateVNode(content), CERT_WIDTH, CERT_HEIGHT),
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Composites the square (1024x1024) portrait onto a taller navy canvas with
// safe-zone padding top and bottom, rather than cropping pixels away — the
// source is square, so a true edge-to-edge phone crop would cut off the pet.
function buildPhoneWallpaper(sourceBytes: Uint8Array): Uint8Array {
  const source = PhotonImage.new_from_byteslice(sourceBytes);
  const resized = resize(source, WALLPAPER_WIDTH, WALLPAPER_WIDTH, SamplingFilter.Lanczos3);
  source.free();
  const photoPixels = resized.get_raw_pixels();
  resized.free();

  const [r, g, b] = hexToRgb(NAVY);
  const canvas = new Uint8Array(WALLPAPER_WIDTH * WALLPAPER_HEIGHT * 4);
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = r;
    canvas[i + 1] = g;
    canvas[i + 2] = b;
    canvas[i + 3] = 255;
  }

  // Opaque row-by-row blit — the generated portrait has no transparency, so
  // no alpha blending is needed, just a direct copy into the safe-zone offset.
  for (let y = 0; y < WALLPAPER_WIDTH; y += 1) {
    const destRowStart = (y + WALLPAPER_TOP_SAFE_ZONE) * WALLPAPER_WIDTH * 4;
    const srcRowStart = y * WALLPAPER_WIDTH * 4;
    canvas.set(photoPixels.subarray(srcRowStart, srcRowStart + WALLPAPER_WIDTH * 4), destRowStart);
  }

  const result = new PhotonImage(canvas, WALLPAPER_WIDTH, WALLPAPER_HEIGHT);
  const bytes = result.get_bytes();
  result.free();
  return bytes;
}

function toPngDataUri(bytes: Uint8Array): string {
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

async function renderPngFromSatori(vnode: unknown, width: number, height: number): Promise<Uint8Array> {
  const [fonts] = await Promise.all([loadFonts(), ensureResvgReady(), ensureSatoriYogaReady()]);
  const svg = await satori(vnode as any, { width, height, fonts: fonts as any });
  // Satori already converts all text to SVG paths using the fonts given above,
  // so resvg never needs to load a font itself. loadSystemFonts must still be
  // explicitly disabled — it defaults to true, and the system-font scan it
  // triggers isn't available under the Workers sandbox (surfaces as an
  // unrelated-looking "Wasm code generation disallowed by embedder" abort).
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } });
  return resvg.render().asPng();
}

// ---- Satori JSX (as plain React-element-shaped objects — no JSX transform
// needed for this handful of nodes). Layout/colours/type are lifted directly
// from design-reference/Pawtoons-Hero-Pack-Reveal-Prototype.html. Two notable
// Satori constraints hit while translating it: (1) every style value must be
// concrete — an `undefined` property (e.g. a conditionally-omitted border)
// throws deep inside Satori's style resolver, so unused sides use "none"
// instead of being left out; (2) Satori/resvg have no colour-emoji font, so
// the prototype's 🏅 badge icon is drawn as a rotated bordered square instead
// of an emoji glyph — flexbox, position:absolute, transform:rotate,
// linear-gradient and italic type all render correctly otherwise.

function buildCardVNode(portraitDataUri: string, content: HeroContent, packNumber: number) {
  const serial = `HP-2026-${String(packNumber).padStart(6, "0")}`;

  function statRow(label: string, value: string, isLast = false) {
    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          fontSize: 20,
          padding: "10px 0",
          gap: 20,
          borderTop: isLast ? "none" : "1px solid rgba(216,184,114,0.2)",
        },
        children: [
          { type: "span", props: { style: { color: MUTED, flexShrink: 0 }, children: label } },
          {
            type: "span",
            props: { style: { color: CREAM, fontWeight: 500, textAlign: "right" }, children: value },
          },
        ],
      },
    };
  }

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 40,
        border: `3px solid ${GOLD}`,
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        padding: "56px 48px",
        fontFamily: "Inter",
        position: "relative",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: 220,
              height: 220,
              borderRadius: 110,
              border: `5px solid ${GOLD}`,
              marginBottom: 32,
              overflow: "hidden",
            },
            children: [{ type: "img", props: { src: portraitDataUri, width: 220, height: 220 } }],
          },
        },
        {
          type: "div",
          props: {
            style: { fontFamily: "Cormorant Garamond", fontWeight: 600, fontSize: 56, color: CREAM, marginBottom: 36 },
            children: content.heroName,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", width: "100%" },
            children: [
              statRow("Hero name", content.heroName),
              statRow("Adventure class", content.adventureClass),
              statRow("Special ability", content.specialAbility),
              statRow("Favourite snack", content.favouriteSnack),
              statRow("Adventure rank", content.adventureRank),
              statRow("Mission", content.missionStatement, true),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 36 },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: 28,
                    height: 28,
                    transform: "rotate(45deg)",
                    border: `3px solid ${GOLD}`,
                    background: "rgba(216,184,114,0.15)",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: 22, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginTop: 6 },
                  children: "Unlocked",
                },
              },
              {
                type: "div",
                props: {
                  style: { fontFamily: "Cormorant Garamond", fontWeight: 600, fontSize: 30, color: GOLD_SOFT, marginTop: 4 },
                  children: content.achievementBadge,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: { style: { fontSize: 18, color: MUTED, letterSpacing: 3, marginTop: 30 }, children: serial },
        },
      ],
    },
  };
}

function certCorner(pos: "tl" | "tr" | "bl" | "br") {
  const base = {
    position: "absolute" as const,
    width: 36,
    height: 36,
    borderColor: GOLD,
    borderStyle: "solid" as const,
    borderWidth: 0,
    display: "flex" as const,
  };
  if (pos === "tl") return { ...base, top: 40, left: 40, borderTopWidth: 3, borderLeftWidth: 3 };
  if (pos === "tr") return { ...base, top: 40, right: 40, borderTopWidth: 3, borderRightWidth: 3 };
  if (pos === "bl") return { ...base, bottom: 40, left: 40, borderBottomWidth: 3, borderLeftWidth: 3 };
  return { ...base, bottom: 40, right: 40, borderBottomWidth: 3, borderRightWidth: 3 };
}

function buildCertificateVNode(content: HeroContent) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: CERT_WIDTH,
        height: CERT_HEIGHT,
        position: "relative",
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        border: `2px solid ${GOLD}`,
        fontFamily: "Inter",
        padding: "80px 120px",
      },
      children: [
        { type: "div", props: { style: certCorner("tl") } },
        { type: "div", props: { style: certCorner("tr") } },
        { type: "div", props: { style: certCorner("bl") } },
        { type: "div", props: { style: certCorner("br") } },
        {
          type: "div",
          props: {
            style: { fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: MUTED },
            children: "Official Pawtoons Hero Certificate",
          },
        },
        {
          type: "div",
          props: {
            style: { fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 30, color: MUTED, marginTop: 44 },
            children: "awarded to",
          },
        },
        {
          type: "div",
          props: {
            style: { fontFamily: "Cormorant Garamond", fontWeight: 600, fontSize: 84, color: GOLD_SOFT, marginTop: 16 },
            children: content.heroName,
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: 26, color: MUTED, marginTop: 40, maxWidth: 820, textAlign: "center", display: "flex" },
            children: `for outstanding bravery and ${content.specialAbility.toLowerCase()}`,
          },
        },
      ],
    },
  };
}
