import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useRef, useState } from "react";
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

type Personality = { id: string; name: string; emoji: string; desc: string; recommended?: boolean };
type Theme = {
  id: string;
  name: string;
  tag: string;
  img: string;
  emoji: string;
  personalities: Personality[];
};

const themes: Theme[] = [
  {
    id: "royal", name: "Royal", tag: "Crown jewels included", img: royal, emoji: "👑",
    personalities: [
      { id: "noble-king", name: "Noble King", emoji: "👑", desc: "Wise, regal, slightly stuck-up.", recommended: true },
      { id: "spoiled-royalty", name: "Spoiled Royalty", emoji: "💅", desc: "Demands snacks. Now." },
      { id: "tiny-tyrant", name: "Tiny Tyrant", emoji: "😤", desc: "Small body. Huge ego." },
      { id: "elegant-queen", name: "Elegant Queen", emoji: "👸", desc: "Effortlessly fabulous." },
    ],
  },
  {
    id: "mafia", name: "Mafia", tag: "Don't make it personal", img: mafia, emoji: "🎩",
    personalities: [
      { id: "crime-boss", name: "Crime Boss", emoji: "🎩", desc: "Runs the block. And the couch.", recommended: true },
      { id: "silent-assassin", name: "Silent Assassin", emoji: "🥷", desc: "You'll never see them coming." },
      { id: "chaotic-gremlin", name: "Chaotic Gremlin", emoji: "😈", desc: "Pure unhinged energy." },
      { id: "smooth-talker", name: "Smooth Talker", emoji: "😎", desc: "Charm-first, paws second." },
    ],
  },
  {
    id: "viking", name: "Viking", tag: "Battle ready, belly rubs", img: viking, emoji: "⚔️",
    personalities: [
      { id: "berserker", name: "Berserker", emoji: "🪓", desc: "Charges first. Naps later." },
      { id: "sleepy-warrior", name: "Sleepy Warrior", emoji: "😴", desc: "Mighty after a 14h nap.", recommended: true },
      { id: "tiny-but-violent", name: "Tiny But Violent", emoji: "💢", desc: "Small. Furious. Iconic." },
      { id: "fearless-explorer", name: "Fearless Explorer", emoji: "🧭", desc: "Bold seas, bolder treats." },
    ],
  },
  {
    id: "astronaut", name: "Astronaut", tag: "To infinity and treats", img: astronaut, emoji: "🚀",
    personalities: [
      { id: "space-commander", name: "Space Commander", emoji: "🚀", desc: "Calm under cosmic pressure.", recommended: true },
      { id: "lost-in-space", name: "Lost In Space", emoji: "🌌", desc: "Confused. Adorable. Floating." },
      { id: "galactic-genius", name: "Galactic Genius", emoji: "🧠", desc: "Solves quantum kibble." },
      { id: "cosmic-menace", name: "Cosmic Menace", emoji: "👽", desc: "A threat to all known galaxies." },
    ],
  },
  {
    id: "superhero", name: "Superhero", tag: "Cape, drama, glory", img: superhero, emoji: "🦸",
    personalities: [
      { id: "city-protector", name: "City Protector", emoji: "🛡️", desc: "Saves the day, every day." },
      { id: "clumsy-hero", name: "Clumsy Hero", emoji: "🤕", desc: "Means well. Trips often.", recommended: true },
      { id: "overconfident-legend", name: "Overconfident Legend", emoji: "💪", desc: "Believes their own hype." },
      { id: "secret-villain", name: "Secret Villain", emoji: "😼", desc: "Plotting world domination." },
    ],
  },
  {
    id: "pirate", name: "Pirate", tag: "Arrr-mazing", img: pirate, emoji: "🏴‍☠️",
    personalities: [
      { id: "treasure-hunter", name: "Treasure Hunter", emoji: "💰", desc: "Will dig for snacks." },
      { id: "drunken-captain", name: "Drunken Captain", emoji: "🍺", desc: "Wobbly. Loud. Beloved.", recommended: true },
      { id: "chaos-goblin", name: "Chaos Goblin", emoji: "🤪", desc: "Lives only for destruction." },
      { id: "sea-monster-slayer", name: "Sea Monster Slayer", emoji: "🐙", desc: "Bath time = epic battle." },
    ],
  },
];

const TRAITS = [
  { id: "funny", emoji: "🤡" },
  { id: "grumpy", emoji: "😾" },
  { id: "energetic", emoji: "⚡" },
  { id: "lazy", emoji: "🦥" },
  { id: "chaotic", emoji: "🌪️" },
  { id: "elegant", emoji: "🌹" },
  { id: "dramatic", emoji: "🎭" },
  { id: "mischievous", emoji: "😏" },
];

type Stage = "upload" | "generating" | "results";

function Upload() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [themeId, setThemeId] = useState("royal");
  const [personalityId, setPersonalityId] = useState("noble-king");
  const [traits, setTraits] = useState<string[]>(["funny"]);
  const [genProgress, setGenProgress] = useState(0);
  const [favourite, setFavourite] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const theme = useMemo(() => themes.find((t) => t.id === themeId)!, [themeId]);
  const personality = useMemo(
    () => theme.personalities.find((p) => p.id === personalityId) ?? theme.personalities[0],
    [theme, personalityId]
  );

  const toggleTrait = (id: string) =>
    setTraits((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < 3 ? [...t, id] : t));

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFileName(f.name);
    setUploadProgress(0);
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
    // reset personality when theme changes
    setPersonalityId(theme.personalities[0].id);
  }, [themeId]); // eslint-disable-line react-hooks/exhaustive-deps

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
            const done = (i === 0 && stage !== "upload") || (i === 1 && stage === "results");
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`size-7 rounded-full grid place-items-center text-xs font-semibold transition-all ${
                    done ? "bg-primary text-primary-foreground" : active ? "bg-foreground text-background scale-110" : "bg-secondary text-muted-foreground"
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
              Upload a clear photo. Pick a vibe. Our AI turns them into a Pawtoon legend in under 60 seconds.
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
                      <button onClick={() => inputRef.current?.click()} className="rounded-full bg-background/95 backdrop-blur px-3 py-2 text-xs font-semibold shadow-[var(--shadow-soft)] hover:bg-background">
                        🔄 Change
                      </button>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFileName("");
                          setUploadProgress(0);
                        }}
                        className="rounded-full bg-background/95 backdrop-blur px-3 py-2 text-xs font-semibold shadow-[var(--shadow-soft)] hover:bg-destructive hover:text-destructive-foreground"
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
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-[spin-slow_1s_linear_infinite]" />
                        <div className="absolute inset-0 grid place-items-center font-display text-lg">{Math.round(uploadProgress)}%</div>
                      </div>
                      <div className="mt-5 font-display text-lg">Uploading your superstar...</div>
                      <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full transition-all duration-200" style={{ width: `${uploadProgress}%`, background: "var(--gradient-primary)" }} />
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

              <button onClick={() => inputRef.current?.click()} className="mt-4 w-full rounded-full border border-border bg-card py-3.5 text-sm font-semibold hover:bg-secondary transition">
                📁 Or upload from your device
              </button>

              {/* Live preview card */}
              <div className="mt-6 rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Live preview</div>
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl overflow-hidden border-2 border-background shadow-[var(--shadow-soft)] shrink-0">
                    <img src={theme.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-lg truncate">
                      {personality.emoji} {personality.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{theme.name} Pawtoon · {traits.length} traits</div>
                  </div>
                </div>
                {traits.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {traits.map((t) => {
                      const tr = TRAITS.find((x) => x.id === t)!;
                      return (
                        <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium capitalize">
                          {tr.emoji} {t}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Themes + Personalities + Traits */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-2xl">Pick a theme</h2>
                <span className="text-xs text-muted-foreground">6 themes</span>
              </div>
              {/* Themes — horizontal swipeable on mobile */}
              <div className="-mx-5 md:mx-0 px-5 md:px-0 overflow-x-auto snap-x snap-mandatory scrollbar-none">
                <div className="flex md:grid md:grid-cols-3 gap-3 pb-2 md:pb-0">
                  {themes.map((t) => {
                    const active = themeId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setThemeId(t.id)}
                        className={`shrink-0 snap-start w-[140px] md:w-auto group relative text-left rounded-2xl overflow-hidden bg-card border-2 transition-all hover:-translate-y-0.5 ${
                          active ? "border-primary shadow-[var(--shadow-card)]" : "border-transparent hover:border-border"
                        }`}
                      >
                        <div className="aspect-[5/4] overflow-hidden">
                          <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        </div>
                        <div className="p-2.5">
                          <div className="font-display text-sm font-semibold flex items-center justify-between gap-1">
                            <span className="truncate">{t.emoji} {t.name}</span>
                            {active && <span className="size-4 rounded-full bg-primary grid place-items-center text-primary-foreground text-[9px]">✓</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personalities */}
              <div className="mt-7">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-2xl">Choose a personality</h2>
                  <span className="text-xs text-muted-foreground">{theme.name}</span>
                </div>
                <div className="-mx-5 md:mx-0 px-5 md:px-0 overflow-x-auto snap-x snap-mandatory scrollbar-none">
                  <div className="flex md:grid md:grid-cols-2 gap-3 pb-2 md:pb-0">
                    {theme.personalities.map((p) => {
                      const active = personalityId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPersonalityId(p.id)}
                          className={`shrink-0 snap-start w-[200px] md:w-auto text-left rounded-2xl p-4 border-2 transition-all hover:-translate-y-0.5 ${
                            active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-3xl group-hover:scale-110 transition-transform">{p.emoji}</div>
                            {p.recommended && (
                              <span className="text-[9px] font-bold uppercase tracking-wider rounded-full bg-primary/15 text-primary px-2 py-0.5">
                                ⭐ Pick for your pet
                              </span>
                            )}
                          </div>
                          <div className="mt-2 font-display text-base font-semibold flex items-center gap-1">
                            {p.name}
                            {active && <span className="text-primary text-sm">✓</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{p.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pet traits */}
              <div className="mt-7">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-2xl">Pet traits <span className="text-sm font-normal text-muted-foreground">— up to 3</span></h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRAITS.map((t) => {
                    const on = traits.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTrait(t.id)}
                        className={`rounded-full px-4 py-2.5 text-sm font-medium capitalize border-2 transition-all hover:-translate-y-0.5 ${
                          on ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t.emoji} {t.id}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">These nudge the AI to capture their true personality.</p>
              </div>

              <button
                onClick={startGenerate}
                disabled={!file}
                className="mt-7 w-full rounded-full px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
              >
                ✨ Generate My Pawtoon
              </button>
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span>⚡ ~60s</span><span>•</span>
                <span>🔁 Free regenerations</span><span>•</span>
                <span>💝 30-day returns</span>
              </div>
            </div>
          </div>

          {/* Why photos matter */}
          <div className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Pro tip</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-display">Why your photo matters 📷</h2>
              <p className="mt-3 text-muted-foreground">Great photos = great Pawtoons. Here's what works (and what doesn't).</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-card border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-full bg-primary/15 grid place-items-center text-primary">✓</div>
                  <h3 className="font-display text-xl">Good photos</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  {["Bright, natural lighting (window light is perfect)", "Face clearly visible and looking at camera", "Single pet in the frame, close up", "High resolution, sharp focus"].map((g) => (
                    <li key={g} className="flex gap-3"><span className="text-primary">●</span><span>{g}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-card border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-full bg-destructive/15 grid place-items-center text-destructive">✕</div>
                  <h3 className="font-display text-xl">Try to avoid</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  {["Dark, low-light or backlit shots", "Blurry or motion-shake photos", "Pet far away or partially hidden", "Multiple pets in the same frame"].map((g) => (
                    <li key={g} className="flex gap-3"><span className="text-destructive">●</span><span>{g}</span></li>
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
            <div className="relative size-28 rounded-full grid place-items-center text-5xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>✨</div>
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Drawing your Pawtoon masterpiece...</h2>
          <p className="mt-3 text-muted-foreground">
            Becoming a <span className="font-semibold text-foreground">{personality.name}</span> in the {theme.name} universe.
          </p>
          <div className="mt-10 max-w-md mx-auto">
            <div className="h-3 rounded-full bg-secondary overflow-hidden relative">
              <div className="h-full rounded-full transition-all duration-200" style={{ width: `${genProgress}%`, background: "var(--gradient-primary)" }} />
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(genProgress)}% complete</span>
              <span>{genProgress < 33 ? "Analysing features..." : genProgress < 66 ? "Inking the cartoon..." : genProgress < 95 ? "Final flourishes..." : "Almost done!"}</span>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-3 md:gap-4 max-w-xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-secondary relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.6), transparent)", backgroundSize: "400px 100%", animation: `shimmer 1.6s linear ${i * 0.2}s infinite` }} />
                <div className="absolute inset-0 grid place-items-center text-3xl opacity-40 animate-[bounce-soft_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.3}s` }}>🎨</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stage === "results" && (
        <ResultsView
          source={file!}
          themeImg={theme.img}
          themeName={`${personality.name} · ${theme.name}`}
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
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 bg-background/95 backdrop-blur-xl border-t border-border">
        <button
          onClick={() => {
            if (stage === "upload" && file) startGenerate();
            else if (stage === "results") navigate({ to: "/products" });
            else if (stage === "upload") inputRef.current?.click();
          }}
          className="w-full rounded-full px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          {stage === "upload" && !file && "📸 Upload Photo"}
          {stage === "upload" && file && "✨ Create My Pawtoon"}
          {stage === "generating" && "Generating..."}
          {stage === "results" && "Continue →"}
        </button>
      </div>

      <Footer />
    </div>
  );
}

function ResultsView({
  source, themeImg, themeName, favourite, setFavourite, onContinue, onRegenerate,
}: {
  source: string; themeImg: string; themeName: string; favourite: number; setFavourite: (n: number) => void; onContinue: () => void; onRegenerate: () => void;
}) {
  const [sliderPos, setSliderPos] = useState(50);
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14 animate-[fade-up_0.6s_ease-out]">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold">✨ Done in 47 seconds</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-display">Meet the new legend 🎉</h1>
        <p className="mt-3 text-muted-foreground">Pick your favourite — or regenerate for more options. It's free.</p>
      </div>

      <div className="rounded-[2rem] bg-card border border-border p-4 md:p-6 mb-10">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 text-center">Drag to compare — Before / After</div>
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-secondary select-none">
          <img src={themeImg} alt="After" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
            <img src={source} alt="Before" className="absolute inset-y-0 left-0 h-full object-cover" style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }} />
          </div>
          <div className="absolute inset-y-0 w-1 bg-white shadow-lg cursor-ew-resize" style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 size-10 rounded-full bg-white grid place-items-center text-foreground shadow-xl font-bold">⇄</div>
          </div>
          <input type="range" min={0} max={100} value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" />
          <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Before</div>
          <div className="absolute top-3 right-3 rounded-full bg-foreground text-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">After · {themeName}</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">3 fresh Pawtoons, just for you</h2>
        <button onClick={onRegenerate} className="text-sm font-semibold rounded-full border border-border bg-card px-4 py-2 hover:bg-secondary transition">🔄 Regenerate</button>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => {
          const active = favourite === i;
          return (
            <div key={i} className={`group relative rounded-3xl overflow-hidden bg-card border-2 transition-all ${active ? "border-primary shadow-[var(--shadow-card)] -translate-y-1" : "border-transparent hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"}`}>
              <button onClick={() => setFavourite(i)} className="absolute top-3 right-3 z-10 size-10 rounded-full bg-background/95 backdrop-blur grid place-items-center text-lg shadow-[var(--shadow-soft)] hover:scale-110 transition" aria-label="Favourite">
                <span className={active ? "" : "grayscale opacity-50"}>{active ? "❤️" : "🤍"}</span>
              </button>
              <div className="aspect-square overflow-hidden">
                <img src={themeImg} alt={`Variation ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: i === 1 ? "hue-rotate(-12deg) saturate(1.1)" : i === 2 ? "brightness(1.05) contrast(1.05)" : "none" }} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-display text-lg">Variation {i + 1}</div>
                  <div className="text-xs text-muted-foreground">{themeName}</div>
                </div>
                <button onClick={() => { setFavourite(i); onContinue(); }} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${active ? "text-primary-foreground" : "bg-foreground text-background hover:bg-primary"}`} style={active ? { background: "var(--gradient-primary)" } : undefined}>Use this →</button>
              </div>
            </div>
          );
        })}
      </div>

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
          <button onClick={onContinue} className="rounded-full bg-foreground text-background px-6 py-3.5 font-semibold hover:bg-primary transition-colors">Pick your product →</button>
        </div>
      </div>
    </section>
  );
}
