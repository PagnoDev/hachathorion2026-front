// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";

const PDF_STUB_PATH = path.resolve("./src/lib/pdf-stub.ts");
// nitro.alias bleeds into Vite via the Lovable wrapper, causing client builds to use the stub
// (0-byte PDFs). This pre-plugin short-circuits the alias for non-SSR (browser) builds by
// returning the real module path before the alias resolver runs.
const REAL_REACT_PDF_PATH = path.resolve(
  "./node_modules/@react-pdf/renderer/lib/react-pdf.js"
);

function realReactPdfForClient() {
  return {
    name: "real-react-pdf-client",
    enforce: "pre" as const,
    resolveId(
      id: string,
      _importer: string | undefined,
      options: { ssr?: boolean }
    ) {
      if (!options?.ssr && id === "@react-pdf/renderer") {
        return REAL_REACT_PDF_PATH;
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // Stubs @react-pdf/renderer in the CF Worker bundle — @react-pdf/font imports node:fs
    // which doesn't exist in CF Workers. The real module is only needed in the browser.
    alias: {
      "@react-pdf/renderer": PDF_STUB_PATH,
    },
  },
  vite: {
    plugins: [realReactPdfForClient()],
  },
});
