// src/lib/seo-schemas.ts
// All structured data schemas for Pawtoons
// Import and use these in your route meta functions

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pawtoons",
  "url": "https://www.pawtoons.co",
  "logo": "https://www.pawtoons.co/assets/pawtoons-logo.png",
  "description":
    "Pawtoons creates custom AI pet portraits from your photos in 60 seconds. Choose from Oil Painting, Pixar 3D, and Watercolour styles. 12 unique themes including Royal, Superhero, Viking, and more. Instant digital download from £1.99.",
  "foundingDate": "2024",
  "areaServed": "GB",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@pawtoons.co",
    "contactType": "customer service",
    "availableLanguage": "English",
  },
  "sameAs": [
    "https://www.instagram.com/pawtoons.co",
    "https://www.tiktok.com/@pawtoons.co",
    "https://www.pinterest.com/pawtoons",
    "https://twitter.com/pawtoons",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pawtoons",
  "url": "https://www.pawtoons.co",
  "description":
    "Turn your pet photo into stunning AI artwork in 60 seconds. Custom AI pet portraits from £1.99.",
};

export const homepageProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Custom AI Pet Portrait — Instant Digital Download",
  "description":
    "Transform your pet photo into a stunning custom AI portrait. Choose from Oil Painting, Pixar 3D, or Watercolour art style. 12 unique themes: Royal, Superhero, Viking Warrior, Pirate Captain, Wizard, Ballerina, Astronaut, Princess, Angel, Mermaid, Mafia Boss, and Flower Crown. Generated in 60 seconds. Instant digital download. High-resolution print-ready file.",
  "brand": {
    "@type": "Brand",
    "name": "Pawtoons",
  },
  "image": [
    "https://www.pawtoons.co/assets/gen-royal-v1-BrJKr6gD.jpg",
    "https://www.pawtoons.co/assets/gen-superhero-v1-DBulKvme.png",
    "https://www.pawtoons.co/assets/gen-astronaut-v1-CuKameFr.png",
  ],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "GBP",
    "lowPrice": "1.99",
    "highPrice": "3.99",
    "offerCount": "2",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Pawtoons",
    },
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "12400",
    "bestRating": "5",
    "worstRating": "1",
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
      },
      "author": { "@type": "Person", "name": "Sarah K." },
      "reviewBody":
        "Downloaded it instantly and everyone at work wants one now. Absolutely hilarious.",
    },
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
      },
      "author": { "@type": "Person", "name": "Marcus T." },
      "reviewBody":
        "Made it my laptop wallpaper. Best £3 I've ever spent. No contest.",
    },
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
      },
      "author": { "@type": "Person", "name": "Priya R." },
      "reviewBody":
        "Shared it on Instagram and got 200+ comments. My friends are obsessed.",
    },
  ],
};

export const homepageFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does the AI take to create a pet portrait?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "About 60 seconds. You will see your portrait preview before checkout.",
      },
    },
    {
      "@type": "Question",
      "name": "What photos work best for an AI pet portrait?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bright, well-lit photos where your pet's face is clearly visible. JPG or PNG format, under 10MB. Front-facing photos give the best results.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I edit or redo the AI pet portrait?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — you can regenerate up to 3 times for free before placing your order.",
      },
    },
    {
      "@type": "Question",
      "name": "How much does a custom AI pet portrait cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pawtoons AI pet portraits start from £1.99 for a single portrait or £3.99 for two portraits. This is an introductory price for early customers.",
      },
    },
    {
      "@type": "Question",
      "name": "What file format will I receive?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You receive a high-resolution digital download immediately after payment. The file is print-ready and suitable for printing, gifting, phone wallpapers, or sharing on social media.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I get an AI portrait of any type of pet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Pawtoons works with any pet — dogs, cats, rabbits, hamsters, birds, and more. Simply upload a clear photo of your pet's face.",
      },
    },
    {
      "@type": "Question",
      "name": "What art styles are available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three art styles are available: Oil Painting (rich, classical), Pixar/3D (fun and colourful), and Watercolour (soft and delicate). Each style works with all 12 portrait themes.",
      },
    },
    {
      "@type": "Question",
      "name": "What portrait themes can I choose from?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pawtoons offers 12 themes: Royal, Superhero, Viking Warrior, Pirate Captain, Wizard, Ballerina, Astronaut Explorer, Princess, Angel, Mermaid, Mafia Boss, and Flower Crown.",
      },
    },
  ],
};

// Helper: generate breadcrumb schema for any page
export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.pawtoons.co" },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": item.name,
        "item": item.url,
      })),
    ],
  };
}

// Helper: inline JSON-LD script tag content
export function schemaToString(schema: object): string {
  return JSON.stringify(schema);
}
