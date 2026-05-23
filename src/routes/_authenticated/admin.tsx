import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Pawtraits" }] }),
  component: Admin,
});

type Tab = "queue" | "orders" | "products" | "themes";

function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("queue");

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return <div className="grid place-items-center min-h-[60vh]"><div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="size-6 text-primary" />
        <h1 className="font-display text-3xl">Admin console</h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {(["queue", "orders", "products", "themes"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "queue" && <QueueTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "themes" && <ThemesTab />}
    </div>
  );
}

function QueueTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-generations"],
    queryFn: async () => {
      const { data } = await supabase.from("generations").select("id, theme, status, result_url, created_at, user_id").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  type GenStatus = "pending" | "processing" | "completed" | "failed" | "rejected";
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GenStatus }) => {
      await supabase.from("generations").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-generations"] }),
  });

  return (
    <div className="space-y-3">
      {(data ?? []).map((g) => (
        <div key={g.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
          <div className="size-16 rounded-xl bg-secondary overflow-hidden shrink-0">
            {g.result_url ? <img src={g.result_url} className="w-full h-full object-cover" alt="" /> : <div className="grid place-items-center h-full">✨</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold capitalize">{g.theme}</div>
            <div className="text-xs text-muted-foreground truncate">User {g.user_id.slice(0, 8)} · {new Date(g.created_at).toLocaleString()}</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary capitalize">{g.status}</span>
          <div className="flex gap-2">
            <button onClick={() => update.mutate({ id: g.id, status: "completed" })} className="rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold">Approve</button>
            <button onClick={() => update.mutate({ id: g.id, status: "rejected" })} className="rounded-lg bg-red-500/15 text-red-700 dark:text-red-300 px-3 py-1.5 text-xs font-semibold">Reject</button>
            <button onClick={() => update.mutate({ id: g.id, status: "pending" })} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold">Regenerate</button>
          </div>
        </div>
      ))}
      {!data?.length && <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Queue is empty.</div>}
    </div>
  );
}

function OrdersTab() {
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("id, status, total_cents, currency, user_id, created_at").order("created_at", { ascending: false }).limit(100)).data ?? [],
  });
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr><th className="p-3">Order</th><th className="p-3">User</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
        </thead>
        <tbody>
          {(data ?? []).map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
              <td className="p-3 font-mono text-xs">{o.user_id.slice(0, 8)}</td>
              <td className="p-3 font-semibold">${(o.total_cents / 100).toFixed(2)}</td>
              <td className="p-3 capitalize">{o.status}</td>
              <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {!data?.length && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No orders.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab() {
  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*").order("name")).data ?? [],
  });
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {(data ?? []).map((p) => (
        <div key={p.id} className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
          <div>
            <div className="font-display text-lg">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.slug} · ${(p.price_cents / 100).toFixed(2)}</div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${p.active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-secondary"}`}>{p.active ? "active" : "inactive"}</span>
        </div>
      ))}
    </div>
  );
}

function ThemesTab() {
  const { data } = useQuery({
    queryKey: ["admin-themes"],
    queryFn: async () => (await supabase.from("themes").select("*").order("name")).data ?? [],
  });
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {(data ?? []).map((t) => (
        <div key={t.id} className="rounded-2xl bg-card border border-border p-4">
          <div className="font-display text-lg">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.tagline}</div>
          <code className="block mt-2 text-xs bg-secondary rounded-lg p-2 text-muted-foreground">{t.prompt_template}</code>
        </div>
      ))}
    </div>
  );
}
