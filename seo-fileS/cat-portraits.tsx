// src/routes/cat-portraits.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "~/lib/seo-schemas";

export const Route = createFileRoute("/cat-portraits")({
  head: () => ({
    meta: [
      {
        title:
          "Custom Cat Portraits from Your Photo | AI Art | From £1.99 | Pawtoons",
      },
      {
        name: "description",
        content:
          "Transform your cat's photo into beautiful AI artwork in 60 seconds. Oil Painting, Pixar 3D, Watercolour. Royal, Wizard, Angel & 9 more themes. Instant download from £1.99.",
      },
      {
        property: "og:title",
        content: "Custom AI Cat Portraits from Your Photo | Pawtoons",
      },
      {
        property: "og:description",
        content:
          "Stunning AI cat portraits from your photo. 3 art styles, 12 themes. From £1.99. Ready in 60 seconds.",
      },
      {
        property: "og:url",
        content: "https://www.pawtoons.co/cat-portraits",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.pawtoons.co/cat-portraits" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Custom AI Cat Portrait — Digital Download",
          "description":
            "AI-generated custom cat portrait from your photo. Oil Painting, Pixar 3D, or Watercolour style. 12 themes including Royal, Wizard, Angel, Mermaid. Instant download from £1.99.",
          "brand": { "@type": "Brand", "name": "Pawtoons" },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "GBP",
            "lowPrice": "1.99",
            "highPrice": "3.99",
            "availability": "https://schema.org/InStock",
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "12400",
            "bestRating": "5",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: schemaToString(
          breadcrumbSchema([
            {
              name: "Custom Cat Portraits",
              url: "https://www.pawtoons.co/cat-portraits",
            },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I get an AI portrait of my cat?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes — Pawtoons creates stunning AI cat portraits from a single photo. Upload a clear photo of your cat, choose a theme and art style, and your portrait is ready in 60 seconds.",
              },
            },
            {
              "@type": "Question",
              "name": "What cat breeds work with Pawtoons?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "All breeds and moggies. Maine Coons, British Shorthairs, Siamese, Persians, tabbies, black cats — the AI handles all fur colours, patterns, and face shapes beautifully.",
              },
            },
            {
              "@type": "Question",
              "name": "What is a good gift for a cat lover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A custom AI cat portrait is one of the most unique and personal gifts for cat lovers. From £1.99, it's exceptional value for a truly personalised gift they'll treasure.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: CatPortraitsPage,
});

function CatPortraitsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <span>Custom Cat Portraits</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Custom AI Cat Portraits — Your Cat as Legendary Art
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload one photo. Our AI turns your cat into breathtaking artwork in
          60 seconds. Royal queen, mystical wizard, graceful angel — your cat
          can be anything. From £1.99.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Create My Cat Portrait →
        </Link>
        <p className="text-sm text-gray-500 mt-3">
          Free to preview · Pay only when you love it
        </p>
      </section>

      {/* Themes for cats */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Portrait Themes Perfect for Cats
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Cats are natural rulers. Our themes were practically made for them.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                emoji: "👑",
                name: "Royal",
                desc: "Your cat as the monarch they believe they are",
              },
              {
                emoji: "🧙",
                name: "Wizard",
                desc: "Mystical powers finally confirmed",
              },
              {
                emoji: "😇",
                name: "Angel",
                desc: "For the cat who only looks innocent",
              },
              {
                emoji: "🧜",
                name: "Mermaid",
                desc: "Under the sea, but make it feline",
              },
              {
                emoji: "🌸",
                name: "Flower Crown",
                desc: "Boho meadow royalty",
              },
              {
                emoji: "👸",
                name: "Princess",
                desc: "Fairy tale elegance",
              },
            ].map((theme) => (
              <Link
                key={theme.name}
                to="/upload"
                className="bg-white p-5 rounded-xl hover:shadow transition"
              >
                <div className="text-3xl mb-2">{theme.emoji}</div>
                <div className="font-bold mb-1">{theme.name}</div>
                <div className="text-xs text-gray-500">{theme.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Art styles */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Three Art Styles for Your Cat Portrait
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-2">Oil Painting</h3>
            <p className="text-gray-600 text-sm">
              Rich, deep tones and classical texture. Makes your cat look like a
              17th-century aristocrat. Stunning when printed and framed.
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-bold text-lg mb-2">Pixar / 3D</h3>
            <p className="text-gray-600 text-sm">
              Bold colours, expressive eyes, cinematic quality. Perfect for
              sharing on social media or using as a phone wallpaper.
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">🌸</div>
            <h3 className="font-bold text-lg mb-2">Watercolour</h3>
            <p className="text-gray-600 text-sm">
              Soft washes, delicate detail, artistic charm. Beautiful for
              printing and gifting. Especially gorgeous for light-coloured cats.
            </p>
          </div>
        </div>
      </section>

      {/* Gift section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            The Ultimate Gift for Cat Lovers
          </h2>
          <p className="text-gray-600 mb-6">
            A custom AI cat portrait makes the most personal and unique
            personalised gift for any cat lover. From £1.99, it's the gift that
            genuinely surprises people.
          </p>
          <p className="text-gray-600 mb-8">
            Perfect for birthdays, Christmas, Mother's Day, and any occasion
            where the recipient is, fundamentally, owned by their cat.
          </p>
          <Link
            to="/upload"
            className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
          >
            🎁 Create a Cat Portrait Gift →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Cat Portrait FAQs
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What cat breeds work best?",
              a: "All of them. The AI has been trained on thousands of cat portraits and handles every breed and mixed cat beautifully. Long-haired, short-haired, tabby, black, white, ginger — all perfect.",
            },
            {
              q: "My cat never sits still — what photo should I use?",
              a: "Any clear photo where your cat's face is visible works well. It doesn't need to be a posed shot — a candid where their features are clear is fine.",
            },
            {
              q: "How much does a custom cat portrait cost?",
              a: "From £1.99 for a single portrait. Two portraits for £3.99. These are introductory prices for early customers.",
            },
            {
              q: "Can I get a cat memorial portrait?",
              a: "Yes. Many customers use Pawtoons to create a beautiful memorial portrait of a cat they've lost. Our Angel and Royal themes are especially popular for this.",
            },
          ].map(({ q, a }) => (
            <details
              key={q}
              className="border border-gray-200 rounded-xl px-5 py-4"
            >
              <summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="text-gray-600 mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="py-10 px-4 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">More Portrait Options</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dog-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Dog Portraits</Link>
            <Link to="/royal-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">👑 Royal Portraits</Link>
            <Link to="/pet-memorial-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🌹 Memorial Portraits</Link>
            <Link to="/pet-portrait-gifts" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🎁 Pet Portrait Gifts</Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Your Cat Deserves a Portrait
        </h2>
        <p className="text-gray-600 mb-6">They know it. Now prove it. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">
          ✨ Create My Cat Portrait
        </Link>
        <p className="text-sm text-gray-400 mt-3">
          🔒 Secure checkout · ⚡ Instant download · 💳 All cards & Apple Pay
        </p>
      </section>
    </main>
  );
}
