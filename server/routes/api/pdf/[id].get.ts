import { getPdf } from "../../../utils/pdfStore";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id") ?? "";
  const entry = getPdf(id);

  if (!entry) throw createError({ statusCode: 404, message: "PDF não encontrado ou expirado" });

  setResponseHeaders(event, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${entry.filename}"`,
    "Content-Length": String(entry.bytes.length),
    "Cache-Control": "private, max-age=86400",
  });

  return entry.bytes;
});
