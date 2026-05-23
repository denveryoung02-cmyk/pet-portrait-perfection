import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useMemo, useState } from "react";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";
import royal from "@/assets/pet-royal.jpg";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Pick your product — Pawtoons" }] }),
  component: Products,
});

const products = [
  { id: "tshirt", name: "Premium Tee", price: 32, img: tshirt, desc: "Organic cotton, soft-touch" },
  { id: "mug", name: "Ceramic Mug", price: 24, img: mug, desc: "11oz dishwasher-safe" },
  { id: "poster", name: "Framed Poster", price: 45, img: poster, desc: "Museum-grade matte paper" },
  { id: "mousemat", name: "Mouse Mat", price: 19, img: mousemat, desc: "Anti-slip neoprene base" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const FITS = [
  { id: "regular", name: "Regular fit", desc: "Classic everyday cut" },
  { id: "oversized", name: "Oversized", desc: "Relaxed streetwear vibe" },
  { id: "premium", name: "Premium fit", desc: "Tailored, slightly slim" },
];
const COLORS: { id: string; name: string; hex: string; ring?: string }[] = [
  { id: "black", name: "Black", hex: "#111111" },
  { id: "white", name: "White", hex: "#fafafa", ring: "border-2 border-border" },
  { id: "cream", name: "Cream", hex: "#f3ead4" },
  { id: "navy", name: "Navy", hex: "#1a2a4a" },
  { id: "pink", name: "Pink", hex: "#f8b5c9" },
  { id: "grey", name: "Grey", hex: "#9aa0a6" },
];

function Products() {
  const [selected, setSelected] = useState("tshirt");
  const [size, setSize] = useState("M");
  const [fit, setFit] = useState("regular");
  const [color, setColor] = useState("black");
  const navigate = useNavigate();

  const product = products.find((p) => p.id === selected)!;
  const colorObj = COLORS.find((c) => c.id === color)!;
  const fitObj = FITS.find((f) => f.id === fit)!;
  const fitPrice = fit === "premium" ? 6 : fit === "oversized" ? 3 : 0;
  const total = useMemo(() => product.price + (selected === "tshirt" ? fitPrice : 0), [product, selected, fitPrice]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Nav />
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Step 2 of 3</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-display">Pick your product.</h1>
          <p className="mt-3 text-muted-foreground">Your Pawtoon is ready ✨ Now choose where it lives.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div>
            {/* Product picker */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`text-left rounded-3xl overflow-hidden bg-card border-2 transition-all hover:-translate-y-0.5 ${
                    selected === p.id ? "border-primary shadow-[var(--shadow-card)]" : "border-transparent hover:border-border"
                  }`}
                >
                  <div className="aspect-square bg-secondary">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-display text-lg">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.desc}</div>
                    </div>
                    <div className="font-semibold">${p.price}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* T-shirt customizer */}
            {selected === "tshirt" && (
              <div className="mt-8 rounded-3xl bg-card border border-border p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
                <h2 className="font-display text-2xl mb-1">Customise your tee</h2>
                <p className="text-sm text-muted-foreground mb-6">Live preview updates as you tweak it.</p>

                {/* Color */}
                <div className="mb-7">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Colour</h3>
                    <span className="text-xs font-semibold">{colorObj.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => {
                      const active = c.id === color;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setColor(c.id)}
                          aria-label={c.name}
                          className={`relative size-12 rounded-full transition-all hover:scale-110 ${c.ring ?? ""} ${active ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                          style={{ background: c.hex }}
                        >
                          {active && <span className="absolute inset-0 grid place-items-center text-xs" style={{ color: c.id === "white" || c.id === "cream" ? "#111" : "#fff" }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size */}
                <div className="mb-7">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Size</h3>
                    <a href="#" className="text-xs text-primary font-semibold hover:underline">Size guide</a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => {
                      const active = s === size;
                      return (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`min-w-[56px] h-12 px-4 rounded-2xl font-semibold text-sm transition-all border-2 ${
                            active ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fit */}
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Fit</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {FITS.map((f) => {
                      const active = f.id === fit;
                      const extra = f.id === "premium" ? 6 : f.id === "oversized" ? 3 : 0;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setFit(f.id)}
                          className={`text-left rounded-2xl p-4 border-2 transition-all hover:-translate-y-0.5 ${
                            active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-display text-base">{f.name}</div>
                            {extra > 0 && <span className="text-[10px] font-bold text-primary">+${extra}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live preview / order summary */}
          <aside className="rounded-3xl bg-card border border-border p-6 md:p-8 h-fit lg:sticky lg:top-24 shadow-[var(--shadow-soft)]">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-5" style={{ background: colorObj.hex }}>
              {selected === "tshirt" ? (
                <>
                  <img src={tshirt} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90" style={{ filter: color === "white" || color === "cream" ? "invert(0)" : color === "black" ? "brightness(0.4) contrast(1.2)" : "saturate(0.4)" }} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="size-28 md:size-36 rounded-2xl overflow-hidden border-4 border-background/60 shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform">
                      <img src={royal} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <span className="rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{size}</span>
                    <span className="rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{fitObj.name}</span>
                  </div>
                </>
              ) : (
                <img src={product.img} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>

            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-2xl">{product.name}</h3>
              <span className="font-display text-2xl text-primary">${total}</span>
            </div>
            <p className="text-sm text-muted-foreground">{product.desc}</p>

            {selected === "tshirt" && (
              <div className="mt-4 space-y-1.5 text-xs">
                <Row k="Colour" v={colorObj.name} />
                <Row k="Size" v={size} />
                <Row k="Fit" v={fitObj.name + (fitPrice ? ` (+$${fitPrice})` : "")} />
              </div>
            )}

            <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-secondary">
              <img src={royal} alt="" className="size-12 rounded-xl object-cover" />
              <div className="text-sm">
                <div className="font-semibold">Your Pawtoon</div>
                <div className="text-xs text-muted-foreground">Royal · Noble King · Ready ✓</div>
              </div>
            </div>

            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="mt-6 w-full rounded-full px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Continue to checkout →
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">Free shipping over $50 · 30-day returns</p>
          </aside>
        </div>
      </section>

      {/* Sticky mobile checkout bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-3 bg-background/95 backdrop-blur-xl border-t border-border flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-display text-base truncate">{product.name}{selected === "tshirt" ? ` · ${size}` : ""}</div>
          <div className="text-xs text-muted-foreground">Total ${total}</div>
        </div>
        <button onClick={() => navigate({ to: "/checkout" })} className="rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          Checkout →
        </button>
      </div>

      <Footer />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
  );
}
