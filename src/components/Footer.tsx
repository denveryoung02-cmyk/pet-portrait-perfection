import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-32 bg-[var(--color-ink)] text-background">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-2xl font-semibold">Pawtoons<span className="text-primary">.</span></div>
            <p className="mt-3 text-sm text-background/60 leading-relaxed">
              Turning beloved pets into legendary characters since 2024.
            </p>
            <div className="flex gap-3 mt-5">
              {["Instagram", "TikTok", "Pinterest", "X"].map((s) => (
                <a key={s} href="#" className="size-9 rounded-full bg-background/10 hover:bg-primary grid place-items-center text-xs transition">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-base mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/products" className="hover:text-primary">Mugs</Link></li>
              <li><Link to="/products" className="hover:text-primary">T-shirts</Link></li>
              <li><Link to="/products" className="hover:text-primary">Posters</Link></li>
              <li><Link to="/products" className="hover:text-primary">Mouse mats</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary">Shipping — 5-7 days worldwide</a></li>
              <li><a href="#" className="hover:text-primary">30-day returns</a></li>
              <li><a href="#" className="hover:text-primary">Size guide</a></li>
              <li><a href="#" className="hover:text-primary">Track order</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>hello@pawtoons.co</li>
              <li>+1 (555) 123-PAWS</li>
              <li>Mon–Fri, 9am–6pm EST</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-background/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-background/50">
          <span>© 2026 Pawtoons. Made with 🐾 for pet people.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-background">Privacy</a>
            <a href="#" className="hover:text-background">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
