import type { GeneratedItineraryResult, ItineraryItemDto } from "@/types/tourism";
import { CATEGORY_LABELS } from "@/data/mockData";
import { resolveMapUrl } from "@/lib/utils";

const TRAVEL_REASON_LABEL: Record<string, string> = {
  leisure: "Lazer",
  work: "Trabalho",
  familyVisit: "Visita à família",
  events: "Eventos",
  passingThrough: "De passagem",
};

const ENTRY_LABEL: Record<string, string> = {
  free: "Gratuito",
  paid: "Pago",
  both: "Ambos",
};

const TYPE_LABEL: Record<string, string> = {
  attraction: "Atração",
  event: "Evento",
};

const C = {
  green:      "#2d7a4f",
  lightGreen: "#e8f5ee",
  gray:       "#6b7280",
  dark:       "#111827",
  border:     "#e5e7eb",
  alertBg:    "#e0f2fe",
  alertText:  "#0369a1",
  cardBg:     "#fafafa",
};

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildDoc(result: GeneratedItineraryResult): Promise<any> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = 210;
  const PH = 297;
  const M = 15;
  const CW = PW - M * 2;
  const MAX_Y = PH - M - 14;

  const pos = { y: M };
  const { request, itinerary } = result;

  const tc = (h: string) => { const [r,g,b] = hexToRgb(h); doc.setTextColor(r, g, b); };
  const fc = (h: string) => { const [r,g,b] = hexToRgb(h); doc.setFillColor(r, g, b); };
  const dc = (h: string) => { const [r,g,b] = hexToRgb(h); doc.setDrawColor(r, g, b); };

  function line(color: string, x1: number, y1: number, x2: number, y2: number, w = 0.2) {
    dc(color); doc.setLineWidth(w); doc.line(x1, y1, x2, y2);
  }

  function continuationHeader() {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); tc(C.green);
    doc.text("ExploraiLages", M, M - 2);
    line(C.border, M, M, PW - M, M);
  }

  function checkPage(need: number) {
    if (pos.y + need > MAX_Y) {
      doc.addPage();
      continuationHeader();
      pos.y = M + 5;
    }
  }

  function renderItem(item: ItineraryItemDto) {
    const PAD = 3;
    const LABEL_W = 22;
    const VAL_W = CW - PAD * 2 - LABEL_W;

    const hasTime  = !!item.suggestedTime;
    const hasCats  = item.categories.length > 0;
    const hasAlert = !!item.weatherAlert;

    const addrLines = doc.splitTextToSize(String(item.location.address ?? ""), VAL_W).length;

    const cardH =
      PAD * 2 +
      (hasTime  ? 4   : 0) +
      5 +
      (hasCats  ? 5   : 0) +
      Math.max(1, addrLines) * 4 +
      3 * 4 +
      (hasAlert ? 9   : 0);

    checkPage(cardH + 3);

    const startY = pos.y;

    fc(C.cardBg); dc(C.border); doc.setLineWidth(0.2);
    doc.roundedRect(M, startY, CW, cardH, 2, 2, "FD");

    let cy = startY + PAD + 3;

    if (hasTime) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); tc(C.green);
      doc.text(item.suggestedTime!, M + PAD, cy);
      cy += 4;
    }

    doc.setFont("helvetica", "bold"); doc.setFontSize(10); tc(C.dark);
    doc.text(item.name, M + PAD, cy);
    const nameW = doc.getTextWidth(item.name);
    const typeStr = ` · ${TYPE_LABEL[item.placeType] ?? item.placeType}`;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); tc(C.gray);
    if (M + PAD + nameW + doc.getTextWidth(typeStr) < PW - M - PAD) {
      doc.text(typeStr, M + PAD + nameW, cy);
    }
    cy += 5;

    if (hasCats) {
      let bx = M + PAD;
      doc.setFontSize(6);
      for (const cat of item.categories.slice(0, 4)) {
        const label = CATEGORY_LABELS[cat.slug] ?? cat.name;
        const tw = doc.getTextWidth(label);
        const bw = tw + 4;
        if (bx + bw > PW - M - PAD) break;
        fc(C.lightGreen); dc(C.lightGreen);
        doc.roundedRect(bx, cy - 3, bw, 4.5, 1, 1, "F");
        doc.setFont("helvetica", "normal"); tc(C.green);
        doc.text(label, bx + 2, cy);
        bx += bw + 2;
      }
      cy += 5;
    }

    const rows: { label: string; value: string | null | undefined; url?: string | null }[] = [
      { label: "Endereço",   value: item.location.address, url: resolveMapUrl(item.location) },
      { label: "Horário",    value: item.openingHoursText },
      { label: "Entrada",    value: item.price.entryType === "free" ? "Gratuita" : item.price.description },
      { label: "Distância",  value: item.distanceText },
    ];

    for (const row of rows) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); tc(C.gray);
      doc.text(row.label, M + PAD, cy);
      tc(C.dark);
      const firstLine = doc.splitTextToSize(String(row.value ?? ""), VAL_W)[0] ?? "";
      doc.text(firstLine, M + PAD + LABEL_W, cy);
      if (row.url) {
        const textW = doc.getTextWidth(firstLine);
        doc.link(M + PAD + LABEL_W, cy - 3, textW, 4, { url: row.url });
      }
      cy += 4;
    }

    if (hasAlert && item.weatherAlert) {
      cy += 1;
      fc(C.alertBg); dc(C.alertBg);
      doc.roundedRect(M + PAD, cy - 2.5, CW - PAD * 2, 7, 1, 1, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); tc(C.alertText);
      const alertLine = doc.splitTextToSize(item.weatherAlert, CW - PAD * 2 - 4)[0] ?? "";
      doc.text(alertLine, M + PAD + 2, cy + 2);
    }

    pos.y = startY + cardH + 3;
  }

  // ---- first-page header ----
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); tc(C.green);
  doc.text("ExploraiLages", M, pos.y + 6);

  const genDate = new Date(itinerary.generatedAt).toLocaleString("pt-BR", {
    dateStyle: "medium", timeStyle: "short",
  });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); tc(C.gray);
  doc.text(genDate, PW - M, pos.y + 2, { align: "right" });
  doc.text("Serra Catarinense · Brasil", M, pos.y + 11);

  pos.y += 15;
  line(C.green, M, pos.y, PW - M, pos.y, 0.5);
  pos.y += 7;

  // ---- summary box ----
  const summaryItems = [
    { label: "MOTIVO DA VIAGEM", value: TRAVEL_REASON_LABEL[request.travelReason] ?? request.travelReason },
    { label: "ENTRADA",          value: ENTRY_LABEL[request.entryPreference] ?? request.entryPreference },
    { label: "ESTADIA",          value: `${request.arrivalDate} → ${request.departureDate}` },
    { label: "CATEGORIAS",       value: request.categories.map(c => CATEGORY_LABELS[c] ?? c).join(", ") },
  ];

  const BOX_H = 18;
  fc(C.lightGreen); dc(C.lightGreen);
  doc.roundedRect(M, pos.y, CW, BOX_H, 3, 3, "F");

  const colW = CW / 4;
  summaryItems.forEach((item, i) => {
    const cx = M + i * colW + 3;
    doc.setFont("helvetica", "normal"); doc.setFontSize(6); tc(C.gray);
    doc.text(item.label, cx, pos.y + 5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); tc(C.dark);
    const val = doc.splitTextToSize(item.value, colW - 6)[0] ?? item.value;
    doc.text(val, cx, pos.y + 12);
  });

  pos.y += BOX_H + 7;

  // ---- days ----
  for (const day of itinerary.days) {
    checkPage(22);

    const dateLabel = new Date(day.date).toLocaleDateString("pt-BR", {
      weekday: "long", month: "long", day: "numeric",
    });

    doc.setFont("helvetica", "bold"); doc.setFontSize(11); tc(C.dark);
    doc.text(`Dia ${day.dayNumber} · ${dateLabel}`, M, pos.y + 5);

    doc.setFont("helvetica", "normal"); doc.setFontSize(7); tc(C.gray);
    doc.text(
      `${day.items.length} parada${day.items.length !== 1 ? "s" : ""}`,
      PW - M, pos.y + 5, { align: "right" }
    );

    pos.y += 7;
    line(C.border, M, pos.y, PW - M, pos.y);
    pos.y += 5;

    for (const item of day.items) renderItem(item);

    pos.y += 3;
  }

  // ---- footers ----
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = PH - M - 2;
    line(C.border, M, fy - 4, PW - M, fy - 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6); tc(C.gray);
    doc.text("ExploraiLages — lagessmarthourism.app", M, fy);
    doc.text(`${p} / ${totalPages}`, PW - M, fy, { align: "right" });
  }

  return doc;
}

export async function downloadItineraryPDF(result: GeneratedItineraryResult) {
  const doc = await buildDoc(result);
  doc.save(`roteiro-lages-${result.request.arrivalDate}.pdf`);
}

export async function generateItineraryPDFBlob(result: GeneratedItineraryResult): Promise<Blob> {
  const doc = await buildDoc(result);
  return doc.output("blob") as Blob;
}
