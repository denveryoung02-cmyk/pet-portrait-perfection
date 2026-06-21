import { supabase } from "@/integrations/supabase/client";

export function track(event: string, properties?: Record<string, unknown>): void {
  supabase
    .from("funnel_events" as any)
    .insert({ event, properties: properties ?? null })
    .then(() => {})
    .catch(() => {});
}
