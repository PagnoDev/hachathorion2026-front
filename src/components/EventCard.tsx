import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { StarRating } from "./StarRating";
import type { EventDto } from "@/types/tourism";

export function EventCard({ e }: { e: EventDto }) {
  const start = new Date(e.startDateTime);
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight">{e.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {e.categories.slice(0, 4).map((c) => (
              <CategoryBadge key={c.id} category={c} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {e.rating != null && <StarRating value={e.rating} />}
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {e.price.entryType === "free" ? "Gratuito" : "Pago"}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{e.shortDescription}</p>
      <div className="mt-4 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          {start.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {e.location.name}, {e.location.city}/{e.location.state}
        </span>
        <span className="text-muted-foreground sm:col-span-2 text-xs">
          {e.location.address}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium">{e.price.description}</span>
        <div className="flex flex-wrap gap-2">
          {e.location.mapUrl && (
            <a
              href={e.location.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <MapPin className="h-3.5 w-3.5" /> Mapa
            </a>
          )}
          {e.externalLinks.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ExternalLink className="h-3.5 w-3.5" /> {l.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
