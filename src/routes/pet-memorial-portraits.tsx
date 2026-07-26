import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/pet-memorial-portraits")({
  head: () => ({
    meta: [
      { title: "Pet Memorial Portraits — Honour Your Pet's Memory | Pawtoons" },
      { name: "description", content: "Create a beautiful memorial portrait of your beloved pet. Timeless AI artwork in Oil Painting, Comic Book or Pixar 3D style. From £1.99. Instant download." },
      { property: "og:title", content: "Pet Memorial Portraits | Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/pet-memorial-portraits" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/pet-memorial-portraits" }],
    scripts: [
      { type: "application/ld+json", children: schemaToString(breadcrumbSchema([{ name: "Pet Memorial Portraits", url: "https://www.pawtoons.co/pet-memorial-portraits" }])) },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Can I create a memorial portrait from an old photo?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Any clear photo works, including older photos. As long as your pet's face is visible, the AI can create a beautiful memorial portrait." } },
            { "@type": "Question", "name": "What is the best portrait style for a pet memorial?", "acceptedAnswer": { "@type": "Answer", "text": "The Angel theme with Oil Painting is most popular for memorials. The Royal theme is also a beautiful way to honour a beloved pet's memory." } },
          ],
        }),
      },
    ],
  }),
  component: PetMemorialPortraitsPage,
});

function PetMemorialPortraitsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6"><Link to="/">Home</Link><span className="mx-2">/</span><span>Pet Memorial Portraits</span></nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Pet Memorial Portraits — Keep Your Pet's Memory Alive</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">A beautiful, timeless AI portrait from your favourite photo. A way to honour the pet who made your life better, and keep them close always. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">🌹 Create a Memorial Portrait →</Link>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Portrait Themes for a Memorial</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl">
              <div className="text-4xl mb-3">😇</div>
              <h3 className="font-bold mb-2">Angel</h3>
              <p className="text-sm text-gray-600">A gentle, serene portrait that honours their spirit. Beautiful in Oil Painting.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="text-4xl mb-3">👑</div>
              <h3 className="font-bold mb-2">Royal</h3>
              <p className="text-sm text-gray-600">Regal and dignified. A fitting tribute for a pet who ruled your heart.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="text-4xl mb-3">🌸</div>
              <h3 className="font-bold mb-2">Flower Crown</h3>
              <p className="text-sm text-gray-600">Soft and beautiful. A gentle memorial with natural warmth.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">A Tribute That Lasts</h2>
        <p className="text-gray-700 mb-4">Losing a pet is a genuine grief. They were part of your daily life, your routine, your home. A memorial portrait is a way to acknowledge that — to hold onto their memory in a beautiful, lasting way.</p>
        <p className="text-gray-700 mb-4">Pawtoons can create a memorial portrait from any clear photo, including older or less-than-perfect images. The AI works with what you have to produce something beautiful.</p>
        <p className="text-gray-700">Print it, frame it, keep it close. They deserve to be remembered in the most beautiful way possible.</p>
      </section>

      <section className="py-12 px-4 bg-gray-50 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Memorial Portrait FAQs</h2>
        <div className="space-y-4">
          {[
            { q: "Can I use an older or lower-quality photo?", a: "Yes. Older photos work as long as your pet's face is reasonably visible and clear. The AI handles varying photo quality well." },
            { q: "What is the best theme for a pet memorial portrait?", a: "The Angel theme is our most popular memorial choice. The Royal theme is also beautiful for a dignified tribute. Oil Painting art style adds a soft, gentle quality many find comforting." },
            { q: "Can I create a memorial portrait as a gift for someone who has lost a pet?", a: "Yes, and it's a profoundly thoughtful gesture. Use a photo they've shared online, create the portrait, and give it as a physical framed gift or digital download." },
          ].map(({ q, a }) => (
            <details key={q} className="border border-gray-200 rounded-xl px-5 py-4">
              <summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="text-gray-600 mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-10 px-4 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dog-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Dog Portraits</Link>
            <Link to="/cat-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐱 Cat Portraits</Link>
            <Link to="/royal-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">👑 Royal Portraits</Link>
            <Link to="/pet-portrait-gifts" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🎁 Gifts for Pet Lovers</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">They Gave You Everything. Give Them This.</h2>
        <p className="text-gray-600 mb-6">A portrait that keeps them close. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">🌹 Create a Memorial Portrait</Link>
        <p className="text-sm text-gray-400 mt-3">🔒 Secure checkout · ⚡ Instant download · 💳 All cards & Apple Pay</p>
      </section>
    </main>
  );
}
