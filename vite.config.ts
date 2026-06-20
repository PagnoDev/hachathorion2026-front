// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// @react-pdf/renderer uses node:fs (via @react-pdf/font) which is unavailable in
// Cloudflare Workers. This plugin stubs it out only in SSR builds so the server
// bundle never imports node:fs. The client build gets the real module.
function stubReactPdfForSSR() {
  return {
    name: "stub-react-pdf-ssr",
    resolveId(id: string, _importer: string | undefined, options: { ssr?: boolean }) {
      if (options?.ssr && id === "@react-pdf/renderer") {
        return "\0@react-pdf-stub";
      }
    },
    load(id: string) {
      if (id === "\0@react-pdf-stub") {
        return [
          "export const pdf = () => ({ toBlob: () => Promise.resolve(new Blob()) });",
          "export const Document = () => null;",
          "export const Page = () => null;",
          "export const Text = () => null;",
          "export const View = () => null;",
          "export const StyleSheet = { create: s => s };",
          "export default {};",
        ].join("\n");
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: true,
  vite: {
    plugins: [stubReactPdfForSSR()],
  },
});
