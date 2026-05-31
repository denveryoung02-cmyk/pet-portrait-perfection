import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  gen: z.string().optional(),
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/success")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Your Pawtoon is ready! — Pawtoons" }] }),
  component: Success,
});

function Success() {
  const { gen: generationId, session_id: sessionId } = Route.useSearch();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generationId) {
      setError("No generation ID found.");
      setLoading(false);
      return;
    }

    // Load generation and update order status
    async function loadAndSaveOrder() {
      try {
        // 1. Get the generation result
        const { data: gen, error: genErr } = await supabase
          .from("generations")
          .select("result_url, storage_path")
          .eq("id", generationId!)
          .single();

        if (genErr || !gen?.result_url) {
          setError("Could not find your portrait. Please contact support.");
          setLoading(false);
          return;
        }

        setPreviewUrl(gen.result_url);
        setDownloadUrl(gen.result_url);

        // 2. Record the completed order in Supabase
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (user) {
          const { data: order } = await supabase
            .from("orders")
            .insert({
              user_id: user.id,
              status: "paid",
              currency: "gbp",
              subtotal_cents: 299,
              total_cents: 299,
              stripe_session_id: sessionId ?? null,
            })
            .select("id")
            .single();

          if (order) {
            await supabase.from("order_items").insert({
              order_id: order.id,
              generation_id: generationId,
              quantity: 1,
              unit_price_cents: 299,
              options: { type: "digital_download" },
            });
          }
        }
      } catch (err) {
        setError("Something went wrong loading your portrait.");
      } finally {
        setLoading(false);
      }
    }

    loadAndSaveOrder();
  }, [generationId, sessionId]);

  async function handleDownload() {
    if (!downloadUrl) return;
    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-pawtoon.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(downloadUrl, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-2xl px-5 md:px-8 py-16 md:py-24 text-center">
        {loading ? (
          <div className="space-y-4">
            <div className="text-5xl animate-bounce">🎨</div>
            <p className="text-muted-foreground">Preparing your download…</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="text-5xl">😿</div>
            <h1 className="font-display text-3xl">Something went wrong</h1>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Your payment was processed. Please email us at{" "}
              <a href="mailto:hello@pawtoons.ai" className="text-primary underline">
                hello@pawtoons.ai
              </a>{" "}
              and we'll get your portrait to you.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success header */}
            <div className="space-y-3">
              <div className="text-5xl">🎉</div>
              <h1 className="font-display text-4xl md:text-5xl">Your Pawtoon is ready!</h1>
              <p className="text-muted-foreground">
                Payment confirmed. Your high-resolution portrait is ready to download.
              </p>
            </div>

            {/* Portrait preview */}
            {previewUrl && (
              <div className="mx-auto max-w-sm">
                <div className="rounded-3xl overflow-hidden border border-border shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Your Pawtoon"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Download button */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <span>⬇</span> Download my Pawtoon
              </button>
              <p className="text-xs text-muted-foreground">
                High-resolution PNG · Yours to keep, share & print
              </p>
            </div>

            {/* What's next */}
            <div className="rounded-3xl bg-card border border-border p-6 text-left space-y-3">
              <h3 className="font-display text-lg">What's next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span>🐾</span> Share your Pawtoon on social media and tag us @pawtoons
                </li>
                <li className="flex items-start gap-2">
                  <span>🖨️</span> Print it at home or at your local print shop
                </li>
                <li className="flex items-start gap-2">
                  <span>🎁</span> Make another one for a friend's pet!
                </li>
              </ul>
            </div>

            <div className="flex justify-center gap-4 text-sm">
              <Link to="/upload" className="text-primary hover:underline">
                Create another Pawtoon →
              </Link>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
