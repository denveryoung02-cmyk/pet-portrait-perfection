// src/routes/about.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { schemaToString } from "~/lib/seo-schemas";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Pawtoons — The Story Behind the AI Pet Portraits" },
      {
        name: "description",
        content:
          "Pawtoons was born from a simple idea: every pet deserves a stunning portrait. Learn how we built the UK's most affordable AI pet portrait service.",
      },
      { property: "og:title", content: "About Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/about" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Pawtoons",
          "url": "https://www.pawtoons.co/about",
          "description":
            "The story of how Pawtoons was built — an AI pet portrait service making custom pet artwork affordable and instant.",
          "mainEntity": {
            "@type": "Organization",
            "name": "Pawtoons",
            "url": "https://www.pawtoons.co",
            "foundingDate": "2024",
            "description":
              "Pawtoons is a UK-based AI pet portrait service. We create custom AI-generated pet portraits from a single photo in approximately 60 seconds. Our portraits are available in three art styles (Oil Painting, Pixar 3D, Watercolour) across 12 unique themes. Instant digital download from £1.99.",
            "areaServed": "GB",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "hello@pawtoons.co",
              "contactType": "customer support",
            },
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4">
      <section className="py-16 text-center">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <span>About</span>
        </nav>
        <h1 className="text-4xl font-bold mb-4">About Pawtoons</h1>
        <p className="text-xl text-gray-600">
          Turning beloved pets into legendary characters since 2024.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">Why We Built This</h2>
        <p className="text-gray-700 mb-4">
          Pawtoons started with a simple frustration: getting a custom portrait of
          a pet used to mean either paying £80–£200 for an artist, or accepting
          low-quality filter apps that didn't really capture your animal.
        </p>
        <p className="text-gray-700 mb-4">
          We believed there had to be a better way — a service that combined
          genuine artistic quality with the speed and affordability that AI now
          makes possible.
        </p>
        <p className="text-gray-700">
          Pawtoons launched in 2024 with one goal: give every pet owner in the UK
          access to a beautiful, custom portrait of their animal — for the price
          of a coffee, delivered in 60 seconds.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">What We Do</h2>
        <p className="text-gray-700 mb-4">
          Pawtoons is an AI pet portrait service based in the UK. You upload a
          single photo of your pet, choose an art style (Oil Painting, Pixar 3D,
          or Watercolour) and a theme (Royal, Superhero, Viking, and 9 more), and
          our AI generates a high-resolution custom portrait in approximately 60
          seconds.
        </p>
        <p className="text-gray-700 mb-4">
          Every portrait is a unique digital artwork of your specific pet — not a
          generic stock image or template. The AI analyses your pet's features and
          creates something that genuinely looks like them, reimagined in the
          chosen style.
        </p>
        <p className="text-gray-700">
          Portraits are instant digital downloads, suitable for printing, framing,
          sharing on social media, or using as wallpapers. Single portrait: £1.99.
          Two portraits: £3.99. Introductory pricing for early customers.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">Our Technology</h2>
        <p className="text-gray-700 mb-4">
          Pawtoons is built using cutting-edge AI image generation technology. The
          service runs on Cloudflare's global edge network, meaning portraits are
          generated and delivered fast — wherever you are in the UK.
        </p>
        <p className="text-gray-700">
          Payments are processed securely via Stripe. Images are stored and
          delivered securely via Supabase. We never store your uploaded photos
          longer than necessary to generate your portrait.
        </p>
      </section>

      <section className="py-8 bg-gray-50 rounded-2xl px-6 my-8">
        <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
        <p className="text-gray-700 mb-2">
          Questions, feedback, or just want to share your portrait?
        </p>
        <a
          href="mailto:hello@pawtoons.co"
          className="text-blue-600 hover:underline font-medium"
        >
          hello@pawtoons.co
        </a>
      </section>

      <section className="py-8 text-center">
        <Link to="/" className="text-gray-500 hover:underline mr-6">← Back to Home</Link>
        <Link to="/upload" className="inline-block bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition">✨ Create a Portrait</Link>
      </section>
    </main>
  );
}
