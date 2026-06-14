import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/superhero-pet-portraits")({
  head: () => ({
    meta: [
      { title: "Superhero Pet Portraits from Photo | AI Art | From £1.99 | Pawtoons" },
      { name: "description", content: "Give your dog or cat superpowers. AI superhero pet portraits from your photo. Cape included. Oil Painting, Pixar 3D or Watercolour. From £1.99. Instant download." },
      { property: "og:title", content: "Superhero Pet Portraits | Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/superhero-pet-portraits" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/superhero-pet-portraits" }],
    scripts: [{ type: "application/ld+json", children: schemaToString(breadcrumbSchema([{ name: "Superhero Pet Portraits", url: "https://www.pawtoons.co/superhero-pet-portraits" }])) }],
  }),
  component: SuperheroPetPortraitsPage,
});

function SuperheroPetPortraitsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6"><Link to="/">Home</Link><span className="mx-2">/</span><span>Superhero Pet Portraits</span></nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Superhero Pet Portraits — Your Pet Saves the Day</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Cape? Check. Superpowers? Obviously. Your dog or cat as a fully-kitted superhero — in stunning AI artwork. Oil Painting, Pixar 3D, or Watercolour. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">🦸 Create My Superhero Portrait →</Link>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Why Superhero Portraits Are Our Most Shared Theme</h2>
          <p className="text-gray-600 mb-6">The Superhero portrait consistently gets the most shares on social media. It hits that perfect combination of impressive artwork and irresistible humour — your pet with a heroic cape, striking a pose, looking absolutely ridiculous and magnificent at the same time.</p>
          <p className="text-gray-600">Instagram, TikTok, WhatsApp family groups — these portraits travel. If you want a portrait that gets reactions, this is it.</p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Superhero Portrait FAQs</h2>
        <div className="space-y-4">
          {[
            { q: "What does the Superhero portrait look like?", a: "Your pet is rendered in heroic pose with a superhero costume — cape, emblem, dramatic lighting. The exact style varies by your chosen art type (Oil Painting looks cinematic; Pixar 3D looks like a Marvel movie still)." },
            { q: "Is it funny or impressive?", a: "Both. That's the magic. The artwork is genuinely high quality, but seeing your Labrador or tabby cat as a caped superhero is objectively hilarious." },
            { q: "What's the best art style for a superhero portrait?", a: "Pixar 3D is the most popular for the Superhero theme — it captures the bold, colourful Marvel/DC aesthetic perfectly. Oil Painting gives a more dramatic, serious feel." },
          ].map(({ q, a }) => (
            <details key={q} className="border border-gray-200 rounded-xl px-5 py-4">
              <summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="text-gray-600 mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Pet Is Already a Hero. Prove It.</h2>
        <p className="text-gray-600 mb-6">Cape ready. AI standing by. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">🦸 Create My Superhero Portrait</Link>
      </section>
    </main>
  );
}
