interface PdfEntry {
  bytes: Uint8Array;
  filename: string;
  expiresAt: number;
}

const store = new Map<string, PdfEntry>();

const TTL_MS = 24 * 60 * 60 * 1000; // 24h

function cleanup() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) store.delete(id);
  }
}

export function storePdf(bytes: Uint8Array, filename: string): string {
  cleanup();
  const id = crypto.randomUUID();
  store.set(id, { bytes, filename, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function getPdf(id: string): PdfEntry | undefined {
  const entry = store.get(id);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) { store.delete(id); return undefined; }
  return entry;
}
