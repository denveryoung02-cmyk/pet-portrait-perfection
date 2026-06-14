// ============================================================
// PASTE EACH SECTION INTO ITS OWN FILE IN src/routes/
// ============================================================


// ============================================================
// FILE: src/routes/pet-portrait-gifts.tsx
// ============================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "~/lib/seo-schemas";

export const PetPortraitGiftsRoute = createFileRoute("/pet-portrait-gifts")({
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


// ============================================================
// FILE: src/routes/royal-pet-portraits.tsx
// ============================================================

export const RoyalPetPortraitsRoute = createFileRoute("/royal-pet-portraits")({
  head: () => ({
    meta: [
      { title: "Royal Pet Portraits — Your Pet as Royalty | From £1.99 | Pawtoons" },
      { name: "description", content: "Transform your pet into royalty with AI royal pet portraits. Crown jewels, regal poses, stunning artwork in Oil Painting, Pixar 3D or Watercolour. From £1.99." },
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
              <div className="text-4xl mb-3">🌸</div>
              <h3 className="font-bold mb-2">Watercolour Royal</h3>
              <p className="text-sm text-gray-600">Soft, elegant washes. A royal portrait with an artistic, painterly charm.</p>
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


// ============================================================
// FILE: src/routes/superhero-pet-portraits.tsx
// ============================================================

export const SuperheroPetPortraitsRoute = createFileRoute("/superhero-pet-portraits")({
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


// ============================================================
// FILE: src/routes/funny-pet-portraits.tsx
// ============================================================

export const FunnyPetPortraitsRoute = createFileRoute("/funny-pet-portraits")({
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


// ============================================================
// FILE: src/routes/pet-memorial-portraits.tsx
// ============================================================

export const PetMemorialPortraitsRoute = createFileRoute("/pet-memorial-portraits")({
  head: () => ({
    meta: [
      { title: "Pet Memorial Portraits — Honour Your Pet's Memory | Pawtoons" },
      { name: "description", content: "Create a beautiful memorial portrait of your beloved pet. Timeless AI artwork in Oil Painting, Watercolour or Pixar 3D style. From £1.99. Instant download." },
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
            { "@type": "Question", "name": "What is the best portrait style for a pet memorial?", "acceptedAnswer": { "@type": "Answer", "text": "The Angel theme with Oil Painting or Watercolour style is most popular for memorials. The Royal theme is also a beautiful way to honour a beloved pet's memory." } },
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
              <p className="text-sm text-gray-600">A gentle, serene portrait that honours their spirit. Beautiful in Watercolour or Oil Painting.</p>
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
            { q: "What is the best theme for a pet memorial portrait?", a: "The Angel theme is our most popular memorial choice. The Royal theme is also beautiful for a dignified tribute. Watercolour art style adds a soft, gentle quality many find comforting." },
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
