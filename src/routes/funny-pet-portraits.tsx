import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/funny-pet-portraits")({
  head: () => ({
    meta: [
      { title: "Funny Pet Portraits from Photo | Hilarious AI Art | Pawtoons" },
      { name: "description", content: "The funniest gift for pet lovers. Hilarious AI-generated funny pet portraits your friends won't stop sharing. Mafia Boss, Viking, Pirate & more. From £1.99." },
      { property: "og:title", content: "Funny Pet Portraits | Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/funny-pet-portraits" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/funny-pet-portraits" }],
    scripts: [{ type: "application/ld+json", children: schemaToString(breadcrumbSchema([{ name: "Funny Pet Portraits", url: "https://www.pawtoons.co/funny-pet-portraits" }])) }],
  }),
  component: FunnyPetPortraitsPage,
});

function FunnyPetPortraitsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6"><Link to="/">Home</Link><span className="mx-2">/</span><span>Funny Pet Portraits</span></nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Funny Pet Portraits — When Your Pet Becomes the Punchline</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Your hamster as a Mafia Boss. Your cat as a Viking Warrior. Your dog as a Pirate Captain. Hilarious, high-quality AI portraits that will make everyone lose it. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">😂 Create My Funny Portrait →</Link>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">The Funniest Themes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: "🤵", name: "Mafia Boss", desc: "Don't mess. Very serious business." },
              { emoji: "⚔️", name: "Viking Warrior", desc: "Mjölnir optional. Ferocity mandatory." },
              { emoji: "🏴‍☠️", name: "Pirate Captain", desc: "The seven seas fear this creature." },
              { emoji: "🦸", name: "Superhero", desc: "Cape on. Dignity off." },
              { emoji: "🧙", name: "Wizard", desc: "They knew all along they had powers." },
              { emoji: "🚀", name: "Astronaut", desc: "One small step for paw." },
            ].map(({ emoji, name, desc }) => (
              <Link key={name} to="/upload" className="bg-white p-5 rounded-xl hover:shadow transition text-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="font-bold mb-1">{name}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">The Best Gift for Someone Who Has Everything</h2>
        <p className="text-gray-600 mb-4">Nobody expects a Mafia Boss portrait of their Bichon Frise. That's exactly why it works. Funny pet portraits are the gift people actually talk about — at the office, in family group chats, on social media.</p>
        <p className="text-gray-600">They're cheap enough to be an impulse purchase (£1.99) and good enough to be genuinely impressive. The perfect combination.</p>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Pet's Most Ridiculous Era Starts Now</h2>
        <p className="text-gray-600 mb-6">From £1.99. Ready in 60 seconds. Reactions guaranteed.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">😂 Create My Funny Portrait</Link>
      </section>
    </main>
  );
}
