import { Link } from "@tanstack/react-router";
import { Accessibility, Clock, MapPin, PawPrint } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { StarRating } from "./StarRating";
import type { AttractionDto } from "@/types/tourism";

export function AttractionCard({ a }: { a: AttractionDto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:shadow-elevated">
      <Link
        to="/guide/$id"
        params={{ id: a.id }}
        className="relative block aspect-[16/10] overflow-hidden bg-muted"
      >
        {a.coverImageUrl ? (
          <img
            src={a.coverImageUrl}
            alt={a.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          <span className="rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {a.price.entryType === "free" ? "Gratuito" : "Pago"}
          </span>
          {a.petFriendly && (
            <span className="rounded-full bg-background/95 px-2 py-1">
              <PawPrint className="h-3 w-3" />
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight">{a.name}</h3>
          <StarRating value={a.rating} />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{a.shortDescription}</p>
        <div className="flex flex-wrap gap-1.5">
          {a.categories.slice(0, 3).map((c) => (
            <CategoryBadge key={c.id} category={c} />
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {a.location.neighborhood ?? a.location.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {a.openingHoursText}
          </span>
          {a.accessibility === "yes" && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Accessibility className="h-3.5 w-3.5" />
              Acessível
            </span>
          )}
        </div>
        <Link
          to="/guide/$id"
          params={{ id: a.id }}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
