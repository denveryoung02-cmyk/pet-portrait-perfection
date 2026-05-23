import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import mug from "@/assets/product-mug.jpg";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Pawtoons" }] }),
  component: Checkout,
});

function Checkout() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Step 3 of 3</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-display">Almost there.</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <form className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl mb-4">Contact</h2>
              <input type="email" placeholder="Email address" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <h2 className="font-display text-xl mb-4">Shipping</h2>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First name" className="rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                <input placeholder="Last name" className="rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                <input placeholder="Address" className="col-span-2 rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                <input placeholder="City" className="rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                <input placeholder="ZIP / Postcode" className="rounded-xl border border-input bg-background px-4 py-3 text-sm" />
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl mb-4">Payment</h2>
              <div className="rounded-2xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
                💳 Payment integration placeholder
              </div>
            </div>

            <button type="button" className="w-full rounded-full px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]" style={{ background: "var(--gradient-primary)" }}>
              Place order — $26.99
            </button>
          </form>

          <aside className="rounded-3xl bg-card border border-border p-6 h-fit sticky top-24">
            <h3 className="font-display text-lg mb-4">Order summary</h3>
            <div className="flex gap-4 mb-5">
              <div className="size-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                <img src={mug} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Ceramic Mug</div>
                <div className="text-xs text-muted-foreground">Royal Pet theme</div>
                <div className="mt-1 font-semibold">$24.00</div>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>$24.00</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>$2.99</span></div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><span>Total</span><span>$26.99</span></div>
            </div>
            <Link to="/products" className="block text-center text-xs text-muted-foreground mt-4 hover:text-foreground">← Edit order</Link>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}
