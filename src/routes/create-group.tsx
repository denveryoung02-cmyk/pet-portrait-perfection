import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useRef, useState } from "react";
import { uploadPetPhoto, updatePetName, validateImage } from "@/services/uploads";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { generateMultiSubjectPawtoon } from "@/lib/multi-subject-generation.functions";
import { createMultiSubjectCheckoutSession } from "@/lib/multi-subject-stripe.functions";

/**
 * Step 2 (UI/state) + Step 2b (real uploads) + Step 4b (real generation) +
 * Step 5 (real Stripe checkout) of the owner+pet build plan. Tier prices
 * below are display copy only (the real amounts live in the fixed price map
 * in multi-subject-stripe.functions.ts) — kept in sync manually since this
 * is UI display text, not the source of truth for what Stripe charges.
 */

export const Route = createFileRoute("/create-group")({
  head: () => ({ meta: [{ title: "Create your Group Pawtoon — owner + pet" }] }),
  component: CreateGroupWizard,
});

/* ---------------- Data (mock only) ---------------- */

type TierId = "solo" | "family" | "full_house";

type Tier = {
  id: TierId;
  name: string;
  tag: string;
  peopleCount: number;
  petCount: number;
  priceDisplay: string; // mock display only — not wired to Stripe
  emoji: string;
  // Solo is fixed: exactly 1 person + 1 pet, no skipping. Family/Full House
  // are flexible: only the first pet slot is required, everything else
  // (both person slots, any additional pet slots) is skippable.
  flexible: boolean;
};

const TIERS: Tier[] = [
  { id: "solo", name: "Solo", tag: "1 person + 1 pet", peopleCount: 1, petCount: 1, priceDisplay: "£2.99", emoji: "🧍", flexible: false },
  { id: "family", name: "Family", tag: "Up to 2 people + 2 pets", peopleCount: 2, petCount: 2, priceDisplay: "£4.99", emoji: "👨‍👩‍👧", flexible: true },
  { id: "full_house", name: "Full House", tag: "Up to 3 people + 3 pets", peopleCount: 3, petCount: 3, priceDisplay: "£6.99", emoji: "🏠", flexible: true },
];

const MAX_PEOPLE = 3;
const MAX_PETS = 3;
const MAX_NAME_LENGTH = 40;

// Same 3 styles/copy as upload.tsx's ART_STYLES (upload.tsx:237-241) — copied,
// not imported, since that const isn't exported from upload.tsx.
const ART_STYLES = [
  { id: "oil-painting", name: "Oil Painting", emoji: "🎨", desc: "Museum-quality oil painting, rich painterly brush strokes, dramatic lighting, gallery-grade composition" },
  { id: "pixar-3d", name: "Pixar/3D", emoji: "✨", desc: "Pixar 3D animation style, soft volumetric lighting, Disney character aesthetic, rounded forms, high detail render, warm family-friendly colours" },
  { id: "comic-book", name: "Comic Book", emoji: "💥", desc: "Bold pop art comic style with vibrant colours and dynamic energy" },
];

const STEPS = [
  { n: 1, title: "Choose your bundle", sub: "Pick a tier" },
  { n: 2, title: "Choose your style", sub: "Pick the art style" },
  { n: 3, title: "Add your photos", sub: "Upload each person & pet" },
];

type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

type SubjectSlot = {
  file: File | null;
  previewUrl: string | null;
  subjectType: "person" | "pet";
  name: string;
  // Populated once uploadPetPhoto + the subject_type tag both succeed —
  // this + subjectType + name is the { uploadedImageId, subjectType, name }
  // shape documented in the Step 1 migration comment for generation_params.
  uploadedImageId: string | null;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  uploadError: string | null;
  // Must be filled — no skip affordance shown. True for both Solo slots;
  // true for only the first pet slot on Family/Full House.
  required: boolean;
  // User explicitly opted out of this optional slot. Only ever true when
  // required is false. Skipped slots are omitted from the generation payload.
  skipped: boolean;
};

function makeSlot(subjectType: "person" | "pet", required: boolean): SubjectSlot {
  return {
    file: null,
    previewUrl: null,
    subjectType,
    name: "",
    uploadedImageId: null,
    uploadProgress: 0,
    uploadStatus: "idle",
    uploadError: null,
    required,
    skipped: false,
  };
}

function buildSlotsForTier(tier: Tier): SubjectSlot[] {
  return [
    ...Array.from({ length: tier.peopleCount }, () => makeSlot("person", !tier.flexible)),
    ...Array.from({ length: tier.petCount }, (_, i) => makeSlot("pet", !tier.flexible || i === 0)),
  ];
}

type GenStatus = "idle" | "generating" | "done" | "failed";

// Same progress-animation pattern as upload.tsx's GEN_STAGES (upload.tsx:254-260)
// and its generation useEffect (upload.tsx:424-494) — copied/adapted, not
// imported, since neither is exported from upload.tsx. Here it's triggered by
// the Continue button instead of automatically on step view.
const GEN_STAGES = [
  { label: "Loading everyone's photos", emoji: "📥" },
  { label: "Blending the scene together", emoji: "🎨" },
  { label: "Adding the finishing details", emoji: "🖌️" },
  { label: "Almost ready", emoji: "✨" },
];

/* ---------------- Wizard ---------------- */

function CreateGroupWizard() {
  const [step, setStep] = useState(1);
  const [tierId, setTierId] = useState<TierId | null>(null);
  const [artStyleId, setArtStyleId] = useState("oil-painting");
  const [subjects, setSubjects] = useState<SubjectSlot[]>([]);

  // Generation state (Step 4b) — mirrors upload.tsx's genProgress/genStage/
  // genDone/genFailed/genError/genResultUrl state (upload.tsx:295-301),
  // collapsed into one status enum since there's no separate "done" vs
  // "failed" boolean pair needed here.
  const [genStatus, setGenStatus] = useState<GenStatus>("idle");
  const [genProgress, setGenProgress] = useState(0);
  const [genStage, setGenStage] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);
  const [genPreviewUrl, setGenPreviewUrl] = useState<string | null>(null);
  const [genGenerationId, setGenGenerationId] = useState<string | null>(null);

  // Checkout state (Step 5) — separate from genStatus since it only ever
  // applies once genStatus === "done".
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "redirecting" | "error">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const tier = TIERS.find((t) => t.id === tierId) ?? null;

  const resetGeneration = () => {
    setGenStatus("idle");
    setGenProgress(0);
    setGenStage(0);
    setGenError(null);
    setGenPreviewUrl(null);
    setGenGenerationId(null);
    setCheckoutStatus("idle");
    setCheckoutError(null);
  };

  const selectTier = (t: Tier) => {
    setTierId(t.id);
    setSubjects(buildSlotsForTier(t));
    resetGeneration();
  };

  // Real call to generateMultiSubjectPawtoon — mirrors upload.tsx's real
  // generation try/catch (upload.tsx:458-487), including the cosmetic
  // progress-tick interval that runs alongside the actual request, but
  // triggered by the Continue button instead of a step-view useEffect.
  const handleGenerate = async () => {
    if (!tier) return;
    setGenStatus("generating");
    setGenError(null);
    setGenProgress(0);
    setGenStage(0);

    const tick = setInterval(() => {
      setGenProgress((p) => {
        const next = Math.min(95, p + Math.random() * 4 + 2);
        setGenStage(Math.min(GEN_STAGES.length - 1, Math.floor((next / 100) * GEN_STAGES.length)));
        return next;
      });
    }, 220);

    try {
      const res = await generateMultiSubjectPawtoon({
        data: {
          // Skipped slots are simply omitted — generateMultiSubjectPawtoon
          // takes whatever subjects list it's given, no fixed count assumed.
          subjects: subjects
            .filter((s) => !s.skipped)
            .map((s) => ({
              uploadedImageId: s.uploadedImageId!,
              subjectType: s.subjectType,
              name: s.name.trim(),
            })),
          artStyleId,
          tier: tier.id,
        },
      });

      clearInterval(tick);

      if (res.status === "completed") {
        setGenProgress(100);
        setGenPreviewUrl(res.previewUrl);
        setGenGenerationId(res.generationId);
        setTimeout(() => setGenStatus("done"), 250);
      } else {
        setGenError((res as { error?: string }).error ?? "Generation failed.");
        setGenStatus("failed");
      }
    } catch (err) {
      clearInterval(tick);
      setGenError(err instanceof Error ? err.message : "Generation failed.");
      setGenStatus("failed");
    }
  };

  // Real call to createMultiSubjectCheckoutSession — same redirect pattern
  // as checkout.tsx's onPlaceOrder (checkout.tsx:55-84): create the session,
  // then hard-navigate to Stripe's hosted checkout page.
  const handleCheckout = async () => {
    if (!genGenerationId || !tier) return;
    setCheckoutStatus("redirecting");
    setCheckoutError(null);
    try {
      const origin = window.location.origin;
      const res = await createMultiSubjectCheckoutSession({
        data: {
          generationId: genGenerationId,
          tier: tier.id,
          successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&gen=${genGenerationId}`,
          cancelUrl: `${origin}/create-group`,
        },
      });
      if (!res?.url) throw new Error("Checkout URL missing.");
      window.location.href = res.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Failed to start checkout.");
      setCheckoutStatus("error");
    }
  };

  // Defensive cap check — tiers already fix the counts, but never trust it blindly.
  const personCount = subjects.filter((s) => s.subjectType === "person").length;
  const petCount = subjects.filter((s) => s.subjectType === "pet").length;
  const withinCaps = personCount <= MAX_PEOPLE && petCount <= MAX_PETS;

  const canNext = () => {
    if (step === 1) return !!tierId;
    if (step === 2) return !!artStyleId;
    if (step === 3) {
      // Every slot must be either uploaded (with a valid name) or explicitly
      // skipped — an empty, undecided optional slot blocks Continue just like
      // an empty required one always has. Solo's slots are all required, so
      // skipped is always false there and this reduces to the original check.
      const allDecided = subjects.every((s) =>
        s.skipped
          ? true
          : s.uploadStatus === "uploaded" &&
            !!s.uploadedImageId &&
            s.name.trim().length > 0 &&
            s.name.trim().length <= MAX_NAME_LENGTH
      );
      const hasAtLeastOnePet = subjects.some(
        (s) => s.subjectType === "pet" && !s.skipped && s.uploadStatus === "uploaded"
      );
      return withinCaps && subjects.length > 0 && allDecided && hasAtLeastOnePet;
    }
    return true;
  };

  const goNext = () => {
    if (!canNext()) return;
    setStep((s) => Math.min(3, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    // Leaving step 3 invalidates any shown/failed result — going back to
    // change style should mean generating fresh, not seeing a stale preview.
    if (step === 3) resetGeneration();
    setStep((s) => Math.max(1, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const primaryAction = () => {
    if (step < 3) {
      goNext();
      return;
    }
    if (genStatus === "idle") {
      if (canNext()) void handleGenerate();
      return;
    }
    if (genStatus === "failed") {
      void handleGenerate();
      return;
    }
    if (genStatus === "done") {
      resetGeneration();
      return;
    }
    // "generating" — button is disabled, no-op.
  };

  const primaryLabel = () => {
    if (step < 3) return "Next →";
    if (genStatus === "generating") return "Generating…";
    if (genStatus === "failed") return "Retry generation";
    if (genStatus === "done") return "Edit photos & generate again";
    return `Generate my portrait — ${tier?.priceDisplay ?? ""}`;
  };

  const primaryDisabled = () => {
    if (step < 3) return !canNext();
    if (genStatus === "generating") return true;
    if (genStatus === "idle") return !canNext();
    return false; // "failed" (retry) and "done" (edit again) are always clickable
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-32 md:pb-28">
      <Nav />

      <ProgressBar step={step} onJump={(n) => n < step && setStep(n)} />

      <main className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8 py-6 sm:py-8 md:py-12">
        <header className="mb-6 sm:mb-8 md:mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
            Step {step} of 3 · {STEPS[step - 1]?.sub}
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-5xl font-display leading-tight">
            {stepHeadline(step)}
          </h1>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs text-muted-foreground">
            🧍🐾 Owner + pet portraits, together in one scene
          </div>
        </header>

        <div key={step} className="animate-[fade-up_0.45s_ease-out]">
          {step === 1 && <StepTier tierId={tierId} onSelect={selectTier} />}
          {step === 2 && <StepArtStyle artStyleId={artStyleId} setArtStyleId={setArtStyleId} />}
          {step === 3 && tier && genStatus === "idle" && <StepSlots subjects={subjects} setSubjects={setSubjects} />}
          {step === 3 && tier && genStatus !== "idle" && (
            <GenerationPanel
              genStatus={genStatus}
              genProgress={genProgress}
              genStage={genStage}
              genError={genError}
              genPreviewUrl={genPreviewUrl}
              tier={tier}
              checkoutStatus={checkoutStatus}
              checkoutError={checkoutError}
              onCheckout={handleCheckout}
            />
          )}
          {step === 3 && !tier && (
            <p className="text-center text-muted-foreground">Go back and pick a bundle first.</p>
          )}
        </div>
      </main>

      {/* Sticky footer nav */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl safe-bottom">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8 py-3 md:py-4 flex flex-col gap-2">
          {step === 3 && (
            <p className="text-center text-[11px] text-muted-foreground">
              {genStatus === "generating"
                ? "Creating your combined portrait — this can take a little longer than a single-pet portrait."
                : genStatus === "done"
                ? "✅ Preview generated — buy below to unlock the full-resolution download, or edit photos to try again."
                : genStatus === "failed"
                ? "Something went wrong generating your portrait — see above to retry."
                : "Upload every tile and give each subject a name, then generate."}
            </p>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={goBack}
              disabled={step === 1 || genStatus === "generating"}
              className="rounded-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border border-border bg-card disabled:opacity-40 hover:bg-secondary transition whitespace-nowrap"
            >
              ← Back
            </button>
            <div className="hidden md:block flex-1 text-sm text-muted-foreground">
              {step < 3 ? `Next: ${STEPS[step]?.title}` : tier ? `Bundle: ${tier.name} · ${tier.priceDisplay}` : ""}
            </div>
            <div className="md:hidden flex-1 text-xs text-muted-foreground truncate">{STEPS[step - 1].title}</div>
            <button
              onClick={primaryAction}
              disabled={primaryDisabled()}
              className="rounded-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 whitespace-nowrap"
              style={{ background: "var(--gradient-primary)" }}
            >
              {primaryLabel()}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function stepHeadline(s: number) {
  return {
    1: "Choose your bundle.",
    2: "Choose your style.",
    3: "Add everyone's photo.",
  }[s as 1 | 2 | 3];
}

/* ---------------- Progress (same visual pattern as upload.tsx's ProgressBar) ---------------- */

function ProgressBar({ step, onJump }: { step: number; onJump: (n: number) => void }) {
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-16 md:top-20 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8 py-3 sm:py-4">
        <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        <ol className="mt-3 hidden md:flex items-center justify-between">
          {STEPS.map((s) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <li key={s.n}>
                <button
                  onClick={() => onJump(s.n)}
                  disabled={s.n > step}
                  className="flex items-center gap-2 group disabled:cursor-not-allowed"
                >
                  <span
                    className={`size-7 rounded-full grid place-items-center text-xs font-bold transition-all ${
                      done ? "bg-primary text-primary-foreground" :
                      active ? "bg-foreground text-background scale-110 ring-4 ring-foreground/10" :
                      "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? "✓" : s.n}
                  </span>
                  <span className={`text-xs font-semibold ${active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-2 sm:mt-3 md:hidden flex items-center justify-between text-xs">
          <span className="font-semibold">Step {step} / {STEPS.length}</span>
          <span className="text-muted-foreground">{STEPS[step - 1]?.sub}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 1: Tier ---------------- */

function StepTier({ tierId, onSelect }: { tierId: TierId | null; onSelect: (t: Tier) => void }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
      {TIERS.map((t) => {
        const active = t.id === tierId;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={`group relative text-left rounded-3xl border-2 p-6 transition-all hover:-translate-y-1 ${
              active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)] scale-[1.02]" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="size-16 rounded-2xl bg-secondary grid place-items-center text-4xl mb-4">{t.emoji}</div>
            <div className="font-display text-2xl mb-1">{t.name}</div>
            <div className="text-sm text-muted-foreground mb-3">{t.tag}</div>
            <div className="text-lg font-semibold text-primary">{t.priceDisplay}</div>
            {active && <div className="absolute top-4 right-4 size-7 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">✓</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Step 2: Art Style (same visual pattern as upload.tsx:836-858) ---------------- */

function StepArtStyle({ artStyleId, setArtStyleId }: { artStyleId: string; setArtStyleId: (id: string) => void }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
      {ART_STYLES.map((style) => {
        const active = style.id === artStyleId;
        return (
          <button
            key={style.id}
            onClick={() => setArtStyleId(style.id)}
            className={`group relative text-left rounded-3xl border-2 p-6 transition-all hover:-translate-y-1 ${
              active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)] scale-[1.02]" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="size-16 rounded-2xl bg-secondary grid place-items-center text-4xl mb-4">{style.emoji}</div>
            <div className="font-display text-2xl mb-2">{style.name}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{style.desc}</div>
            {active && <div className="absolute top-4 right-4 size-7 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">✓</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Generation panel (Step 4b) ---------------- */
/* Visual pattern mirrors upload.tsx's StepGenerate (upload.tsx:994-1046+):
   pulsing gradient tile + stage emoji/label + progress bar while in flight,
   error card with retry on failure, simple result view on success. */

function GenerationPanel({
  genStatus,
  genProgress,
  genStage,
  genError,
  genPreviewUrl,
  tier,
  checkoutStatus,
  checkoutError,
  onCheckout,
}: {
  genStatus: GenStatus;
  genProgress: number;
  genStage: number;
  genError: string | null;
  genPreviewUrl: string | null;
  tier: Tier;
  checkoutStatus: "idle" | "redirecting" | "error";
  checkoutError: string | null;
  onCheckout: () => void;
}) {
  if (genStatus === "failed") {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center max-w-xl mx-auto">
        <div className="text-5xl mb-4">😿</div>
        <h3 className="font-display text-2xl">Generation hiccup</h3>
        <p className="text-muted-foreground text-sm mt-2 mb-2">
          {genError ?? "Something went wrong generating your group portrait."}
        </p>
        <p className="text-xs text-muted-foreground">Use the button below to retry.</p>
      </div>
    );
  }

  if (genStatus === "done" && genPreviewUrl) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <img src={genPreviewUrl} alt="Your group Pawtoon" className="w-full aspect-square object-cover" />
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-xs sm:text-sm text-muted-foreground">
          🔒 Preview watermarked — buy below to unlock the full-resolution download.
        </div>
        {checkoutError && <p className="mt-3 text-xs sm:text-sm text-destructive">{checkoutError}</p>}
        <button
          onClick={onCheckout}
          disabled={checkoutStatus === "redirecting"}
          className="mt-4 w-full rounded-full px-6 py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          style={{ background: "var(--gradient-primary)" }}
        >
          {checkoutStatus === "redirecting" ? "Redirecting to checkout…" : `Buy for ${tier.priceDisplay}`}
        </button>
      </div>
    );
  }

  // "generating"
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden max-w-xl mx-auto">
      <div className="relative aspect-square bg-gradient-to-br from-amber-200 via-rose-200 to-purple-300">
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-[pulse-ring_1.8s_ease-out_infinite]"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div
              className="relative size-24 rounded-full grid place-items-center text-4xl text-primary-foreground shadow-2xl"
              style={{ background: "var(--gradient-primary)" }}
            >
              {GEN_STAGES[genStage].emoji}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span className="flex items-center gap-2">
            <span className="text-lg">{GEN_STAGES[genStage].emoji}</span>
            {GEN_STAGES[genStage].label}…
          </span>
          <span className="text-muted-foreground">{Math.floor(genProgress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${genProgress}%`, background: "var(--gradient-primary)" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 3: Slot-based upload (real uploadPetPhoto calls) ---------------- */

function StepSlots({
  subjects,
  setSubjects,
}: {
  subjects: SubjectSlot[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectSlot[]>>;
}) {
  const personIndexes = subjects.map((s, i) => (s.subjectType === "person" ? i : -1)).filter((i) => i >= 0);
  const petIndexes = subjects.map((s, i) => (s.subjectType === "pet" ? i : -1)).filter((i) => i >= 0);

  // Mirrors upload.tsx's handleFile (upload.tsx:350-387): validate, show a
  // local preview immediately, call uploadPetPhoto, and on failure revert to
  // the empty state with an error message rather than leaving a half-done tile.
  const handlePick = async (index: number, f: File) => {
    const slot = subjects[index];

    const v = validateImage(f);
    if (v) {
      setSubjects((prev) =>
        prev.map((s, i) => (i === index ? { ...s, uploadStatus: "error", uploadError: v.message } : s))
      );
      return;
    }

    const previewUrl = URL.createObjectURL(f);
    setSubjects((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, file: f, previewUrl, uploadStatus: "uploading", uploadError: null, uploadProgress: 0, uploadedImageId: null }
          : s
      )
    );

    try {
      const uploaded = await uploadPetPhoto(f, {
        petName: slot.name.trim() || undefined,
        onProgress: (n) => setSubjects((prev) => prev.map((s, i) => (i === index ? { ...s, uploadProgress: n } : s))),
      });

      // Tag the new row with subject_type (the Step 1 migration column) and
      // read it back to confirm the write actually landed — don't assume it did.
      const { data: tagged, error: tagErr } = await supabase
        .from("uploaded_images")
        .update({ subject_type: slot.subjectType })
        .eq("id", uploaded.id)
        .select("id, subject_type")
        .single();

      if (tagErr || tagged?.subject_type !== slot.subjectType) {
        throw new Error(
          `Photo uploaded but couldn't be tagged as ${slot.subjectType}: ${tagErr?.message ?? "unexpected response"}`
        );
      }

      track("photo_uploaded");

      setSubjects((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, uploadedImageId: uploaded.id, uploadStatus: "uploaded", uploadProgress: 100 } : s
        )
      );
    } catch (err) {
      setSubjects((prev) =>
        prev.map((s, i) =>
          i === index
            ? {
                ...s,
                file: null,
                previewUrl: null,
                uploadedImageId: null,
                uploadStatus: "error",
                uploadError: err instanceof Error ? err.message : "Upload failed",
                uploadProgress: 0,
              }
            : s
        )
      );
    }
  };

  const handleClear = (index: number) => {
    setSubjects((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, file: null, previewUrl: null, uploadedImageId: null, uploadStatus: "idle", uploadError: null, uploadProgress: 0 }
          : s
      )
    );
  };

  // Only ever called from an optional, empty slot's "Skip this one" link —
  // the button itself is not rendered for required slots, but guard here too
  // rather than trust the UI alone.
  const handleSkip = (index: number) => {
    setSubjects((prev) => prev.map((s, i) => (i === index && !s.required ? { ...s, skipped: true } : s)));
  };

  const handleUnskip = (index: number) => {
    setSubjects((prev) => prev.map((s, i) => (i === index ? { ...s, skipped: false } : s)));
  };

  const handleNameChange = (index: number, name: string) => {
    setSubjects((prev) => prev.map((s, i) => (i === index ? { ...s, name } : s)));
  };

  // Reconciles the name on the already-created uploaded_images row, the same
  // way upload.tsx does at its step transition (upload.tsx:519-525) — here
  // triggered on blur since name + photo share one tile instead of separate steps.
  const handleNameBlur = (index: number) => {
    const slot = subjects[index];
    if (!slot.uploadedImageId) return;
    updatePetName(slot.uploadedImageId, slot.name.trim()).catch((err) => {
      console.error("[create-group] Failed to save subject name:", err);
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 sm:gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {subjects.map((slot, i) => {
          const typeIndexes = slot.subjectType === "person" ? personIndexes : petIndexes;
          const ordinal = typeIndexes.indexOf(i) + 1;
          const label = slot.subjectType === "person" ? `Person ${ordinal}` : `Pet ${ordinal}`;
          return (
            <SubjectTile
              key={i}
              label={label}
              slot={slot}
              onPick={(f) => handlePick(i, f)}
              onClear={() => handleClear(i)}
              onNameChange={(name) => handleNameChange(i, name)}
              onNameBlur={() => handleNameBlur(i)}
              onSkip={() => handleSkip(i)}
              onUnskip={() => handleUnskip(i)}
            />
          );
        })}
      </div>

      <aside className="rounded-2xl sm:rounded-3xl bg-card border border-border p-5 sm:p-6 h-fit">
        <h3 className="font-display text-base sm:text-lg mb-1">📸 Photo tips</h3>
        <p className="text-xs text-muted-foreground mb-3 sm:mb-4">One subject per tile — we'll combine everyone into one scene.</p>
        <Tip ok text="One clear, well-lit photo per tile" />
        <Tip ok text="Face clearly visible" />
        <Tip ok text="Simple background, minimal clutter" />
        <Tip text="Group photos in a single tile" />
        <Tip text="Sunglasses or face coverings" />
        <Tip text="Heavily filtered or edited photos" />
      </aside>
    </div>
  );
}

function SubjectTile({
  label,
  slot,
  onPick,
  onClear,
  onNameChange,
  onNameBlur,
  onSkip,
  onUnskip,
}: {
  label: string;
  slot: SubjectSlot;
  onPick: (f: File) => void;
  onClear: () => void;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onSkip: () => void;
  onUnskip: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const badgeEmoji = slot.subjectType === "person" ? "🧍" : "🐾";

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onPick(f);
  };

  if (slot.skipped) {
    return (
      <div className="rounded-2xl sm:rounded-3xl bg-card border border-dashed border-border overflow-hidden opacity-60">
        <div className="flex items-center gap-2 px-3 sm:px-4 pt-3 sm:pt-4">
          <span className="text-lg grayscale">{badgeEmoji}</span>
          <span className="text-xs sm:text-sm font-semibold">{label}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">skipped</span>
        </div>
        <div className="m-3 sm:m-4 rounded-xl bg-secondary/20 p-5 sm:p-6 text-center">
          <div className="text-2xl mb-1">➖</div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Not included</p>
          <button
            onClick={onUnskip}
            className="mt-3 text-xs font-semibold text-primary underline underline-offset-2 hover:no-underline"
          >
            + Add this one back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <span className="text-lg">{badgeEmoji}</span>
        <span className="text-xs sm:text-sm font-semibold">{label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
          {slot.required ? slot.subjectType : `${slot.subjectType} · optional`}
        </span>
      </div>

      {!slot.file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="relative m-3 sm:m-4 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 sm:p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-all"
        >
          <div className="text-3xl mb-2">📤</div>
          <p className="text-xs sm:text-sm font-semibold">Click to choose photo</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">JPG, PNG, HEIC up to 12MB</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
      ) : null}

      {!slot.file && !slot.required && (
        <div className="px-3 sm:px-4 -mt-2 mb-3 sm:mb-4 text-center">
          <button
            onClick={onSkip}
            className="text-[11px] sm:text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Skip this one — not needed
          </button>
        </div>
      )}

      {slot.file && (
        <div className="m-3 sm:m-4 rounded-xl overflow-hidden bg-secondary relative">
          <div className="relative aspect-square">
            <img src={slot.previewUrl ?? undefined} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          {slot.uploadStatus === "uploading" && (
            <div className="absolute top-2 left-2 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Uploading… {Math.floor(slot.uploadProgress)}%
            </div>
          )}
          {slot.uploadStatus === "uploaded" && (
            <div className="absolute top-2 left-2 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Photo ready
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold hover:bg-background"
            >
              Change
            </button>
            <button
              onClick={onClear}
              className="rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-destructive hover:bg-background"
            >
              Remove
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
      )}

      {slot.uploadStatus === "error" && slot.uploadError && (
        <div className="mx-3 sm:mx-4 mb-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs flex gap-2">
          <span>⚠️</span>
          <div>
            <div className="font-semibold text-destructive">{slot.uploadError}</div>
            <div className="text-muted-foreground mt-0.5">Try a different photo.</div>
          </div>
        </div>
      )}

      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <input
          type="text"
          value={slot.name}
          onChange={(e) => onNameChange(e.target.value.slice(0, MAX_NAME_LENGTH))}
          onBlur={onNameBlur}
          placeholder={slot.subjectType === "person" ? "Their name" : "Pet's name"}
          maxLength={MAX_NAME_LENGTH}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}

function Tip({ ok, text }: { ok?: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <span className={`size-5 rounded-full grid place-items-center text-[10px] font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "" : "text-muted-foreground line-through"}>{text}</span>
    </div>
  );
}
