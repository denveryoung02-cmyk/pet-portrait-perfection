import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/blog/best-gifts-for-dog-lovers-2026")({
  head: () => ({
    meta: [
      {
        title: "21 Best Gifts for Dog Lovers in 2026 | Pawtoons",
      },
      {
        name: "description",
        content:
          "21 thoughtful gift ideas for dog lovers in 2026 — from personalised AI portraits to practical and quirky gifts. Something for every budget.",
      },
      {
        property: "og:title",
        content: "21 Best Gifts for Dog Lovers in 2026",
      },
      {
        property: "og:description",
        content:
          "From custom AI portraits to cosy essentials — the best gift ideas for dog lovers in 2026.",
      },
      {
        property: "og:url",
        content: "https://www.pawtoons.co/blog/best-gifts-for-dog-lovers-2026",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.pawtoons.co/blog/best-gifts-for-dog-lovers-2026",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString(
          breadcrumbSchema([
            { name: "Blog", url: "https://www.pawtoons.co/blog" },
            {
              name: "Best Gifts for Dog Lovers 2026",
              url: "https://www.pawtoons.co/blog/best-gifts-for-dog-lovers-2026",
            },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "21 Best Gifts for Dog Lovers in 2026",
          "description":
            "21 thoughtful gift ideas for dog lovers in 2026 — from personalised AI portraits to practical and quirky gifts for every budget.",
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
            "@id": "https://www.pawtoons.co/blog/best-gifts-for-dog-lovers-2026",
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
              "name": "What is the best gift for someone who loves their dog?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Personalised gifts featuring their actual dog tend to be the most appreciated — things like a custom AI portrait, an engraved item, or a photo book. These show thought and create something the recipient couldn't easily get for themselves.",
              },
            },
            {
              "@type": "Question",
              "name": "What is a good cheap gift for a dog lover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A custom AI pet portrait is one of the best value personalised gifts available, starting from £1.99. Other affordable options include dog-themed mugs, candles, and small accessories.",
              },
            },
            {
              "@type": "Question",
              "name": "What should I get a dog lover for their birthday?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Consider a personalised portrait of their dog, a quality dog bed or blanket, a subscription box for their dog, or an experience like a dog-friendly day out together.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: BestGiftsForDogLoversPage,
});

function BestGiftsForDogLoversPage() {
  const gifts = [
    {
      n: 1,
      title: "Custom AI Dog Portrait",
      price: "From £1.99",
      desc:
        "A unique AI-generated portrait of their actual dog — Royal, Superhero, Viking and more themes available. Ready in 60 seconds, delivered as a high-resolution digital download. Genuinely one of the most personal gifts you can give, at one of the lowest price points on this list.",
      featured: true,
      link: "/dog-portraits" as const,
      linkText: "Create a Dog Portrait →",
    },
    {
      n: 2,
      title: "Engraved Dog Tag",
      price: "£8–£15",
      desc: "A practical gift that's also sentimental — engraved with the dog's name and the owner's contact details.",
    },
    {
      n: 3,
      title: "Memory Foam Dog Bed",
      price: "£25–£60",
      desc: "Older dogs especially benefit from supportive bedding. A genuinely useful gift that gets used daily.",
    },
    {
      n: 4,
      title: "Dog Lover Candle",
      price: "£10–£20",
      desc: "Scented candles with dog-themed names ('Wet Dog' is a genuinely popular novelty scent) make a fun stocking-filler.",
    },
    {
      n: 5,
      title: "Personalised Dog Mug",
      price: "£10–£18",
      desc: "A mug featuring a photo or illustration of their dog — classic, but always appreciated by dog parents.",
    },
    {
      n: 6,
      title: "Treat Subscription Box",
      price: "£15–£30/month",
      desc: "Monthly boxes of treats and toys tailored to the dog's size and preferences. A gift that keeps giving.",
    },
    {
      n: 7,
      title: "Dog Walking Backpack",
      price: "£20–£40",
      desc: "A hands-free bag designed for dog walks — poo bags, treats, water bottle, and lead all in one place.",
    },
    {
      n: 8,
      title: "Interactive Puzzle Toy",
      price: "£10–£25",
      desc: "Mental stimulation toys that dispense treats as the dog solves them. Great for high-energy or food-motivated dogs.",
    },
    {
      n: 9,
      title: "Dog Photo Book",
      price: "£15–£35",
      desc: "A printed photo book of the dog's life — puppy photos through to today. Sentimental and tactile.",
    },
    {
      n: 10,
      title: "Cooling Mat (for summer)",
      price: "£12–£25",
      desc: "A practical gift for dogs that struggle in warm weather — particularly appreciated by owners of flat-faced breeds.",
    },
    {
      n: 11,
      title: "Dog Lover's Cookbook (Treats)",
      price: "£10–£18",
      desc: "Recipe books for homemade dog treats — popular with owners who like to bake for their pets.",
    },
    {
      n: 12,
      title: "Slow Feeder Bowl",
      price: "£8–£15",
      desc: "Helps dogs that eat too quickly. A small, practical upgrade that owners genuinely notice the benefit of.",
    },
    {
      n: 13,
      title: "GPS Dog Tracker",
      price: "£30–£50",
      desc: "A tag that attaches to the collar and tracks the dog's location via an app — popular for adventurous or escape-prone dogs.",
    },
    {
      n: 14,
      title: "Dog-Themed Socks",
      price: "£8–£12",
      desc: "Socks printed with the recipient's actual dog's face (from a photo) — a fun, slightly silly gift.",
    },
    {
      n: 15,
      title: "Car Seat Cover / Hammock",
      price: "£20–£40",
      desc: "Protects car seats from muddy paws — a practical gift for owners who regularly travel with their dog.",
    },
    {
      n: 16,
      title: "Dog Training Course (Online)",
      price: "£20–£60",
      desc: "Online courses covering basic obedience or specific issues like recall or leash pulling. Great for new puppy owners.",
    },
    {
      n: 17,
      title: "Personalised Dog Blanket",
      price: "£20–£35",
      desc: "A soft blanket printed with the dog's name or photo — cosy and sentimental.",
    },
    {
      n: 18,
      title: "Agility Kit (for the garden)",
      price: "£25–£50",
      desc: "A set of jumps, tunnels, and weave poles for garden play — great for active dogs and owners who enjoy training.",
    },
    {
      n: 19,
      title: "Grooming Kit",
      price: "£15–£40",
      desc: "A quality brush, nail clippers, and de-shedding tool — practical and appreciated by owners of long-haired breeds.",
    },
    {
      n: 20,
      title: "Dog-Friendly Day Out (Experience)",
      price: "£0–£30",
      desc: "A trip to a dog-friendly beach, pub, or hiking trail. Costs little but creates a memorable day for both dog and owner.",
    },
    {
      n: 21,
      title: "Donation to a Dog Charity (in their name)",
      price: "Any amount",
      desc: "For dog lovers who already have everything — a donation to a rescue or charity in their dog's name is a meaningful gesture.",
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
          <span>Best Gifts for Dog Lovers 2026</span>
        </nav>
        <p className="text-sm text-gray-500 mb-2">Updated June 2026 · 8 min read</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          21 Best Gifts for Dog Lovers in 2026
        </h1>
        <p className="text-xl text-gray-600">
          From deeply personal to wonderfully practical — 21 gift ideas for the
          dog lover in your life, across every budget.
        </p>
      </section>

      {/* Intro */}
      <section className="px-4 max-w-3xl mx-auto pb-8">
        <p className="text-gray-700 mb-4">
          Buying a gift for a dog lover is easier than most categories — because
          really, you're buying for two. The best gifts either celebrate their
          specific dog, make daily life with their dog easier, or give the two
          of them something fun to do together.
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
            recipient's actual dog tend to land the best — they're impossible
            to duplicate, they show genuine thought, and they create something
            the recipient will keep and display.
          </p>
          <p className="text-gray-700 mb-4">
            A custom AI portrait is the fastest and most affordable way to do
            this. You only need one photo of the dog, the portrait is ready in
            about 60 seconds, and prices start from £1.99 — making it both a
            standalone gift and an easy add-on to something else on this list.
          </p>
          <div className="bg-black text-white rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              See What a Custom Dog Portrait Looks Like
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Royal, Superhero, Viking, and 9 more themes. Oil Painting, Pixar
              3D, or Watercolour styles. Free preview before you pay.
            </p>
            <Link
              to="/dog-portraits"
              className="inline-block bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              Create a Dog Portrait →
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
              q: "What is the best gift for someone who loves their dog?",
              a: "Personalised gifts featuring their actual dog tend to be the most appreciated — things like a custom AI portrait, an engraved item, or a photo book. These show thought and create something the recipient couldn't easily get for themselves.",
            },
            {
              q: "What is a good cheap gift for a dog lover?",
              a: "A custom AI pet portrait is one of the best value personalised gifts available, starting from £1.99. Other affordable options include dog-themed mugs, candles, and small accessories.",
            },
            {
              q: "What should I get a dog lover for their birthday?",
              a: "Consider a personalised portrait of their dog, a quality dog bed or blanket, a subscription box for their dog, or an experience like a dog-friendly day out together.",
            },
            {
              q: "What's a good gift for a new dog owner?",
              a: "Practical items work best for new owners — a slow feeder bowl, training course, or grooming kit. A custom portrait is also a lovely way to celebrate a new addition to the family.",
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
          <Link to="/dog-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Dog Portraits</Link>
          <Link to="/pet-portrait-gifts" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🎁 All Pet Portrait Gifts</Link>
          <Link to="/blog/complete-guide-to-ai-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">✨ AI Pet Portrait Guide</Link>
          <Link to="/royal-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">👑 Royal Portraits</Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          The Gift They'll Actually Talk About
        </h2>
        <p className="text-gray-600 mb-6">
          A custom portrait of their dog. From £1.99. Ready in 60 seconds.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Create a Dog Portrait Gift
        </Link>
      </section>
    </main>
  );
}
