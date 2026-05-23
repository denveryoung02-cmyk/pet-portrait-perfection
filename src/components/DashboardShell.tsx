import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Home, Image as ImageIcon, Sparkles, ShoppingBag, Heart, Shield, LogOut, Menu, X } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/dashboard/pets", label: "My pets", icon: ImageIcon },
  { to: "/dashboard/generations", label: "Generations", icon: Sparkles },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/favorites", label: "Favorites", icon: Heart },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] bg-card border-r border-border transition-transform`}>
          <div className="p-5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground">🐾</div>
              <span className="font-display text-lg">Pawtoons<span className="text-primary">.</span></span>
            </Link>
            <button onClick={() => setOpen(false)} className="lg:hidden p-2"><X className="size-5" /></button>
          </div>
          <nav className="px-3 space-y-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <Icon className="size-4" /> {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className={`mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border border-dashed border-border ${pathname.startsWith("/admin") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                <Shield className="size-4" /> Admin
              </Link>
            )}
          </nav>

          <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground font-semibold text-sm">
                {(user?.email ?? "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{user?.user_metadata?.full_name ?? user?.email}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
            <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-secondary">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>

        {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

        <main className="min-h-screen">
          <div className="lg:hidden sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border px-4 h-14 flex items-center justify-between">
            <button onClick={() => setOpen(true)} className="p-2"><Menu className="size-5" /></button>
            <span className="font-display">Pawtoons<span className="text-primary">.</span></span>
            <Link to="/upload" className="text-sm font-semibold text-primary">+ New</Link>
          </div>
          <div className="p-5 md:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
