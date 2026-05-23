import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import royal from "@/assets/pet-royal.jpg";
import superhero from "@/assets/pet-superhero.jpg";
import mafia from "@/assets/pet-mafia.jpg";
import astronaut from "@/assets/pet-astronaut.jpg";
import viking from "@/assets/pet-viking.jpg";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload your pet — Pawtraits" }] }),
  component: Upload,
});

const themes = [
  { id: "royal", name: "Royal Pet", img: royal },
  { id: "superhero", name: "Superhero", img: superhero },
  { id: "mafia", name: "Mafia Boss", img: mafia },
  { id: "astronaut", name: "Astronaut", img: astronaut },
  { id: "viking", name: "Viking", img: viking },
];

function Upload() {
  const [file, setFile] = useState<string | null>(null);
  const [theme, setTheme] = useState("royal");
  const navigate = useNavigate();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(URL.createObjectURL(f));
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Step 1 of 3</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-display">Show us your superstar.</h1>
          <p className="mt-3 text-muted-foreground">Clear, well-lit photos work best. JPG / PNG, up to 10MB.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <label className="relative aspect-square rounded-3xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-secondary/50 transition-all cursor-pointer overflow-hidden grid place-items-center">
            {file ? (
              <img src={file} alt="Your pet" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <div className="size-20 mx-auto rounded-full bg-[var(--gradient-primary)] grid place-items-center text-3xl text-primary-foreground shadow-[var(--shadow-glow)]">
                  📸
                </div>
                <div className="mt-6 font-display text-xl">Drop a photo here</div>
                <div className="text-sm text-muted-foreground mt-1">or click to browse</div>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>

          <div>
            <h2 className="font-display text-2xl mb-4">Pick a theme</h2>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                    theme === t.id ? "border-primary scale-[1.03] shadow-[var(--shadow-soft)]" : "border-transparent hover:scale-[1.02]"
                  }`}
                >
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white text-xs font-semibold">{t.name}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate({ to: "/products" })}
              disabled={!file}
              className="mt-8 w-full rounded-full px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              ✨ Generate Caricature
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Takes ~60 seconds. Free unlimited regenerations before checkout.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
