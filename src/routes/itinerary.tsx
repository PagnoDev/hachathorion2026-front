import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Compass, FileDown, Loader2, Share2, Sparkles } from "lucide-react";
import { loadItinerary } from "@/lib/itineraryStore";
import { savePDF } from "@/lib/itineraryShare";
import { ItineraryCard } from "@/components/ItineraryCard";
import { CATEGORY_LABELS } from "@/data/mockData";
import { resolveMapUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  EntryPreference,
  GeneratedItineraryResult,
  TravelReason,
} from "@/types/tourism";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Seu roteiro — ExploraiLages" },
      {
        name: "description",
        content: "Seu roteiro personalizado dia a dia para Lages, SC.",
      },
    ],
  }),
  component: ItineraryPage,
});

const TRAVEL_REASON_LABEL: Record<TravelReason, string> = {
  leisure: "Lazer",
  work: "Trabalho",
  familyVisit: "Visita à família",
  events: "Eventos",
  passingThrough: "De passagem",
};

const ENTRY_LABEL: Record<EntryPreference, string> = {
  free: "Gratuito",
  paid: "Pago",
  both: "Ambos",
};

function buildWhatsAppText(result: GeneratedItineraryResult, shareUrl: string): string {
  const { request, itinerary } = result;
  const reason = TRAVEL_REASON_LABEL[request.travelReason as TravelReason] ?? request.travelReason;

  const lines: string[] = [
    `🗺️ *Roteiro em Lages - SC*`,
    `📅 ${request.arrivalDate} → ${request.departureDate} · ${reason}`,
    "",
  ];

  for (const day of itinerary.days) {
    const dateLabel = new Date(day.date).toLocaleDateString("pt-BR", {
      weekday: "long", month: "long", day: "numeric",
    });
    lines.push(`*Dia ${day.dayNumber} · ${dateLabel}*`);
    lines.push("");

    for (const item of day.items) {
      const typeLabel = item.placeType === "attraction" ? "Atração" : "Evento";
      const timePart = item.suggestedTime ? `🕐 ${item.suggestedTime} · ` : "";
      lines.push(`${timePart}*${item.name}* (${typeLabel})`);
      lines.push(`📍 ${item.location.address}, ${item.location.city}/${item.location.state}`);
      const itemMapUrl = resolveMapUrl(item.location);
      if (itemMapUrl) lines.push(`🔗 ${itemMapUrl}`);
      lines.push("");
    }
  }

  lines.push("📄 Baixar roteiro em PDF:");
  lines.push(shareUrl);
  lines.push("");
  lines.push("_Gerado por ExploraiLages_ 🌿");
  return lines.join("\n");
}

function ItineraryPage() {
  const [result, setResult] = useState<GeneratedItineraryResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setResult(loadItinerary());
  }, []);

  async function handleExport() {
    if (!result) return;
    setExporting(true);
    try {
      const { downloadItineraryPDF } = await import("@/components/ItineraryPDF.ts");
      await downloadItineraryPDF(result);
    } finally {
      setExporting(false);
    }
  }

  async function sendToWhatsApp() {
    if (!result) return;
    setSending(true);
    try {
      const { generateItineraryPDFBlob } = await import("@/components/ItineraryPDF.ts");
      const blob = await generateItineraryPDFBlob(result);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const filename = `roteiro-lages-${result.request.arrivalDate}.pdf`;
      const id = await savePDF({ data: { base64, filename } });
      const shareUrl = `${window.location.origin}/share?id=${id}`;
      const text = buildWhatsAppText(result, shareUrl);
      const digits = phone.replace(/\D/g, "");
      const waUrl = digits
        ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noreferrer");
      setWhatsappOpen(false);
      setPhone("");
    } finally {
      setSending(false);
    }
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Nenhum roteiro ainda</h1>
        <p className="mt-2 text-muted-foreground">
          Preencha o filtro de preferências para gerar sua viagem personalizada.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Começar a planejar
        </Link>
      </div>
    );
  }

  const { request, itinerary } = result;
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar aos filtros
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Compass className="h-4 w-4" /> Explorar mais atrativos
            </Link>
            <button
              onClick={() => setWhatsappOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ebe5d]"
            >
              <Share2 className="h-4 w-4" /> WhatsApp
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {exporting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
                : <><FileDown className="h-4 w-4" /> Exportar PDF</>
              }
            </button>
          </div>
        </div>

        <header className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sua viagem a Lages
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gerado em{" "}
            {new Date(itinerary.generatedAt).toLocaleString("pt-BR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </header>

        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-secondary/50 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Motivo da viagem" value={TRAVEL_REASON_LABEL[request.travelReason]} />
          <Summary label="Preferência de entrada" value={ENTRY_LABEL[request.entryPreference]} />
          <Summary label="Estadia" value={`${request.arrivalDate} → ${request.departureDate}`} />
          <Summary
            label="Categorias"
            value={request.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}
          />
        </div>

        <div className="mt-8 space-y-10">
          {itinerary.days.map((day) => (
            <section key={day.dayNumber}>
              <div className="mb-4 flex items-baseline justify-between gap-2 border-b border-border pb-2">
                <h2 className="text-xl font-semibold">
                  Dia {day.dayNumber} ·{" "}
                  <span className="text-muted-foreground font-normal">
                    {new Date(day.date).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </h2>
                <span className="text-xs text-muted-foreground">
                  {day.items.length} parada{day.items.length === 1 ? "" : "s"}
                </span>
              </div>
              {day.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem sugestões para este dia com seus filtros.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {day.items.map((item) => (
                    <ItineraryCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <Dialog open={whatsappOpen} onOpenChange={(open) => { setWhatsappOpen(open); if (!open) setPhone(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar no WhatsApp</DialogTitle>
            <DialogDescription>
              Informe o número para receber o roteiro com o link de visualização e PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp-phone">Número de WhatsApp</Label>
            <Input
              id="whatsapp-phone"
              type="tel"
              placeholder="+55 47 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !sending) sendToWhatsApp(); }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Inclua o código do país (+55 para Brasil). Deixe em branco para escolher o contato no WhatsApp.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => { setWhatsappOpen(false); setPhone(""); }}
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={sendToWhatsApp}
              disabled={sending}
              className="inline-flex items-center gap-1.5 justify-center rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ebe5d] disabled:opacity-60"
            >
              {sending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparando…</>
                : <><Share2 className="h-4 w-4" /> Compartilhar</>
              }
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
