import { createServerFn } from "@tanstack/react-start";

interface PdfEntry {
  base64: string;
  filename: string;
  expiresAt: number;
}

// Dev fallback: in-memory Map (works fine in a single Node.js process).
// In production (Cloudflare Workers) requests can hit different isolates,
// so this is replaced by an HTTP call to the Railway backend via URL_PROD.
const localStore = new Map<string, PdfEntry>();
const TTL_MS = 48 * 60 * 60 * 1000;

function localCleanup() {
  const now = Date.now();
  for (const [id, e] of localStore) if (e.expiresAt < now) localStore.delete(id);
}

export const savePDF = createServerFn({ method: "POST" })
  .validator((data: { base64: string; filename: string }) => data)
  .handler(async ({ data }) => {
    const prodUrl = process.env.URL_PROD;

    if (prodUrl) {
      const res = await fetch(`${prodUrl}/api/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Backend falhou ao salvar o PDF");
      const { id } = (await res.json()) as { id: string };
      return id;
    }

    // Local dev fallback
    localCleanup();
    const id = crypto.randomUUID().slice(0, 8);
    localStore.set(id, { ...data, expiresAt: Date.now() + TTL_MS });
    return id;
  });

export const loadPDF = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const prodUrl = process.env.URL_PROD;

    if (prodUrl) {
      const res = await fetch(`${prodUrl}/api/pdf/${id}`);
      if (!res.ok) return null;
      return (await res.json()) as { base64: string; filename: string };
    }

    // Local dev fallback
    const entry = localStore.get(id);
    if (!entry || entry.expiresAt < Date.now()) {
      localStore.delete(id);
      return null;
    }
    return { base64: entry.base64, filename: entry.filename };
  });
