import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  cloudflare: false, // disable Lovable's build-only cloudflare; we register it below for both serve + build
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [cloudflare({ viteEnvironment: { name: "ssr" } })],
  },
});
