import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-main.jpg";
import royal from "@/assets/pet-royal.jpg";
import superhero from "@/assets/pet-superhero.jpg";
import mafia from "@/assets/pet-mafia.jpg";
import astronaut from "@/assets/pet-astronaut.jpg";
import viking from "@/assets/pet-viking.jpg";
import pirate from "@/assets/pet-pirate.jpg";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";

export const Route = createFileRoute("/")({ component: Home });

const themes = [
  { name: "Royal Pet", img: royal, tag: "Crown jewels" },
  { name: "Superhero Pet", img: superhero, tag: "Cape included" },
  { name: "Mafia Boss", img: mafia, tag: "Don't mess" },
  { name: "Viking Warrior", img: viking, tag: "Battle ready" },
  { name: "Astronaut Explorer", img: astronaut, tag: "To infinity" },
  { name: "Pirate Captain", img: pirate, tag: "Arrr-mazing" },
];

const products = [
  { name: "Ceramic Mug", price: "$24", img: mug },
  { name: "Premium Tee", price: "$32", img: tshirt },
  { name: "Framed Poster", price: "$45", img: poster },
  { name: "Mouse Mat", price: "$19", img: mousemat },
];

const testimonials = [
  { name: "Sarah K.", role: "Bella's mum", text: "I cried laughing. My dog as a royal king now lives on my favourite mug.", rating: 5 },
  { name: "Marcus T.", role: "Loki's dad", text: "Gifted the superhero poster to my partner — instant tears of joy. Insane quality.", rating: 5 },
  { name: "Priya R.", role: "Mochi's human", text: "The mafia bulldog tee is officially my personality now. Worth every penny.", rating: 5 },
];

const faqs = [
  { q: "How long does the AI take?", a: "About 60 seconds. You'll see your caricature preview before checkout." },
  { q: "What photos work best?", a: "Bright, well-lit photos where your pet's face is clearly visible. JPG or PNG, under 10MB." },
  { q: "How long is shipping?", a: "5–7 business days worldwide. Expedited options available at checkout." },
  { q: "Can I edit the caricature?", a: "Yes — you can regenerate up to 3 times for free before placing your order." },
  { q: "What's the return policy?", a: "30-day no-questions returns on all products. If your pet isn't happy, we aren't either." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-32 -right-32 size-[500px] rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-primary)" }} />

        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-20 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-[fade-up_0.8s_ease-out]">
            <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-1.5 text-xs font-medium shadow-[var(--shadow-soft)]">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              AI-powered • Made in 60 seconds
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Your pet,<br />
              <span className="italic text-primary">reimagined</span> as a<br />
              legend.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Upload a photo. Our AI turns your pet into a hilarious caricature — royalty, superhero, viking, you name it. Printed on premium gifts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/upload"
                className="group relative rounded-full px-7 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gradient-primary)" }}
              >
                📸 Upload Your Pet Photo
              </Link>
              <a href="#how" className="rounded-full px-7 py-4 text-base font-semibold border border-foreground/15 hover:bg-card transition">
                How it works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[royal, superhero, astronaut, viking].map((src, i) => (
                  <img key={i} src={src} alt="" className="size-9 rounded-full border-2 border-background object-cover" />
                ))}
              </div>
              <div>
                <div className="text-foreground font-semibold">★★★★★ 4.9 / 5</div>
                <div className="text-xs">12,400+ happy pet parents</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[2rem] overflow-hidden bg-card shadow-[var(--shadow-card)] aspect-[7/6]">
              <img src={heroImg} alt="Pet caricature transformation" className="w-full h-full object-cover" width={1400} height={1200} />
            </div>
            <div className="absolute -bottom-6 -left-6 size-32 md:size-40 rounded-3xl overflow-hidden border-4 border-background shadow-[var(--shadow-card)] animate-[float_6s_ease-in-out_infinite]">
              <img src={royal} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -top-6 -right-4 size-28 md:size-32 rounded-3xl overflow-hidden border-4 border-background shadow-[var(--shadow-card)] animate-[float_7s_ease-in-out_infinite_reverse]">
              <img src={astronaut} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "⚡", label: "Generated in", bold: "Under 60 seconds" },
            { icon: "🌍", label: "Printed & shipped", bold: "Worldwide" },
            { icon: "💝", label: "Happiness", bold: "30-day guarantee" },
            { icon: "⭐", label: "Loved by", bold: "12,400+ pet parents" },
          ].map((t) => (
            <div key={t.bold} className="flex items-center justify-center gap-3">
              <div className="text-2xl">{t.icon}</div>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
                <div className="font-display text-sm md:text-base font-semibold">{t.bold}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
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
            <Link to="/products" key={p.name} className="group">
              <div className="aspect-square rounded-3xl overflow-hidden bg-secondary mb-4">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-lg">{p.name}</div>
                  <div className="text-sm text-muted-foreground">From {p.price}</div>
                </div>
                <div className="size-9 rounded-full bg-foreground text-background grid place-items-center text-sm group-hover:bg-primary transition">→</div>
              </div>
            </Link>
          ))}
        </div>
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
        <div className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-20 text-center" style={{ background: "var(--gradient-primary)" }}>
          <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 size-60 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative font-display text-4xl md:text-6xl text-primary-foreground tracking-tight">
            Ready to make them famous?
          </h2>
          <p className="relative mt-4 text-primary-foreground/85 max-w-xl mx-auto">
            Join thousands of pet parents turning everyday photos into forever keepsakes.
          </p>
          <Link
            to="/upload"
            className="relative inline-block mt-8 rounded-full bg-background text-foreground px-8 py-4 font-semibold shadow-2xl hover:scale-[1.03] transition-transform"
          >
            Start Creating →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
