# PAWTOONS SEO IMPLEMENTATION
# Paste this entire prompt into a fresh Claude Code session
# All files to create are provided inline below

Read CLAUDE.md first.

We are implementing a comprehensive SEO update to Pawtoons. This is a multi-file operation. Complete ALL steps in order. Do not ask for confirmation between steps. Deploy to staging only at the end.

---

## STEP 1: Create public/robots.txt

Create the file `public/robots.txt` with this exact content:

```
User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://www.pawtoons.co/sitemap.xml
```

---

## STEP 2: Create public/sitemap.xml

Create the file `public/sitemap.xml` with this exact content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.pawtoons.co/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/dog-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/cat-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/ai-pet-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/pet-portrait-gifts</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/royal-pet-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/superhero-pet-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/funny-pet-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/pet-memorial-portraits</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/about</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.pawtoons.co/products</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## STEP 3: Create src/lib/seo-schemas.ts

Create `src/lib/seo-schemas.ts`:

```typescript
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pawtoons",
  "url": "https://www.pawtoons.co",
  "logo": "https://www.pawtoons.co/assets/pawtoons-logo.png",
  "description": "Pawtoons creates custom AI pet portraits from your photos in 60 seconds. Choose from Oil Painting, Pixar 3D, and Watercolour styles. 12 unique themes. Instant digital download from £1.99.",
  "foundingDate": "2024",
  "areaServed": "GB",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@pawtoons.co",
    "contactType": "customer service",
  },
  "sameAs": [
    "https://www.instagram.com/pawtoons.co",
    "https://www.tiktok.com/@pawtoons.co",
    "https://www.pinterest.com/pawtoons",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pawtoons",
  "url": "https://www.pawtoons.co",
  "description": "Turn your pet photo into stunning AI artwork in 60 seconds. Custom AI pet portraits from £1.99.",
};

export const homepageProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Custom AI Pet Portrait — Instant Digital Download",
  "description": "Transform your pet photo into a stunning custom AI portrait. Choose from Oil Painting, Pixar 3D, or Watercolour art style. 12 unique themes: Royal, Superhero, Viking Warrior, Pirate Captain, Wizard, Ballerina, Astronaut, Princess, Angel, Mermaid, Mafia Boss, and Flower Crown. Generated in 60 seconds. Instant digital download.",
  "brand": { "@type": "Brand", "name": "Pawtoons" },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "GBP",
    "lowPrice": "1.99",
    "highPrice": "3.99",
    "offerCount": "2",
    "availability": "https://schema.org/InStock",
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
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "author": { "@type": "Person", "name": "Sarah K." },
      "reviewBody": "Downloaded it instantly and everyone at work wants one now. Absolutely hilarious.",
    },
    {
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "author": { "@type": "Person", "name": "Marcus T." },
      "reviewBody": "Made it my laptop wallpaper. Best £3 I've ever spent. No contest.",
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
      "acceptedAnswer": { "@type": "Answer", "text": "About 60 seconds. You will see your portrait preview before checkout." },
    },
    {
      "@type": "Question",
      "name": "What photos work best for an AI pet portrait?",
      "acceptedAnswer": { "@type": "Answer", "text": "Bright, well-lit photos where your pet's face is clearly visible. JPG or PNG format, under 10MB. Front-facing photos give the best results." },
    },
    {
      "@type": "Question",
      "name": "Can I edit or redo the AI pet portrait?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — you can regenerate up to 3 times for free before placing your order." },
    },
    {
      "@type": "Question",
      "name": "How much does a custom AI pet portrait cost?",
      "acceptedAnswer": { "@type": "Answer", "text": "Pawtoons AI pet portraits start from £1.99 for a single portrait or £3.99 for two portraits." },
    },
    {
      "@type": "Question",
      "name": "What file format will I receive?",
      "acceptedAnswer": { "@type": "Answer", "text": "You receive a high-resolution digital download immediately after payment. Print-ready and suitable for printing, gifting, or sharing on social media." },
    },
    {
      "@type": "Question",
      "name": "Can I get an AI portrait of any type of pet?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Pawtoons works with any pet — dogs, cats, rabbits, hamsters, birds, and more." },
    },
    {
      "@type": "Question",
      "name": "What art styles are available?",
      "acceptedAnswer": { "@type": "Answer", "text": "Three art styles: Oil Painting, Pixar/3D, and Watercolour. Each works with all 12 portrait themes." },
    },
    {
      "@type": "Question",
      "name": "What portrait themes can I choose from?",
      "acceptedAnswer": { "@type": "Answer", "text": "12 themes: Royal, Superhero, Viking Warrior, Pirate Captain, Wizard, Ballerina, Astronaut Explorer, Princess, Angel, Mermaid, Mafia Boss, and Flower Crown." },
    },
  ],
};

export function breadcrumbSchema(items: { name: string; url: string }[]) {
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
```

---

## STEP 4: Update the homepage head() meta

Find the homepage route file (likely `src/routes/index.tsx` or `src/routes/__root.tsx` — check which one renders the homepage). Update its `head()` export to use these meta tags:

```typescript
head: () => ({
  meta: [
    { title: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
    { name: "description", content: "Turn your pet photo into stunning AI artwork in 60 seconds. Oil Painting, Pixar 3D or Watercolour. 12 themes. From £1.99. Instant download. 12,400+ happy pet parents." },
    { property: "og:title", content: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
    { property: "og:description", content: "Turn your pet photo into AI art in 60 seconds. From £1.99. Instant download." },
    { property: "og:url", content: "https://www.pawtoons.co" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Custom AI Pet Portraits From Your Photo | Pawtoons" },
  ],
  scripts: [
    { type: "application/ld+json", children: JSON.stringify(organizationSchema) },
    { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
    { type: "application/ld+json", children: JSON.stringify(homepageProductSchema) },
    { type: "application/ld+json", children: JSON.stringify(homepageFAQSchema) },
  ],
}),
```

Import the schemas at the top: `import { organizationSchema, websiteSchema, homepageProductSchema, homepageFAQSchema } from '~/lib/seo-schemas'`

---

## STEP 5: Add nav links to __root.tsx

In the root layout (likely `src/routes/__root.tsx`), find the navigation section and add these links alongside the existing nav items:

```tsx
<Link to="/dog-portraits">Dog Portraits</Link>
<Link to="/cat-portraits">Cat Portraits</Link>
<Link to="/ai-pet-portraits">AI Portraits</Link>
<Link to="/about">About</Link>
```

Also update the footer to replace the `#` placeholder on Privacy and Terms:
- Change `<a href="#">Privacy</a>` to `<Link to="/privacy">Privacy</Link>`
- Change `<a href="#">Terms</a>` to `<Link to="/terms">Terms</Link>`
- Update social media links from `#` to real URLs (use placeholder URLs for now if actual URLs not known — e.g. `https://www.instagram.com/pawtoons.co`)

---

## STEP 6: Create all landing page routes

Create these 8 files. Each is a full TanStack Start route. I'll provide the content for each.

### src/routes/dog-portraits.tsx
[PASTE FULL CONTENT OF dog-portraits.tsx FROM THE ATTACHED FILES]

### src/routes/cat-portraits.tsx
[PASTE FULL CONTENT OF cat-portraits.tsx FROM THE ATTACHED FILES]

### src/routes/ai-pet-portraits.tsx
[PASTE FULL CONTENT OF ai-pet-portraits.tsx FROM THE ATTACHED FILES]

### src/routes/pet-portrait-gifts.tsx
[Extract and paste the PetPortraitGiftsPage section from remaining-landing-pages.tsx]
NOTE: Change `export const PetPortraitGiftsRoute = createFileRoute(...)` to `export const Route = createFileRoute(...)`

### src/routes/royal-pet-portraits.tsx
[Extract and paste the RoyalPetPortraitsPage section — same Route rename]

### src/routes/superhero-pet-portraits.tsx
[Extract and paste the SuperheroPetPortraitsPage section — same Route rename]

### src/routes/funny-pet-portraits.tsx
[Extract and paste the FunnyPetPortraitsPage section — same Route rename]

### src/routes/pet-memorial-portraits.tsx
[Extract and paste the PetMemorialPortraitsPage section — same Route rename]

### src/routes/about.tsx
[PASTE FULL CONTENT OF about.tsx FROM THE ATTACHED FILES]

---

## STEP 7: Create placeholder Privacy and Terms pages

Create `src/routes/privacy.tsx`:
```tsx
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy | Pawtoons" }] }),
  component: () => (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-4">Last updated: June 2026</p>
      <p className="text-gray-700 mb-4">Pawtoons (pawtoons.co) is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal data in accordance with UK GDPR.</p>
      <h2 className="text-xl font-bold mb-3 mt-6">Data We Collect</h2>
      <p className="text-gray-700 mb-4">We collect: your email address (for account creation and order delivery), photos you upload (used only to generate your portrait and deleted after processing), and payment information (processed securely by Stripe — we never see your card details).</p>
      <h2 className="text-xl font-bold mb-3 mt-6">How We Use Your Data</h2>
      <p className="text-gray-700 mb-4">Your data is used to: create your account, process your order, deliver your portrait download, and send transactional emails related to your order.</p>
      <h2 className="text-xl font-bold mb-3 mt-6">Contact</h2>
      <p className="text-gray-700">For privacy enquiries: <a href="mailto:hello@pawtoons.co" className="text-blue-600">hello@pawtoons.co</a></p>
    </main>
  ),
});
```

Create `src/routes/terms.tsx`:
```tsx
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service | Pawtoons" }] }),
  component: () => (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-4">Last updated: June 2026</p>
      <p className="text-gray-700 mb-4">By using Pawtoons (pawtoons.co), you agree to these terms.</p>
      <h2 className="text-xl font-bold mb-3 mt-6">Service</h2>
      <p className="text-gray-700 mb-4">Pawtoons provides AI-generated pet portrait digital downloads. All sales are final. Portraits are delivered as high-resolution digital files for personal use.</p>
      <h2 className="text-xl font-bold mb-3 mt-6">Regenerations</h2>
      <p className="text-gray-700 mb-4">You may regenerate your portrait up to 3 times before purchase at no additional cost.</p>
      <h2 className="text-xl font-bold mb-3 mt-6">Permitted Use</h2>
      <p className="text-gray-700 mb-4">Portraits are licensed for personal use: printing, home display, social media sharing, gifting. Commercial use (selling products featuring the portrait) requires separate permission.</p>
      <h2 className="text-xl font-bold mb-3 mt-6">Contact</h2>
      <p className="text-gray-700">Questions: <a href="mailto:hello@pawtoons.co" className="text-blue-600">hello@pawtoons.co</a></p>
    </main>
  ),
});
```

---

## STEP 8: Verify the H1 on the homepage

Open the homepage component. Find the main H1 heading (currently something like "Choose your style. Transform your pet."). Change it to:

```
Custom AI Pet Portraits — From Your Photo in 60 Seconds
```

---

## STEP 9: Add alt text to homepage images

Find all `<img>` tags in the homepage component. Add descriptive alt text to each:
- Royal portrait image: `alt="AI royal pet portrait in oil painting style — dog wearing crown"`
- Superhero portrait image: `alt="AI superhero pet portrait — dog in cape, Pixar 3D style"`
- Astronaut portrait image: `alt="AI astronaut pet portrait — cat in space suit"`
- Viking portrait image: `alt="AI viking warrior pet portrait — dog in battle armour"`
- Wizard image: `alt="AI wizard pet portrait with staff and magical robes"`
- Ballerina image: `alt="AI ballerina pet portrait in graceful dance pose"`
- Flower Crown image: `alt="AI flower crown pet portrait — boho meadow style"`

---

## STEP 10: Deploy to staging

Run:
```
npx wrangler deploy --name pawtoons-staging
```

Then verify:
1. Visit the staging URL and confirm the homepage loads
2. Check that `/dog-portraits`, `/cat-portraits`, `/ai-pet-portraits` all render
3. Check that `/robots.txt` returns the correct content
4. Check that `/sitemap.xml` returns the XML sitemap
5. View page source on homepage and confirm JSON-LD scripts are present in `<head>`

Report back what's working and what needs fixing before we deploy to production.

---

END OF PROMPT
