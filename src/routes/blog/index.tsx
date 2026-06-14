import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Pawtoons" },
      {
        name: "description",
        content:
          "Guides, tips, and ideas for AI pet portrait lovers. Learn how to get the best results, choose the right style, and make the most of your Pawtoons portrait.",
      },
      { property: "og:title", content: "Blog | Pawtoons" },
      { property: "og:url", content: "https://www.pawtoons.co/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.pawtoons.co/blog" }],
  }),
  component: BlogIndexPage,
});

const posts = [
  {
    to: "/blog/best-gifts-for-dog-lovers-2026" as const,
    title: "21 Best Gifts for Dog Lovers in 2026",
    excerpt:
      "From deeply personal to wonderfully practical — 21 gift ideas for the dog lover in your life, across every budget.",
    date: "June 2026",
    readTime: "8 min read",
  },
  {
    to: "/blog/best-gifts-for-cat-lovers-2026" as const,
    title: "21 Best Gifts for Cat Lovers in 2026",
    excerpt:
      "From deeply personal to wonderfully practical — 21 gift ideas for the cat lover (and the cat) in your life, across every budget.",
    date: "June 2026",
    readTime: "8 min read",
  },
  {
    to: "/blog/complete-guide-to-ai-pet-portraits" as const,
    title: "The Complete Guide to AI Pet Portraits (2026)",
    excerpt:
      "Everything you need to know about turning your pet's photo into stunning AI artwork — how it works, what it costs, and how to get a result you'll actually want to frame.",
    date: "June 2026",
    readTime: "9 min read",
  },
];

function BlogIndexPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <span>Blog</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Pawtoons Blog</h1>
        <p className="text-xl text-gray-600">
          Guides and ideas for AI pet portrait lovers.
        </p>
      </section>

      <section className="px-4 max-w-3xl mx-auto pb-20">
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.to}
              to={post.to}
              className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
            >
              <p className="text-xs text-gray-400 mb-2">
                {post.date} · {post.readTime}
              </p>
              <h2 className="text-xl font-bold mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {post.excerpt}
              </p>
              <span className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline">
                Read article →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
