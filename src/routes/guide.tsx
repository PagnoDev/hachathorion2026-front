import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AttractionCard } from "@/components/AttractionCard";
import { CATEGORIES, CATEGORY_LABELS } from "@/data/mockData";
import { getAttractions } from "@/services/api";
import type {
  AccessibilityStatus,
  AttractionDto,
  AudienceType,
  EntryPreference,
  TourismCategory,
} from "@/types/tourism";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guia Turístico — ExploraiLages" },
      {
        name: "description",
        content: "Explore os atrativos de Lages com filtros por categoria, acessibilidade, público e mais.",
      },
    ],
  }),
  component: GuidePage,
});

const AUDIENCES: { value: AudienceType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "families", label: "Famílias" },
  { value: "adults", label: "Adultos" },
  { value: "children", label: "Crianças" },
  { value: "elderly", label: "Idosos" },
  { value: "tourists", label: "Turistas" },
];

const ENTRY_LABELS: Record<EntryPreference, string> = {
  free: "Gratuito",
  paid: "Pago",
  both: "Ambos",
};

function GuidePage() {
  const [all, setAll] = useState<AttractionDto[]>([]);
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<TourismCategory[]>([]);
  const [entry, setEntry] = useState<EntryPreference>("both");
  const [access, setAccess] = useState<AccessibilityStatus | "any">("any");
  const [audience, setAudience] = useState<AudienceType | "any">("any");
  const [petOnly, setPetOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    getAttractions().then(setAll);
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter((a) => {
      if (term && !`${a.name} ${a.shortDescription}`.toLowerCase().includes(term))
        return false;
      if (cats.length && !a.categories.some((c) => cats.includes(c.slug)))
        return false;
      if (entry !== "both" && a.price.entryType !== entry) return false;
      if (access !== "any" && a.accessibility !== access) return false;
      if (audience !== "any" && !a.audience.includes(audience)) return false;
      if (petOnly && a.petFriendly !== true) return false;
      return true;
    });
  }, [all, q, cats, entry, access, audience, petOnly]);

  function toggleCat(slug: TourismCategory) {
    setCats((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));
  }

  function clearAll() {
    setCats([]); setEntry("both"); setAccess("any"); setAudience("any"); setPetOnly(false); setQ("");
  }

  const Filters = (
    <div className="space-y-5">
      <FilterBlock title="Entrada">
        <div className="flex flex-wrap gap-2">
          {(["free", "paid", "both"] as EntryPreference[]).map((e) => (
            <button
              key={e}
              onClick={() => setEntry(e)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                entry === e
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              {ENTRY_LABELS[e]}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Categorias">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = cats.includes(c.slug);
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.slug)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
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
      </FilterBlock>

      <FilterBlock title="Acessibilidade">
        <select
          value={access}
          onChange={(e) => setAccess(e.target.value as typeof access)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="any">Qualquer</option>
          <option value="yes">Acessível</option>
          <option value="no">Não acessível</option>
          <option value="unknown">Não informado</option>
        </select>
      </FilterBlock>

      <FilterBlock title="Público">
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as typeof audience)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="any">Qualquer</option>
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </FilterBlock>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={petOnly}
          onChange={(e) => setPetOnly(e.target.checked)}
          className="h-4 w-4 accent-[oklch(0.58_0.14_160)]"
        />
        Apenas pet friendly
      </label>

      <button
        onClick={clearAll}
        className="text-sm font-medium text-primary hover:underline"
      >
        Limpar todos os filtros
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore Lages
        </h1>
        <p className="mt-2 text-muted-foreground">
          Atrativos selecionados em toda a Serra Catarinense.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar atrativos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-full border border-input bg-background pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-card">
            {Filters}
          </div>
        </aside>

        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            {list.length} resultado{list.length === 1 ? "" : "s"}
          </div>
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center text-muted-foreground">
              Nenhum atrativo corresponde aos seus filtros.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((a) => (
                <AttractionCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-card p-5 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-1 hover:bg-accent rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">{Filters}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}
