// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const REACT_PDF_STUB = [
  "export const pdf = () => ({ toBlob: () => Promise.resolve(new Blob()) });",
  "export const Document = () => null;",
  "export const Page = () => null;",
  "export const Text = () => null;",
  "export const View = () => null;",
  "export const StyleSheet = { create: s => s };",
  "export default {};",
].join("\n");

// Applied only to Nitro's Rollup build (server/Worker) — does NOT affect the Vite
// client bundle. Stubs @react-pdf/* and fontkit so node:fs is never imported.
const stubReactPdfNitro = {
  name: "stub-react-pdf-nitro",
  resolveId(id: string) {
    if (id.startsWith("@react-pdf/") || id === "fontkit") {
      return "\0@react-pdf-stub";
    }
  },
  load(id: string) {
    if (id === "\0@react-pdf-stub") return REACT_PDF_STUB;
  },
};

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    rollupConfig: {
      plugins: [stubReactPdfNitro],
    },
  },
});
