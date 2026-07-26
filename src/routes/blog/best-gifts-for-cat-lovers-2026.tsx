import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/blog/best-gifts-for-cat-lovers-2026")({
  head: () => ({
    meta: [
      {
        title: "21 Best Gifts for Cat Lovers in 2026 | Pawtoons",
      },
      {
        name: "description",
        content:
          "21 thoughtful gift ideas for cat lovers in 2026 — from personalised AI portraits to cosy and quirky gifts. Something for every budget.",
      },
      {
        property: "og:title",
        content: "21 Best Gifts for Cat Lovers in 2026",
      },
      {
        property: "og:description",
        content:
          "From custom AI portraits to cosy essentials — the best gift ideas for cat lovers in 2026.",
      },
      {
        property: "og:url",
        content: "https://www.pawtoons.co/blog/best-gifts-for-cat-lovers-2026",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.pawtoons.co/blog/best-gifts-for-cat-lovers-2026",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString(
          breadcrumbSchema([
            { name: "Blog", url: "https://www.pawtoons.co/blog" },
            {
              name: "Best Gifts for Cat Lovers 2026",
              url: "https://www.pawtoons.co/blog/best-gifts-for-cat-lovers-2026",
            },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "21 Best Gifts for Cat Lovers in 2026",
          "description":
            "21 thoughtful gift ideas for cat lovers in 2026 — from personalised AI portraits to cosy and quirky gifts for every budget.",
          "author": { "@type": "Organization", "name": "Pawtoons" },
          "publisher": {
            "@type": "Organization",
            "name": "Pawtoons",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.pawtoons.co/assets/pawtoons-logo.png",
            },
          },
          "datePublished": "2026-06-12",
          "dateModified": "2026-06-12",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.pawtoons.co/blog/best-gifts-for-cat-lovers-2026",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the best gift for someone who loves their cat?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Personalised gifts featuring their actual cat tend to be the most appreciated — things like a custom AI portrait, an engraved item, or a photo book. These show thought and create something the recipient couldn't easily get for themselves.",
              },
            },
            {
              "@type": "Question",
              "name": "What is a good cheap gift for a cat lover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A custom AI cat portrait is one of the best value personalised gifts available, starting from £1.99. Other affordable options include cat-themed mugs, candles, and small accessories.",
              },
            },
            {
              "@type": "Question",
              "name": "What should I get a cat lover for their birthday?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Consider a personalised portrait of their cat, a quality cat bed or scratching post, a treat subscription box, or a cosy cat-themed item for their home.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: BestGiftsForCatLoversPage,
});

function BestGiftsForCatLoversPage() {
  const gifts = [
    {
      n: 1,
      title: "Custom AI Cat Portrait",
      price: "From £1.99",
      desc:
        "A unique AI-generated portrait of their actual cat — Royal, Wizard, Angel, Mermaid and more themes available. Ready in 60 seconds, delivered as a high-resolution digital download. One of the most personal gifts on this list, and one of the cheapest.",
      featured: true,
      link: "/cat-portraits" as const,
      linkText: "Create a Cat Portrait →",
    },
    {
      n: 2,
      title: "Heated Cat Bed",
      price: "£20–£45",
      desc: "Cats famously seek out warmth — a self-heating or electric cat bed is a gift that gets used constantly, especially in winter.",
    },
    {
      n: 3,
      title: "Cat Window Perch",
      price: "£15–£35",
      desc: "A hammock-style perch that attaches to a window, giving cats a sunny vantage point to watch the world. Genuinely improves a cat's day-to-day life.",
    },
    {
      n: 4,
      title: "Cat Lover Candle",
      price: "£10–£20",
      desc: "Novelty candles with cat-themed scents and names make a fun, low-cost addition to any gift.",
    },
    {
      n: 5,
      title: "Personalised Cat Mug",
      price: "£10–£18",
      desc: "A mug featuring a photo or illustration of their cat — a classic gift that's always appreciated.",
    },
    {
      n: 6,
      title: "Interactive Laser Toy",
      price: "£10–£25",
      desc: "Automatic laser toys keep cats entertained even when their owner is busy or out — great for indoor cats.",
    },
    {
      n: 7,
      title: "Cat Tree / Scratching Post",
      price: "£25–£70",
      desc: "A good quality cat tree gives cats somewhere to climb, scratch, and perch — a substantial but well-loved gift.",
    },
    {
      n: 8,
      title: "Treat Subscription Box",
      price: "£10–£25/month",
      desc: "Monthly boxes of treats and toys tailored to the cat's preferences. A gift that keeps giving long after the wrapping paper is gone.",
    },
    {
      n: 9,
      title: "Cat Photo Book",
      price: "£15–£35",
      desc: "A printed photo book celebrating the cat's life — from kitten photos to today. Sentimental and tactile.",
    },
    {
      n: 10,
      title: "Catnip Toy Set",
      price: "£8–£15",
      desc: "A set of catnip-filled toys — an affordable, reliable crowd-pleaser for most cats.",
    },
    {
      n: 11,
      title: "Automatic Feeder",
      price: "£25–£60",
      desc: "Useful for owners who travel or work long hours — schedules feeding times automatically. A practical gift that genuinely helps.",
    },
    {
      n: 12,
      title: "Cat Grooming Glove",
      price: "£8–£15",
      desc: "A gentle grooming glove that removes loose fur while petting — especially appreciated by owners of long-haired cats.",
    },
    {
      n: 13,
      title: "Cat-Themed Socks",
      price: "£8–£12",
      desc: "Socks printed with the recipient's actual cat's face (from a photo) — fun and slightly silly, in the best way.",
    },
    {
      n: 14,
      title: "Puzzle Feeder",
      price: "£10–£20",
      desc: "Slows down eating and provides mental stimulation — great for food-motivated or indoor cats.",
    },
    {
      n: 15,
      title: "Cosy Cat Blanket (Personalised)",
      price: "£20–£35",
      desc: "A soft blanket printed with the cat's name or photo — both for the cat and a lovely keepsake for the owner.",
    },
    {
      n: 16,
      title: "Cat Backpack Carrier",
      price: "£25–£50",
      desc: "For owners who like to take their cat outdoors safely — a bubble-window backpack carrier is a fun, increasingly popular gift.",
    },
    {
      n: 17,
      title: "Air Purifier (Pet-Specific)",
      price: "£40–£100",
      desc: "Helps with pet dander and odour — a thoughtful gift for allergy-prone households.",
    },
    {
      n: 18,
      title: "Cat Grass Growing Kit",
      price: "£8–£15",
      desc: "A simple kit for growing cat grass at home — most cats love it, and it's a fun, low-effort gift.",
    },
    {
      n: 19,
      title: "Designer Cat Collar",
      price: "£10–£25",
      desc: "A stylish, comfortable collar — practical and a small style upgrade for the cat.",
    },
    {
      n: 20,
      title: "Cat Cafe Voucher / Experience",
      price: "£10–£30",
      desc: "For cat lovers without their own cat (or who want to spend time around more cats), a cat cafe visit makes a fun experience gift.",
    },
    {
      n: 21,
      title: "Donation to a Cat Rescue (in their name)",
      price: "Any amount",
      desc: "For cat lovers who already have everything — a donation to a rescue charity in their cat's name is a meaningful gesture.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog/">Blog</Link>
          <span className="mx-2">/</span>
          <span>Best Gifts for Cat Lovers 2026</span>
        </nav>
        <p className="text-sm text-gray-500 mb-2">Updated June 2026 · 8 min read</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          21 Best Gifts for Cat Lovers in 2026
        </h1>
        <p className="text-xl text-gray-600">
          From deeply personal to wonderfully practical — 21 gift ideas for the
          cat lover (and the cat) in your life, across every budget.
        </p>
      </section>

      {/* Intro */}
      <section className="px-4 max-w-3xl mx-auto pb-8">
        <p className="text-gray-700 mb-4">
          Cat lovers tend to fall into two camps: those who want something for
          themselves that celebrates their cat, and those who want something
          that genuinely improves their cat's life (which, let's be honest, is
          really the same thing).
        </p>
        <p className="text-gray-700">
          Here are 21 ideas, starting with the most personal and working through
          practical, fun, and experience-based options.
        </p>
      </section>

      {/* Gift list */}
      <section className="px-4 max-w-3xl mx-auto pb-12">
        <div className="space-y-4">
          {gifts.map((gift) => (
            <div
              key={gift.n}
              className={`rounded-2xl p-5 border ${
                gift.featured
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="font-bold text-lg">
                  {gift.n}. {gift.title}
                </h2>
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
                  {gift.price}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{gift.desc}</p>
              {"link" in gift && gift.link && (
                <Link
                  to={gift.link}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  {gift.linkText}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Why personalised gifts win */}
      <section className="px-4 max-w-3xl mx-auto py-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Why Personalised Gifts Are Always a Safe Bet
          </h2>
          <p className="text-gray-700 mb-4">
            Of all the categories above, personalised gifts featuring the
            recipient's actual cat tend to land the best — they're impossible
            to duplicate, they show genuine thought, and they create something
            the recipient will keep and display.
          </p>
          <p className="text-gray-700 mb-4">
            A custom AI portrait is the fastest and most affordable way to do
            this. You only need one photo of the cat, the portrait is ready in
            about 60 seconds, and prices start from £1.99 — making it both a
            standalone gift and an easy add-on to something else on this list.
          </p>
          <div className="bg-black text-white rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              See What a Custom Cat Portrait Looks Like
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Royal, Wizard, Angel, Mermaid, and more themes. Oil Painting,
              Pixar 3D, or Comic Book styles. Free preview before you pay.
            </p>
            <Link
              to="/cat-portraits"
              className="inline-block bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              Create a Cat Portrait →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 max-w-3xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What is the best gift for someone who loves their cat?",
              a: "Personalised gifts featuring their actual cat tend to be the most appreciated — things like a custom AI portrait, an engraved item, or a photo book. These show thought and create something the recipient couldn't easily get for themselves.",
            },
            {
              q: "What is a good cheap gift for a cat lover?",
              a: "A custom AI cat portrait is one of the best value personalised gifts available, starting from £1.99. Other affordable options include cat-themed mugs, candles, and small accessories.",
            },
            {
              q: "What should I get a cat lover for their birthday?",
              a: "Consider a personalised portrait of their cat, a quality cat bed or scratching post, a treat subscription box, or a cosy cat-themed item for their home.",
            },
            {
              q: "What's a good gift for a new cat owner?",
              a: "Practical items work best for new owners — an automatic feeder, a scratching post, or a grooming kit. A custom portrait is also a lovely way to celebrate a new addition to the family.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="border border-gray-200 rounded-xl px-5 py-4">
              <summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="text-gray-600 mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="px-4 max-w-4xl mx-auto py-10 text-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">More from Pawtoons</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/cat-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐱 Cat Portraits</Link>
          <Link to="/pet-portrait-gifts" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🎁 All Pet Portrait Gifts</Link>
          <Link to="/blog/complete-guide-to-ai-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">✨ AI Pet Portrait Guide</Link>
          <Link to="/blog/best-gifts-for-dog-lovers-2026" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Gifts for Dog Lovers</Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          The Gift They'll Actually Talk About
        </h2>
        <p className="text-gray-600 mb-6">
          A custom portrait of their cat. From £1.99. Ready in 60 seconds.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Create a Cat Portrait Gift
        </Link>
      </section>
    </main>
  );
}
