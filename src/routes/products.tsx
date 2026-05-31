// NEW VERSION 2 - FORCE RELOAD
import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Products — Pawtoons" }] }),
  component: Products,
});

const comingSoon = [
  { id: "tshirt", name: "Premium Tee", img: tshirt, desc: "Organic cotton, soft-touch print" },
  { id: "mug", name: "Ceramic Mug", img: mug, desc: "11oz dishwasher-safe" },
  { id: "poster", name: "Framed Poster", img: poster, desc: "Museum-grade matte paper" },
  { id: "mousemat", name: "Mouse Mat", img: mousemat, desc: "Anti-slip neoprene base" },
];

function Products() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-6xl px-5 md:px-8 py-12 md:py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Products</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-display">Your Pawtoon, everywhere.</h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Start with a digital download today. Printed merch is coming very soon — join the waitlist to be first to know.
          </p>
        </div>

        {/* Digital Download — Available Now */}
        <div className="relative rounded-3xl overflow-hidden mb-14 p-8 md:p-12" style={{ background: "var(--gradient-primary)" }}>
          <div className="absolute -top-10 -left-10 size-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 size-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-4">
                ✅ Available now
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-white">Digital Download</h2>
              <p className="mt-2 text-white/80 max-w-md">
                Get your AI pet portrait as a high-resolution PNG instantly after payment. Yours to keep, share, print, or frame anywhere you like.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-white/90">
                <li className="flex items-center gap-2"><span>✓</span> High-resolution PNG</li>
                <li className="flex items-center gap-2"><span>✓</span> Instant delivery</li>
                <li className="flex items-center gap-2"><span>✓</span> Print at home or any print shop</li>
                <li className="flex items-center gap-2"><span>✓</span> Keep forever</li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center text-white">
                <div className="font-display text-5xl">£2.99</div>
                <div className="text-white/70 text-sm mt-1">one-time payment</div>
              </div>
              <Link
                to="/upload"
                className="rounded-full px-8 py-4 font-semibold bg-white text-primary shadow-lg transition-transform hover:scale-[1.02] whitespace-nowrap"
              >
                Create my Pawtoon →
              </Link>
            </div>
          </div>
        </div>

        {/* Coming Soon Merch */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold px-2">Coming soon</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {comingSoon.map((p) => (
            <div key={p.id} className="relative rounded-3xl overflow-hidden bg-card border border-border opacity-70">
              {/* Coming Soon overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <span className="rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="aspect-square bg-secondary">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="font-display text-base">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div className="rounded-3xl bg-card border border-border p-8 text-center max-w-xl mx-auto">
          <div className="text-3xl mb-3">📬</div>
          <h3 className="font-display text-2xl mb-2">Get notified when merch launches</h3>
          <p className="text-sm text-muted-foreground mb-5">
            We're working on mugs, tees, posters and more. Be the first to know — no spam, ever.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              className="rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground whitespace-nowrap"
              style={{ background: "var(--gradient-primary)" }}
            >
              Notify me
            </button>
          </div>
        </div>

      </section>
      <Footer />
    </div>
  );
}
