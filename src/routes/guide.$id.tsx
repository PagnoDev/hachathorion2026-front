import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowLeft,
  Clock,
  ExternalLink,
  MapPin,
  PawPrint,
  Users,
} from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StarRating } from "@/components/StarRating";
import { getAttraction } from "@/services/api";
import { resolveMapUrl } from "@/lib/utils";

export const Route = createFileRoute("/guide/$id")({
  loader: async ({ params }) => {
    const a = await getAttraction(params.id);
    if (!a) throw notFound();
    return { attraction: a };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.attraction.name} — ExploraiLages` },
          { name: "description", content: loaderData.attraction.shortDescription },
          { property: "og:title", content: loaderData.attraction.name },
          { property: "og:description", content: loaderData.attraction.shortDescription },
          ...(loaderData.attraction.coverImageUrl
            ? [
                { property: "og:image", content: loaderData.attraction.coverImageUrl },
                { name: "twitter:image", content: loaderData.attraction.coverImageUrl },
              ]
            : []),
        ]
      : [],
  }),

  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Atrativo não encontrado</h1>
      <Link to="/guide" className="mt-4 inline-block text-primary hover:underline">
        Voltar ao guia
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-xl font-semibold">Não foi possível carregar o atrativo</h1>
      <button onClick={reset} className="mt-4 text-primary hover:underline">
        Tentar novamente
      </button>
    </div>
  ),
  component: DetailPage,
});

function DetailPage() {
  const { attraction: a } = Route.useLoaderData() as { attraction: import("@/types/tourism").AttractionDto };
  const mapUrl = resolveMapUrl(a.location);

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Link
        to="/guide"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao guia
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="relative aspect-[16/7] bg-muted">
          {a.coverImageUrl ? (
            <img
              src={a.coverImageUrl}
              alt={a.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent" />
          )}
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {a.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.categories.map((c) => (
                  <CategoryBadge key={c.id} category={c} />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StarRating value={a.rating} size={18} />
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {a.price.entryType === "free" ? "Entrada gratuita" : a.price.description}
              </span>
            </div>
          </div>

          <p className="mt-5 text-base text-foreground/80">{a.description}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={<MapPin className="h-4 w-4" />} label="Endereço">
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-primary"
                >
                  {a.location.address}, {a.location.city}/{a.location.state}
                </a>
              ) : (
                <>{a.location.address}, {a.location.city}/{a.location.state}</>
              )}
            </Info>
            <Info icon={<Clock className="h-4 w-4" />} label="Horário de funcionamento">
              {a.openingHoursText}
            </Info>
            <Info
              icon={<Accessibility className="h-4 w-4" />}
              label="Acessibilidade"
            >
              <span className="capitalize">
                {a.accessibility === "yes" ? "Sim" : a.accessibility === "no" ? "Não" : "Não informado"}
              </span>
            </Info>
            <Info icon={<Users className="h-4 w-4" />} label="Público">
              {a.audience.join(", ")}
            </Info>
            {a.petFriendly && (
              <Info icon={<PawPrint className="h-4 w-4" />} label="Pets">
                Pet friendly
              </Info>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <MapPin className="h-4 w-4" /> Abrir no mapa
              </a>
            )}
            {a.externalLinks.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent"
              >
                <ExternalLink className="h-4 w-4" /> {l.label}
              </a>
            ))}
          </div>

          {a.media.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Galeria</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {a.media.map((m) => (
                  <a
                    key={m.url}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-border"
                  >
                    <img
                      src={m.url}
                      alt={m.title ?? a.name}
                      className="h-40 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
