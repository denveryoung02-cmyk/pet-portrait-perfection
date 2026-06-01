import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 sm:mt-32 bg-[var(--color-ink)] text-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <div className="font-display text-xl sm:text-2xl font-semibold">Pawtoons<span className="text-primary">.</span></div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-background/60 leading-relaxed">
              Turning beloved pets into legendary characters since 2024.
            </p>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
              {["Instagram", "TikTok", "Pinterest", "X"].map((s) => (
                <a key={s} href="#" className="size-8 sm:size-9 rounded-full bg-background/10 hover:bg-primary grid place-items-center text-xs transition">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base mb-3 sm:mb-4">Product</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-background/70">
              <li><Link to="/products" className="hover:text-primary">Digital Portrait</Link></li>
              <li><Link to="/upload" className="hover:text-primary">Create yours</Link></li>
              <li><a href="/#themes" className="hover:text-primary">Themes</a></li>
              <li><a href="/#how" className="hover:text-primary">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base mb-3 sm:mb-4">Help</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-background/70">
              <li><a href="/#faq" className="hover:text-primary">FAQ</a></li>
              <li><a href="#" className="hover:text-primary">Instant digital download</a></li>
              <li><a href="#" className="hover:text-primary">Refund policy</a></li>
              <li><a href="mailto:hello@pawtoons.co" className="hover:text-primary">Contact us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-background/70">
              <li>hello@pawtoons.co</li>
              <li>+1 (555) 123-PAWS</li>
              <li>Mon–Fri, 9am–6pm EST</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 sm:mt-14 pt-5 sm:pt-6 border-t border-background/10 flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs text-background/50">
          <span>© 2026 Pawtoons. Made with 🐾 for pet people.</span>
          <div className="flex gap-4 sm:gap-5">
            <a href="#" className="hover:text-background">Privacy</a>
            <a href="#" className="hover:text-background">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
