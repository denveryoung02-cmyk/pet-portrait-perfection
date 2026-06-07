import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/favorites")({
  head: () => ({ meta: [{ title: "Favorites — Pawtoons" }] }),
  component: Favorites,
});

function Favorites() {
  const { data } = useQuery({
    queryKey: ["favorites-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("id, generations(id, theme, preview_url, status)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="font-display text-3xl">Favorites ❤️</h1>
      {!data?.length ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Tap the heart on any generation to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((f: any) => f.generations && (
            <div key={f.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="aspect-square bg-secondary">
                {f.generations.preview_url ? <img src={f.generations.preview_url} className="w-full h-full object-cover" alt="" /> : <div className="grid place-items-center h-full text-3xl">✨</div>}
              </div>
              <div className="p-3 text-sm font-semibold capitalize">{f.generations.theme}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
