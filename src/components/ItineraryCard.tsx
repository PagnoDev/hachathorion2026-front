import {
  Clock,
  CloudRain,
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { StarRating } from "./StarRating";
import type { ItineraryItemDto } from "@/types/tourism";

export function ItineraryCard({ item }: { item: ItineraryItemDto }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.suggestedTime && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                <Clock className="h-3 w-3" />
                {item.suggestedTime}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {item.distanceText}
            </span>
            <span className="capitalize text-foreground/70">· {item.placeType}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-tight">{item.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.categories.slice(0, 4).map((c) => (
              <CategoryBadge key={c.id} category={c} />
            ))}
          </div>
        </div>
        <div className="shrink-0">
          {item.rating != null && <StarRating value={item.rating} />}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {item.location.address}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {item.openingHoursText}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium">
          {item.price.entryType === "free" ? "Entrada gratuita" : item.price.description}
        </span>
        <div className="flex flex-wrap gap-2">
          {item.location.mapUrl && (
            <a
              href={item.location.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <MapPin className="h-3.5 w-3.5" /> Abrir no mapa
            </a>
          )}
          {item.externalLinks.map((l) => (
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

      {item.weatherAlert && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[oklch(0.95_0.04_230)] p-3 text-sm text-[oklch(0.35_0.1_230)]">
          <CloudRain className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{item.weatherAlert}</span>
        </div>
      )}
    </article>
  );
}
