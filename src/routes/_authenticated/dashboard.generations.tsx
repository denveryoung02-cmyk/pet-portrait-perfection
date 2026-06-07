import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusPill } from "./dashboard";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/generations")({
  head: () => ({ meta: [{ title: "Generations — Pawtoons" }] }),
  component: Generations,
});

function Generations() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["all-generations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("generations")
        .select("id, theme, status, preview_url, created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: favs } = useQuery({
    queryKey: ["favorite-ids"],
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("generation_id");
      return new Set((data ?? []).map((d) => d.generation_id));
    },
  });

  const toggleFav = useMutation({
    mutationFn: async ({ id, isFav }: { id: string; isFav: boolean }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      if (isFav) {
        await supabase.from("favorites").delete().eq("generation_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("favorites").insert({ generation_id: id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorite-ids"] }),
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Generations</h1>
        <p className="text-muted-foreground text-sm mt-1">Every pawtrait you've made.</p>
      </div>
      {!data?.length ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No generations yet.</p>
          <Link to="/upload" className="mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Generate one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((g) => {
            const isFav = favs?.has(g.id) ?? false;
            return (
              <div key={g.id} className="rounded-2xl bg-card border border-border overflow-hidden group">
                <div className="aspect-square bg-secondary relative">
                  {g.preview_url ? <img src={g.preview_url} alt="" className="w-full h-full object-cover" /> : <div className="grid place-items-center h-full text-3xl">✨</div>}
                  <button onClick={() => toggleFav.mutate({ id: g.id, isFav })} className="absolute top-2 right-2 size-9 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition">
                    <Heart className={`size-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                  </button>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold capitalize">{g.theme}</div>
                    <StatusPill status={g.status} />
                  </div>
                  {g.status === "completed" && (
                    <Link to="/products" className="text-xs font-semibold text-primary">Order →</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
