import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

// lucide-react has no TikTok, Pinterest or X icons — simple filled brand marks (24×24 viewBox).
const TIKTOK_PATH = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
const PINTEREST_PATH = "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z";
const X_PATH = "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z";

function BrandIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

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
              {[
                { name: "Instagram", href: "https://www.instagram.com/pawtoons.co", icon: <Instagram className="size-4" aria-hidden="true" /> },
                { name: "TikTok", href: "https://www.tiktok.com/@pawtoons.co", icon: <BrandIcon d={TIKTOK_PATH} /> },
                { name: "Pinterest", href: "https://www.pinterest.com/pawtoons", icon: <BrandIcon d={PINTEREST_PATH} /> },
                { name: "X", href: "https://twitter.com/pawtoons", icon: <BrandIcon d={X_PATH} /> },
              ].map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name} className="size-8 sm:size-9 rounded-full bg-background/10 hover:bg-primary grid place-items-center text-xs transition" target="_blank" rel="noopener noreferrer">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base mb-3 sm:mb-4">Product</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-background/70">
              <li><Link to="/upload" className="hover:text-primary">Create yours</Link></li>
              <li><a href="/#themes" className="hover:text-primary">Themes</a></li>
              <li><a href="/#how" className="hover:text-primary">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base mb-3 sm:mb-4">Help</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-background/70">
              <li><a href="/#faq" className="hover:text-primary">FAQ</a></li>
              <li><span className="text-background/50">Instant digital download</span></li>
              <li><a href="mailto:hello@pawtoons.co" className="hover:text-primary">Contact us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-background/70">
              <li>hello@pawtoons.co</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 sm:mt-14 pt-5 sm:pt-6 border-t border-background/10 flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs text-background/50">
          <span>© 2026 Pawtoons. Made with 🐾 for pet people.</span>
          <div className="flex gap-4 sm:gap-5">
            <Link to="/privacy" className="hover:text-background">Privacy</Link>
            <Link to="/terms" className="hover:text-background">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
