import { Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LayoutDashboard, Shield } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border/60" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground font-display text-lg shadow-[var(--shadow-soft)] group-hover:rotate-12 transition-transform">🐾</div>
          <span className="font-display text-xl md:text-2xl font-semibold tracking-tight">Pawtoons<span className="text-primary">.</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#how" className="hover:text-foreground transition">How it works</a>
          <Link to="/products" className="hover:text-foreground transition">Products</Link>
          <a href="/#themes" className="hover:text-foreground transition">Themes</a>
          <a href="/#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1.5 pr-3 hover:bg-secondary/70 transition">
                <div className="size-7 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground text-xs font-semibold">
                  {(user.email ?? "?")[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{user.user_metadata?.full_name ?? user.email}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><LayoutDashboard className="size-4" /> Dashboard</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><Shield className="size-4" /> Admin</Link>
                  )}
                  <button onClick={() => { setMenuOpen(false); signOut(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary border-t border-border text-left"><LogOut className="size-4" /> Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="hidden sm:inline text-sm font-semibold text-muted-foreground hover:text-foreground">Sign in</Link>
          )}
          <Link to="/upload" className="rounded-full bg-foreground text-background px-4 md:px-5 py-2.5 text-sm font-semibold hover:bg-primary transition-colors shadow-[var(--shadow-soft)]">
            Start Creating
          </Link>
        </div>
      </div>
    </header>
  );
}
