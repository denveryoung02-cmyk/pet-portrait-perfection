import { createFileRoute, Link } from "@tanstack/react-router";
import { organizationSchema, websiteSchema, homepageProductSchema, homepageFAQSchema } from "@/lib/seo-schemas";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useState, useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

import royalV1 from "@/assets/gen-royal-v1.jpg";
import superheroGen from "@/assets/gen-superhero-v1.webp";
import mafiaGen from "@/assets/gen-mafia-v1.webp";
import astronautGen from "@/assets/gen-astronaut-v1.webp";
import vikingGen from "@/assets/gen-viking-v1.webp";
import pirateGen from "@/assets/gen-pirate-v1.webp";
import princessGen from "@/assets/Gen-princess-v1.webp";
import angelGen from "@/assets/gen-angel-v1.webp";
import mermaidGen from "@/assets/gen-mermaid-v1.webp";
import wizardGen from "@/assets/Gen-Wizard-v1.webp";
import ballerinaGen from "@/assets/gen-ballerina-v1.webp";
import flowerCrownGen from "@/assets/gen-flower crown-v1.webp";
import royalPixar from "@/assets/gen-pixar-royal-v1.webp";
import superheroPixar from "@/assets/gen-Pixar-Superhero-v1.webp";

import mafiaPixar from "@/assets/gen-pixar-mafia-v1.webp";
import vikingPixar from "@/assets/gen-pixar-viking-v1.webp";
import astronautPixar from "@/assets/gen-pixar-astronaut-v1.webp";
import piratePixar from "@/assets/gen-pixar-pirate-v1.webp";
import princessPixar from "@/assets/gen-pixar-princess-v1.webp";
import angelPixar from "@/assets/gen-pixar-angel-v1.webp";
import mermaidPixar from "@/assets/gen-pixar-mermaid-v1.webp";
import wizardPixar from "@/assets/gen-pixar-wizard-v1.webp";
import ballerinaPixar from "@/assets/gen-pixar-ballerina-v1.webp";
import flowerCrownPixar from "@/assets/gen-pixar-flower crown-v1.webp";

import princessComic from "@/assets/gen-comic-princess-v1.webp";
import royalComic from "@/assets/gen-comic-royal-v1.webp";
import mafiaComic from "@/assets/gen-comic-mafia-v1.webp";
import vikingComic from "@/assets/gen-comic-viking-v1.webp";
import astronautComic from "@/assets/gen-comic-astronaut-v1.webp";
import superheroComic from "@/assets/gen-comic-superhero-v1.webp";
import pirateComic from "@/assets/gen-comic-pirate-v1.webp";
import angelComic from "@/assets/gen-comic-angel-v1.webp";
import mermaidComic from "@/assets/gen-comic-mermaid-v1.webp";
import wizardComic from "@/assets/gen-comic-wizard-v1.webp";
import ballerinaComic from "@/assets/gen-comic-ballerina-v1.webp";
import flowerCrownComic from "@/assets/gen-comic-flower-crown-v1.webp";

// Hero Pack demo assets (Kobi & Buddy) — real generated output from
// denveryoung02@gmail.com's own account, used deliberately so there is no
// customer-consent issue displaying it publicly. Served as static files
// under public/hero-pack-demo, not hot-linked from the hero-pack-assets
// storage bucket or a signed URL — matches the existing public/before-after
// convention for real marketing imagery instead of a dynamic user-content path.
const kobiHdPortrait = "/hero-pack-demo/kobi-hd-portrait.png";
const kobiPhoneWallpaper = "/hero-pack-demo/kobi-phone-wallpaper.png";
const kobiCharacterCard = "/hero-pack-demo/kobi-character-card.png";
const kobiHeroCertificate = "/hero-pack-demo/kobi-hero-certificate.png";
const buddyHdPortrait = "/hero-pack-demo/buddy-hd-portrait.png";
const buddyCharacterCard = "/hero-pack-demo/buddy-character-card.png";

// Owner+pet example — same public/ convention as hero-pack-demo above (real
// example imagery, not baked-in theme art, so it lives outside src/assets).
const ownerPetExample = "/owner-pet-demo/owner-pet-example.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
      { name: "description", content: "Turn your pet photo into stunning AI artwork in 60 seconds. Oil Painting, Pixar 3D or Comic Book. 12 themes. From £1.99. Instant digital download." },
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
  { name: "Royal Pet", imgOil: royalV1, imgPixar: royalPixar, imgComic: royalComic, tag: "Crown jewels", alt: "AI royal pet portrait in oil painting style — dog wearing crown" },
  { name: "Superhero Pet", imgOil: superheroGen, imgPixar: superheroPixar, imgComic: superheroComic, tag: "Cape included", alt: "AI superhero pet portrait — dog in cape, Pixar 3D style" },
  { name: "Mafia Boss", imgOil: mafiaGen, imgPixar: mafiaPixar, imgComic: mafiaComic, tag: "Don't mess", alt: "AI mafia boss pet portrait — pet in formal suit" },
  { name: "Viking Warrior", imgOil: vikingGen, imgPixar: vikingPixar, imgComic: vikingComic, tag: "Battle ready", alt: "AI viking warrior pet portrait — dog in battle armour" },
  { name: "Astronaut Explorer", imgOil: astronautGen, imgPixar: astronautPixar, imgComic: astronautComic, tag: "To infinity", alt: "AI astronaut pet portrait — cat in space suit" },
  { name: "Pirate Captain", imgOil: pirateGen, imgPixar: piratePixar, imgComic: pirateComic, tag: "Arrr-mazing", alt: "AI pirate captain pet portrait — pet with tricorn hat" },
  { name: "Princess", imgOil: princessGen, imgPixar: princessPixar, imgComic: princessComic, tag: "Fairy tale", alt: "AI princess pet portrait in fairy tale style" },
  { name: "Angel", imgOil: angelGen, imgPixar: angelPixar, imgComic: angelComic, tag: "Garden guardian", alt: "AI angel pet portrait with wings and halo" },
  { name: "Mermaid", imgOil: mermaidGen, imgPixar: mermaidPixar, imgComic: mermaidComic, tag: "Under the sea", alt: "AI mermaid pet portrait — underwater scene" },
  { name: "Wizard", imgOil: wizardGen, imgPixar: wizardPixar, imgComic: wizardComic, tag: "Magical", alt: "AI wizard pet portrait with staff and magical robes" },
  { name: "Ballerina", imgOil: ballerinaGen, imgPixar: ballerinaPixar, imgComic: ballerinaComic, tag: "Graceful", alt: "AI ballerina pet portrait in graceful dance pose" },
  { name: "Flower Crown", imgOil: flowerCrownGen, imgPixar: flowerCrownPixar, imgComic: flowerCrownComic, tag: "Boho vibes", alt: "AI flower crown pet portrait — boho meadow style" },
];

const faqs = [
  { q: "How long does the AI take?", a: "About 60 seconds. You'll see your caricature preview before checkout." },
  { q: "What photos work best?", a: "Bright, well-lit photos where your pet's face is clearly visible. JPG or PNG, under 10MB." },
  { q: "Can I edit the caricature?", a: "Yes — you can regenerate up to 3 times for free before placing your order." },
];

const beforeAfterPairs = [
  { label: "Pirate Captain", before: "/before-after/pair1-before.jpg.jpg", after: "/before-after/pair1-after.webp.png" },
  { label: "Ballerina", before: "/before-after/pair2-before.jpg.jpg", after: "/before-after/pair2-after.webp.png" },
  { label: "Royal Pet", before: "/before-after/pair3-before.jpg.jpg", after: "/before-after/pair3-after.webp.png" },
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
              Every pet has a hidden hero waiting to be discovered.
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Upload one photo. Create hero artwork starring your pet — or bring the whole family into the adventure.
            </p>
          </div>

          {/* Hero comparison: single-pet vs owner+pet */}
          <HeroComparisonPreview />

          <div className="mt-10 flex justify-center">
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
              <div className="text-foreground font-semibold text-xs sm:text-sm">★★★★★ Loved by pet owners everywhere · Free to preview</div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO PACK — WHAT'S INCLUDED */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Every order includes</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display">Your pet's Hero Pack — free with every order.</h2>
            <p className="mt-4 text-muted-foreground">Not just a portrait. Four keepsakes, revealed after checkout — like Kobi's, below.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { img: kobiHdPortrait, title: "HD Portrait", desc: "Full-resolution artwork" },
              { img: kobiCharacterCard, title: "Character Card", desc: "A collectible hero stat card" },
              { img: kobiHeroCertificate, title: "Hero Certificate", desc: "Official recognition, framed" },
              { img: kobiPhoneWallpaper, title: "Phone Wallpaper", desc: "Their hero era, everywhere" },
            ].map((item, i) => (
              <div key={item.title} className="relative rounded-3xl bg-card border border-border overflow-hidden text-center">
                <div className="aspect-square bg-secondary overflow-hidden">
                  <img src={item.img} alt={`${item.title} example — Kobi`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="font-display text-base sm:text-lg">{item.title}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{item.desc}</div>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-[calc(50%-1.75rem)] -right-3 -translate-y-1/2 text-muted-foreground/40 text-xl z-10">→</div>
                )}
              </div>
            ))}
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

      {/* BEFORE & AFTER */}
      <BeforeAfterSection />

      {/* HOW IT WORKS */}
      <HowItWorksSection />

      {/* THEMES */}
      <ThemesSection />

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
          <h2 className="mt-3 text-4xl md:text-5xl font-display">From upload to download, sorted.</h2>
        </div>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 rounded-[2rem] bg-card border border-border p-5 md:p-8 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-secondary">
                <img src="/before-after/pair1-before.jpg.jpg" alt="Original pet photo" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="mt-1.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Your photo</p>
            </div>
            <div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-secondary">
                <img src={superheroGen} alt="AI generated superhero pet portrait" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="mt-1.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Your portrait</p>
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

      {/* MEET SOME PAWTOONS HEROES */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Hero Pack examples</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-display">Meet some Pawtoons Heroes.</h2>
          <p className="mt-4 text-muted-foreground">Every character card is written from your pet's own personality.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { name: "Kobi", heroName: "Kobi the Courageous", theme: "Canine Crusader", img: kobiCharacterCard },
            { name: "Buddy", heroName: "Captain Buddy Paws", theme: "Buccaneer of Bones", img: buddyCharacterCard },
          ].map((hero) => (
            <div key={hero.name} className="rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-soft)]">
              <div className="aspect-[3/4.2] bg-secondary overflow-hidden">
                <img src={hero.img} alt={`${hero.heroName} — Pawtoons character card`} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4 text-center">
                <div className="font-display text-lg">{hero.heroName}</div>
                <div className="text-xs text-muted-foreground mt-1">{hero.theme}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OWNER + PET — /create-group entry point */}
      <section className="py-16 sm:py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">For the whole crew</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display">Up to 3 people, 3 pets, one scene.</h2>
            <p className="mt-4 text-muted-foreground">Same AI, same 60 seconds — everyone and every pet painted together in one portrait.</p>
          </div>

          <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-card)]">
            <div className="aspect-[16/10] bg-secondary">
              <img
                src={ownerPetExample}
                alt="AI-generated owner and pet portrait — 2 people and 3 pets together, Pixar 3D style"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/create-group"
              onClick={() => track("start_creating_clicked", { source: "owner_pet_section" })}
              className="group relative rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-primary)" }}
            >
              ✨ Create Your Group Portrait →
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary shadow-[var(--shadow-soft)]">
              From £2.99 · Instant digital download
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
            Their face — or the whole crew's. Immortalised as stunning art, ready to download in 60 seconds.
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

function HeroComparisonPreview() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-6 flex flex-row items-start justify-center gap-3 sm:gap-4">
      <div
        className={`flex flex-col items-center gap-2 w-[130px] sm:w-[170px] transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <Link
          to="/upload"
          onClick={() => track("start_creating_clicked", { source: "hero_comparison_pet" })}
          className="group relative w-full hover:-translate-y-1 transition-transform"
        >
          <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-[var(--shadow-card)] aspect-square group-hover:shadow-[var(--shadow-card)] transition-shadow">
            <img
              src={buddyHdPortrait}
              alt="Buddy's AI-generated Hero Pack portrait"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
            🐾 Pet Portrait
          </span>
        </Link>
        <Link
          to="/upload"
          onClick={() => track("start_creating_clicked", { source: "hero_comparison_pet_button" })}
          className="w-full text-center rounded-full px-3 py-2 text-[11px] sm:text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Create Your Hero →
        </Link>
      </div>

      <div
        className={`flex flex-col items-center gap-2 w-[130px] sm:w-[170px] transition-all duration-500 ease-out delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <Link
          to="/create-group"
          onClick={() => track("start_creating_clicked", { source: "hero_comparison_group" })}
          className="group relative w-full hover:-translate-y-1 transition-transform"
        >
          <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-[var(--shadow-card)] aspect-square group-hover:shadow-[var(--shadow-card)] transition-shadow">
            <img
              src={ownerPetExample}
              alt="AI-generated owner and pet portrait — 2 people and 3 pets together, Pixar 3D style"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <span
            className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white rounded-full px-2 py-0.5"
            style={{ background: "var(--gradient-primary)" }}
          >
            👨‍👩‍👧‍👦 Family Portrait
          </span>
        </Link>
        <Link
          to="/create-group"
          onClick={() => track("start_creating_clicked", { source: "hero_comparison_group_button" })}
          className="w-full text-center rounded-full px-3 py-2 text-[11px] sm:text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Create Family Portrait →
        </Link>
      </div>
    </div>
  );
}

function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 py-16 sm:py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Real results</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-display">See the Transformation</h2>
        <p className="mt-4 text-muted-foreground">Drag to reveal · Real pets, real portraits</p>
      </div>

      {/* Mobile: horizontal scroll row */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
        {beforeAfterPairs.map((pair, i) => (
          <div key={i} className="snap-center flex-shrink-0">
            <BeforeAfterCard before={pair.before} after={pair.after} label={pair.label} eager={i === 0} />
          </div>
        ))}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {beforeAfterPairs.map((pair, i) => (
          <BeforeAfterCard key={i} before={pair.before} after={pair.after} label={pair.label} eager={i === 0} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        These are real Pawtoons portraits. Upload your pet's photo and see yours in 60 seconds.
      </p>
      <div className="mt-6 text-center">
        <Link
          to="/upload"
          onClick={() => track("start_creating_clicked", { source: "before_after" })}
          className="inline-flex items-center rounded-full px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.03] transition-transform"
          style={{ background: "var(--gradient-primary)" }}
        >
          ✨ Try It Free →
        </Link>
      </div>
    </section>
  );
}

function BeforeAfterCard({ before, after, label, eager }: {
  before: string;
  after: string;
  label: string;
  eager?: boolean;
}) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const getPos = (clientX: number): number => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) setPosition(getPos(e.clientX));
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      setPosition(getPos(e.touches[0].clientX));
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-[76vw] max-w-[320px] md:w-auto md:max-w-none">
      <div
        ref={containerRef}
        className="relative aspect-square rounded-3xl overflow-hidden cursor-col-resize select-none bg-secondary shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
        onMouseDown={(e) => {
          e.preventDefault();
          isDraggingRef.current = true;
          setIsDragging(true);
          setPosition(getPos(e.clientX));
        }}
        onMouseEnter={() => { if (!isDraggingRef.current) setPosition(75); }}
        onMouseLeave={() => { if (!isDraggingRef.current) setPosition(50); }}
        onTouchStart={(e) => {
          isDraggingRef.current = true;
          setIsDragging(true);
          setPosition(getPos(e.touches[0].clientX));
        }}
        onTouchEnd={() => {
          isDraggingRef.current = false;
          setIsDragging(false);
        }}
      >
        {/* After image — base layer, always fully visible */}
        <img
          src={after}
          alt={`${label} AI pet portrait`}
          className="absolute inset-0 w-full h-full object-cover"
          loading={eager ? "eager" : "lazy"}
          draggable={false}
        />

        {/* Before image — top layer, clipped to left of divider */}
        <img
          src={before}
          alt={`Original photo — ${label}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
            transition: isDragging ? "none" : "clip-path 0.5s ease",
          }}
          loading={eager ? "eager" : "lazy"}
          draggable={false}
        />

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/90 pointer-events-none"
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
            boxShadow: "0 0 6px rgba(0,0,0,0.35)",
            transition: isDragging ? "none" : "left 0.5s ease",
          }}
        >
          {/* Drag handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.2)] flex items-center justify-center gap-0.5">
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground" style={{ transform: "scaleX(-1)" }}>
              <polyline points="1 1 6 6 1 11" />
            </svg>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <polyline points="1 1 6 6 1 11" />
            </svg>
          </div>
        </div>

        {/* Corner labels */}
        <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 pointer-events-none">
          Before
        </span>
        <span
          className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-white rounded-full px-2 py-0.5 pointer-events-none"
          style={{ background: "var(--gradient-primary)" }}
        >
          After
        </span>
      </div>
      <p className="mt-2.5 text-center text-sm font-semibold">{label}</p>
    </div>
  );
}

function HowItWorksSection() {
  const [mode, setMode] = useState<"pet" | "family">("pet");

  const petSteps = [
    { n: "01", title: "Upload photo", desc: "Drag in any clear photo of your pet. We handle the rest.", emoji: "📸" },
    { n: "02", title: "AI creates caricature", desc: "Pick a theme — Royal, Superhero, Viking — and watch the magic.", emoji: "✨" },
    { n: "03", title: "Download instantly", desc: "Pay once, download your high-quality Hero Pack immediately.", emoji: "⚡" },
  ];

  const familySteps = [
    { n: "01", title: "Upload your crew", desc: "1 pet, multiple pets, or up to 3 people and 3 pets — however your family looks.", emoji: "📸" },
    { n: "02", title: "AI paints your scene", desc: "Everyone and every pet, painted together in one theme.", emoji: "✨" },
    { n: "03", title: "Download instantly", desc: "Pay once, download your high-quality family portrait immediately.", emoji: "⚡" },
  ];

  const steps = mode === "pet" ? petSteps : familySteps;

  return (
    <section id="how" className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 py-16 sm:py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">How it works</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-display">Three steps. One masterpiece.</h2>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex w-full sm:w-auto rounded-full bg-card border border-border p-1.5 shadow-[var(--shadow-soft)]">
          <button
            onClick={() => setMode("pet")}
            className={`flex-1 sm:flex-none rounded-full px-5 sm:px-7 py-3 text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
              mode === "pet" ? "text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
            style={mode === "pet" ? { background: "var(--gradient-primary)" } : undefined}
          >
            🐾 Just your pet
          </button>
          <button
            onClick={() => setMode("family")}
            className={`flex-1 sm:flex-none rounded-full px-5 sm:px-7 py-3 text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
              mode === "family" ? "text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
            style={mode === "family" ? { background: "var(--gradient-primary)" } : undefined}
          >
            👨‍👩‍👧‍👦 The whole family
          </button>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
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
  );
}

function ThemesSection() {
  const [styleFilter, setStyleFilter] = useState<"oil" | "pixar" | "comic-book">("oil");
  const [showAllThemes, setShowAllThemes] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const getThemeImage = (theme: any) => {
    if (styleFilter === "pixar") return theme.imgPixar;
    if (styleFilter === "comic-book") return theme.imgComic;
    return theme.imgOil;
  };

  useEffect(() => {
    if (!showAllThemes || !gridRef.current) return;
    requestAnimationFrame(() => {
      const seventhCard = gridRef.current?.children[6] as HTMLElement | undefined;
      seventhCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [showAllThemes]);

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
            { id: "comic-book" as const, label: "Comic Book", emoji: "💥" },
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

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {themes.map((t, i) => (
            <Link
              to="/upload"
              key={t.name}
              className={`group relative rounded-3xl overflow-hidden bg-card aspect-[4/5] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all hover:-translate-y-1${i >= 6 ? (showAllThemes ? "" : " hidden md:block") : ""}`}
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
        {!showAllThemes && (
          <div className="mt-6 md:hidden text-center">
            <button
              onClick={() => setShowAllThemes(true)}
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold border border-foreground/20 hover:bg-card transition"
            >
              See all 12 themes →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
