import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { uploadPetPhoto, validateImage } from "@/services/uploads";
import { startGeneration } from "@/services/generations";
import royal from "@/assets/pet-royal.jpg";
import superhero from "@/assets/pet-superhero.jpg";
import mafia from "@/assets/pet-mafia.jpg";
import astronaut from "@/assets/pet-astronaut.jpg";
import viking from "@/assets/pet-viking.jpg";
import pirate from "@/assets/pet-pirate.jpg";
import royalV1 from "@/assets/gen-royal-v1.jpg";
import royalV2 from "@/assets/gen-royal-v2.jpg";
import royalV3 from "@/assets/gen-royal-v3.jpg";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Create your Pawtoon — step by step" }] }),
  component: CreateWizard,
});

/* ---------------- Data ---------------- */

type Personality = { id: string; name: string; emoji: string; desc: string; recommended?: boolean };
type Theme = { id: string; name: string; tag: string; img: string; emoji: string; gradient: string; personalities: Personality[] };

const themes: Theme[] = [
  { id: "royal", name: "Royal", tag: "Crown jewels included", img: royalV1, emoji: "👑",
    gradient: "from-amber-200 via-rose-200 to-purple-300",
    personalities: [
      { id: "noble-king", name: "Noble King", emoji: "👑", desc: "Wise, regal, slightly stuck-up.", recommended: true },
      { id: "spoiled-royalty", name: "Spoiled Royalty", emoji: "💅", desc: "Demands snacks. Now." },
      { id: "tiny-tyrant", name: "Tiny Tyrant", emoji: "😤", desc: "Small body. Huge ego." },
      { id: "elegant-queen", name: "Elegant Queen", emoji: "👸", desc: "Effortlessly fabulous." },
    ] },
  { id: "mafia", name: "Mafia", tag: "Don't make it personal", img: mafia, emoji: "🎩",
    gradient: "from-stone-300 via-stone-500 to-stone-800",
    personalities: [
      { id: "crime-boss", name: "Crime Boss", emoji: "🎩", desc: "Runs the block. And the couch.", recommended: true },
      { id: "silent-assassin", name: "Silent Assassin", emoji: "🥷", desc: "You'll never see them coming." },
      { id: "chaotic-gremlin", name: "Chaotic Gremlin", emoji: "😈", desc: "Pure unhinged energy." },
      { id: "smooth-talker", name: "Smooth Talker", emoji: "😎", desc: "Charm-first, paws second." },
    ] },
  { id: "viking", name: "Viking", tag: "Battle ready, belly rubs", img: viking, emoji: "⚔️",
    gradient: "from-orange-300 via-red-400 to-stone-700",
    personalities: [
      { id: "berserker", name: "Berserker", emoji: "🪓", desc: "Charges first. Naps later." },
      { id: "sleepy-warrior", name: "Sleepy Warrior", emoji: "😴", desc: "Mighty after a 14h nap.", recommended: true },
      { id: "tiny-but-violent", name: "Tiny But Violent", emoji: "💢", desc: "Small. Furious. Iconic." },
      { id: "fearless-explorer", name: "Fearless Explorer", emoji: "🧭", desc: "Bold seas, bolder treats." },
    ] },
  { id: "astronaut", name: "Astronaut", tag: "To infinity and treats", img: astronaut, emoji: "🚀",
    gradient: "from-indigo-300 via-violet-500 to-slate-900",
    personalities: [
      { id: "space-commander", name: "Space Commander", emoji: "🚀", desc: "Calm under cosmic pressure.", recommended: true },
      { id: "lost-in-space", name: "Lost In Space", emoji: "🌌", desc: "Confused. Adorable. Floating." },
      { id: "galactic-genius", name: "Galactic Genius", emoji: "🧠", desc: "Solves quantum kibble." },
      { id: "cosmic-menace", name: "Cosmic Menace", emoji: "👽", desc: "A threat to all known galaxies." },
    ] },
  { id: "superhero", name: "Superhero", tag: "Cape, drama, glory", img: superhero, emoji: "🦸",
    gradient: "from-sky-300 via-blue-500 to-red-500",
    personalities: [
      { id: "city-protector", name: "City Protector", emoji: "🛡️", desc: "Saves the day, every day." },
      { id: "clumsy-hero", name: "Clumsy Hero", emoji: "🤕", desc: "Means well. Trips often.", recommended: true },
      { id: "overconfident-legend", name: "Overconfident Legend", emoji: "💪", desc: "Believes their own hype." },
      { id: "secret-villain", name: "Secret Villain", emoji: "😼", desc: "Plotting world domination." },
    ] },
  { id: "pirate", name: "Pirate", tag: "Arrr-mazing", img: pirate, emoji: "🏴‍☠️",
    gradient: "from-teal-300 via-cyan-600 to-slate-800",
    personalities: [
      { id: "treasure-hunter", name: "Treasure Hunter", emoji: "💰", desc: "Will dig for snacks." },
      { id: "drunken-captain", name: "Drunken Captain", emoji: "🍺", desc: "Wobbly. Loud. Beloved.", recommended: true },
      { id: "chaos-goblin", name: "Chaos Goblin", emoji: "🤪", desc: "Lives only for destruction." },
      { id: "sea-monster-slayer", name: "Sea Monster Slayer", emoji: "🐙", desc: "Bath time = epic battle." },
    ] },
];

const TRAITS = [
  { id: "funny", label: "Funny", emoji: "🤡" },
  { id: "grumpy", label: "Grumpy", emoji: "😾" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "lazy", label: "Lazy", emoji: "🦥" },
  { id: "chaotic", label: "Chaotic", emoji: "🌪️" },
  { id: "elegant", label: "Elegant", emoji: "🌹" },
  { id: "dramatic", label: "Dramatic", emoji: "🎭" },
  { id: "mischievous", label: "Mischievous", emoji: "😏" },
];

const PRODUCTS = [
  { id: "tshirt", name: "Premium Tee", price: 32, img: tshirt, desc: "Organic cotton, soft-touch" },
  { id: "mug", name: "Ceramic Mug", price: 24, img: mug, desc: "11oz dishwasher-safe" },
  { id: "poster", name: "Framed Poster", price: 45, img: poster, desc: "Museum-grade matte paper" },
  { id: "mousemat", name: "Mouse Mat", price: 19, img: mousemat, desc: "Anti-slip neoprene base" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const FITS = [
  { id: "regular", name: "Regular fit", desc: "Classic everyday cut", extra: 0 },
  { id: "oversized", name: "Oversized", desc: "Relaxed streetwear vibe", extra: 3 },
  { id: "premium", name: "Premium fit", desc: "Tailored, slim", extra: 6 },
];
const COLORS = [
  { id: "black", name: "Black", hex: "#111111" },
  { id: "white", name: "White", hex: "#fafafa", ring: "border-2 border-border" },
  { id: "cream", name: "Cream", hex: "#f3ead4" },
  { id: "navy", name: "Navy", hex: "#1a2a4a" },
  { id: "pink", name: "Pink", hex: "#f8b5c9" },
  { id: "grey", name: "Grey", hex: "#9aa0a6" },
];

const STEPS = [
  { n: 1, title: "Upload photo", sub: "Add a clear pet pic" },
  { n: 2, title: "Theme", sub: "Pick a universe" },
  { n: 3, title: "Personality", sub: "Set the vibe" },
  { n: 4, title: "Traits", sub: "Optional flavour" },
  { n: 5, title: "Generate", sub: "AI does the magic" },
  { n: 6, title: "Product", sub: "Pick what to print" },
  { n: 7, title: "Checkout", sub: "Make it real" },
];

const GEN_STAGES = [
  { label: "Analyzing pet personality", emoji: "🔍" },
  { label: "Reading those soulful eyes", emoji: "👀" },
  { label: "Building cartoon style", emoji: "🎨" },
  { label: "Painting the masterpiece", emoji: "🖌️" },
  { label: "Adding final flourishes", emoji: "✨" },
];

/* ---------------- Wizard ---------------- */

function CreateWizard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 — upload
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step 2-4
  const [themeId, setThemeId] = useState("royal");
  const [personalityId, setPersonalityId] = useState("noble-king");
  const [traits, setTraits] = useState<string[]>([]);

  // Step 5 — generate
  const [genProgress, setGenProgress] = useState(0);
  const [genStage, setGenStage] = useState(0);
  const [genDone, setGenDone] = useState(false);
  const [genFailed, setGenFailed] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genResultUrl, setGenResultUrl] = useState<string | null>(null);
  const [genId, setGenId] = useState<string | null>(null);
  const [favourite, setFavourite] = useState(1);
  const [zoom, setZoom] = useState<number | null>(null);

  // Step 6 — product
  const [productId, setProductId] = useState("tshirt");
  const [size, setSize] = useState("M");
  const [fit, setFit] = useState("regular");
  const [color, setColor] = useState("black");

  const theme = useMemo(() => themes.find((t) => t.id === themeId)!, [themeId]);
  const personality = useMemo(
    () => theme.personalities.find((p) => p.id === personalityId) ?? theme.personalities[0],
    [theme, personalityId]
  );
  const product = PRODUCTS.find((p) => p.id === productId)!;
  const fitObj = FITS.find((f) => f.id === fit)!;
  const colorObj = COLORS.find((c) => c.id === color)!;
  const total = product.price + (productId === "tshirt" ? fitObj.extra : 0);

  /* upload handlers — real Supabase Storage when signed in, local preview otherwise */
  const handleFile = async (f: File) => {
    setUploadError(null);
    const v = validateImage(f);
    if (v) {
      setUploadError(v.message);
      return;
    }
    setFileName(f.name);
    setUploadProgress(0);
    // Show local preview immediately so the UI feels instant.
    const localUrl = URL.createObjectURL(f);
    setFile(localUrl);

    if (!session) {
      // Anonymous browse mode: simulate progress, no DB row created.
      let p = 0;
      const tick = setInterval(() => {
        p += Math.random() * 22 + 10;
        if (p >= 100) {
          p = 100;
          clearInterval(tick);
        }
        setUploadProgress(p);
      }, 130);
      return;
    }

    try {
      const uploaded = await uploadPetPhoto(f, { onProgress: (n) => setUploadProgress(n) });
      setUploadedImageId(uploaded.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
      setFile(null);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };
  const removeFile = () => {
    setFile(null);
    setFileName("");
    setUploadProgress(0);
    setUploadedImageId(null);
  };

  /* theme change resets personality */
  useEffect(() => {
    setPersonalityId(theme.personalities[0].id);
  }, [themeId]); // eslint-disable-line

  /* generation: real server fn when authed + uploaded; simulated otherwise */
  useEffect(() => {
    if (step !== 5 || genDone || genFailed) return;

    // Progress animation (cosmetic — runs alongside the real request)
    setGenProgress(0);
    setGenStage(0);
    const tick = setInterval(() => {
      setGenProgress((p) => {
        const next = Math.min(95, p + Math.random() * 4 + 2);
        setGenStage(Math.min(GEN_STAGES.length - 1, Math.floor((next / 100) * GEN_STAGES.length)));
        return next;
      });
    }, 220);

    const useReal = !!session && !!uploadedImageId;
    let cancelled = false;

    (async () => {
      if (!useReal) {
        // Anonymous demo path: just complete the simulation.
        await new Promise((r) => setTimeout(r, 5000));
        if (cancelled) return;
        clearInterval(tick);
        setGenProgress(100);
        setTimeout(() => setGenDone(true), 300);
        return;
      }

      try {
        const res = await startGeneration({
          uploadedImageId: uploadedImageId!,
          themeId,
          themeName: theme.name,
          personalityId,
          personalityName: personality.name,
          personalityDesc: personality.desc,
          traits,
        });
        if (cancelled) return;
        clearInterval(tick);
        if (res.status === "completed" && res.resultUrl) {
          setGenId(res.generationId);
          setGenResultUrl(res.resultUrl);
          setGenProgress(100);
          setTimeout(() => setGenDone(true), 250);
        } else {
          setGenError((res as any).error ?? "Generation failed.");
          setGenFailed(true);
        }
      } catch (err) {
        if (cancelled) return;
        clearInterval(tick);
        setGenError(err instanceof Error ? err.message : "Generation failed.");
        setGenFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [step, genDone, genFailed, session, uploadedImageId, themeId, personalityId]); // eslint-disable-line

  const toggleTrait = (id: string) =>
    setTraits((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < 3 ? [...t, id] : t));

  /* step gating */
  const canNext = () => {
    if (step === 1) return !!file;
    if (step === 5) return genDone;
    return true;
  };
  const goNext = () => {
    if (step === 7) {
      navigate({ to: "/checkout", search: { gen: genId ?? undefined, product: productId, size, fit, color } as any });
      return;
    }
    if (step === 5 && !genDone) return;
    setStep((s) => Math.min(7, s + 1) as any);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setStep((s) => Math.max(1, s - 1) as any);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const retryGen = () => {
    setGenFailed(false);
    setGenError(null);
    setGenDone(false);
    setGenProgress(0);
    setGenStage(0);
    setGenResultUrl(null);
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-28">
      <Nav />

      {/* Progress */}
      <ProgressBar step={step} onJump={(n) => n < step && setStep(n as any)} />

      <main className="mx-auto max-w-6xl px-5 md:px-8 py-8 md:py-12">
        <header className="mb-8 md:mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
            Step {step} of 7 · {STEPS[step - 1].sub}
          </span>
          <h1 className="mt-2 text-3xl md:text-5xl font-display">{stepHeadline(step)}</h1>
        </header>

        <div key={step} className="animate-[fade-up_0.45s_ease-out]">
          {step === 1 && (
            <StepUpload
              file={file} fileName={fileName} uploadProgress={uploadProgress}
              uploadError={uploadError} dragOver={dragOver} inputRef={inputRef}
              setDragOver={setDragOver} onPick={onPick} onDrop={onDrop} removeFile={removeFile}
            />
          )}
          {step === 2 && <StepTheme themeId={themeId} setThemeId={setThemeId} />}
          {step === 3 && <StepPersonality theme={theme} personalityId={personalityId} setPersonalityId={setPersonalityId} />}
          {step === 4 && <StepTraits traits={traits} toggleTrait={toggleTrait} />}
          {step === 5 && (
            <StepGenerate
              theme={theme} personality={personality} file={file}
              genProgress={genProgress} genStage={genStage} genDone={genDone}
              genFailed={genFailed} setGenFailed={setGenFailed} retryGen={retryGen}
              favourite={favourite} setFavourite={setFavourite} setZoom={setZoom}
              genResultUrl={genResultUrl} genError={genError}
            />
          )}
          {step === 6 && (
            <StepProduct
              theme={theme} productId={productId} setProductId={setProductId}
              size={size} setSize={setSize} fit={fit} setFit={setFit}
              color={color} setColor={setColor}
            />
          )}
          {step === 7 && (
            <StepCheckout
              theme={theme} personality={personality} product={product}
              size={size} fitObj={fitObj} colorObj={colorObj} total={total} productId={productId}
            />
          )}
        </div>

        {step === 5 && genDone && <SocialShowcase />}
      </main>

      {/* Sticky footer nav */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-3 md:py-4 flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="rounded-full px-4 md:px-5 py-3 text-sm font-semibold border border-border bg-card disabled:opacity-40 hover:bg-secondary transition"
          >
            ← Back
          </button>
          <div className="hidden md:block flex-1 text-sm text-muted-foreground">
            {step < 7 ? `Next: ${STEPS[step].title}` : "Ready to make it real."}
          </div>
          <div className="md:hidden flex-1 text-xs text-muted-foreground truncate">
            {STEPS[step - 1].title}
          </div>
          <button
            onClick={goNext}
            disabled={!canNext()}
            className="rounded-full px-6 md:px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
            style={{ background: "var(--gradient-primary)" }}
          >
            {step === 7 ? "Go to checkout →" : step === 5 && !genDone ? "Generating…" : "Next →"}
          </button>
        </div>
      </div>

      {/* Zoom modal */}
      {zoom !== null && <ZoomModal img={theme.img} theme={theme} onClose={() => setZoom(null)} />}

      <Footer />
    </div>
  );
}

function stepHeadline(s: number) {
  return {
    1: "Drop in your best pet pic.",
    2: "Pick your pet's cinematic universe.",
    3: "Who are they, really?",
    4: "Add a sprinkle of chaos.",
    5: "Painting their movie poster moment ✨",
    6: "Pick where the magic lives.",
    7: "One last look before glory.",
  }[s as 1 | 2 | 3 | 4 | 5 | 6 | 7];
}

/* ---------------- Progress ---------------- */

function ProgressBar({ step, onJump }: { step: number; onJump: (n: number) => void }) {
  const pct = ((step - 1) / 6) * 100;
  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-16 z-30">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-4">
        <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        <ol className="mt-3 hidden md:flex items-center justify-between">
          {STEPS.map((s) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <li key={s.n}>
                <button
                  onClick={() => onJump(s.n)}
                  disabled={s.n > step}
                  className="flex items-center gap-2 group disabled:cursor-not-allowed"
                >
                  <span
                    className={`size-7 rounded-full grid place-items-center text-xs font-bold transition-all ${
                      done ? "bg-primary text-primary-foreground" :
                      active ? "bg-foreground text-background scale-110 ring-4 ring-foreground/10" :
                      "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? "✓" : s.n}
                  </span>
                  <span className={`text-xs font-semibold ${active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 md:hidden flex items-center justify-between text-xs">
          <span className="font-semibold">Step {step} / 7</span>
          <span className="text-muted-foreground">{STEPS[step - 1].title}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 1: Upload ---------------- */

function StepUpload({
  file, fileName, uploadProgress, uploadError, dragOver, inputRef,
  setDragOver, onPick, onDrop, removeFile,
}: any) {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div>
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed bg-card p-10 md:p-16 text-center cursor-pointer transition-all ${
              dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-secondary/40"
            }`}
          >
            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="space-y-4">
                <div className="size-16 mx-auto rounded-full bg-primary/10 grid place-items-center text-3xl animate-pulse">📤</div>
                <p className="font-semibold">Uploading {fileName}…</p>
                <div className="max-w-xs mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${uploadProgress}%`, background: "var(--gradient-primary)" }} />
                </div>
              </div>
            ) : (
              <>
                <div className="size-20 mx-auto rounded-2xl grid place-items-center text-4xl mb-5" style={{ background: "var(--gradient-warm)" }}>
                  🐾
                </div>
                <h3 className="font-display text-2xl mb-1">Drag & drop your pet photo</h3>
                <p className="text-sm text-muted-foreground mb-6">or click anywhere to browse · JPG, PNG, HEIC up to 12MB</p>
                <button className="rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                  Choose photo
                </button>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </div>
        ) : (
          <div className="rounded-3xl bg-card border border-border overflow-hidden">
            <div className="relative aspect-[4/3] bg-secondary">
              <img src={file} alt="Your pet" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Photo ready
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold truncate max-w-[200px]">{fileName}</div>
                <div className="text-xs text-muted-foreground">Looks great — tap next to continue.</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => inputRef.current?.click()} className="rounded-full px-4 py-2 text-xs font-semibold border border-border hover:bg-secondary">Change</button>
                <button onClick={removeFile} className="rounded-full px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10">Remove</button>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm flex gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-semibold text-destructive">{uploadError}</div>
              <div className="text-muted-foreground mt-0.5">Try a different photo — clearer faces give better results.</div>
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-3xl bg-card border border-border p-6 h-fit">
        <h3 className="font-display text-lg mb-1">📸 Photo tips</h3>
        <p className="text-xs text-muted-foreground mb-4">Better photos = better Pawtoons.</p>
        <Tip ok text="Clear, well-lit face" />
        <Tip ok text="Eyes visible" />
        <Tip ok text="Close-up shot" />
        <Tip text="Blurry or dark photos" />
        <Tip text="Multiple pets in one shot" />
        <Tip text="Face hidden by toys" />
      </aside>
    </div>
  );
}
function Tip({ ok, text }: { ok?: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <span className={`size-5 rounded-full grid place-items-center text-[10px] font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "" : "text-muted-foreground line-through"}>{text}</span>
    </div>
  );
}

/* ---------------- Step 2: Theme ---------------- */

function StepTheme({ themeId, setThemeId }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {themes.map((t) => {
        const active = t.id === themeId;
        return (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            className={`group relative overflow-hidden rounded-3xl text-left transition-all ${
              active ? "ring-4 ring-primary scale-[1.02] shadow-[var(--shadow-card)]" : "hover:-translate-y-1"
            }`}
          >
            <div className="relative aspect-[4/5] bg-secondary">
              <img src={t.img} alt={t.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t ${t.gradient} mix-blend-overlay opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-3 right-3 text-2xl drop-shadow">{t.emoji}</div>
              {active && <div className="absolute top-3 left-3 size-7 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">✓</div>}
              <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                <div className="font-display text-2xl">{t.name}</div>
                <div className="text-xs opacity-80">{t.tag}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Step 3: Personality ---------------- */

function StepPersonality({ theme, personalityId, setPersonalityId }: any) {
  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
        <span className="text-lg">{theme.emoji}</span>
        <span className="font-semibold">{theme.name}</span>
        <span className="text-muted-foreground">· choose a personality</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
        {theme.personalities.map((p: Personality) => {
          const active = p.id === personalityId;
          return (
            <button
              key={p.id}
              onClick={() => setPersonalityId(p.id)}
              className={`relative text-left rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 ${
                active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {p.recommended && (
                <span className="absolute -top-2 right-4 rounded-full bg-foreground text-background px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">★ Popular</span>
              )}
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-2xl bg-secondary grid place-items-center text-3xl shrink-0">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl">{p.name}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{p.desc}</div>
                </div>
                {active && <div className="size-6 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">✓</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 4: Traits ---------------- */

function StepTraits({ traits, toggleTrait }: any) {
  return (
    <div>
      <p className="text-muted-foreground mb-6">Pick up to 3 (totally optional). Skip if your pet defies labels.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRAITS.map((t) => {
          const active = traits.includes(t.id);
          const disabled = !active && traits.length >= 3;
          return (
            <button
              key={t.id}
              onClick={() => toggleTrait(t.id)}
              disabled={disabled}
              className={`rounded-2xl border-2 p-5 text-center transition-all ${
                active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)] scale-105" :
                disabled ? "border-border bg-card opacity-40 cursor-not-allowed" :
                "border-border bg-card hover:border-primary/40 hover:-translate-y-0.5"
              }`}
            >
              <div className="text-3xl mb-1">{t.emoji}</div>
              <div className="font-semibold text-sm capitalize">{t.label}</div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 text-xs text-muted-foreground">
        {traits.length}/3 selected{traits.length === 0 && " · Feel free to skip — it's optional."}
      </div>
    </div>
  );
}

/* ---------------- Step 5: Generate ---------------- */

function StepGenerate({
  theme, personality, file, genProgress, genStage, genDone, genFailed,
  setGenFailed, retryGen, favourite, setFavourite, setZoom,
  genResultUrl, genError,
}: any) {
  if (genFailed) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center max-w-xl mx-auto">
        <div className="text-5xl mb-4">😿</div>
        <h3 className="font-display text-2xl">Generation hiccup</h3>
        <p className="text-muted-foreground text-sm mt-2 mb-6">
          {genError ?? "Our AI tripped over its own paws. Let's try again — usually nails it second time."}
        </p>
        <button onClick={retryGen} className="rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          Retry generation
        </button>
      </div>
    );
  }
  if (!genDone) {
    return (
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className={`relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br ${theme.gradient}`}>
          {file && (
            <img src={file} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" />
          )}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-[pulse-ring_1.8s_ease-out_infinite]" style={{ background: "var(--gradient-primary)" }} />
              <div className="absolute inset-0 rounded-full animate-[pulse-ring_1.8s_ease-out_infinite] [animation-delay:0.6s]" style={{ background: "var(--gradient-primary)" }} />
              <div className="relative size-24 rounded-full grid place-items-center text-4xl text-primary-foreground shadow-2xl" style={{ background: "var(--gradient-primary)" }}>
                {GEN_STAGES[genStage].emoji}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:400px_100%] animate-[shimmer_2s_linear_infinite]" />
        </div>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between text-sm font-semibold mb-2">
            <span className="flex items-center gap-2">
              <span className="text-lg">{GEN_STAGES[genStage].emoji}</span>
              {GEN_STAGES[genStage].label}…
            </span>
            <span className="text-muted-foreground">{Math.floor(genProgress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-5">
            <div className="h-full transition-all duration-300" style={{ width: `${genProgress}%`, background: "var(--gradient-primary)" }} />
          </div>
          <ol className="grid sm:grid-cols-5 gap-2 text-xs">
            {GEN_STAGES.map((g, i) => (
              <li key={i} className={`rounded-full px-3 py-1.5 text-center font-medium transition-all ${
                i < genStage ? "bg-primary/10 text-primary" :
                i === genStage ? "bg-foreground text-background" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i < genStage ? "✓ " : ""}{g.label.replace(/Building |Painting the |Adding final |Analyzing |Reading those soulful /, "")}
              </li>
            ))}
          </ol>
          <button onClick={() => setGenFailed(true)} className="mt-6 text-xs text-muted-foreground hover:text-foreground underline opacity-60">
            Simulate failure (demo)
          </button>
        </div>
      </div>
    );
  }

  /* RESULTS — use real AI result when available, otherwise theme placeholders */
  const royalImgs = [royalV1, royalV2, royalV3];
  const isRoyal = theme.id === "royal";
  const heroImg = genResultUrl ?? (isRoyal ? royalImgs[0] : theme.img);
  const variations = [
    { id: 0, badge: "Most popular", tone: "Heroic edition", filter: "", img: heroImg, sub: "Cinematic studio lighting" },
    { id: 1, badge: "Staff pick", tone: "Dramatic edition", filter: "saturate(1.35) contrast(1.12) brightness(0.97)", img: genResultUrl ?? (isRoyal ? royalImgs[1] : theme.img), sub: "Bold expression, deep shadows" },
    { id: 2, badge: null, tone: "Pastel dream", filter: "saturate(0.78) brightness(1.08) hue-rotate(-8deg)", img: genResultUrl ?? (isRoyal ? royalImgs[2] : theme.img), sub: "Soft glow, dreamy palette" },
  ];

  return (
    <div className="relative">
      {/* CONFETTI BURST */}
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-40 overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => {
          const colors = ["#ff8a4c", "#f8b5c9", "#ffd166", "#9b72cf", "#67e8f9", "#ff6b6b"];
          return (
            <span
              key={i}
              className="absolute top-0 block rounded-sm animate-[confetti_2.4s_ease-out_forwards]"
              style={{
                left: `${(i * 3.6) % 100}%`,
                background: colors[i % colors.length],
                width: i % 3 === 0 ? 8 : 6,
                height: i % 3 === 0 ? 14 : 10,
                transform: `rotate(${i * 23}deg)`,
                animationDelay: `${(i % 8) * 60}ms`,
                opacity: 0.95,
              }}
            />
          );
        })}
      </div>

      {/* CELEBRATION BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-7 text-center animate-[fade-up_0.6s_ease-out]" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 size-52 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <div className="text-4xl md:text-5xl mb-2 animate-[bounce-soft_1.8s_ease-in-out_infinite]">🎉</div>
          <h2 className="font-display text-3xl md:text-5xl text-primary-foreground leading-tight">
            Your Pawtoon is ready.
          </h2>
          <p className="mt-2 text-primary-foreground/85 text-sm md:text-base">
            Main character energy unlocked. Pick your favourite cut below.
          </p>
        </div>
      </div>

      {/* VARIATIONS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {variations.map((v, i) => {
          const isFav = favourite === v.id;
          return (
            <div
              key={v.id}
              className={`group relative rounded-3xl overflow-hidden bg-card border-2 transition-all duration-500 animate-[fade-up_0.7s_ease-out_both] ${
                isFav ? "border-primary shadow-[var(--shadow-card)] scale-[1.02]" : "border-transparent hover:border-border hover:-translate-y-1"
              }`}
              style={{ animationDelay: `${200 + i * 140}ms` }}
            >
              <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
                <img
                  src={v.img}
                  alt={v.tone}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  style={{ filter: v.filter }}
                  loading="lazy"
                  width={1024}
                  height={1024}
                />
                {!isRoyal && <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} mix-blend-overlay opacity-35`} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {v.badge && (
                  <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
                    v.badge === "Most popular" ? "bg-foreground/90 text-background" : "bg-amber-400/95 text-amber-950"
                  }`}>
                    {v.badge === "Most popular" ? "🔥 " : "★ "}{v.badge}
                  </span>
                )}

                <button
                  onClick={() => setFavourite(v.id)}
                  className={`absolute top-3 right-3 size-10 rounded-full grid place-items-center backdrop-blur transition-all ${
                    isFav ? "bg-primary text-primary-foreground scale-110 shadow-[var(--shadow-glow)]" : "bg-background/85 hover:bg-background hover:scale-110"
                  }`}
                  aria-label="Favourite"
                >
                  <span className={isFav ? "animate-[bounce-soft_0.6s_ease-out]" : ""}>{isFav ? "♥" : "♡"}</span>
                </button>

                <div className="absolute bottom-3 inset-x-3 flex gap-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <button onClick={() => setZoom(v.id)} className="flex-1 rounded-full bg-background/95 backdrop-blur px-3 py-2 text-xs font-semibold hover:bg-background">🔍 Zoom</button>
                  <button className="flex-1 rounded-full bg-background/95 backdrop-blur px-3 py-2 text-xs font-semibold hover:bg-background">⇆ Compare</button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-display text-lg">{personality.name}</div>
                  <span className="text-[10px] text-muted-foreground font-mono">v{v.id + 1}</span>
                </div>
                <div className="text-xs text-muted-foreground">{v.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SHARE STRIP */}
      <ShareStrip theme={theme} personality={personality} img={isRoyal ? royalImgs[favourite] ?? royalImgs[0] : theme.img} />
    </div>
  );
}

/* ---------------- Share Experience ---------------- */

function ShareStrip({ theme, personality, img }: any) {
  return (
    <section className="mt-10 rounded-3xl bg-card border border-border overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_1.2fr]">
        {/* Mock Instagram story / TikTok preview */}
        <div className="relative p-6 md:p-8 bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400">
          <div className="flex items-center gap-3 text-white">
            <div className="size-9 rounded-full bg-white/20 backdrop-blur grid place-items-center text-sm">@you</div>
            <div>
              <div className="text-sm font-semibold">your_story · now</div>
              <div className="text-[11px] opacity-80">Pawtoons · tap to share</div>
            </div>
            <span className="ml-auto text-xs opacity-80">···</span>
          </div>
          <div className="mt-5 relative mx-auto w-full max-w-[260px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl ring-4 ring-white/30">
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            <div className="absolute top-4 inset-x-4 flex gap-1">
              {[0,1,2].map(i => <div key={i} className={`flex-1 h-0.5 rounded-full ${i===0 ? "bg-white" : "bg-white/40"}`} />)}
            </div>
            <div className="absolute bottom-5 inset-x-4 text-white text-center">
              <div className="text-[11px] uppercase tracking-widest opacity-80">my pet but make it</div>
              <div className="font-display text-2xl leading-tight">{personality.name.toUpperCase()}</div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[10px] font-semibold">
                ✨ made with Pawtoons
              </div>
            </div>
          </div>
        </div>

        {/* Share actions + copy */}
        <div className="p-6 md:p-8">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Share the chaos</span>
          <h3 className="font-display text-2xl md:text-3xl mt-2">Turn it loose on the internet.</h3>
          <p className="text-sm text-muted-foreground mt-2">Everyone needs to see this. It's the law now.</p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <ShareBtn icon="📸" label="Instagram Story" tone="from-fuchsia-500 to-orange-400" />
            <ShareBtn icon="🎵" label="TikTok" tone="from-black to-rose-500" />
            <ShareBtn icon="🐦" label="Post on X" tone="from-slate-900 to-slate-700" />
            <ShareBtn icon="💬" label="Send to friend" tone="from-emerald-500 to-teal-500" />
          </div>

          <div className="mt-5 flex gap-2">
            <button className="flex-1 rounded-full px-5 py-3 text-sm font-semibold border border-border hover:bg-secondary transition flex items-center justify-center gap-2">
              ⬇ Download preview
            </button>
            <button className="rounded-full size-12 grid place-items-center border border-border hover:bg-secondary transition" aria-label="Copy link">🔗</button>
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-secondary/60 flex items-center gap-3 text-xs">
            <span className="text-base">💡</span>
            <span><b>Pro tip:</b> Pawtoons posted as Reels get 3× the reach. Just saying.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShareBtn({ icon, label, tone }: { icon: string; label: string; tone: string }) {
  return (
    <button className={`relative overflow-hidden rounded-2xl p-3 text-left text-white bg-gradient-to-br ${tone} transition-transform hover:scale-[1.03] hover:-translate-y-0.5`}>
      <div className="text-xl">{icon}</div>
      <div className="text-xs font-semibold mt-1">{label}</div>
    </button>
  );
}

/* ---------------- Step 6: Product ---------------- */

function StepProduct({ theme, productId, setProductId, size, setSize, fit, setFit, color, setColor }: any) {
  const product = PRODUCTS.find((p) => p.id === productId)!;
  const colorObj = COLORS.find((c) => c.id === color)!;
  const fitObj = FITS.find((f) => f.id === fit)!;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.map((p) => {
            const active = p.id === productId;
            return (
              <button
                key={p.id}
                onClick={() => setProductId(p.id)}
                className={`text-left rounded-3xl overflow-hidden bg-card border-2 transition-all hover:-translate-y-0.5 ${
                  active ? "border-primary shadow-[var(--shadow-card)]" : "border-transparent hover:border-border"
                }`}
              >
                <div className="relative aspect-square bg-secondary">
                  <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-2 right-2 size-9 rounded-full bg-background/90 backdrop-blur grid place-items-center text-xs font-bold">
                    ${p.price}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-display text-base">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {productId === "tshirt" && (
          <div className="mt-6 rounded-3xl bg-card border border-border p-6 animate-[fade-up_0.4s_ease-out]">
            <h3 className="font-display text-xl mb-4">Customise your tee</h3>

            <Section label="Colour" value={colorObj.name}>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => {
                  const active = c.id === color;
                  return (
                    <button key={c.id} onClick={() => setColor(c.id)} aria-label={c.name}
                      className={`size-11 rounded-full transition-transform hover:scale-110 ${(c as any).ring ?? ""} ${active ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      style={{ background: c.hex }} />
                  );
                })}
              </div>
            </Section>

            <Section label="Size">
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => {
                  const active = s === size;
                  return (
                    <button key={s} onClick={() => setSize(s)}
                      className={`min-w-[52px] h-11 px-4 rounded-xl font-semibold text-sm border-2 transition ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"
                      }`}>{s}</button>
                  );
                })}
              </div>
            </Section>

            <Section label="Fit" last>
              <div className="grid sm:grid-cols-3 gap-2">
                {FITS.map((f) => {
                  const active = f.id === fit;
                  return (
                    <button key={f.id} onClick={() => setFit(f.id)}
                      className={`text-left rounded-2xl p-3 border-2 transition ${
                        active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                      }`}>
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-sm">{f.name}</div>
                        {f.extra > 0 && <span className="text-[10px] font-bold text-primary">+${f.extra}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>
        )}
      </div>

      <aside className="rounded-3xl bg-card border border-border p-5 h-fit lg:sticky lg:top-44 shadow-[var(--shadow-soft)]">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Live preview</div>
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4" style={{ background: colorObj.hex }}>
          {productId === "tshirt" ? (
            <>
              <img src={tshirt} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
                style={{ filter: color === "white" || color === "cream" ? "invert(0)" : color === "black" ? "brightness(0.4) contrast(1.2)" : "saturate(0.4)" }} />
              <div className="absolute inset-0 grid place-items-center">
                <div className={`size-28 rounded-2xl overflow-hidden border-4 border-background/70 shadow-2xl rotate-[-3deg] bg-gradient-to-br ${theme.gradient}`}>
                  <img src={theme.img} alt="" className="w-full h-full object-cover mix-blend-overlay" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50 mix-blend-color`} />
                </div>
              </div>
            </>
          ) : (
            <img src={product.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
        <div className="font-display text-xl">{product.name}</div>
        {productId === "tshirt" && (
          <div className="text-xs text-muted-foreground">{colorObj.name} · {size} · {fitObj.name}</div>
        )}
        <div className="mt-3 flex items-center gap-3 p-3 rounded-2xl bg-secondary">
          <div className={`size-10 rounded-xl overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
            <img src={theme.img} alt="" className="w-full h-full object-cover mix-blend-overlay" />
          </div>
          <div className="text-xs">
            <div className="font-semibold">Your Pawtoon</div>
            <div className="text-muted-foreground">{theme.name} · ready ✓</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
function Section({ label, value, children, last }: any) {
  return (
    <div className={last ? "" : "mb-5"}>
      <div className="flex items-baseline justify-between mb-2.5">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{label}</h4>
        {value && <span className="text-xs font-semibold">{value}</span>}
      </div>
      {children}
    </div>
  );
}

/* ---------------- Step 7: Checkout summary ---------------- */

function StepCheckout({ theme, personality, product, size, fitObj, colorObj, total, productId }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className={`rounded-3xl overflow-hidden bg-gradient-to-br ${theme.gradient} p-1`}>
        <div className="rounded-[22px] bg-card overflow-hidden">
          <div className="relative aspect-square">
            <img src={theme.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} mix-blend-overlay opacity-40`} />
          </div>
          <div className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your Pawtoon</div>
            <div className="font-display text-2xl">{personality.name}</div>
            <div className="text-sm text-muted-foreground">{theme.name} · {theme.tag}</div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl bg-card border border-border p-6 flex flex-col">
        <h3 className="font-display text-xl mb-4">Order summary</h3>
        <Row k="Product" v={product.name} />
        {productId === "tshirt" && (
          <>
            <Row k="Colour" v={colorObj.name} />
            <Row k="Size" v={size} />
            <Row k="Fit" v={fitObj.name + (fitObj.extra ? ` (+$${fitObj.extra})` : "")} />
          </>
        )}
        <Row k="Shipping" v="Free · 3-5 days" />
        <div className="border-t border-border my-4" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-3xl text-primary">${total}</span>
        </div>
        <div className="mt-auto pt-5 text-xs text-muted-foreground flex items-center gap-3">
          <span>🔒 Secure checkout</span><span>·</span><span>30-day returns</span>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

/* ---------------- Social Showcase ---------------- */

const FEED = [
  { img: royalV1, user: "@bella.thecorgi", handle: "Bella, 4yo", caption: "She demanded the throne. We obliged. 👑", likes: "12.4k", comments: 284, theme: "Royal" },
  { img: mafia, user: "@loki_themobster", handle: "Loki, 6yo", caption: "Don't make him ask twice for the treats.", likes: "8.9k", comments: 167, theme: "Mafia" },
  { img: astronaut, user: "@mochi.in.space", handle: "Mochi, 2yo", caption: "Houston, we have a chonk. 🚀", likes: "21.2k", comments: 532, theme: "Astronaut" },
  { img: superhero, user: "@captain_biscuit", handle: "Biscuit, 5yo", caption: "Saves the day. Naps for the rest.", likes: "6.7k", comments: 98, theme: "Superhero" },
  { img: viking, user: "@thor.the.frenchie", handle: "Thor, 3yo", caption: "Sleepy warrior. Mighty after 14h.", likes: "9.3k", comments: 211, theme: "Viking" },
  { img: pirate, user: "@captain.barknacle", handle: "Barknacle, 7yo", caption: "Treasure = his dinner bowl. Arrr.", likes: "5.1k", comments: 74, theme: "Pirate" },
  { img: royalV3, user: "@cleo.princess", handle: "Cleo, 1yo", caption: "Tiny tyrant in flower-crown era. 🌸", likes: "14.8k", comments: 312, theme: "Royal" },
  { img: royalV2, user: "@duke_thegrump", handle: "Duke, 8yo", caption: "Permanent side-eye. Iconic.", likes: "11.0k", comments: 245, theme: "Royal" },
];

function SocialShowcase() {
  return (
    <section className="mt-20">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">#Pawtoons</span>
        <h2 className="mt-2 font-display text-3xl md:text-5xl">Pets gone viral.</h2>
        <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-lg mx-auto">
          47K+ posts. Counting. Every pet deserves their movie poster moment.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {FEED.map((p, i) => (
          <article
            key={i}
            className="group rounded-3xl overflow-hidden bg-card border border-border hover:shadow-[var(--shadow-card)] transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-square overflow-hidden">
              <img src={p.img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading="lazy" />
              <span className="absolute top-3 left-3 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                {p.theme}
              </span>
            </div>
            <div className="p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="size-7 rounded-full grid place-items-center text-[10px] font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {p.user.charAt(1).toUpperCase()}
                </div>
                <div className="text-xs">
                  <div className="font-semibold leading-tight">{p.user}</div>
                  <div className="text-muted-foreground leading-tight">{p.handle}</div>
                </div>
              </div>
              <p className="text-xs leading-snug">{p.caption}</p>
              <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="text-rose-500">♥</span> {p.likes}</span>
                <span className="flex items-center gap-1">💬 {p.comments}</span>
                <span className="ml-auto text-primary font-semibold">↗ Share</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Live reaction ticker */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-secondary/60 border border-border py-3">
        <div className="flex gap-8 whitespace-nowrap animate-[marquee_28s_linear_infinite]">
          {[
            "💬 @mia_p: 'I cried laughing'",
            "♥ 312 just liked Cleo's Pawtoon",
            "🎉 New Pawtoon every 7 seconds",
            "💬 @james: 'Bought 4 mugs. No regrets.'",
            "🔥 Trending: Mafia theme",
            "💬 @nina: 'Better than my actual headshots'",
            "♥ 1.2k loved Thor's portrait",
            "🎁 92% buy as a gift",
          ].concat([
            "💬 @mia_p: 'I cried laughing'",
            "♥ 312 just liked Cleo's Pawtoon",
            "🎉 New Pawtoon every 7 seconds",
            "💬 @james: 'Bought 4 mugs. No regrets.'",
            "🔥 Trending: Mafia theme",
            "💬 @nina: 'Better than my actual headshots'",
            "♥ 1.2k loved Thor's portrait",
            "🎁 92% buy as a gift",
          ]).map((t, i) => (
            <span key={i} className="text-sm font-medium">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Zoom Modal ---------------- */

function ZoomModal({ img, theme, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl grid place-items-center p-4 animate-[fade-in_0.2s_ease-out]" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 size-11 rounded-full bg-white/10 text-white grid place-items-center text-xl hover:bg-white/20">✕</button>
      <div className={`relative max-w-3xl w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${theme.gradient}`} onClick={(e) => e.stopPropagation()}>
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  );
}
