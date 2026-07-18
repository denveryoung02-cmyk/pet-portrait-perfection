/**
 * Server functions backing the Hero Pack reveal route (src/routes/hero-pack.tsx).
 *
 * Access model: always requires an authenticated Supabase session (via
 * requireSupabaseAuth), verified against orders.user_id — the same model
 * confirmCheckout and checkBundleReady already use. There is no SSR-visible
 * session in this app (src/integrations/supabase/client.ts persists sessions
 * to localStorage only, no @supabase/ssr cookie bridge), so the initial
 * server-rendered paint cannot know who's asking; it renders a content-free
 * placeholder, and the client fetches real data after hydration once it can
 * attach a Bearer token, same as success.tsx / dashboard.orders.tsx.
 *
 * `session_id` is deliberately NOT accepted as a substitute for auth here —
 * it was briefly used that way to make the SSR paint work, but that let
 * anyone holding a Stripe session id read another customer's Hero Pack
 * without proving identity. If the route wants it for analytics, it can stay
 * in the URL, but it must never reach these functions as a credential.
 *
 * hero_profiles / adventure_pack_assets have no direct user_id column and no
 * authenticated write policy (Phase 1, deliberately), so all reads and writes
 * here go through supabaseAdmin (service role), never the user-scoped client
 * — mirroring bundle.server.ts.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { signCleanDownloadUrl } from "@/lib/fulfillment.server";

export type HeroPackAsset = {
  assetType: "hd_portrait" | "phone_wallpaper" | "character_card" | "hero_certificate";
  status: string;
  url: string | null;
};

export type HeroPackProfile = {
  packNumber: number;
  petName: string | null;
  heroName: string | null;
  adventureClass: string | null;
  specialAbility: string | null;
  favouriteSnack: string | null;
  adventureRank: string | null;
  missionStatement: string | null;
  achievementBadge: string | null;
  originStory: string | null;
  firstViewedAt: string | null;
};

export type HeroPackResult =
  | { found: false }
  | { found: true; profile: null; assets: HeroPackAsset[]; ready: false }
  | { found: true; profile: HeroPackProfile; assets: HeroPackAsset[]; ready: boolean };

async function verifyOrderOwnership(orderId: string, userId: string): Promise<boolean> {
  const { data: order } = await supabaseAdmin.from("orders").select("user_id").eq("id", orderId).single();
  return !!order && order.user_id === userId;
}

const GetHeroPackInput = z.object({
  orderId: z.string().uuid(),
});

export const getHeroPack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GetHeroPackInput.parse(input))
  .handler(async ({ data, context }): Promise<HeroPackResult> => {
    const { userId } = context;
    const { orderId } = data;

    if (!(await verifyOrderOwnership(orderId, userId))) return { found: false };

    const { data: profileRow } = await supabaseAdmin
      .from("hero_profiles")
      .select(
        "pack_number, pet_name, hero_name, adventure_class, special_ability, favourite_snack, adventure_rank, mission_statement, achievement_badge, origin_story, first_viewed_at, primary_generation_id",
      )
      .eq("order_id", orderId)
      .maybeSingle();

    if (!profileRow) {
      // recordPaidOrder has run (order exists, access verified) but
      // generateHeroPack hasn't claimed its hero_profiles row yet — genuinely
      // still starting up.
      return { found: true, profile: null, assets: [], ready: false };
    }

    const { data: assetRows } = await supabaseAdmin
      .from("adventure_pack_assets")
      .select("asset_type, status, storage_path, public_url")
      .eq("order_id", orderId);

    const assets: HeroPackAsset[] = await Promise.all(
      (assetRows ?? []).map(async (row): Promise<HeroPackAsset> => {
        if (row.asset_type === "hd_portrait") {
          const url = row.status === "completed" ? await signCleanDownloadUrl(profileRow.primary_generation_id) : null;
          return { assetType: "hd_portrait", status: row.status, url };
        }
        return {
          assetType: row.asset_type as HeroPackAsset["assetType"],
          status: row.status,
          url: row.status === "completed" ? row.public_url : null,
        };
      }),
    );

    const expectedTypes: HeroPackAsset["assetType"][] = ["hd_portrait", "phone_wallpaper", "character_card", "hero_certificate"];
    const ready = expectedTypes.every((t) => assets.some((a) => a.assetType === t && a.status === "completed"));

    const profile: HeroPackProfile = {
      packNumber: profileRow.pack_number,
      petName: profileRow.pet_name,
      heroName: profileRow.hero_name,
      adventureClass: profileRow.adventure_class,
      specialAbility: profileRow.special_ability,
      favouriteSnack: profileRow.favourite_snack,
      adventureRank: profileRow.adventure_rank,
      missionStatement: profileRow.mission_statement,
      achievementBadge: profileRow.achievement_badge,
      originStory: profileRow.origin_story,
      firstViewedAt: profileRow.first_viewed_at,
    };

    return { found: true, profile, assets, ready };
  });

const MarkViewedInput = z.object({
  orderId: z.string().uuid(),
});

// No authenticated-write RLS policy exists on hero_profiles (Phase 1,
// deliberately) — this write can only happen through this service-role
// function, never a direct client update. Called from the client once the
// reveal sequence finishes or is skipped.
export const markHeroPackViewed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MarkViewedInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { orderId } = data;
    if (!(await verifyOrderOwnership(orderId, userId))) return { ok: false as const };

    const { error } = await supabaseAdmin
      .from("hero_profiles")
      .update({ first_viewed_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("first_viewed_at", null);
    if (error) {
      console.error("[hero-pack] failed to set first_viewed_at:", { orderId, error });
      return { ok: false as const };
    }
    return { ok: true as const };
  });
