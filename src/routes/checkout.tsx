import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createCheckoutSession } from "@/lib/stripe.functions";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  gen: z.string().optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Checkout — Pawtoons" }] }),
  component: Checkout,
});

function Checkout() {
  const { gen: generationId } = Route.useSearch();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load the generated portrait for the order summary preview.
  useEffect(() => {
    if (!generationId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("generations")
        .select("preview_url")
        .eq("id", generationId)
        .single();
      if (!cancelled && data?.preview_url) setPreviewUrl(data.preview_url);
    })();
    return () => {
      cancelled = true;
    };
  }, [generationId]);

  const onPlaceOrder = async () => {
    setIsPlacingOrder(true);
    setError(null);

    try {
      if (!generationId) throw new Error("No portrait found — please create one first.");

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw new Error(sessionErr.message);
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("You must be signed in to place an order.");

      const origin = window.location.origin;
      const res = await createCheckoutSession({
        data: {
          generationId,
          successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&gen=${generationId}`,
          cancelUrl: `${origin}/checkout?gen=${generationId}`,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res?.url) throw new Error("Checkout URL missing.");
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-5xl px-4 sm:px-5 md:px-8 py-8 sm:py-12 md:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Step 3 of 3</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display">Almost there.</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 sm:gap-8">
          <form className="rounded-2xl sm:rounded-3xl bg-card border border-border p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            <div>
              <h2 className="font-display text-lg sm:text-xl mb-3 sm:mb-4">Contact</h2>
              <input type="email" placeholder="Email address" className="w-full rounded-xl border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              You'll be redirected to our secure Stripe checkout to complete payment.
            </p>
            {error ? (
              <p className="text-center text-xs sm:text-sm text-destructive">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="w-full rounded-full px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isPlacingOrder ? "Redirecting to checkout..." : "Place order — £2.99"}
            </button>
          </form>

          <aside className="rounded-2xl sm:rounded-3xl bg-card border border-border p-5 sm:p-6 h-fit lg:sticky lg:top-24">
            <h3 className="font-display text-base sm:text-lg mb-3 sm:mb-4">Order summary</h3>
            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="relative size-16 sm:size-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0 grid place-items-center text-2xl sm:text-3xl">
                {previewUrl ? (
                  <img src={previewUrl} alt="Your Pawtoon" className="w-full h-full object-cover" />
                ) : (
                  <span>🐾</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs sm:text-sm">Pawtoons Digital Portrait</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">High-resolution PNG · instant download</div>
                <div className="mt-1 font-semibold text-sm sm:text-base">£2.99</div>
              </div>
            </div>
            <div className="space-y-2 text-xs sm:text-sm border-t border-border pt-3 sm:pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>£2.99</span></div>
              <div className="flex justify-between font-semibold text-sm sm:text-base pt-2 border-t border-border"><span>Total</span><span>£2.99</span></div>
            </div>
            <Link to="/upload" className="block text-center text-xs text-muted-foreground mt-3 sm:mt-4 hover:text-foreground">← Back</Link>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}
