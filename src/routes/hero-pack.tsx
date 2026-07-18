import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getHeroPack, markHeroPackViewed, type HeroPackAsset, type HeroPackProfile, type HeroPackResult } from "@/lib/hero-pack.functions";

// Brand palette — lifted directly from design-reference/Pawtoons-Hero-Pack-Reveal-Prototype.html
// (same values used to render the character_card / hero_certificate PNGs in hero-pack.server.ts).
const NAVY = "#0c1f33";
const NAVY_DEEP = "#081522";
const GOLD = "#d8b872";
const GOLD_SOFT = "#f0dfae";
const CREAM = "#f6f1e4";
const MUTED = "#9aa9bb";

const searchSchema = z.object({
  order: z.string().uuid(),
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/hero-pack")({
  validateSearch: searchSchema,
  // No SSR loader: this app has no server-readable session (Supabase auth
  // persists to localStorage only, no cookie bridge — see
  // src/integrations/supabase/client.ts), so the initial server-rendered
  // paint cannot know who's asking. It renders a content-free placeholder
  // (the `!result` branch below); real data is fetched client-side after
  // hydration with a Bearer token, same as every other authenticated page in
  // this app (success.tsx, dashboard.orders.tsx). `session_id` stays in the
  // URL for the checkout redirect shape but is never sent to the server
  // functions — it must not be usable as a substitute for proving identity.
  head: () => ({
    meta: [{ title: "Your Hero Pack — Pawtoons" }],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500&display=swap",
      },
    ],
  }),
  component: HeroPackRoute,
});

const ASSET_LABELS: Record<HeroPackAsset["assetType"], string> = {
  hd_portrait: "HD portrait",
  phone_wallpaper: "Phone wallpaper",
  character_card: "Character card",
  hero_certificate: "Hero certificate",
};
const ASSET_FILENAMES: Record<HeroPackAsset["assetType"], string> = {
  hd_portrait: "pawtoons-hero-hd-portrait.png",
  phone_wallpaper: "pawtoons-hero-phone-wallpaper.png",
  character_card: "pawtoons-hero-character-card.png",
  hero_certificate: "pawtoons-hero-certificate.png",
};

type SequenceLayer = "analysing" | "origin" | "portrait" | "wallpaper" | "cert" | "cardstage" | "final";

function HeroPackRoute() {
  const { order } = Route.useSearch();

  const [result, setResult] = useState<HeroPackResult | undefined>(undefined);
  const [signInRequired, setSignInRequired] = useState(false);

  async function fetchHeroPack(): Promise<HeroPackResult | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setSignInRequired(true);
      return null;
    }
    return getHeroPack({ data: { orderId: order }, headers: { Authorization: `Bearer ${token}` } });
  }

  // Always fetched client-side — there is no SSR-visible session to check
  // ownership with (see the route's comment above).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchHeroPack();
      if (!cancelled && res) setResult(res);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // Poll every 10s while assets are still generating — same cadence as
  // success.tsx's checkBundleReady polling.
  useEffect(() => {
    if (!result || !result.found || result.ready) return;
    const interval = setInterval(async () => {
      const res = await fetchHeroPack();
      if (res) setResult(res);
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result && result.found, result && result.found ? result.ready : undefined]);

  async function markViewedFromClient() {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    await markHeroPackViewed({ data: { orderId: order }, headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }

  if (signInRequired) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md text-center py-16 sm:py-24 space-y-3">
          <div className="text-4xl">🔒</div>
          <h1 className="font-display text-2xl">Please sign in</h1>
          <p className="text-sm text-muted-foreground">Sign in to view this Hero Pack.</p>
          <a href="/auth" className="inline-block mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            Sign in →
          </a>
        </div>
      </PageShell>
    );
  }

  // This is the initial server-rendered paint for every request, and the
  // permanent state for a visitor whose JS never runs — deliberately no real
  // hero_profiles content, pet name, or download links here. Real data only
  // ever arrives via the authenticated client-side fetch above.
  if (!result) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md text-center py-16 sm:py-24 space-y-3">
          <div className="text-4xl animate-spin inline-block">✨</div>
          <h1 className="font-display text-2xl">Your Hero Pack is ready</h1>
          <p className="text-sm text-muted-foreground">Sign in to view it — loading…</p>
        </div>
      </PageShell>
    );
  }

  if (!result.found) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md text-center py-16 sm:py-24 space-y-3">
          <div className="text-4xl">😿</div>
          <h1 className="font-display text-2xl">We couldn't find this Hero Pack</h1>
          <p className="text-sm text-muted-foreground">
            Please use the link from your order confirmation, or check your{" "}
            <a href="/dashboard/orders" className="text-primary underline">
              orders
            </a>
            .
          </p>
        </div>
      </PageShell>
    );
  }

  if (!result.ready || !result.profile) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md text-center py-16 sm:py-24 space-y-4">
          <div className="text-4xl animate-spin inline-block">✨</div>
          <h1 className="font-display text-2xl">Your Hero Pack is being prepared</h1>
          <p className="text-sm text-muted-foreground">
            This usually takes under a minute. This page updates automatically — no need to refresh.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroPackReveal profile={result.profile} assets={result.assets} onViewed={markViewedFromClient} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      {children}
      <Footer />
    </div>
  );
}

function assetByType(assets: HeroPackAsset[], type: HeroPackAsset["assetType"]): HeroPackAsset | undefined {
  return assets.find((a) => a.assetType === type);
}

function HeroPackReveal({
  profile,
  assets,
  onViewed,
}: {
  profile: HeroPackProfile;
  assets: HeroPackAsset[];
  onViewed: () => void;
}) {
  const petName = profile.petName ?? "Your pet";
  const heroName = profile.heroName ?? petName;
  const serial = `HP-2026-${String(profile.packNumber).padStart(6, "0")}`;

  const portrait = assetByType(assets, "hd_portrait");
  const wallpaper = assetByType(assets, "phone_wallpaper");
  const card = assetByType(assets, "character_card");
  const cert = assetByType(assets, "hero_certificate");

  const [playIntro, setPlayIntro] = useState(false);
  const [settled, setSettled] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [layer, setLayer] = useState<SequenceLayer>("analysing");
  const [openingLine, setOpeningLine] = useState("");
  const [skipVisible, setSkipVisible] = useState(false);
  const [rarityShown, setRarityShown] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [statsShown, setStatsShown] = useState<boolean[]>([false, false, false, false, false, false]);
  const [badgeShown, setBadgeShown] = useState(false);
  const [serialShown, setSerialShown] = useState(false);

  const viewedRef = useRef(false);
  function finishOnce() {
    if (viewedRef.current) return;
    viewedRef.current = true;
    onViewed();
  }

  // Decide, once on mount, whether to play the intro at all.
  useEffect(() => {
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (profile.firstViewedAt || reduceMotion) {
      setSettled(true);
      setShowReplay(true);
      if (!profile.firstViewedAt) finishOnce();
      return;
    }
    setSettled(false);
    setPlayIntro(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The actual ~20.5s timeline. Cleans up all pending timers if playIntro
  // flips to false early (skip) or the component unmounts.
  useEffect(() => {
    if (!playIntro) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    setLayer("analysing");
    setOpeningLine(`Analysing ${petName}'s heroic potential…`);
    setSkipVisible(false);
    setRarityShown(false);
    setCardFlipped(false);
    setStatsShown([false, false, false, false, false, false]);
    setBadgeShown(false);
    setSerialShown(false);

    at(1500, () => setOpeningLine("Preparing Hero Pack…"));
    at(2000, () => setSkipVisible(true));
    at(3000, () => setLayer("origin"));
    at(4500, () => setLayer("portrait"));
    at(7000, () => setLayer("wallpaper"));
    at(9500, () => setLayer("cert"));
    at(12000, () => setLayer("cardstage"));
    at(14000, () => setRarityShown(true));
    at(14800, () => setCardFlipped(true));
    at(15500, () => setStatsShown((s) => [true, s[1], s[2], s[3], s[4], s[5]]));
    at(16000, () => setStatsShown((s) => [s[0], true, s[2], s[3], s[4], s[5]]));
    at(16500, () => setStatsShown((s) => [s[0], s[1], true, s[3], s[4], s[5]]));
    at(17000, () => setStatsShown((s) => [s[0], s[1], s[2], true, true, true]));
    at(18000, () => setBadgeShown(true));
    at(19000, () => setSerialShown(true));
    at(19500, () => setLayer("final"));
    at(20500, () => {
      setPlayIntro(false);
      setSettled(true);
      setShowReplay(true);
      finishOnce();
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIntro]);

  function skipToFinal() {
    setRarityShown(true);
    setCardFlipped(true);
    setStatsShown([true, true, true, true, true, true]);
    setBadgeShown(true);
    setSerialShown(true);
    setLayer("final");
    setPlayIntro(false); // cleans up any still-pending timers
    setSettled(true);
    setShowReplay(true);
    finishOnce();
  }

  function replay() {
    setSettled(false);
    setPlayIntro(true);
  }

  return (
    <>
      {/* Always-rendered base content — the no-JS / progressive-enhancement
          floor. Works with zero JS: real <a href download> links, no
          onClick-only affordances. The animated overlay below sits on top of
          this only once client JS decides to play it. */}
      <SettledGrid petName={petName} heroName={heroName} portrait={portrait} wallpaper={wallpaper} card={card} cert={cert} serial={serial} showReplay={showReplay && settled} onReplay={replay} />

      {playIntro && (
        <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto py-6 px-4" style={{ background: `radial-gradient(circle at 50% 30%, ${NAVY} 0%, ${NAVY_DEEP} 75%)` }}>
          <div className="relative w-full max-w-md mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            {skipVisible && (
              <button
                onClick={skipToFinal}
                className="absolute bottom-4 right-4 z-10 rounded-full border px-3 py-1.5 text-xs opacity-90"
                style={{ borderColor: "rgba(246,241,228,0.35)", color: CREAM, background: "transparent" }}
              >
                Skip to my pack
              </button>
            )}

            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
              {layer === "analysing" && (
                <div className="flex flex-col items-center">
                  <div className="size-28 rounded-full mb-6 animate-[hero-pack-glow-pulse_1.8s_ease-in-out_infinite]" style={{ border: `1px solid ${GOLD}` }} />
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 500, color: GOLD_SOFT, letterSpacing: "0.02em" }}>{openingLine}</div>
                </div>
              )}

              {layer === "origin" && (
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 500, color: GOLD_SOFT, letterSpacing: "0.02em" }}>
                  {profile.originStory ?? `In a world of squeaky toys and forbidden socks, one hero rises.`}
                </div>
              )}

              {layer === "portrait" && (
                <div className="flex flex-col items-center">
                  <PortraitCircle url={portrait?.url} size={180} />
                  <div className="mt-4" style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: 28, color: CREAM }}>
                    {heroName}
                  </div>
                  <div className="text-sm mt-1" style={{ color: MUTED }}>
                    {petName}'s Hero Pack
                  </div>
                </div>
              )}

              {layer === "wallpaper" && (
                <div className="flex flex-col items-center">
                  <div className="text-xs uppercase tracking-wider mb-4" style={{ color: MUTED }}>
                    Phone wallpaper
                  </div>
                  <div className="w-[130px] h-[230px] rounded-2xl overflow-hidden" style={{ border: `2px solid ${GOLD}` }}>
                    {wallpaper?.url && <img src={wallpaper.url} alt="Phone wallpaper" className="w-full h-full object-cover" />}
                  </div>
                </div>
              )}

              {layer === "cert" && (
                <div className="flex flex-col items-center">
                  <div className="text-xs uppercase tracking-wider mb-4" style={{ color: MUTED }}>
                    Hero certificate
                  </div>
                  {cert?.url && <img src={cert.url} alt="Hero certificate" className="w-full rounded-sm shadow-lg" style={{ border: `1px solid ${GOLD}` }} />}
                </div>
              )}

              {layer === "cardstage" && (
                <div className="flex flex-col items-center w-full">
                  <div
                    className="size-28 rounded-full mb-4 animate-[hero-pack-glow-pulse_1.8s_ease-in-out_infinite]"
                    style={{ border: `1px solid ${GOLD}` }}
                  />
                  <div
                    className="uppercase tracking-[0.12em] mb-4 transition-opacity duration-500"
                    style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: 26, color: GOLD, opacity: rarityShown ? 1 : 0 }}
                  >
                    {profile.adventureRank ?? "Legendary Guardian"}
                  </div>
                  <div
                    className="w-full max-w-[260px] rounded-2xl p-5 flex flex-col items-center transition-transform duration-700"
                    style={{
                      border: `1px solid ${GOLD}`,
                      background: "linear-gradient(180deg, rgba(216,184,114,0.10), rgba(216,184,114,0.02))",
                      transform: cardFlipped ? "rotateY(0deg)" : "rotateY(90deg)",
                    }}
                  >
                    <PortraitCircle url={portrait?.url} size={64} />
                    <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: 19, color: CREAM, margin: "10px 0" }}>{heroName}</div>
                    <div className="w-full">
                      {[
                        ["Hero name", heroName],
                        ["Adventure class", profile.adventureClass ?? ""],
                        ["Special ability", profile.specialAbility ?? ""],
                        ["Favourite snack", profile.favouriteSnack ?? ""],
                        ["Adventure rank", profile.adventureRank ?? ""],
                        ["Mission", profile.missionStatement ?? ""],
                      ].map(([label, value], i) => (
                        <div
                          key={label}
                          className="flex justify-between gap-3 py-1.5 text-[11.5px] transition-all duration-500"
                          style={{
                            borderTop: i === 0 ? "none" : "0.5px solid rgba(216,184,114,0.2)",
                            opacity: statsShown[i] ? 1 : 0,
                            transform: statsShown[i] ? "translateY(0)" : "translateY(6px)",
                          }}
                        >
                          <span style={{ color: MUTED, flexShrink: 0 }}>{label}</span>
                          <span style={{ color: CREAM, fontWeight: 500, textAlign: "right" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="text-center mt-2.5 transition-all duration-500"
                      style={{ opacity: badgeShown ? 1 : 0, transform: badgeShown ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.8)" }}
                    >
                      <div className="mx-auto size-5" style={{ transform: "rotate(45deg)", border: `2px solid ${GOLD}`, background: "rgba(216,184,114,0.15)" }} />
                      <div className="text-[10.5px] uppercase tracking-wide mt-1" style={{ color: MUTED }}>
                        Unlocked
                      </div>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 12.5, color: GOLD_SOFT, fontWeight: 500 }}>{profile.achievementBadge ?? ""}</div>
                    </div>
                    <div className="text-[10px] tracking-wider mt-2.5 transition-opacity duration-500" style={{ color: MUTED, opacity: serialShown ? 1 : 0 }}>
                      {serial}
                    </div>
                  </div>
                </div>
              )}

              {layer === "final" && (
                <div className="flex flex-col items-center">
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 19, color: CREAM, marginBottom: 14 }}>{petName}'s Hero Pack is complete.</div>
                  <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
                    {(["hd_portrait", "phone_wallpaper", "character_card", "hero_certificate"] as const).map((t) => (
                      <div key={t} className="rounded-xl p-3 text-center" style={{ border: "0.5px solid rgba(216,184,114,0.35)", background: "rgba(216,184,114,0.05)" }}>
                        <div className="text-[10.5px]" style={{ color: CREAM }}>
                          {ASSET_LABELS[t]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={skipToFinal}
                    className="mt-5 rounded-full px-5 py-2.5 text-sm font-medium animate-[hero-pack-button-pulse_2.2s_ease-in-out_infinite]"
                    style={{ background: GOLD, color: NAVY_DEEP }}
                  >
                    Show off {petName} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PortraitCircle({ url, size }: { url?: string | null; size: number }) {
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, border: `2px solid ${GOLD}`, background: "rgba(216,184,114,0.08)" }}
    >
      {url ? <img src={url} alt="Hero portrait" className="w-full h-full object-cover" /> : <span style={{ fontSize: size * 0.4 }}>🐾</span>}
    </div>
  );
}

function SettledGrid({
  petName,
  heroName,
  portrait,
  wallpaper,
  card,
  cert,
  serial,
  showReplay,
  onReplay,
}: {
  petName: string;
  heroName: string;
  portrait?: HeroPackAsset;
  wallpaper?: HeroPackAsset;
  card?: HeroPackAsset;
  cert?: HeroPackAsset;
  serial: string;
  showReplay: boolean;
  onReplay: () => void;
}) {
  const items: { type: HeroPackAsset["assetType"]; asset?: HeroPackAsset }[] = [
    { type: "hd_portrait", asset: portrait },
    { type: "phone_wallpaper", asset: wallpaper },
    { type: "character_card", asset: card },
    { type: "hero_certificate", asset: cert },
  ];

  function shareShareUrl(): string {
    const text = encodeURIComponent(`${heroName} just unlocked their Pawtoons Hero Pack! 🐾`);
    return `https://twitter.com/intent/tweet?text=${text}`;
  }

  function handleShareClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      e.preventDefault();
      (navigator as any)
        .share({ title: "My Pawtoons Hero Pack", text: `${heroName} just unlocked their Pawtoons Hero Pack!`, url: window.location.href })
        .catch(() => {
          window.open(shareShareUrl(), "_blank", "noopener,noreferrer");
        });
    }
    // No JS / no Web Share API: default anchor href navigation proceeds.
  }

  return (
    <section
      className="mx-auto max-w-2xl px-4 sm:px-5 md:px-8 py-10 sm:py-16 text-center"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {showReplay && (
        <button
          onClick={onReplay}
          className="mb-6 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Replay the reveal ✨
        </button>
      )}

      <div className="space-y-2 mb-8">
        <div className="text-4xl">🦸</div>
        <h1 className="font-display text-3xl sm:text-4xl">{petName}'s Hero Pack is complete.</h1>
        <p className="text-sm text-muted-foreground">Serial {serial}</p>
      </div>

      {portrait?.url && (
        <div className="mx-auto max-w-xs mb-8 rounded-2xl overflow-hidden border border-border shadow-lg">
          <img src={portrait.url} alt={`${heroName} portrait`} className="w-full h-auto" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
        {items.map(({ type, asset }) => (
          <div key={type} className="rounded-2xl border border-border bg-card overflow-hidden">
            {asset?.url ? (
              <img src={asset.url} alt={ASSET_LABELS[type]} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square grid place-items-center bg-secondary text-2xl">✨</div>
            )}
            <div className="p-3">
              <div className="text-xs font-semibold mb-2">{ASSET_LABELS[type]}</div>
              {asset?.url ? (
                <a
                  href={asset.url}
                  download={ASSET_FILENAMES[type]}
                  className="block w-full rounded-full px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  ⬇ Download
                </a>
              ) : (
                <span className="block w-full rounded-full px-3 py-1.5 text-xs font-semibold bg-secondary text-muted-foreground">Preparing…</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <a
        href={shareShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleShareClick}
        className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        Show off {petName} →
      </a>
    </section>
  );
}
