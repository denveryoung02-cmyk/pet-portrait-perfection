import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import mug from "@/assets/product-mug.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import poster from "@/assets/product-poster.jpg";
import mousemat from "@/assets/product-mousemat.jpg";
import royal from "@/assets/pet-royal.jpg";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Pick your product — Pawtraits" }] }),
  component: Products,
});

const products = [
  { id: "mug", name: "Ceramic Mug", price: 24, img: mug, desc: "11oz dishwasher-safe" },
  { id: "tshirt", name: "Premium Tee", price: 32, img: tshirt, desc: "Organic cotton, soft-touch" },
  { id: "poster", name: "Framed Poster", price: 45, img: poster, desc: "Museum-grade matte paper" },
  { id: "mousemat", name: "Mouse Mat", price: 19, img: mousemat, desc: "Anti-slip neoprene base" },
];

function Products() {
  const [selected, setSelected] = useState("mug");
  const navigate = useNavigate();
  const product = products.find((p) => p.id === selected)!;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Step 2 of 3</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-display">Pick your product.</h1>
          <p className="mt-3 text-muted-foreground">Your caricature is ready ✨ Now choose where it lives.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`text-left rounded-3xl overflow-hidden bg-card border-2 transition-all ${
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

          <aside className="rounded-3xl bg-card border border-border p-6 md:p-8 h-fit sticky top-24 shadow-[var(--shadow-soft)]">
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary mb-5">
              <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-2xl">{product.name}</h3>
              <span className="font-display text-2xl text-primary">${product.price}</span>
            </div>
            <p className="text-sm text-muted-foreground">{product.desc} — printed with your caricature.</p>

            <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-secondary">
              <img src={royal} alt="" className="size-12 rounded-xl object-cover" />
              <div className="text-sm">
                <div className="font-semibold">Your caricature</div>
                <div className="text-xs text-muted-foreground">Royal theme · Ready</div>
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
      <Footer />
    </div>
  );
}
