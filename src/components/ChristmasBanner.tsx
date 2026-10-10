// Seasonal promo for the SEO pet-portrait landing pages. Links out to the
// Foreverlai partner shop (physical products are sold/fulfilled there, not by
// Pawtoons). In normal flow, not sticky, so it scrolls away on mobile.

// Stops rendering after Boxing Day 2026. Midnight UTC = midnight UK (GMT in
// December). A fixed date, not a month/day check, so it doesn't come back
// on its own next year.
const CHRISTMAS_BANNER_ENDS = new Date("2026-12-27T00:00:00Z");

export function ChristmasBanner() {
  if (Date.now() >= CHRISTMAS_BANNER_ENDS.getTime()) return null;
  return (
    <a
      href="https://www.etsy.com/shop/Foreverlai"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-red-700 border-b-4 border-green-700 px-4 py-3 text-center text-sm sm:text-base font-medium text-white hover:bg-red-800 transition"
    >
      🎄 New: turn your portrait into a Christmas gift — mug, canvas or tote, from £13.99 →
    </a>
  );
}
