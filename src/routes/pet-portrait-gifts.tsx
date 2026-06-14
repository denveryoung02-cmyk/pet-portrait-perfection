import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/pet-portrait-gifts")({
  head: () => ({
    meta: [
      { title: "Personalised Pet Portrait Gifts | From £1.99 | Pawtoons" },
      {
        name: "description",
        content:
          "The most unique personalised gift for pet lovers. Custom AI pet portraits created in 60 seconds. From £1.99. Perfect for birthdays, Christmas, Mother's Day and more.",
      },
      { property: "og:title", content: "Personalised Pet Portrait Gifts | Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/pet-portrait-gifts" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/pet-portrait-gifts" }],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString(breadcrumbSchema([{ name: "Pet Portrait Gifts", url: "https://www.pawtoons.co/pet-portrait-gifts" }])),
      },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is a good personalised gift for a pet lover?",
              "acceptedAnswer": { "@type": "Answer", "text": "A custom AI pet portrait of their pet is one of the most thoughtful and unique personalised gifts for a pet lover. Pawtoons creates stunning AI portraits from a single photo in 60 seconds, starting from £1.99." },
            },
            {
              "@type": "Question",
              "name": "How do I gift a digital pet portrait?",
              "acceptedAnswer": { "@type": "Answer", "text": "Simply create the portrait using a photo of their pet, download the high-resolution file, and send it digitally or print and frame it as a physical gift. It makes a beautiful surprise." },
            },
          ],
        }),
      },
    ],
  }),
  component: PetPortraitGiftsPage,
});

function PetPortraitGiftsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6"><Link to="/">Home</Link><span className="mx-2">/</span><span>Pet Portrait Gifts</span></nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Personalised Pet Portrait Gifts — The Gift Every Pet Lover Wants</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">A custom AI portrait of their pet. Created in 60 seconds. Delivered as an instant digital download. The most unique personalised gift available — from just £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">🎁 Create a Portrait Gift →</Link>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Perfect for Every Gifting Occasion</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: "🎂", occasion: "Birthdays", desc: "The gift they'll talk about all year" },
              { emoji: "🎄", occasion: "Christmas", desc: "Stocking filler or main event" },
              { emoji: "🌸", occasion: "Mother's Day", desc: "For the mum who loves their pet like a child" },
              { emoji: "👨", occasion: "Father's Day", desc: "For the dog dad who has everything" },
              { emoji: "💝", occasion: "Valentine's Day", desc: "Their pet is part of your love story" },
              { emoji: "🐾", occasion: "Just Because", desc: "No reason needed" },
            ].map(({ emoji, occasion, desc }) => (
              <div key={occasion} className="bg-white p-5 rounded-xl text-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="font-bold mb-1">{occasion}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Why Pet Portraits Make the Best Personalised Gifts</h2>
        <div className="space-y-4 text-gray-700">
          <p>Pet owners have a unique bond with their animals — a bond that generic gifts rarely acknowledge. A personalised pet portrait says "I see how much your pet means to you." That's rare. That's memorable. That's what makes people cry happy tears.</p>
          <p>Unlike candles, wine, or vouchers, a custom pet portrait is completely unique to the recipient. There is no other gift in the world exactly like it, because there is no other pet exactly like theirs.</p>
          <p>And at £1.99, it's one of the best-value personalised gifts available anywhere.</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">How to Gift a Digital Pet Portrait</h2>
          <div className="space-y-4">
            {[
              { n: "01", title: "Get a photo of their pet", body: "Check their social media, ask a family member, or use a photo you already have. Any clear photo of the pet's face works." },
              { n: "02", title: "Create their portrait on Pawtoons", body: "Upload the photo, choose a theme that matches their pet's personality (Royal? Superhero? Wizard?), and let the AI work its magic." },
              { n: "03", title: "Download and deliver the gift", body: "Download the high-resolution file and email it, print it and frame it, or have it printed on canvas for a truly stunning physical gift." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-4">
                <div className="text-3xl font-bold text-gray-200 w-12 shrink-0">{n}</div>
                <div><h3 className="font-bold mb-1">{title}</h3><p className="text-gray-600 text-sm">{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Pet Portrait Gift FAQs</h2>
        <div className="space-y-4">
          {[
            { q: "Can I buy a portrait as a gift without the recipient knowing?", a: "Yes. Create and download the portrait yourself, then give the digital file as a gift or have it printed before presenting it." },
            { q: "What if I don't have a great photo of their pet?", a: "Most clear photos of the pet's face work well. Even a decent smartphone photo taken in reasonable light will produce a great portrait." },
            { q: "How do I physically print and gift the portrait?", a: "Download the file and take it to any print shop (Boots, Snappy Snaps, local print shop) for same-day printing. Order a canvas online for a premium feel." },
            { q: "Is £1.99 really the price? That seems too cheap.", a: "Yes, really. It's our introductory price for early customers. The portraits are digital downloads created by AI, which keeps costs low and lets us pass the savings on." },
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
          <h2 className="text-2xl font-bold mb-6">More Portrait Options</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dog-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Dog Portraits</Link>
            <Link to="/cat-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐱 Cat Portraits</Link>
            <Link to="/royal-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">👑 Royal Portraits</Link>
            <Link to="/funny-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">😂 Funny Portraits</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Give a Gift They'll Never Forget</h2>
        <p className="text-gray-600 mb-6">Their pet. As legendary art. From £1.99.</p>
        <Link to="/upload" className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">✨ Create the Gift</Link>
        <p className="text-sm text-gray-400 mt-3">🔒 Secure checkout · ⚡ Instant download · 💳 All cards & Apple Pay</p>
      </section>
    </main>
  );
}
