import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Compass, FileDown, Loader2, Sparkles } from "lucide-react";
import { loadItinerary } from "@/lib/itineraryStore";
import { ItineraryCard } from "@/components/ItineraryCard";
import { CATEGORY_LABELS } from "@/data/mockData";
import type {
  EntryPreference,
  GeneratedItineraryResult,
  TravelReason,
} from "@/types/tourism";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Seu roteiro — Lages Smart Tourism" },
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

function ItineraryPage() {
  const [result, setResult] = useState<GeneratedItineraryResult | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setResult(loadItinerary());
  }, []);

  async function handleExport() {
    if (!result) return;
    setExporting(true);
    try {
      const { downloadItineraryPDF } = await import("@/components/ItineraryPDF");
      await downloadItineraryPDF(result);
    } finally {
      setExporting(false);
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

      {/* Summary */}
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
