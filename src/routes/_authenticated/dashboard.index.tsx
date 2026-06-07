import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Image as ImageIcon, ShoppingBag, Plus } from "lucide-react";
import { StatusPill } from "./dashboard";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Pawtoons" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [pets, gens, orders] = await Promise.all([
        supabase.from("uploaded_images").select("id", { count: "exact", head: true }),
        supabase.from("generations").select("id,status", { count: "exact" }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      return {
        pets: pets.count ?? 0,
        generations: gens.count ?? 0,
        pending: (gens.data ?? []).filter((g) => g.status === "pending" || g.status === "processing").length,
        orders: orders.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-generations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("generations")
        .select("id, theme, status, preview_url, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Welcome back 🐾</h1>
          <p className="text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <Link to="/upload" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="size-4" /> Start a new pawtrait
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pets uploaded" value={stats?.pets ?? 0} icon={<ImageIcon className="size-4" />} />
        <StatCard label="Generations" value={stats?.generations ?? 0} icon={<Sparkles className="size-4" />} />
        <StatCard label="In progress" value={stats?.pending ?? 0} accent icon={<Sparkles className="size-4" />} />
        <StatCard label="Orders" value={stats?.orders ?? 0} icon={<ShoppingBag className="size-4" />} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Recent generations</h2>
          <Link to="/dashboard/generations" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {!recent || recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.map((g) => (
              <div key={g.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="aspect-square bg-secondary grid place-items-center">
                  {g.preview_url ? (
                    <img src={g.preview_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">✨</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold capitalize">{g.theme}</div>
                  <StatusPill status={g.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}


function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <div className="text-5xl mb-3">🐶</div>
      <h3 className="font-display text-xl">No pawtoons yet</h3>
      <p className="text-sm text-muted-foreground mt-1">Upload a photo of your pet to generate your first caricature.</p>
      <Link to="/upload" className="mt-5 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        Start creating
      </Link>
    </div>
  );
}
