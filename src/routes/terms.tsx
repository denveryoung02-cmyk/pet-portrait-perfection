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
