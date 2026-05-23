import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import royal from "@/assets/pet-royal.jpg";
import superhero from "@/assets/pet-superhero.jpg";
import mafia from "@/assets/pet-mafia.jpg";
import astronaut from "@/assets/pet-astronaut.jpg";
import viking from "@/assets/pet-viking.jpg";
import pirate from "@/assets/pet-pirate.jpg";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload your pet — Pawtoons" }] }),
  component: Upload,
});

const themes = [
  { id: "royal", name: "Royal Pet", tag: "Crown jewels included", img: royal, emoji: "👑" },
  { id: "superhero", name: "Superhero Pet", tag: "Cape, drama, glory", img: superhero, emoji: "🦸" },
  { id: "mafia", name: "Mafia Boss", tag: "Don't make it personal", img: mafia, emoji: "🎩" },
  { id: "viking", name: "Viking Warrior", tag: "Battle ready, belly rubs", img: viking, emoji: "⚔️" },
  { id: "astronaut", name: "Astronaut Explorer", tag: "To infinity and treats", img: astronaut, emoji: "🚀" },
  { id: "pirate", name: "Pirate Captain", tag: "Arrr-mazing", img: pirate, emoji: "🏴‍☠️" },
];

type Stage = "upload" | "generating" | "results";

function Upload() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [theme, setTheme] = useState("royal");
  const [genProgress, setGenProgress] = useState(0);
  const [favourite, setFavourite] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFileName(f.name);
    setUploadProgress(0);
    // simulate upload progress
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(tick);
        setFile(URL.createObjectURL(f));
      }
      setUploadProgress(p);
    }, 140);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const startGenerate = () => {
    setStage("generating");
    setGenProgress(0);
  };

  useEffect(() => {
    if (stage !== "generating") return;
    const tick = setInterval(() => {
      setGenProgress((p) => {
        const next = p + Math.random() * 6 + 2;
        if (next >= 100) {
          clearInterval(tick);
          setTimeout(() => setStage("results"), 500);
          return 100;
        }
        return next;
      });
    }, 220);
    return () => clearInterval(tick);
  }, [stage]);

  const currentThemeImg = themes.find((t) => t.id === theme)!.img;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Nav />

      {/* Progress steps */}
      <div className="mx-auto max-w-5xl px-5 md:px-8 pt-8">
        <div className="flex items-center gap-2 text-xs">
          {["Upload", "Generate", "Choose"].map((label, i) => {
            const active =
              (i === 0 && stage === "upload") ||
              (i === 1 && stage === "generating") ||
              (i === 2 && stage === "results");
            const done =
              (i === 0 && stage !== "upload") || (i === 1 && stage === "results");
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`size-7 rounded-full grid place-items-center text-xs font-semibold transition-all ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                      ? "bg-foreground text-background scale-110"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className={active || done ? "font-semibold" : "text-muted-foreground"}>{label}</span>
                {i < 2 && <div className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {stage === "upload" && (
        <section className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14">
          <div className="text-center mb-10 animate-[fade-up_0.6s_ease-out]">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Step 1 — The glamour shot</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-display">Show us your superstar 🌟</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Upload a clear photo. Our AI will turn them into a legend in under 60 seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
            {/* Upload area */}
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`relative aspect-square rounded-[2rem] border-2 border-dashed transition-all overflow-hidden ${
                  dragOver
                    ? "border-primary bg-secondary scale-[1.01]"
                    : file
                    ? "border-primary/40 bg-card"
                    : "border-border bg-card hover:border-primary hover:bg-secondary/40 cursor-pointer"
                }`}
              >
                {file ? (
                  <>
                    <img src={file} alt="Your pet" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="rounded-full bg-background/95 backdrop-blur px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow-soft)] hover:bg-background"
                      >
                        🔄 Change
                      </button>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFileName("");
                          setUploadProgress(0);
                        }}
                        className="rounded-full bg-background/95 backdrop-blur px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow-soft)] hover:bg-destructive hover:text-destructive-foreground"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-background/95 backdrop-blur px-4 py-2 flex items-center gap-2 shadow-[var(--shadow-soft)]">
                      <div className="size-7 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs">✓</div>
                      <div className="text-sm font-semibold truncate">{fileName || "Photo uploaded"}</div>
                    </div>
                  </>
                ) : uploadProgress > 0 ? (
                  <div className="absolute inset-0 grid place-items-center p-8">
                    <div className="w-full max-w-sm text-center">
                      <div className="relative size-20 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-secondary" />
                        <div
                          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-[spin-slow_1s_linear_infinite]"
                        />
                        <div className="absolute inset-0 grid place-items-center font-display text-lg">
                          {Math.round(uploadProgress)}%
                        </div>
                      </div>
                      <div className="mt-5 font-display text-lg">Uploading your superstar...</div>
                      <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%`, background: "var(--gradient-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-center p-8">
                    <div>
                      <div className="relative inline-grid place-items-center">
                        <span className="absolute inset-0 rounded-full bg-primary/30 animate-[pulse-ring_2s_ease-out_infinite]" />
                        <div className="relative size-24 rounded-full grid place-items-center text-4xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                          📸
                        </div>
                      </div>
                      <div className="mt-6 font-display text-2xl">Drop the photo here</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        or <span className="text-primary font-semibold underline">click to browse</span>
                      </div>
                      <div className="mt-5 flex justify-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2.5 py-1">JPG</span>
                        <span className="rounded-full bg-secondary px-2.5 py-1">PNG</span>
                        <span className="rounded-full bg-secondary px-2.5 py-1">≤ 10MB</span>
                      </div>
                    </div>
                  </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
              </div>

              <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 w-full rounded-full border border-border bg-card py-3 text-sm font-semibold hover:bg-secondary transition"
              >
                📁 Or upload from your device
              </button>
            </div>

            {/* Themes */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-display text-2xl">Pick a personality</h2>
                <span className="text-xs text-muted-foreground">6 themes</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => {
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`group relative text-left rounded-2xl overflow-hidden bg-card border-2 transition-all hover:-translate-y-0.5 ${
                        active
                          ? "border-primary shadow-[var(--shadow-card)]"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <div className="aspect-[5/4] overflow-hidden">
                        <img
                          src={t.img}
                          alt={t.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-display text-sm font-semibold">
                            {t.emoji} {t.name}
                          </div>
                          {active && (
                            <div className="size-5 rounded-full bg-primary grid place-items-center text-primary-foreground text-[10px]">✓</div>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{t.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={startGenerate}
                disabled={!file}
                className="mt-6 w-full rounded-full px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
              >
                ✨ Generate My Caricature
              </button>
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span>⚡ ~60s</span>
                <span>•</span>
                <span>🔁 Free regenerations</span>
                <span>•</span>
                <span>💝 30-day returns</span>
              </div>
            </div>
          </div>

          {/* Why photos matter */}
          <div className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Pro tip</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-display">Why your photo matters 📷</h2>
              <p className="mt-3 text-muted-foreground">
                Great photos = great caricatures. Here's what works (and what doesn't).
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-card border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-full bg-primary/15 grid place-items-center text-primary">✓</div>
                  <h3 className="font-display text-xl">Good photos</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  {[
                    "Bright, natural lighting (window light is perfect)",
                    "Face clearly visible and looking at camera",
                    "Single pet in the frame, close up",
                    "High resolution, sharp focus",
                  ].map((g) => (
                    <li key={g} className="flex gap-3">
                      <span className="text-primary">●</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-card border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-full bg-destructive/15 grid place-items-center text-destructive">✕</div>
                  <h3 className="font-display text-xl">Try to avoid</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  {[
                    "Dark, low-light or backlit shots",
                    "Blurry or motion-shake photos",
                    "Pet far away or partially hidden",
                    "Multiple pets in the same frame",
                  ].map((g) => (
                    <li key={g} className="flex gap-3">
                      <span className="text-destructive">●</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {stage === "generating" && (
        <section className="mx-auto max-w-3xl px-5 md:px-8 py-16 md:py-24 text-center">
          <div className="relative inline-grid place-items-center mb-8">
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-[pulse-ring_2s_ease-out_infinite]" />
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-[pulse-ring_2s_ease-out_0.6s_infinite]" />
            <div className="relative size-28 rounded-full grid place-items-center text-5xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              ✨
            </div>
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Generating your pet masterpiece...</h2>
          <p className="mt-3 text-muted-foreground">
            Our AI is dressing them up. This usually takes under 60 seconds.
          </p>

          <div className="mt-10 max-w-md mx-auto">
            <div className="h-3 rounded-full bg-secondary overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${genProgress}%`, background: "var(--gradient-primary)" }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(genProgress)}% complete</span>
              <span>{genProgress < 33 ? "Analysing features..." : genProgress < 66 ? "Painting caricature..." : genProgress < 95 ? "Adding final flourishes..." : "Almost done!"}</span>
            </div>
          </div>

          {/* Preview placeholder cards */}
          <div className="mt-12 grid grid-cols-3 gap-3 md:gap-4 max-w-xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-secondary relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.6), transparent)",
                    backgroundSize: "400px 100%",
                    animation: `shimmer 1.6s linear ${i * 0.2}s infinite`,
                  }}
                />
                <div className="absolute inset-0 grid place-items-center text-3xl opacity-40 animate-[bounce-soft_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.3}s` }}>
                  🎨
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-4 py-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Fun fact: 94% of pet parents cry happy tears the first time.
          </div>
        </section>
      )}

      {stage === "results" && (
        <ResultsView
          source={file!}
          themeImg={currentThemeImg}
          themeName={themes.find((t) => t.id === theme)!.name}
          favourite={favourite}
          setFavourite={setFavourite}
          onContinue={() => navigate({ to: "/products" })}
          onRegenerate={() => {
            setStage("generating");
            setGenProgress(0);
          }}
        />
      )}

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 bg-background/90 backdrop-blur-xl border-t border-border">
        <button
          onClick={() => {
            if (stage === "upload" && file) startGenerate();
            else if (stage === "results") navigate({ to: "/products" });
            else if (stage === "upload") inputRef.current?.click();
          }}
          className="w-full rounded-full px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          {stage === "upload" && !file && "📸 Upload Photo"}
          {stage === "upload" && file && "✨ Create My Pet"}
          {stage === "generating" && "Generating..."}
          {stage === "results" && "Continue →"}
        </button>
      </div>

      <Footer />
    </div>
  );
}

function ResultsView({
  source,
  themeImg,
  themeName,
  favourite,
  setFavourite,
  onContinue,
  onRegenerate,
}: {
  source: string;
  themeImg: string;
  themeName: string;
  favourite: number;
  setFavourite: (n: number) => void;
  onContinue: () => void;
  onRegenerate: () => void;
}) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14 animate-[fade-up_0.6s_ease-out]">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold">
          ✨ Done in 47 seconds
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-display">Meet the new legend 🎉</h1>
        <p className="mt-3 text-muted-foreground">
          Pick your favourite — or regenerate for more options. It's free.
        </p>
      </div>

      {/* Before / After slider */}
      <div className="rounded-[2rem] bg-card border border-border p-4 md:p-6 mb-10">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 text-center">
          Drag to compare — Before / After
        </div>
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-secondary select-none">
          <img src={themeImg} alt="After" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={source}
              alt="Before"
              className="absolute inset-y-0 left-0 h-full object-cover"
              style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }}
            />
          </div>
          <div
            className="absolute inset-y-0 w-1 bg-white shadow-lg cursor-ew-resize"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 size-10 rounded-full bg-white grid place-items-center text-foreground shadow-xl font-bold">
              ⇄
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
          <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
            Before
          </div>
          <div className="absolute top-3 right-3 rounded-full bg-foreground text-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
            After · {themeName}
          </div>
        </div>
      </div>

      {/* Generated options */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">3 fresh designs, just for you</h2>
        <button
          onClick={onRegenerate}
          className="text-sm font-semibold rounded-full border border-border bg-card px-4 py-2 hover:bg-secondary transition"
        >
          🔄 Regenerate
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => {
          const active = favourite === i;
          return (
            <div
              key={i}
              className={`group relative rounded-3xl overflow-hidden bg-card border-2 transition-all ${
                active ? "border-primary shadow-[var(--shadow-card)] -translate-y-1" : "border-transparent hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              }`}
            >
              <button
                onClick={() => setFavourite(i)}
                className="absolute top-3 right-3 z-10 size-10 rounded-full bg-background/95 backdrop-blur grid place-items-center text-lg shadow-[var(--shadow-soft)] hover:scale-110 transition"
                aria-label="Favourite"
              >
                <span className={active ? "" : "grayscale opacity-50"}>{active ? "❤️" : "🤍"}</span>
              </button>
              <div className="aspect-square overflow-hidden">
                <img
                  src={themeImg}
                  alt={`Variation ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ filter: i === 1 ? "hue-rotate(-12deg) saturate(1.1)" : i === 2 ? "brightness(1.05) contrast(1.05)" : "none" }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg">Variation {i + 1}</div>
                    <div className="text-xs text-muted-foreground">{themeName} style</div>
                  </div>
                  <button
                    onClick={() => {
                      setFavourite(i);
                      onContinue();
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? "text-primary-foreground"
                        : "bg-foreground text-background hover:bg-primary"
                    }`}
                    style={active ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    Use this →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini checkout preview */}
      <div className="mt-12 rounded-3xl p-6 md:p-8" style={{ background: "var(--gradient-warm)" }}>
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-2xl overflow-hidden border-4 border-background shadow-[var(--shadow-soft)]">
              <img src={themeImg} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-foreground/70">Your selection</div>
              <div className="font-display text-xl">{themeName} · Variation {favourite + 1}</div>
              <div className="text-sm text-foreground/75">Ready for printing on premium products</div>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="rounded-full bg-foreground text-background px-6 py-3.5 font-semibold hover:bg-primary transition-colors"
          >
            Pick your product →
          </button>
        </div>
      </div>
    </section>
  );
}
