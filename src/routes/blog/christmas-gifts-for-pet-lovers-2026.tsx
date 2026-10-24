import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbSchema, schemaToString } from "@/lib/seo-schemas";

const ETSY_SHOP_URL = "https://www.etsy.com/shop/Foreverlai";

export const Route = createFileRoute("/blog/christmas-gifts-for-pet-lovers-2026")({
  head: () => ({
    meta: [
      {
        title: "15 Christmas Gift Ideas for Pet Lovers in 2026 | Pawtoons Blog",
      },
      {
        name: "description",
        content:
          "15 Christmas gift ideas for pet lovers in 2026, from cosy beds and puzzle toys to a custom pet portrait made from their own photo.",
      },
      {
        property: "og:title",
        content: "15 Christmas Gift Ideas for Pet Lovers in 2026",
      },
      {
        property: "og:description",
        content:
          "15 Christmas gift ideas for pet lovers in 2026, from cosy beds and puzzle toys to a custom pet portrait made from their own photo.",
      },
      {
        property: "og:url",
        content: "https://www.pawtoons.co/blog/christmas-gifts-for-pet-lovers-2026",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://www.pawtoons.co/og-default.jpg" },
      { name: "twitter:image", content: "https://www.pawtoons.co/og-default.jpg" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.pawtoons.co/blog/christmas-gifts-for-pet-lovers-2026",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: schemaToString(
          breadcrumbSchema([
            { name: "Blog", url: "https://www.pawtoons.co/blog" },
            {
              name: "Christmas Gifts for Pet Lovers 2026",
              url: "https://www.pawtoons.co/blog/christmas-gifts-for-pet-lovers-2026",
            },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: schemaToString({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "15 Christmas Gift Ideas for Pet Lovers in 2026",
          "description":
            "15 Christmas gift ideas for pet lovers in 2026, from cosy beds and puzzle toys to a custom pet portrait made from their own photo.",
          "author": { "@type": "Organization", "name": "Pawtoons" },
          "publisher": {
            "@type": "Organization",
            "name": "Pawtoons",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.pawtoons.co/assets/pawtoons-logo.png",
            },
          },
          "datePublished": "2026-10-24",
          "dateModified": "2026-10-24",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.pawtoons.co/blog/christmas-gifts-for-pet-lovers-2026",
          },
        }),
      },
    ],
  }),
  component: ChristmasGiftsForPetLoversPage,
});

function ChristmasGiftsForPetLoversPage() {
  const gifts = [
    {
      n: 1,
      title: "A custom pet portrait (digital)",
      desc:
        "A Pawtoons portrait is made from a photo of their pet, in styles like Oil Painting, Pixar 3D, Comic Book and Graffiti Splash. You see a watermarked preview before you pay, and it's usually ready in about a minute, so it works well as a last-minute gift. It's AI-made from the photo you upload, and you can save it, share it or print it.",
      featured: true,
      link: "/upload" as const,
      linkText: "Create a Pawtoons portrait",
    },
    {
      n: 2,
      title: "A personalised pet mug",
      desc:
        "Foreverlai, our partner Etsy shop, offers Pawtoons Christmas Portraits on a mug. Choose a festive look such as Santa Pet, Reindeer Pet or Cosy Jumper Pet, and it's made from your own pet photo. The portrait is AI-assisted and the mug is printed to order by a production partner.",
      etsy: true,
    },
    {
      n: 3,
      title: "A pet portrait canvas",
      desc:
        "The same festive looks are also available on a canvas, for people who want something to hang on the wall. It's made from your photo.",
      etsy: true,
    },
    {
      n: 4,
      title: "A pet portrait tote bag",
      desc:
        "A tote bag with your pet's festive portrait on it is useful all year: dog walks, shopping, carrying presents. It's also on the Foreverlai Etsy shop, made from your photo.",
      etsy: true,
    },
    {
      n: 5,
      title: "A cosy pet bed",
      desc: "Cats and dogs both appreciate a soft, warm place of their own. Pick a size that suits how they actually sleep (stretched out or curled up), and a cover you can take off and wash.",
    },
    {
      n: 6,
      title: "A puzzle feeder or treat toy",
      desc: "Puzzle toys make mealtime a game and keep clever pets busy on a wet afternoon. Choose a difficulty that suits them, so it's fun rather than frustrating.",
    },
    {
      n: 7,
      title: "A new lead and harness set",
      desc: "A comfortable, well-fitting harness is a gift both the dog and the person on the other end of the lead will notice. Check the sizing guide before buying, and add a festive bandana if you like.",
    },
    {
      n: 8,
      title: "A pet-safe treat box",
      desc: "Treats are a safe bet for most pets. Check the ingredients suit their size, age and any dietary needs, and ask their vet if you're not sure what's right for them.",
    },
    {
      n: 9,
      title: "A scratching post or cat tree",
      desc: "For cat people, a sturdy scratching post saves the sofa and gives their cat somewhere high to watch the world. Look for something stable, and tall enough for a full stretch.",
    },
    {
      n: 10,
      title: "A grooming kit",
      desc: "A good brush and a few grooming basics make coat care easier and give you a bit of bonding time too. Match the brush to their coat type: short, long or double.",
    },
    {
      n: 11,
      title: "A cosy blanket for the sofa",
      desc: "A soft washable blanket keeps pet hair off the furniture and gives their favourite spot a bit of extra comfort. It's an easy gift for almost any pet owner.",
    },
    {
      n: 12,
      title: "A pet photo calendar or album",
      desc: "Pick out the best photos from the year and turn them into a calendar or photo book. It's a simple gift that gets a smile every time someone opens it.",
    },
    {
      n: 13,
      title: "A pet first-aid kit",
      desc: "Not the most glamorous present, but a thoughtful one. A small kit for the cupboard or the car gives a pet owner peace of mind. Check what's inside suits their type of pet.",
    },
    {
      n: 14,
      title: "A donation to an animal charity in their pet's name",
      desc: "For the person who has everything, a donation to a local rescue or animal charity in their pet's name is a kind gift that helps animals who need it. Check the charity is registered and what the money goes towards.",
    },
    {
      n: 15,
      title: "A Christmas stocking for the pet",
      desc: "A stocking with a couple of treats, a new toy and a little something wrapped for them is cheap, cheerful, and gets the whole family involved on Christmas morning.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog/">Blog</Link>
          <span className="mx-2">/</span>
          <span>Christmas Gifts for Pet Lovers 2026</span>
        </nav>
        <p className="text-sm text-gray-500 mb-2">Updated October 2026 · 4 min read</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          15 Christmas Gift Ideas for Pet Lovers in 2026
        </h1>
      </section>

      {/* Intro */}
      <section className="px-4 max-w-3xl mx-auto pb-8">
        <p className="text-gray-700">
          Shopping for someone whose pet is basically family? You're in the
          right place. Here are 15 Christmas gift ideas for dog, cat and
          all-round animal lovers, from practical bits and pieces to something
          truly personal. Some are on the quick side too, for anyone who has
          left it a bit late.
        </p>
      </section>

      {/* Gift list */}
      <section className="px-4 max-w-3xl mx-auto pb-12">
        <div className="space-y-4">
          {gifts.map((gift) => (
            <div
              key={gift.n}
              className={`rounded-2xl p-5 border ${
                gift.featured
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <h2 className="font-bold text-lg mb-2">
                {gift.n}. {gift.title}
              </h2>
              <p className="text-gray-600 text-sm mb-2">{gift.desc}</p>
              {gift.link && (
                <Link
                  to={gift.link}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  {gift.linkText}
                </Link>
              )}
              {gift.etsy && (
                <a
                  href={ETSY_SHOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Foreverlai Etsy shop
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Picking the right gift */}
      <section className="px-4 max-w-3xl mx-auto py-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Picking the right gift</h2>
          <p className="text-gray-700 mb-4">
            If you're not sure, think about what the pet owner does with their
            pet every day, and pick something that fits. For something truly
            personal, a portrait made from their own pet's photo is hard to
            beat.
          </p>
          <p className="text-gray-700">
            <Link
              to="/upload"
              className="font-semibold text-blue-600 hover:underline"
            >
              Create a Pawtoons portrait
            </Link>{" "}
            or see the festive mug, canvas and tote ideas in the{" "}
            <a
              href={ETSY_SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline"
            >
              Foreverlai Etsy shop
            </a>
            .
          </p>
        </div>
      </section>

      {/* Internal links */}
      <section className="px-4 max-w-4xl mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-6">More from Pawtoons</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/pet-portrait-gifts" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🎁 All Pet Portrait Gifts</Link>
          <Link to="/blog/best-gifts-for-dog-lovers-2026" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐶 Gifts for Dog Lovers</Link>
          <Link to="/blog/best-gifts-for-cat-lovers-2026" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">🐱 Gifts for Cat Lovers</Link>
          <Link to="/blog/complete-guide-to-ai-pet-portraits" className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow transition">✨ AI Pet Portrait Guide</Link>
        </div>
      </section>
    </main>
  );
}
