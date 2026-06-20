import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Compass,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS } from "@/data/mockData";
import { generateItinerary } from "@/services/api";
import { saveItinerary } from "@/lib/itineraryStore";
import { fetchWeatherForecast, getWeatherAlert } from "@/lib/weatherService";
import type {
  EntryPreference,
  GenerateItineraryRequest,
  TourismCategory,
  TravelReason,
} from "@/types/tourism";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planeje sua viagem a Lages — ExploraiLages" },
      {
        name: "description",
        content:
          "Monte um roteiro personalizado para Lages, SC com base no seu estilo de viagem, datas e local de hospedagem.",
      },
      { property: "og:title", content: "Planeje sua viagem a Lages" },
      {
        property: "og:description",
        content:
          "Monte um roteiro personalizado para Lages, SC com base no seu estilo de viagem e datas.",
      },
    ],
  }),
  component: HomePage,
});

const TRAVEL_REASONS: { value: TravelReason; label: string }[] = [
  { value: "leisure", label: "Lazer" },
  { value: "work", label: "Trabalho" },
  { value: "familyVisit", label: "Visita à família" },
  { value: "events", label: "Eventos" },
  { value: "passingThrough", label: "De passagem" },
];

const ENTRY_PREFS: { value: EntryPreference; label: string }[] = [
  { value: "free", label: "Gratuito" },
  { value: "paid", label: "Pago" },
  { value: "both", label: "Ambos" },
];

function HomePage() {
  const navigate = useNavigate();
  const [reason, setReason] = useState<TravelReason>("leisure");
  const [selectedCats, setSelectedCats] = useState<TourismCategory[]>([
    "nature",
    "gastronomy",
  ]);
  const [entry, setEntry] = useState<EntryPreference>("both");
  const [lodgingName, setLodgingName] = useState("");
  const [lodgingAddress, setLodgingAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [arrival, setArrival] = useState(today);
  const [departure, setDeparture] = useState(tomorrow);
  const [termsOpen, setTermsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = useMemo(() => {
    if (!lodgingAddress.trim()) return false;
    if (selectedCats.length === 0) return false;
    if (!arrival || !departure) return false;
    if (new Date(departure) < new Date(arrival)) return false;
    return true;
  }, [lodgingAddress, selectedCats, arrival, departure]);

  function toggleCategory(slug: TourismCategory) {
    setSelectedCats((cur) =>
      cur.includes(slug) ? cur.filter((c) => c !== slug) : [...cur, slug],
    );
  }

  async function handleAccept() {
    setAccepted(true);
    setLoading(true);
    const req: GenerateItineraryRequest = {
      travelReason: reason,
      categories: selectedCats,
      entryPreference: entry,
      lodgingLocation: {
        name: lodgingName || "Minha hospedagem",
        address: lodgingAddress,
        neighborhood: neighborhood || null,
        city: "Lages",
        state: "SC",
        latitude: -27.8159,
        longitude: -50.3261,
        mapUrl: null,
      },
      arrivalDate: arrival,
      departureDate: departure,
    };
    const itinerary = await generateItinerary(req);

    try {
      const lat = req.lodgingLocation.latitude ?? -27.8159;
      const lng = req.lodgingLocation.longitude ?? -50.3261;
      const weather = await fetchWeatherForecast(lat, lng, req.arrivalDate, req.departureDate);
      for (const day of itinerary.days) {
        for (const item of day.items) {
          // isOutdoor may be absent from the API response; treat backend's non-null weatherAlert as the indicator
          const isOutdoor = item.isOutdoor ?? (item.weatherAlert !== null);
          const alert = getWeatherAlert(weather, day.date, item.suggestedTime, isOutdoor);
          // Only replace if Open-Meteo gave a specific message; otherwise keep what the backend set
          item.weatherAlert = alert ?? item.weatherAlert;
        }
      }
    } catch {
      // silently degrade — itinerary is shown without weather alerts
    }

    saveItinerary({ request: req, itinerary });
    setTermsOpen(false);
    setLoading(false);
    navigate({ to: "/itinerary" });
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(180deg, oklch(0.97 0.03 160) 0%, oklch(1 0 0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[520px] opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 75%)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 75%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Roteiro inteligente em segundos
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Descubra o melhor de <span className="text-primary">Lages</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Gere um roteiro personalizado com base no seu estilo de viagem,
            datas e localização — explore a Serra Catarinense como um local.
          </p>
        </div>
      </section>

      {/* Filter card */}
      <section className="mx-auto -mt-2 max-w-5xl px-4 sm:px-6 pb-20">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevated">
          <div className="grid gap-6">
            {/* Travel reason */}
            <Field label="Por que você está visitando Lages?">
              <div className="flex flex-wrap gap-2">
                {TRAVEL_REASONS.map((r) => (
                  <Chip
                    key={r.value}
                    active={reason === r.value}
                    onClick={() => setReason(r.value)}
                  >
                    {r.label}
                  </Chip>
                ))}
              </div>
            </Field>

            {/* Categories */}
            <Field
              label="Que tipo de experiências te interessam?"
              hint={`${selectedCats.length} selecionada(s) · ao menos 1 obrigatória`}
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = selectedCats.includes(c.slug);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.slug)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-card"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      {CATEGORY_LABELS[c.slug]}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Entry preference */}
            <Field label="Preferência de entrada">
              <div className="flex flex-wrap gap-2">
                {ENTRY_PREFS.map((e) => (
                  <Chip
                    key={e.value}
                    active={entry === e.value}
                    onClick={() => setEntry(e.value)}
                  >
                    {e.label}
                  </Chip>
                ))}
              </div>
            </Field>

            {/* Lodging location */}
            <Field label="Onde você está hospedado?">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Nome do local (hotel, pousada...)"
                  value={lodgingName}
                  onChange={(e) => setLodgingName(e.target.value)}
                  className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  placeholder="Endereço *"
                  value={lodgingAddress}
                  onChange={(e) => setLodgingAddress(e.target.value)}
                  className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground/80 inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Lages
                  </div>
                  <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground/80">
                    SC
                  </div>
                </div>
              </div>
            </Field>

            {/* Dates */}
            <Field label="Período da estadia">
              <div className="grid gap-3 sm:grid-cols-2">
                <DateInput
                  label="Chegada"
                  value={arrival}
                  onChange={setArrival}
                />
                <DateInput
                  label="Partida"
                  value={departure}
                  onChange={setDeparture}
                  min={arrival}
                />
              </div>
              {new Date(departure) < new Date(arrival) && (
                <p className="mt-2 text-xs text-destructive">
                  A data de partida deve ser posterior à de chegada.
                </p>
              )}
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to="/guide"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Compass className="h-4 w-4" /> Ou explore os atrativos manualmente
              </Link>
              <button
                disabled={!valid || loading}
                onClick={() => setTermsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Gerando..." : "Gerar Roteiro"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Terms modal */}
      {termsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => !loading && setTermsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">Termos de Uso</h2>
              <button
                aria-label="Fechar"
                disabled={loading}
                onClick={() => setTermsOpen(false)}
                className="rounded-lg p-1 hover:bg-accent disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Este roteiro é uma recomendação e pode depender do clima, horários
              de funcionamento, disponibilidade e alterações locais. Sempre
              confirme os detalhes com o local oficial ou organizador do evento.
            </p>
            <Link
              to="/terms"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ler termos completos →
            </Link>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[oklch(0.58_0.14_160)]"
              />
              <span>Li e aceito os termos acima.</span>
            </label>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                disabled={loading}
                onClick={() => setTermsOpen(false)}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                disabled={!accepted || loading}
                onClick={handleAccept}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Gerando..." : "Aceitar e gerar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-border bg-background hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function DateInput({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}
