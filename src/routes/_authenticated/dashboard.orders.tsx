import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/orders")({
  head: () => ({ meta: [{ title: "Orders — Pawtoons" }] }),
  component: Orders,
});

function Orders() {
  const { data } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, status, total_cents, currency, created_at, tracking_number, order_items(id, quantity, unit_price_cents, products(name, image_url))")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="font-display text-3xl">Orders</h1>
      {!data?.length ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <Link to="/upload" className="mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Create a Pawtoon →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((o: any) => (
            <div key={o.id} className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)}</div>
                  <div className="font-semibold mt-0.5">${(o.total_cents / 100).toFixed(2)} {o.currency.toUpperCase()}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary font-medium capitalize">{o.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {(o.order_items ?? []).length} item(s)
                {o.tracking_number && <> · Tracking: <code className="text-foreground">{o.tracking_number}</code></>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
