import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { CATEGORIES, CATEGORY_LABELS } from "@/data/mockData";
import { getEventCalendar } from "@/services/api";
import type {
  EntryPreference,
  EventCalendarDto,
  TourismCategory,
} from "@/types/tourism";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Eventos em Lages — ExploraiLages" },
      {
        name: "description",
        content: "Veja o calendário mensal de eventos culturais e turísticos em Lages, SC.",
      },
    ],
  }),
  component: EventsPage,
});

const ENTRY_LABELS: Record<EntryPreference, string> = {
  free: "Gratuito",
  paid: "Pago",
  both: "Ambos",
};

function EventsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendar, setCalendar] = useState<EventCalendarDto | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [cats, setCats] = useState<TourismCategory[]>([]);
  const [entry, setEntry] = useState<EntryPreference>("both");

  useEffect(() => {
    let alive = true;
    getEventCalendar(year, month).then((c) => alive && setCalendar(c));
    return () => {
      alive = false;
    };
  }, [year, month]);

  const events = useMemo(() => {
    if (!calendar) return [];
    return calendar.events.filter((e) => {
      if (entry !== "both" && e.price.entryType !== entry) return false;
      if (cats.length && !e.categories.some((c) => cats.includes(c.slug)))
        return false;
      if (selectedDay) {
        const s = new Date(e.startDateTime).toISOString().slice(0, 10);
        const en = (e.endDateTime
          ? new Date(e.endDateTime)
          : new Date(e.startDateTime))
          .toISOString()
          .slice(0, 10);
        if (!(selectedDay >= s && selectedDay <= en)) return false;
      }
      return true;
    });
  }, [calendar, entry, cats, selectedDay]);

  function navMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
    setSelectedDay(null);
  }

  function toggleCat(slug: TourismCategory) {
    setCats((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));
  }

  const monthName = new Date(year, month - 1, 1).toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Eventos em Lages
        </h1>
        <p className="mt-2 text-muted-foreground">
          Festivais, música e momentos culturais por toda a Serra Catarinense.
        </p>
      </header>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold mr-1">Entrada:</span>
          {(["free", "paid", "both"] as EntryPreference[]).map((e) => (
            <button
              key={e}
              onClick={() => setEntry(e)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                entry === e
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              {ENTRY_LABELS[e]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold mr-1">Categorias:</span>
          {CATEGORIES.map((c) => {
            const active = cats.includes(c.slug);
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.slug)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {CATEGORY_LABELS[c.slug]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Calendar */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <button
              aria-label="Mês anterior"
              onClick={() => navMonth(-1)}
              className="rounded-full p-2 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
            <button
              aria-label="Próximo mês"
              onClick={() => navMonth(1)}
              className="rounded-full p-2 hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} className="py-2">{d}</div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {calendar?.days.map((d) => {
              const dayNum = Number(d.date.slice(-2));
              const isSelected = selectedDay === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() =>
                    setSelectedDay(isSelected ? null : d.date)
                  }
                  className={`relative aspect-square rounded-lg text-sm font-medium transition ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : d.hasEvents
                        ? "bg-accent hover:bg-accent/80"
                        : "hover:bg-secondary"
                  }`}
                >
                  {dayNum}
                  {d.hasEvents && (
                    <div className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
                      {d.colors.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Limpar filtro do dia ({selectedDay})
            </button>
          )}
        </div>

        {/* Event list */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {events.length} evento{events.length === 1 ? "" : "s"} encontrado{events.length === 1 ? "" : "s"}
          </div>
          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center text-muted-foreground">
              Nenhum evento corresponde aos seus filtros.
            </div>
          ) : (
            events.map((e) => <EventCard key={e.id} e={e} />)
          )}
        </div>
      </div>
    </div>
  );
}
