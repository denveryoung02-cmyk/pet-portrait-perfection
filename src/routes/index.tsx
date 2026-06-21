import { createFileRoute, Link } from "@tanstack/react-router";
import { organizationSchema, websiteSchema, homepageProductSchema, homepageFAQSchema } from "@/lib/seo-schemas";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { track } from "@/lib/analytics";

import royalV1 from "@/assets/gen-royal-v1.jpg";
import royalV2 from "@/assets/gen-royal-v2.jpg";
import royalV3 from "@/assets/gen-royal-v3.jpg";
import superheroGen from "@/assets/gen-superhero-v1.webp";
import mafiaGen from "@/assets/gen-mafia-v1.webp";
import astronautGen from "@/assets/gen-astronaut-v1.webp";
import vikingGen from "@/assets/gen-viking-v1.webp";
import pirateGen from "@/assets/gen-pirate-v1.webp";
import superhero from "@/assets/pet-superhero.jpg";
import lifestyleMug from "@/assets/lifestyle-mug.jpg";
import packagingUnbox from "@/assets/packaging-unbox.jpg";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";
import newMug from "@/assets/New Product Mug.webp";
import newTshirt from "@/assets/New Product T-Shirt.webp";
import newPoster from "@/assets/New Product Picture Frame.webp";
import newMousemat from "@/assets/New Product Mouse Mat.webp";
import princessGen from "@/assets/Gen-princess-v1.webp";
import angelGen from "@/assets/gen-angel-v1.webp";
import mermaidGen from "@/assets/gen-mermaid-v1.webp";
import wizardGen from "@/assets/Gen-Wizard-v1.webp";
import ballerinaGen from "@/assets/gen-ballerina-v1.webp";
import flowerCrownGen from "@/assets/gen-flower crown-v1.webp";
import royalPixar from "@/assets/gen-pixar-royal-v1.webp";
import superheroPixar from "@/assets/gen-Pixar-Superhero-v1.webp";
import princessWatercolour from "@/assets/gen-watercolour-princess-v1.webp";

import royalWatercolour from "@/assets/gen-watercolour-royal-v1.webp";
import mafiaPixar from "@/assets/gen-pixar-mafia-v1.webp";
import mafiaWatercolour from "@/assets/gen-watercolour-mafia-v1.webp";
import vikingPixar from "@/assets/gen-pixar-viking-v1.webp";
import vikingWatercolour from "@/assets/gen-watercolour-viking-v1.webp";
import astronautPixar from "@/assets/gen-pixar-astronaut-v1.webp";
import astronautWatercolour from "@/assets/gen-Watercolour-astronaut-v1.webp";
import superheroWatercolour from "@/assets/gen-watercolour-superhero-v1.webp";
import piratePixar from "@/assets/gen-pixar-pirate-v1.webp";
import pirateWatercolour from "@/assets/gen-watercolour-pirate-v1.webp";
import princessPixar from "@/assets/gen-pixar-princess-v1.webp";
import angelPixar from "@/assets/gen-pixar-angel-v1.webp";
import angelWatercolour from "@/assets/gen-watercolour-angel-v1.webp";
import mermaidPixar from "@/assets/gen-pixar-mermaid-v1.webp";
import mermaidWatercolour from "@/assets/gen-watercolour-mermaid-v1.webp";
import wizardPixar from "@/assets/gen-pixar-wizard-v1.webp";
import wizardWatercolour from "@/assets/gen-watercolour-wizard-v1.webp";
import ballerinaPixar from "@/assets/gen-pixar-ballerina-v1.webp";
import ballerinaWatercolour from "@/assets/gen-watercolour-ballerina-v1.webp";
import flowerCrownPixar from "@/assets/gen-pixar-flower crown-v1.webp";
import flowerCrownWatercolour from "@/assets/gen-watercolour-flower crown-v1.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
      { name: "description", content: "Turn your pet photo into stunning AI artwork in 60 seconds. Oil Painting, Pixar 3D or Watercolour. 12 themes. From £1.99. Instant digital download." },
      { property: "og:title", content: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
      { property: "og:description", content: "Turn your pet photo into AI art in 60 seconds. From £1.99. Instant download." },
      { property: "og:url", content: "https://www.pawtoons.co" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
      { name: "msvalidate.01", content: "4E19254887370F9CF869612EEADBCBF4" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationSchema) },
      { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
      { type: "application/ld+json", children: JSON.stringify(homepageProductSchema) },
      { type: "application/ld+json", children: JSON.stringify(homepageFAQSchema) },
    ],
  }),
  component: Home,
});

const themes = [
  { name: "Royal Pet", imgOil: royalV1, imgPixar: royalPixar, imgWatercolour: royalWatercolour, tag: "Crown jewels", alt: "AI royal pet portrait in oil painting style — dog wearing crown" },
  { name: "Superhero Pet", imgOil: superheroGen, imgPixar: superheroPixar, imgWatercolour: superheroWatercolour, tag: "Cape included", alt: "AI superhero pet portrait — dog in cape, Pixar 3D style" },
  { name: "Mafia Boss", imgOil: mafiaGen, imgPixar: mafiaPixar, imgWatercolour: mafiaWatercolour, tag: "Don't mess", alt: "AI mafia boss pet portrait — pet in formal suit" },
  { name: "Viking Warrior", imgOil: vikingGen, imgPixar: vikingPixar, imgWatercolour: vikingWatercolour, tag: "Battle ready", alt: "AI viking warrior pet portrait — dog in battle armour" },
  { name: "Astronaut Explorer", imgOil: astronautGen, imgPixar: astronautPixar, imgWatercolour: astronautWatercolour, tag: "To infinity", alt: "AI astronaut pet portrait — cat in space suit" },
  { name: "Pirate Captain", imgOil: pirateGen, imgPixar: piratePixar, imgWatercolour: pirateWatercolour, tag: "Arrr-mazing", alt: "AI pirate captain pet portrait — pet with tricorn hat" },
  { name: "Princess", imgOil: princessGen, imgPixar: princessPixar, imgWatercolour: princessWatercolour, tag: "Fairy tale", alt: "AI princess pet portrait in fairy tale style" },
  { name: "Angel", imgOil: angelGen, imgPixar: angelPixar, imgWatercolour: angelWatercolour, tag: "Garden guardian", alt: "AI angel pet portrait with wings and halo" },
  { name: "Mermaid", imgOil: mermaidGen, imgPixar: mermaidPixar, imgWatercolour: mermaidWatercolour, tag: "Under the sea", alt: "AI mermaid pet portrait — underwater scene" },
  { name: "Wizard", imgOil: wizardGen, imgPixar: wizardPixar, imgWatercolour: wizardWatercolour, tag: "Magical", alt: "AI wizard pet portrait with staff and magical robes" },
  { name: "Ballerina", imgOil: ballerinaGen, imgPixar: ballerinaPixar, imgWatercolour: ballerinaWatercolour, tag: "Graceful", alt: "AI ballerina pet portrait in graceful dance pose" },
  { name: "Flower Crown", imgOil: flowerCrownGen, imgPixar: flowerCrownPixar, imgWatercolour: flowerCrownWatercolour, tag: "Boho vibes", alt: "AI flower crown pet portrait — boho meadow style" },
];

const products = [
  { name: "Ceramic Mug", price: "Coming Soon", img: newMug },
  { name: "Premium Tee", price: "Coming Soon", img: newTshirt },
  { name: "Framed Poster", price: "Coming Soon", img: newPoster },
  { name: "Mouse Mat", price: "Coming Soon", img: newMousemat },
];



const faqs = [
  { q: "How long does the AI take?", a: "About 60 seconds. You'll see your caricature preview before checkout." },
  { q: "What photos work best?", a: "Bright, well-lit photos where your pet's face is clearly visible. JPG or PNG, under 10MB." },
  { q: "Can I edit the caricature?", a: "Yes — you can regenerate up to 3 times for free before placing your order." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-32 -right-32 size-[500px] rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-primary)" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 pt-8 sm:pt-12 md:pt-20 pb-16 sm:pb-20 md:pb-28">
          <div className="text-center max-w-3xl mx-auto animate-[fade-up_0.8s_ease-out]">
            <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium shadow-[var(--shadow-soft)]">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              AI-powered • Made in 60 seconds
            </div>
            <h1 className="mt-5 sm:mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Custom AI Pet Portraits — From Your Photo in 60 Seconds
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Upload one photo. Pick your art style — Oil Painting, Pixar 3D, or Watercolour. Our AI creates your pet's cinematic portrait. Instant digital download.
            </p>
          </div>

          {/* Art Style Samples */}
          <ArtStyleCarousel />

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/upload"
              onClick={() => track("start_creating_clicked", { source: "hero" })}
              className="group relative rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-primary)" }}
            >
              ✨ Start Creating — it's free to try
            </Link>
            <a href="#how" className="rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold border border-foreground/15 hover:bg-card transition">
              See how it works
            </a>
          </div>
          <div className="mt-3 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary shadow-[var(--shadow-soft)]">
              From £1.99 · Instant digital download
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[royalV1, superheroGen, astronautGen, vikingGen].map((src, i) => (
                <img key={i} src={src} alt="" className="size-7 sm:size-9 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <div>
              <div className="text-foreground font-semibold text-xs sm:text-sm">See your portrait in 60 seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { icon: "⚡", label: "Generated in", bold: "Under 60 seconds" },
            { icon: "💝", label: "Digital download", bold: "Instant access" },
            { icon: "✨", label: "High quality", bold: "Print-ready files" },
            { icon: "🔒", label: "Secure payment", bold: "Stripe checkout" },
          ].map((t) => (
            <div key={t.bold} className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">{t.icon}</div>
              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
                <div className="font-display text-xs sm:text-sm md:text-base font-semibold">{t.bold}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 py-16 sm:py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">How it works</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-display">Three steps. One masterpiece.</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Upload photo", desc: "Drag in any clear photo of your pet. We handle the rest.", emoji: "📸" },
            { n: "02", title: "AI creates caricature", desc: "Pick a theme — Royal, Superhero, Viking — and watch the magic.", emoji: "✨" },
            { n: "03", title: "Download instantly", desc: "Pay once, download your high-quality portrait immediately.", emoji: "⚡" },
          ].map((s) => (
            <div key={s.n} className="group relative rounded-3xl bg-card border border-border p-8 hover:shadow-[var(--shadow-card)] transition-all hover:-translate-y-1">
              <div className="text-6xl">{s.emoji}</div>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-mono text-primary">{s.n}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-4 text-2xl font-display">{s.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THEMES */}
      <ThemesSection />

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Coming Soon</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-display">Printed products on the way.</h2>
          <p className="mt-4 text-muted-foreground">Mugs, tees, posters, and more — launching soon with your digital portraits.</p>
        </div>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {products.map((p) => (
            <div key={p.name} className="group opacity-75">
              <div className="aspect-square rounded-3xl overflow-hidden bg-secondary mb-4">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-lg">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIFESTYLE / PACKAGING — TRUST */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-5 md:gap-6">
          <div className="relative rounded-[2rem] overflow-hidden bg-secondary group">
            <img src={vikingGen} alt="AI viking warrior pet portrait — dog in battle armour" className="w-full h-[420px] md:h-[520px] object-cover transition-transform duration-[1500ms] group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-7 text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">AI-Generated</span>
              <h3 className="font-display text-2xl md:text-3xl mt-1">Your pet. Reimagined.</h3>
              <p className="text-sm opacity-85 mt-1.5 max-w-sm">From everyday photo to cinematic portrait in under 60 seconds.</p>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-5 md:gap-6">
            <div className="relative rounded-[2rem] overflow-hidden bg-secondary group">
              <img src={mafiaGen} alt="AI mafia boss pet portrait — pet in formal suit" className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">Instant Download</span>
                <h3 className="font-display text-xl md:text-2xl mt-1">Ready to print. Ready to gift.</h3>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground italic font-display">
          "Turn chaos into art. The most fun your pet will ever have."
        </p>
      </section>

      {/* WHY PAWTOONS */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Why Pawtoons</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-display">Why people love Pawtoons.</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { emoji: "⚡", text: "Ready in 60 seconds — see your portrait before you pay" },
              { emoji: "🎨", text: "3 art styles, 12 themes — find the perfect match for your pet" },
              { emoji: "💝", text: "From £1.99 — the most affordable custom pet portrait available" },
            ].map((item) => (
              <div key={item.emoji} className="rounded-3xl bg-card p-7 border border-border shadow-[var(--shadow-soft)] flex gap-4 items-start">
                <div className="text-3xl shrink-0">{item.emoji}</div>
                <p className="text-lg leading-relaxed font-display">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 md:px-8 py-20 md:py-28">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Questions</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-display">Good ones. Answered.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-2xl bg-card border border-border p-5 md:p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold list-none">
                <span>{f.q}</span>
                <span className="size-7 rounded-full bg-secondary grid place-items-center text-sm group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* MOCK CHECKOUT PREVIEW */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Sneak peek</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-display">From upload to doorstep, sorted.</h2>
        </div>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 rounded-[2rem] bg-card border border-border p-5 md:p-8 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden aspect-square bg-secondary">
              <img src={superheroGen} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-secondary">
              <img src={superheroGen} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="col-span-2 rounded-2xl bg-secondary p-4 flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div className="flex-1 text-sm">
                <div className="font-semibold">Instant delivery</div>
                <div className="text-muted-foreground text-xs">Download immediately after payment</div>
              </div>
              <div className="text-xs rounded-full bg-card border border-border px-3 py-1 font-semibold">Digital ✓</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Order preview</div>
            <h3 className="font-display text-2xl mt-1">Kobi the Superhero</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Theme</span><span>Superhero Pet</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Format</span><span>Digital Download</span></div>
              <div className="flex justify-between font-semibold text-base pt-3 border-t border-border"><span>Total</span><span>£1.99</span></div>
            </div>
            <Link
              to="/upload"
              className="mt-6 inline-flex w-full justify-center rounded-full px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform"
              style={{ background: "var(--gradient-primary)" }}
            >
              Start mine like this →
            </Link>
            <div className="mt-3 flex justify-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>🔒 Secure checkout</span>
              <span>•</span>
              <span>💳 All cards · Apple Pay</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
        <div className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-20 text-center" style={{ background: "var(--gradient-primary)" }}>
          <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 size-60 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative font-display text-4xl md:text-6xl text-primary-foreground tracking-tight">
            Ready to make them famous?
          </h2>
          <p className="relative mt-4 text-primary-foreground/85 max-w-xl mx-auto">
            Their face. Their personality. Immortalised on a mug your colleagues will fight over.
          </p>
          <Link
            to="/upload"
            onClick={() => track("start_creating_clicked", { source: "cta_banner" })}
            className="relative inline-block mt-8 rounded-full bg-background text-foreground px-8 py-4 font-semibold shadow-2xl hover:scale-[1.03] transition-transform"
          >
            ✨ Create My Pet
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 bg-background/90 backdrop-blur-xl border-t border-border">
        <Link
          to="/upload"
          onClick={() => track("start_creating_clicked", { source: "sticky_mobile" })}
          className="block w-full text-center rounded-full px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          ✨ Create My Pet
        </Link>
      </div>

      <div className="pb-20 md:pb-0" />
      <Footer />
    </div>
  );
}

function ArtStyleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const dailySets = [
    // Day 0 (Sunday): royal, mafia, viking oil painting
    [
      { name: "Royal", img: royalV1, emoji: "👑", desc: "Cinematic movie poster style" },
      { name: "Mafia", img: mafiaGen, emoji: "🎩", desc: "Dramatic noir lighting" },
      { name: "Viking", img: vikingGen, emoji: "⚔️", desc: "Epic Norse scene" },
    ],
    // Day 1 (Monday): astronaut, superhero, pirate oil painting
    [
      { name: "Astronaut", img: astronautGen, emoji: "🚀", desc: "Deep space backdrop" },
      { name: "Superhero", img: superheroGen, emoji: "🦸", desc: "Heroic cape flowing" },
      { name: "Pirate", img: pirateGen, emoji: "🏴‍☠️", desc: "Swashbuckling adventure" },
    ],
    // Day 2 (Tuesday): princess, angel, mermaid oil painting
    [
      { name: "Princess", img: princessGen, emoji: "👸", desc: "Fairy tale elegance" },
      { name: "Angel", img: angelGen, emoji: "😇", desc: "Ethereal heavenly glow" },
      { name: "Mermaid", img: mermaidGen, emoji: "🧜‍♀️", desc: "Enchanting underwater" },
    ],
    // Day 3 (Wednesday): wizard, ballerina, flower-crown oil painting
    [
      { name: "Wizard", img: wizardGen, emoji: "🧙", desc: "Mystical magical spells" },
      { name: "Ballerina", img: ballerinaGen, emoji: "🩰", desc: "Graceful stage spotlight" },
      { name: "Flower Crown", img: flowerCrownGen, emoji: "🌸", desc: "Boho meadow vibes" },
    ],
    // Day 4 (Thursday): royal, princess, mermaid pixar
    [
      { name: "Royal Pixar", img: royalPixar, emoji: "👑", desc: "Disney 3D animation" },
      { name: "Princess Pixar", img: princessPixar, emoji: "👸", desc: "Pixar character magic" },
      { name: "Mermaid Pixar", img: mermaidPixar, emoji: "🧜‍♀️", desc: "Ocean 3D adventure" },
    ],
    // Day 5 (Friday): superhero, wizard, ballerina watercolour
    [
      { name: "Superhero Watercolour", img: superheroWatercolour, emoji: "🦸", desc: "Soft pastel hero" },
      { name: "Wizard Watercolour", img: wizardWatercolour, emoji: "🧙", desc: "Delicate magic wash" },
      { name: "Ballerina Watercolour", img: ballerinaWatercolour, emoji: "🩰", desc: "Flowing watercolour dance" },
    ],
    // Day 6 (Saturday): viking, angel, flower-crown watercolour
    [
      { name: "Viking Watercolour", img: vikingWatercolour, emoji: "⚔️", desc: "Soft warrior tones" },
      { name: "Angel Watercolour", img: angelWatercolour, emoji: "😇", desc: "Gentle pastel divine" },
      { name: "Flower Crown Watercolour", img: flowerCrownWatercolour, emoji: "🌸", desc: "Watercolour garden" },
    ],
  ];

  const dayOfWeek = new Date().getDay();
  const styles = dailySets[dayOfWeek];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % styles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [styles.length]);

  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {styles.map((style, i) => (
        <div
          key={style.name}
          className="group rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all hover:-translate-y-1"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={style.img}
              alt={style.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${currentIndex === i ? 'opacity-100' : 'opacity-60'}`}
              loading="eager"
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            <div className={`absolute top-3 left-3 size-12 rounded-2xl bg-background/90 backdrop-blur grid place-items-center text-2xl transition-all duration-500 ${currentIndex === i ? 'scale-110' : 'scale-100'}`}>
              {style.emoji}
            </div>
          </div>
          <div className="p-5 text-center">
            <div className="font-display text-xl mb-1">{style.name}</div>
            <div className="text-sm text-muted-foreground">{style.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ThemesSection() {
  const [styleFilter, setStyleFilter] = useState<"oil" | "pixar" | "watercolour">("oil");

  const getThemeImage = (theme: any) => {
    if (styleFilter === "pixar") return theme.imgPixar;
    if (styleFilter === "watercolour") return theme.imgWatercolour;
    return theme.imgOil;
  };

  return (
    <section id="themes" className="py-20 md:py-28" style={{ background: "var(--gradient-warm)" }}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Pick a personality</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-display">Choose your pet's alter ego.</h2>
          </div>
          <Link to="/upload" className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-primary transition">
            Start Creating →
          </Link>
        </div>

        {/* Style Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "oil" as const, label: "Oil Painting", emoji: "🎨" },
            { id: "pixar" as const, label: "Pixar/3D", emoji: "✨" },
            { id: "watercolour" as const, label: "Watercolour", emoji: "🌸" },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setStyleFilter(style.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                styleFilter === style.id
                  ? "bg-foreground text-background shadow-[var(--shadow-soft)]"
                  : "bg-card border border-border hover:border-foreground/30"
              }`}
            >
              <span className="mr-1.5">{style.emoji}</span>
              {style.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {themes.map((t, i) => (
            <Link
              to="/upload"
              key={t.name}
              className="group relative rounded-3xl overflow-hidden bg-card aspect-[4/5] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all hover:-translate-y-1"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img src={getThemeImage(t)} alt={t.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-[10px] uppercase tracking-wider text-white/70">{t.tag}</div>
                <div className="text-white font-display text-lg">{t.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
