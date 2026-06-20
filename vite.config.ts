// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";

const PDF_STUB_PATH = path.resolve("./src/lib/pdf-stub.ts");
const REAL_REACT_PDF_PATH = path.resolve(
  "./node_modules/@react-pdf/renderer/lib/react-pdf.js"
);

// nitro.alias bleeds into Vite's aliasPlugin (which runs before user plugins, even enforce:'pre').
// After the alias redirects @react-pdf/renderer → PDF_STUB_PATH, Vite calls this.resolve(PDF_STUB_PATH).
// This plugin intercepts THAT secondary call and, for non-SSR (browser) builds, redirects back
// to the real module so PDF generation works on the client.
function restoreReactPdfForClient() {
  return {
    name: "restore-react-pdf-client",
    resolveId(
      id: string,
      _importer: string | undefined,
      options: { ssr?: boolean }
    ) {
      if (!options?.ssr && id === PDF_STUB_PATH) {
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
    // Stubs @react-pdf/renderer in the CF Worker — @react-pdf/font imports node:fs
    // which is unavailable in CF Workers. The real module is only needed in the browser.
    alias: {
      "@react-pdf/renderer": PDF_STUB_PATH,
    },
  },
  vite: {
    plugins: [restoreReactPdfForClient()],
  },
});
