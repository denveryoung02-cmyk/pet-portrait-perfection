import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/pets")({
  head: () => ({ meta: [{ title: "My pets — Pawtoons" }] }),
  component: Pets,
});

function Pets() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-pets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("uploaded_images")
        .select("id, pet_name, storage_path, created_at")
        .order("created_at", { ascending: false });

      if (!data) return [];

      // Generate signed URLs for each uploaded image
      const withUrls = await Promise.all(
        data.map(async (img) => {
          const { data: signedUrl } = await supabase.storage
            .from("pet-uploads")
            .createSignedUrl(img.storage_path, 3600); // 1 hour expiry
          return { ...img, signedUrl: signedUrl?.signedUrl ?? null };
        })
      );

      return withUrls;
    },
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">My pets</h1>
          <p className="text-muted-foreground text-sm mt-1">Photos you've uploaded.</p>
        </div>
        <Link to="/upload" className="rounded-full px-4 py-2.5 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>+ Add pet</Link>
      </div>
      {isLoading ? (
        <Skeleton />
      ) : !data?.length ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="text-5xl mb-3">📸</div>
          <p className="text-sm text-muted-foreground">No pets uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="aspect-square bg-secondary">
                {p.signedUrl && <img src={p.signedUrl} alt={p.pet_name ?? ""} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3 text-sm font-semibold">{p.pet_name ?? "Untitled"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
      ))}
    </div>
  );
}
