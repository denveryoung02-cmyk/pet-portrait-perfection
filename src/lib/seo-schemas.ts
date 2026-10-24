export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pawtoons",
  "url": "https://www.pawtoons.co",
  "logo": "https://www.pawtoons.co/assets/pawtoons-logo.png",
  "description":
    "Pawtoons creates custom AI pet portraits from your photos in 60 seconds. Choose from Oil Painting, Pixar 3D, Comic Book, and Graffiti Splash styles. 12 unique themes including Royal, Superhero, Viking, and more. Instant digital download from £1.99.",
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
    "Transform your pet photo into a stunning custom AI portrait. Choose from Oil Painting, Pixar 3D, Comic Book, or Graffiti Splash art style. 12 unique themes: Royal, Superhero, Viking Warrior, Pirate Captain, Wizard, Ballerina, Astronaut, Princess, Angel, Mermaid, Mafia Boss, and Flower Crown. Generated in 60 seconds. Instant digital download. High-resolution print-ready file.",
  "brand": {
    "@type": "Brand",
    "name": "Pawtoons",
  },
  "image": [
    "https://www.pawtoons.co/assets/gen-royal-v1-BrJKr6gD.jpg",
    "https://www.pawtoons.co/assets/gen-superhero-v1-B4wgHz16.webp",
    "https://www.pawtoons.co/assets/gen-astronaut-v1-DWENdJa5.webp",
  ],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "GBP",
    "lowPrice": "1.99",
    "highPrice": "4.99",
    "offerCount": "2",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Pawtoons",
    },
  },
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
        "text": "Just a few minutes from upload to download, so there's no waiting weeks for your portrait. You'll see a watermarked preview before you pay.",
      },
    },
    {
      "@type": "Question",
      "name": "What photos work best for an AI pet portrait?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bright, well-lit photos where your pet's face is clearly visible. JPG or PNG, under 10MB.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I edit or redo the AI pet portrait?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You'll see a watermarked preview of your portrait before you pay. If a generation fails, you can tap Retry generation to try again.",
      },
    },
  ],
};

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

export function schemaToString(schema: object): string {
  return JSON.stringify(schema);
}
