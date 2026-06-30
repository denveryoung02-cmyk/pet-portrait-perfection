import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { confirmCheckout, checkBundleReady } from "@/lib/fulfillment.functions";
import type { BundlePortrait } from "@/lib/bundle.server";
import { track } from "@/lib/analytics";

const searchSchema = z.object({
  gen: z.string().optional(),
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/success")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Your Pawtoon is ready! — Pawtoons" }] }),
  component: Success,
});

const ART_STYLE_LABELS: Record<string, string> = {
  "oil-painting": "Oil Painting",
  "pixar-3d": "Pixar 3D",
  "watercolour": "Watercolour",
};

function Success() {
  const { gen: generationId, session_id: sessionId } = Route.useSearch();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [wantsBundle, setWantsBundle] = useState(false);
  const [bundlePortraits, setBundlePortraits] = useState<BundlePortrait[]>([]);
  const [bundleReady, setBundleReady] = useState(false);

  useEffect(() => {
    if (!generationId || !sessionId) {
      setError("Missing checkout details. Please use the link from your purchase.");
      setLoading(false);
      return;
    }

    async function confirmAndReveal() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          setError("Please sign in to view your purchase.");
          setLoading(false);
          return;
        }

        const res = await confirmCheckout({
          data: { sessionId: sessionId!, generationId: generationId! },
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res?.paid || !res.downloadUrl) {
          setError("We couldn't confirm your payment. If you were charged, contact support.");
          setLoading(false);
          return;
        }

        setPreviewUrl(res.downloadUrl);
        setDownloadUrl(res.downloadUrl);
        if (res.orderId) setOrderId(res.orderId);
        if (res.wantsBundle) setWantsBundle(true);
        track("payment_completed", { bundle: !!res.wantsBundle });
      } catch {
        setError("Something went wrong confirming your purchase.");
      } finally {
        setLoading(false);
      }
    }

    confirmAndReveal();
  }, [generationId, sessionId]);

  // Poll bundle status every 10 s. Each checkBundleReady call generates one
  // missing style if any remain (one per invocation to stay within CF memory limit).
  useEffect(() => {
    if (!orderId || !wantsBundle || bundleReady) return;
    const interval = setInterval(async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;
        const res = await checkBundleReady({
          data: { orderId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.portraits?.length > 0) setBundlePortraits(res.portraits);
        if (res?.ready) {
          setBundleReady(true);
          clearInterval(interval);
        }
      } catch {
        // best-effort — keep polling
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId, wantsBundle, bundleReady]);

  async function handleDownload(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="mx-auto max-w-2xl px-4 sm:px-5 md:px-8 py-12 sm:py-16 md:py-24 text-center">
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-4xl sm:text-5xl animate-bounce">🎨</div>
            <p className="text-sm sm:text-base text-muted-foreground">Preparing your download…</p>
          </div>
        ) : error ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-4xl sm:text-5xl">😿</div>
            <h1 className="font-display text-2xl sm:text-3xl">Something went wrong</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your payment was processed. Please email us at{" "}
              <a href="mailto:hello@pawtoons.ai" className="text-primary underline">
                hello@pawtoons.ai
              </a>{" "}
              and we'll get your portrait to you.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Success header */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-4xl sm:text-5xl">🎉</div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">Your Pawtoon is ready!</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {wantsBundle
                  ? "Payment confirmed. Your first portrait is ready now — the other 2 styles are generating."
                  : "Payment confirmed. Your high-resolution portrait is ready to download."}
              </p>
            </div>

            {/* Primary portrait */}
            {previewUrl && (
              <div className="mx-auto max-w-sm px-4 sm:px-0">
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-lg">
                  <img src={previewUrl} alt="Your Pawtoon" className="w-full h-auto" />
                </div>
              </div>
            )}

            {/* Download button */}
            {downloadUrl && (
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => handleDownload(downloadUrl, "my-pawtoon.png")}
                  className="inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <span>⬇</span> Download my Pawtoon
                </button>
                <p className="text-xs text-muted-foreground">
                  High-resolution PNG · Yours to keep, share &amp; print
                </p>
              </div>
            )}

            {/* Bundle section */}
            {wantsBundle && (
              <div className="rounded-2xl sm:rounded-3xl bg-card border border-border p-5 sm:p-6 text-left space-y-4">
                <h3 className="font-display text-base sm:text-lg">Your 2 extra styles</h3>
                {bundlePortraits.length === 0 ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="animate-spin text-lg inline-block">✨</span>
                    <span>Generating your other 2 styles — this takes a few minutes. This page updates automatically.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {bundlePortraits.map((portrait) => (
                      <div key={portrait.generationId} className="rounded-xl border border-border overflow-hidden">
                        {portrait.status === "completed" && portrait.downloadUrl ? (
                          <>
                            <div className="aspect-square overflow-hidden bg-secondary">
                              <img
                                src={portrait.downloadUrl}
                                alt={portrait.artStyleLabel}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3 space-y-2">
                              <div className="text-xs font-semibold">{portrait.artStyleLabel}</div>
                              <button
                                onClick={() => handleDownload(portrait.downloadUrl!, `my-pawtoon-${portrait.artStyle}.png`)}
                                className="w-full rounded-full px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                style={{ background: "var(--gradient-primary)" }}
                              >
                                ⬇ Download
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="aspect-square bg-secondary grid place-items-center">
                            {portrait.status === "failed" ? (
                              <div className="text-center p-3">
                                <div className="text-2xl mb-1">😿</div>
                                <div className="text-xs text-muted-foreground">{ART_STYLE_LABELS[portrait.artStyle] ?? portrait.artStyle} failed</div>
                              </div>
                            ) : (
                              <div className="text-center p-3">
                                <div className="text-2xl animate-spin inline-block">✨</div>
                                <div className="text-xs text-muted-foreground mt-2">{ART_STYLE_LABELS[portrait.artStyle] ?? portrait.artStyle} generating…</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {bundlePortraits.length < 2 && (
                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="aspect-square bg-secondary grid place-items-center">
                          <div className="text-center p-3">
                            <div className="text-2xl animate-spin inline-block">✨</div>
                            <div className="text-xs text-muted-foreground mt-2">Generating…</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* What's next */}
            <div className="rounded-2xl sm:rounded-3xl bg-card border border-border p-5 sm:p-6 text-left space-y-2 sm:space-y-3">
              <h3 className="font-display text-base sm:text-lg">What's next?</h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span>🐾</span> <span>Share your Pawtoon on social media and tag us @pawtoons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🖨️</span> <span>Print it at home or at your local print shop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎁</span> <span>Make another one for a friend's pet!</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
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
