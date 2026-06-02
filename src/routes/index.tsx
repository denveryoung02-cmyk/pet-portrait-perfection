import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

import royalV1 from "@/assets/gen-royal-v1.jpg";
import royalV2 from "@/assets/gen-royal-v2.jpg";
import royalV3 from "@/assets/gen-royal-v3.jpg";
import superheroGen from "@/assets/gen-superhero-v1.png";
import mafiaGen from "@/assets/gen-mafia-v1.png";
import astronautGen from "@/assets/gen-astronaut-v1.png";
import vikingGen from "@/assets/gen-viking-v1.png";
import pirateGen from "@/assets/gen-pirate-v1.png";
import superhero from "@/assets/pet-superhero.jpg";
import lifestyleMug from "@/assets/lifestyle-mug.jpg";
import packagingUnbox from "@/assets/packaging-unbox.jpg";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";

export const Route = createFileRoute("/")({ component: Home });

const themes = [
  { name: "Royal Pet", img: royalV1, tag: "Crown jewels" },
  { name: "Superhero Pet", img: superheroGen, tag: "Cape included" },
  { name: "Mafia Boss", img: mafiaGen, tag: "Don't mess" },
  { name: "Viking Warrior", img: vikingGen, tag: "Battle ready" },
  { name: "Astronaut Explorer", img: astronautGen, tag: "To infinity" },
  { name: "Pirate Captain", img: pirateGen, tag: "Arrr-mazing" },
];

const products = [
  { name: "Ceramic Mug", price: "Coming Soon", img: mug },
  { name: "Premium Tee", price: "Coming Soon", img: tshirt },
  { name: "Framed Poster", price: "Coming Soon", img: poster },
  { name: "Mouse Mat", price: "Coming Soon", img: mousemat },
];


const testimonials = [
  { name: "Sarah K.", role: "Bella's mum", text: "I cried laughing. My dog as a royal king now lives on my favourite mug.", rating: 5 },
  { name: "Marcus T.", role: "Loki's dad", text: "Gifted the superhero poster to my partner — instant tears of joy. Insane quality.", rating: 5 },
  { name: "Priya R.", role: "Mochi's human", text: "The mafia bulldog tee is officially my personality now. Worth every penny.", rating: 5 },
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

        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 pt-8 sm:pt-12 md:pt-20 pb-16 sm:pb-20 md:pb-28 grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="animate-[fade-up_0.8s_ease-out]">
            <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium shadow-[var(--shadow-soft)]">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              AI-powered • Made in 60 seconds
            </div>
            <h1 className="mt-5 sm:mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Every pet deserves a<br />
              <span className="italic text-primary">movie poster</span><br />
              moment.
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              Upload one photo. Our AI turns your pet into a cinematic caricature — royal, viking, superhero, whatever they secretly think they are. Printed on stuff worth gifting.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <Link
                to="/upload"
                className="group relative rounded-full px-5 sm:px-7 py-3 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gradient-primary)" }}
              >
                ✨ Start Creating — it's free to try
              </Link>
              <a href="#how" className="rounded-full px-5 sm:px-7 py-3 sm:py-4 text-sm sm:text-base font-semibold border border-foreground/15 hover:bg-card transition">
                See it in action
              </a>
            </div>
            <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[royalV1, superheroGen, astronautGen, vikingGen].map((src, i) => (
                  <img key={i} src={src} alt="" className="size-7 sm:size-9 rounded-full border-2 border-background object-cover" />
                ))}
              </div>
              <div>
                <div className="text-foreground font-semibold text-xs sm:text-sm">★★★★★ 4.9 / 5</div>
                <div className="text-[10px] sm:text-xs">12,400+ happy pet parents</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-card shadow-[var(--shadow-card)] aspect-[7/6]">
              <img src={royalV1} alt="Pet caricature transformation" className="w-full h-full object-cover" width={1400} height={1200} />
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-background/90 backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI generated · 58s
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 size-24 sm:size-32 md:size-40 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-background shadow-[var(--shadow-card)] animate-[float_6s_ease-in-out_infinite]">
              <img src={royalV2} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -top-4 -right-3 sm:-top-6 sm:-right-4 size-20 sm:size-28 md:size-32 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-background shadow-[var(--shadow-card)] animate-[float_7s_ease-in-out_infinite_reverse]">
              <img src={royalV3} alt="" className="w-full h-full object-cover" loading="lazy" />
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
            { icon: "⭐", label: "Loved by", bold: "12,400+ pet parents" },
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
            { n: "03", title: "We print & ship", desc: "Premium products, lovingly made and delivered to your door.", emoji: "📦" },
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
      <section id="themes" className="py-20 md:py-28" style={{ background: "var(--gradient-warm)" }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Pick a personality</span>
              <h2 className="mt-3 text-4xl md:text-5xl font-display">Choose your pet's alter ego.</h2>
            </div>
            <Link to="/upload" className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-primary transition">
              Start Creating →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {themes.map((t, i) => (
              <Link
                to="/upload"
                key={t.name}
                className="group relative rounded-3xl overflow-hidden bg-card aspect-[4/5] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all hover:-translate-y-1"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-[10px] uppercase tracking-wider text-white/70">{t.tag}</div>
                  <div className="text-white font-display text-lg">{t.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Premium merch</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-display">Built to last. Made to gift.</h2>
          <p className="mt-4 text-muted-foreground">Heavy-weight ceramics, soft-touch cottons, museum paper. We don't cut corners.</p>
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
            <img src={lifestyleMug} alt="Customer holding their Pawtoon mug" className="w-full h-[420px] md:h-[520px] object-cover transition-transform duration-[1500ms] group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-7 text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">In the wild</span>
              <h3 className="font-display text-2xl md:text-3xl mt-1">Real prints. Real morning coffee.</h3>
              <p className="text-sm opacity-85 mt-1.5 max-w-sm">Heavy-weight ceramic. Dishwasher safe. Survives the Monday-morning grip.</p>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-5 md:gap-6">
            <div className="relative rounded-[2rem] overflow-hidden bg-secondary group">
              <img src={packagingUnbox} alt="Premium Pawtoons unboxing" className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">Unboxing</span>
                <h3 className="font-display text-xl md:text-2xl mt-1">Wrapped like a gift, because it is.</h3>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground italic font-display">
          "Turn chaos into art. The most fun your pet will ever have."
        </p>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">The pack approves</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-display">Loved by 12,400+ pet parents.</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-3xl bg-card p-7 border border-border shadow-[var(--shadow-soft)]">
                <div className="text-primary">{"★".repeat(t.rating)}</div>
                <p className="mt-4 text-lg leading-relaxed font-display italic">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
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
              <img src={superhero} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-secondary">
              <img src={mug} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="col-span-2 rounded-2xl bg-secondary p-4 flex items-center gap-3">
              <span className="text-2xl">🚚</span>
              <div className="flex-1 text-sm">
                <div className="font-semibold">Estimated delivery</div>
                <div className="text-muted-foreground text-xs">5–7 business days · Free over $50</div>
              </div>
              <div className="text-xs rounded-full bg-card border border-border px-3 py-1 font-semibold">On track ✓</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Order preview</div>
            <h3 className="font-display text-2xl mt-1">Bella the Superhero Mug</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Caricature</span><span>Superhero Pet</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>Ceramic Mug · 11oz</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>$2.99</span></div>
              <div className="flex justify-between font-semibold text-base pt-3 border-t border-border"><span>Total</span><span>$26.99</span></div>
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
