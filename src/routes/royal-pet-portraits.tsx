import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/royal-pet-portraits")({
  head: () => ({
    meta: [
      { title: "Royal Pet Portraits — Your Pet as Royalty | From £1.99 | Pawtoons" },
      { name: "description", content: "Transform your pet into royalty with AI royal pet portraits. Crown jewels, regal poses, stunning artwork in Oil Painting, Pixar 3D or Comic Book. From £1.99." },
      { property: "og:title", content: "Royal Pet Portraits | Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/royal-pet-portraits" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/royal-pet-portraits" }],
    scripts: [
      { type: "application/ld+json", children: schemaToString(breadcrumbSchema([{ name: "Royal Pet Portraits", url: "https://www.pawtoons.co/royal-pet-portraits" }])) },
    ],
  }),
  component: RoyalPetPortraitsPage,
});

function RoyalPetPortraitsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6"><Link to="/">Home</Link><span className="mx-2">/</span><span>Royal Pet Portraits</span></nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Royal Pet Portraits — Your Pet, Crown and All</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Your pet already rules the household. It's time their portrait reflected that. Stunning AI royal pet portraits — crown jewels, velvet robes, regal pose — from £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">👑 Create My Royal Portrait →</Link>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Three Royal Art Styles</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold mb-2">Oil Painting Royal</h3>
              <p className="text-sm text-gray-600">Rich, dark tones. The look of a 17th-century royal portrait. Completely regal.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-bold mb-2">Pixar 3D Royal</h3>
              <p className="text-sm text-gray-600">Vivid colours and expressive features. Your pet as the star of a royal animated film.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="text-4xl mb-3">💥</div>
              <h3 className="font-bold mb-2">Comic Book Royal</h3>
              <p className="text-sm text-gray-600">Bold outlines, vibrant colours. A royal portrait with graphic, pop-art flair.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">The History of Royal Pet Portraits</h2>
        <p className="text-gray-700 mb-4">Royalty and pets have been inseparable throughout history. Queen Victoria was famously devoted to her dogs and had them painted by the finest artists of the day. Henry VIII's court featured hunting dogs immortalised in grand portraits. Marie Antoinette's beloved spaniels appeared alongside her in formal paintings.</p>
        <p className="text-gray-700 mb-4">The tradition of portraying pets with royal grandeur is centuries old — and Pawtoons brings it to you in 60 seconds, for £1.99.</p>
        <p className="text-gray-700">Whether you want your cat painted as an Elizabethan monarch or your dog rendered as a regal Victorian dignitary, the Royal theme captures that timeless sense of nobility.</p>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Royal Pet Portrait FAQs</h2>
          <div className="space-y-4">
            {[
              { q: "What does the Royal theme include?", a: "The Royal theme adds a crown, regal costume, and formal backdrop to your pet's portrait. The specific elements vary by art style but all versions capture the sense of royal grandeur." },
              { q: "Is the Royal portrait good as a framed gift?", a: "Absolutely. The Royal portrait is our most popular theme for framing and gifting. Printed at A4 or A3 and put in a classic frame, it makes a stunning piece of home decor." },
              { q: "Can I get a royal portrait of any pet?", a: "Yes. Dogs, cats, rabbits — any pet becomes royalty. The AI adapts the costume and setting to suit the animal." },
            ].map(({ q, a }) => (
              <details key={q} className="border border-gray-200 rounded-xl px-5 py-4">
                <summary className="font-semibold cursor-pointer">{q}</summary>
                <p className="text-gray-600 mt-2 text-sm">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">More Portrait Themes</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/superhero-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🦸 Superhero Portraits</Link>
            <Link to="/funny-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">😂 Funny Portraits</Link>
            <Link to="/dog-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Dog Portraits</Link>
            <Link to="/cat-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐱 Cat Portraits</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Pet Deserves a Crown</h2>
        <p className="text-gray-600 mb-6">They act like royalty anyway. Make it official. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">👑 Create My Royal Portrait</Link>
      </section>
    </main>
  );
}
