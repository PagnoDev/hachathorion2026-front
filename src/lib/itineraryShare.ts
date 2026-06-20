import { createServerFn } from "@tanstack/react-start";

interface PdfEntry {
  base64: string;
  filename: string;
  expiresAt: number;
}

// Persists within a single server instance/isolate (48 h TTL).
const store = new Map<string, PdfEntry>();

function cleanup() {
  const now = Date.now();
  for (const [id, e] of store) if (e.expiresAt < now) store.delete(id);
}

export const savePDF = createServerFn({ method: "POST" })
  .validator((data: { base64: string; filename: string }) => data)
  .handler(async ({ data }) => {
    cleanup();
    const id = crypto.randomUUID().slice(0, 8);
    store.set(id, { ...data, expiresAt: Date.now() + 48 * 60 * 60 * 1000 });
    return id;
  });

export const loadPDF = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const entry = store.get(id);
    if (!entry || entry.expiresAt < Date.now()) { store.delete(id); return null; }
    return { base64: entry.base64, filename: entry.filename };
  });
