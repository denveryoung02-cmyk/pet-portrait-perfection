import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground font-display text-lg shadow-[var(--shadow-soft)] group-hover:rotate-12 transition-transform">
            🐾
          </div>
          <span className="font-display text-xl md:text-2xl font-semibold tracking-tight">
            Pawtraits<span className="text-primary">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#how" className="hover:text-foreground transition">How it works</a>
          <a href="/#products" className="hover:text-foreground transition">Products</a>
          <a href="/#themes" className="hover:text-foreground transition">Themes</a>
          <a href="/#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <Link
          to="/upload"
          className="rounded-full bg-foreground text-background px-4 md:px-5 py-2.5 text-sm font-semibold hover:bg-primary transition-colors shadow-[var(--shadow-soft)]"
        >
          Start Creating
        </Link>
      </div>
    </header>
  );
}
