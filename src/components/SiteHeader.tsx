import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/itinerary", label: "Gerar Roteiro" },
  { to: "/events", label: "Eventos" },
  { to: "/guide", label: "Explorar Lages" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.jpeg" alt="ExploraiLages" className="h-9 w-9 rounded-xl object-cover shadow-card" />
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">
              ExploraiLages
            </span>
            <span className="text-[11px] text-muted-foreground">
              Serra Catarinense · Brasil
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Abrir menu"
          className="md:hidden rounded-lg p-2 hover:bg-accent"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent"
                activeProps={{ className: "bg-accent" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <div className="font-semibold">ExploraiLages</div>
          <p className="mt-2 text-muted-foreground">
            Descubra a Serra Catarinense — roteiros, eventos e atrativos
            selecionados para visitantes.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Explorar</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Gerar roteiro</Link></li>
            <li><Link to="/events" className="hover:text-foreground">Eventos</Link></li>
            <li><Link to="/guide" className="hover:text-foreground">Guia turístico</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Sobre</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/terms" className="hover:text-foreground">Termos de uso</Link></li>
            <li>MVP demonstrativo — sem vínculo com órgãos oficiais de turismo.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
