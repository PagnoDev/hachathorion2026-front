import { storePdf } from "../../utils/pdfStore";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ data: string; filename: string }>(event);
  if (!body?.data) throw createError({ statusCode: 400, message: "Missing PDF data" });

  const binary = atob(body.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const filename = body.filename || "roteiro-lages.pdf";
  const id = storePdf(bytes, filename);

  return { id };
});
