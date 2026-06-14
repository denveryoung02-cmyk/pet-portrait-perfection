import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

export const Route = createFileRoute("/ai-pet-portraits")({
  head: () => ({
    meta: [
      {
        title:
          "AI Pet Portraits — How It Works, Quality & Cost Guide | Pawtoons",
      },
      {
        name: "description",
        content:
          "Everything you need to know about AI pet portraits. How they work, the quality you can expect, how long they take, and why Pawtoons creates them for just £1.99.",
      },
      {
        property: "og:title",
        content: "AI Pet Portraits: The Complete Guide | Pawtoons",
      },
      {
        property: "og:url",
        content: "https://www.pawtoons.co/ai-pet-portraits",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.pawtoons.co/ai-pet-portraits" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString(
          breadcrumbSchema([
            {
              name: "AI Pet Portraits",
              url: "https://www.pawtoons.co/ai-pet-portraits",
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
              "name": "What is an AI pet portrait?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "An AI pet portrait is a custom artwork of your pet created by artificial intelligence. You upload a photo of your pet, choose an art style and theme, and AI generates a unique portrait in seconds. The result is a high-resolution digital image that can be downloaded, printed, and framed.",
              },
            },
            {
              "@type": "Question",
              "name": "How does AI create a pet portrait?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI pet portrait tools use image generation models trained on millions of artworks and photographs. When you upload your pet's photo, the AI analyses the facial features, fur pattern, and expression, then applies the chosen art style and theme to generate a unique portrait that captures your pet's likeness.",
              },
            },
            {
              "@type": "Question",
              "name": "Are AI pet portraits good quality?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Modern AI image generation produces genuinely high-quality pet portraits that are print-ready and look stunning when framed. Pawtoons uses advanced AI to create high-resolution portraits suitable for large-format printing.",
              },
            },
            {
              "@type": "Question",
              "name": "How much do AI pet portraits cost?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI pet portraits are significantly cheaper than hand-painted portraits. Pawtoons AI pet portraits start from £1.99 for a single portrait. Traditional artist-painted custom pet portraits typically cost £50–£200.",
              },
            },
            {
              "@type": "Question",
              "name": "How long does an AI pet portrait take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "About 60 seconds with Pawtoons. Upload a photo, pick a style and theme, and your portrait is generated instantly. Compare this to hand-painted portraits which typically take 1–4 weeks.",
              },
            },
            {
              "@type": "Question",
              "name": "Which is better — AI or hand-painted pet portraits?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Both have merits. Hand-painted portraits offer the artistic touch of a human creator and may have more sentimental value for some people, but cost significantly more (£50–£200+) and take weeks. AI portraits are instant, affordable (from £1.99), and the quality has become genuinely impressive with modern tools like Pawtoons.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: AIPetPortraitsPage,
});

function AIPetPortraitsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <span>AI Pet Portraits</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI Pet Portraits: How They Work, What to Expect & Why They're Amazing
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Everything you need to know about AI-generated custom pet portraits —
          from how the technology works to the quality you can expect and exactly
          how much they cost.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          ✨ Try Pawtoons Free →
        </Link>
      </section>

      {/* What is an AI pet portrait */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">What Is an AI Pet Portrait?</h2>
        <p className="text-gray-700 mb-4">
          An AI pet portrait is a custom artwork of your pet created entirely by
          artificial intelligence. You provide one photo of your pet — a dog,
          cat, rabbit, or any animal — choose an art style and a creative theme,
          and an AI system generates a unique, high-resolution portrait in
          seconds.
        </p>
        <p className="text-gray-700 mb-4">
          The output is a digital image file that you can download immediately,
          print at home or at a print shop, frame, share on social media, or use
          as a phone wallpaper. The quality of modern AI pet portraits is
          genuinely impressive — rich colours, accurate likenesses, and
          professional-level artwork at a fraction of the cost of commissioned
          human art.
        </p>
        <p className="text-gray-700">
          Pawtoons is a UK-based AI pet portrait service offering instant digital
          downloads from £1.99. Portraits are generated in approximately 60
          seconds.
        </p>
      </section>

      {/* How AI creates portraits */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            How Does AI Create a Pet Portrait?
          </h2>
          <p className="text-gray-700 mb-4">
            Modern AI pet portrait tools use large image generation models
            trained on millions of artworks, photographs, and artistic styles.
            When you upload your pet's photo, the AI:
          </p>
          <ol className="space-y-3 mb-6">
            {[
              "Analyses your pet's facial features, colouring, fur patterns, and expression",
              "Applies the chosen art style — oil painting techniques, 3D rendering, or watercolour washes",
              "Incorporates the selected theme — a royal costume, superhero cape, viking armour, and so on",
              "Generates a high-resolution image that captures your pet's likeness in the new style",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-gray-700">
            The entire process takes around 60 seconds. The result is a unique
            portrait that captures your specific pet's appearance — not a generic
            stock image.
          </p>
        </div>
      </section>

      {/* Quality section */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Are AI Pet Portraits Good Quality?
        </h2>
        <p className="text-gray-700 mb-4">
          The quality of AI pet portraits has improved dramatically in recent
          years. Modern AI image generation tools produce genuinely beautiful,
          high-resolution artwork that looks stunning when printed.
        </p>
        <p className="text-gray-700 mb-4">
          Pawtoons portraits are generated at high resolution and are
          print-ready. Customers regularly use them for framed wall art, printed
          canvases, phone wallpapers, and social media sharing.
        </p>
        <p className="text-gray-700">
          The AI captures your pet's unique features — their fur colour, eye
          shape, expression — and applies the chosen style while maintaining
          enough likeness that anyone who knows your pet will immediately
          recognise them.
        </p>
      </section>

      {/* Cost comparison */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            How Much Do AI Pet Portraits Cost?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Cost</th>
                  <th className="text-left p-3 font-semibold">Time</th>
                  <th className="text-left p-3 font-semibold">Quality</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="p-3 font-semibold">Pawtoons AI Portrait</td>
                  <td className="p-3">From £1.99</td>
                  <td className="p-3">60 seconds</td>
                  <td className="p-3">High-res, print-ready</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-3">Other AI Portrait Services</td>
                  <td className="p-3">£5–£25</td>
                  <td className="p-3">Minutes–hours</td>
                  <td className="p-3">Variable</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-3">Digital Artist (Etsy)</td>
                  <td className="p-3">£25–£80</td>
                  <td className="p-3">3–7 days</td>
                  <td className="p-3">Hand-crafted</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-3">Professional Pet Artist</td>
                  <td className="p-3">£100–£400+</td>
                  <td className="p-3">2–6 weeks</td>
                  <td className="p-3">Museum quality</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AI vs hand-painted */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          AI Pet Portraits vs Hand-Painted: Which Should You Choose?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-bold text-lg mb-3">✨ AI Pet Portrait</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Ready in 60 seconds</li>
              <li>✅ From £1.99</li>
              <li>✅ Preview before you pay</li>
              <li>✅ High-resolution digital download</li>
              <li>✅ Multiple styles and themes</li>
              <li>✅ Perfect for gifting quickly</li>
              <li>⚠️ Generated, not hand-crafted</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-bold text-lg mb-3">🎨 Hand-Painted Portrait</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Created by a human artist</li>
              <li>✅ Unique sentimental value</li>
              <li>✅ Physical original artwork possible</li>
              <li>⚠️ £50–£400+ cost</li>
              <li>⚠️ 1–6 week wait time</li>
              <li>⚠️ Limited revisions</li>
              <li>⚠️ No instant preview</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-600 mt-4 text-sm">
          For most people, AI pet portraits offer the best balance of quality,
          speed, and value — especially as gifts. Hand-painted portraits remain
          special for memorials or very high-end display purposes.
        </p>
      </section>

      {/* Pawtoons specifically */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Why Choose Pawtoons for Your AI Pet Portrait?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
            {[
              { icon: "⚡", title: "60-second generation", body: "The fastest AI pet portrait service available." },
              { icon: "💷", title: "From £1.99", body: "The most affordable quality AI pet portrait. Introductory price." },
              { icon: "🎨", title: "3 art styles × 12 themes", body: "36 unique combinations. More variety than any competitor." },
              { icon: "👀", title: "Preview before you pay", body: "See your portrait before checkout. Pay only when you love it." },
              { icon: "🔄", title: "Regenerate up to 3×", body: "Not happy with the first result? Regenerate for free." },
              { icon: "⬇️", title: "Instant download", body: "High-resolution file delivered the moment you pay." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex gap-3 bg-white p-4 rounded-xl">
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-gray-500">{body}</div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/upload"
            className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
          >
            ✨ Try Pawtoons — Free to Preview
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          AI Pet Portrait FAQs
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Are AI pet portraits legal to use commercially?",
              a: "Pawtoons portraits are generated for personal use: printing, gifting, home display, social media, phone wallpapers. For commercial use (selling merchandise featuring your portrait), we recommend checking our terms.",
            },
            {
              q: "What resolution are the portraits?",
              a: "Pawtoons generates high-resolution portraits suitable for printing at A4 size and larger.",
            },
            {
              q: "Do AI pet portraits capture my specific pet's likeness?",
              a: "Yes. The AI uses your specific photo to capture your pet's features — fur colour, face shape, eye colour, and expression. The result is recognisably your pet, reimagined in the chosen style.",
            },
            {
              q: "Can I get an AI portrait of a pet that has passed away?",
              a: "Absolutely. Many customers use old photos of pets they've lost to create a beautiful memorial portrait. Any clear photo works, even older ones.",
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
      <section className="py-10 px-4 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Explore Pawtoons</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dog-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Dog Portraits</Link>
            <Link to="/cat-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐱 Cat Portraits</Link>
            <Link to="/royal-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">👑 Royal Pet Portraits</Link>
            <Link to="/pet-portrait-gifts" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🎁 Pet Portrait Gifts</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
