import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/dog-portraits")({
  head: () => ({
    meta: [
      {
        title:
          "Custom Dog Portraits from Your Photo | AI Art | From £1.99 | Pawtoons",
      },
      {
        name: "description",
        content:
          "Turn your dog's photo into stunning AI artwork in 60 seconds. Oil Painting, Pixar 3D, Comic Book styles. Royal, Superhero, Viking & 9 more themes. Instant download from £1.99.",
      },
      {
        property: "og:title",
        content: "Custom AI Dog Portraits from Your Photo | Pawtoons",
      },
      {
        property: "og:description",
        content:
          "Stunning custom dog portraits from your photo. 3 art styles, 12 themes. From £1.99. Created by AI in 60 seconds.",
      },
      {
        property: "og:url",
        content: "https://www.pawtoons.co/dog-portraits",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.pawtoons.co/dog-portraits",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Custom AI Dog Portrait — Digital Download",
          "description":
            "AI-generated custom dog portrait from your photo. Choose from Oil Painting, Pixar 3D, or Comic Book. 12 themes including Royal, Superhero, Viking. Instant download from £1.99.",
          "brand": { "@type": "Brand", "name": "Pawtoons" },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "GBP",
            "lowPrice": "1.99",
            "highPrice": "3.99",
            "availability": "https://schema.org/InStock",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: schemaToString(
          breadcrumbSchema([
            {
              name: "Custom Dog Portraits",
              url: "https://www.pawtoons.co/dog-portraits",
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
              "name": "What dog breeds work best for an AI portrait?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Any breed works brilliantly. The AI has been trained on thousands of dog portraits and handles everything from Golden Retrievers to French Bulldogs, Border Collies to Chihuahuas. The key is a clear, well-lit photo where your dog's face is visible.",
              },
            },
            {
              "@type": "Question",
              "name": "Can I get a portrait of my dog in a superhero costume?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Superhero is one of our most popular themes. Your dog becomes a fully caped superhero with your choice of art style — Oil Painting, Pixar 3D, or Comic Book.",
              },
            },
            {
              "@type": "Question",
              "name": "How long does a custom dog portrait take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "About 60 seconds. Upload your photo, pick a theme, and see the portrait preview instantly. Pay once and download immediately.",
              },
            },
            {
              "@type": "Question",
              "name": "What is the best gift for a dog lover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A custom AI dog portrait of their dog is consistently the most unique and personal gift you can give a dog lover. From £1.99, it's also exceptional value. Print it, frame it, or use it as a phone wallpaper.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: DogPortraitsPage,
});

function DogPortraitsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <span>Custom Dog Portraits</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Custom AI Dog Portraits from Your Photo
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload one photo of your dog. Our AI transforms it into stunning custom
          artwork in 60 seconds. Choose from Oil Painting, Pixar 3D, or
          Comic Book — and 12 epic themes. Instant digital download from £1.99.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Create My Dog Portrait →
        </Link>
        <p className="text-sm text-gray-500 mt-3">
          Free to preview · Pay only when you love it · From £1.99
        </p>
      </section>

      {/* Why dog owners love Pawtoons */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Dog Owners Choose Pawtoons
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Ready in 60 Seconds</h3>
              <p className="text-gray-600">
                No waiting days for an artist. Our AI creates your dog's
                portrait while you watch. Preview it before you pay.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">3 Art Styles</h3>
              <p className="text-gray-600">
                Oil Painting for a classic feel. Pixar 3D for fun and vibrant.
                Comic Book for something bold and full of energy.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl text-center">
              <div className="text-3xl mb-3">💝</div>
              <h3 className="font-bold text-lg mb-2">From £1.99</h3>
              <p className="text-gray-600">
                A custom dog portrait that used to cost £50–£150 from an artist.
                Now available as an instant digital download for less than a
                coffee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Choose Your Dog's Portrait Style
        </h2>
        <p className="text-center text-gray-600 mb-8">
          12 unique themes, each available in 3 art styles. That's 36 ways to
          turn your dog into a legend.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { emoji: "👑", name: "Royal", desc: "Crown jewels included" },
            { emoji: "🦸", name: "Superhero", desc: "Cape included" },
            { emoji: "⚔️", name: "Viking Warrior", desc: "Battle ready" },
            { emoji: "🏴‍☠️", name: "Pirate Captain", desc: "Arrr-mazing" },
            { emoji: "🧙", name: "Wizard", desc: "Magical spells" },
            { emoji: "🚀", name: "Astronaut", desc: "To infinity" },
            { emoji: "🤵", name: "Mafia Boss", desc: "Don't mess" },
            { emoji: "👸", name: "Princess", desc: "Fairy tale" },
          ].map((theme) => (
            <Link
              key={theme.name}
              to="/upload"
              className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition"
            >
              <div className="text-2xl mb-1">{theme.emoji}</div>
              <div className="font-semibold">{theme.name}</div>
              <div className="text-xs text-gray-500">{theme.desc}</div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/upload" className="text-blue-600 hover:underline">
            See all 12 themes →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            How to Get Your Custom Dog Portrait in 3 Steps
          </h2>
          <div className="space-y-6">
            {[
              {
                n: "01",
                title: "Upload a photo of your dog",
                body: "Any clear photo where your dog's face is visible. JPG or PNG, under 10MB. The better the photo, the better the portrait.",
              },
              {
                n: "02",
                title: "Pick a theme and art style",
                body: "Choose from 12 themes and 3 art styles. Royal? Superhero? Viking? Mix and match to find the perfect look for your dog's personality.",
              },
              {
                n: "03",
                title: "Download instantly",
                body: "Pay once (from £1.99) and download your high-resolution portrait immediately. Print it, frame it, or share it — the file is yours forever.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 items-start">
                <div className="text-3xl font-bold text-gray-200 w-12 shrink-0">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift section */}
      <section className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          The Perfect Gift for Dog Lovers
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Struggling to find a unique gift for a dog lover? A custom AI dog
          portrait of their dog is one of the most personal and memorable gifts
          you can give — for any occasion.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            "🎂 Birthdays",
            "🎄 Christmas",
            "💝 Valentine's",
            "🌸 Mother's Day",
            "👨 Father's Day",
            "🐾 Just Because",
          ].map((occasion) => (
            <span
              key={occasion}
              className="bg-gray-100 px-4 py-2 rounded-full text-sm"
            >
              {occasion}
            </span>
          ))}
        </div>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Create a Dog Portrait Gift →
        </Link>
      </section>

      {/* Reviews */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Loved by Dog Owners Everywhere
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                text: "Got a Royal portrait of my Labrador. It looks absolutely incredible. Everyone who's seen it wants one.",
                name: "James W.",
                pet: "Monty's dad",
              },
              {
                stars: 5,
                text: "Bought it as a birthday gift for my sister. She cried happy tears. Best gift I've ever given.",
                name: "Emma T.",
                pet: "Gifted for Bella",
              },
              {
                stars: 5,
                text: "Downloaded it instantly and everyone at work wants one now. Absolutely hilarious Superhero portrait.",
                name: "Sarah K.",
                pet: "Bella's mum",
              },
            ].map((r) => (
              <div key={r.name} className="bg-white p-5 rounded-2xl">
                <div className="text-yellow-400 mb-2">{"★".repeat(r.stars)}</div>
                <p className="text-gray-700 text-sm mb-3 italic">
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-gray-400">{r.pet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Custom Dog Portrait FAQs
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What dog breeds work best?",
              a: "Any breed. The AI handles everything from Golden Retrievers to Pugs, Border Collies to Dachshunds. Clear photo = great portrait.",
            },
            {
              q: "Can I portrait my dog in a superhero costume?",
              a: "Absolutely — it's one of our most popular themes. Your dog gets a full superhero makeover including cape.",
            },
            {
              q: "Is the portrait an instant download?",
              a: "Yes. You see a preview in 60 seconds, pay from £1.99, and download your high-resolution portrait immediately.",
            },
            {
              q: "What file format will I receive?",
              a: "A high-resolution PNG or JPG file suitable for printing, framing, phone wallpaper, or sharing on social media.",
            },
            {
              q: "Can I use this as a gift?",
              a: "Absolutely. It makes one of the most unique personalised gifts for dog lovers. Simply download and print at your local print shop or at home.",
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
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Explore More Portraits</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/cat-portraits"
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition"
            >
              🐱 Cat Portraits
            </Link>
            <Link
              to="/royal-pet-portraits"
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition"
            >
              👑 Royal Pet Portraits
            </Link>
            <Link
              to="/superhero-pet-portraits"
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition"
            >
              🦸 Superhero Portraits
            </Link>
            <Link
              to="/pet-portrait-gifts"
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition"
            >
              🎁 Pet Portrait Gifts
            </Link>
            <Link
              to="/ai-pet-portraits"
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition"
            >
              ✨ About AI Pet Portraits
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Make Your Dog Famous?
        </h2>
        <p className="text-gray-600 mb-6">
          Their face. Their personality. Immortalised in 60 seconds. From £1.99.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Create My Dog Portrait
        </Link>
        <p className="text-sm text-gray-400 mt-3">
          🔒 Secure checkout · 💳 All cards & Apple Pay · ⚡ Instant download
        </p>
      </section>
    </main>
  );
}
