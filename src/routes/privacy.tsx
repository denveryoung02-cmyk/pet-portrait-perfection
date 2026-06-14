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
