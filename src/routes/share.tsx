import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileDown, Loader2, MapPin } from "lucide-react";
import { loadPDF } from "@/lib/itineraryShare";

export const Route = createFileRoute("/share")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : "",
  }),
  head: () => ({
    meta: [
      { title: "Seu roteiro — ExploraiLages" },
      { name: "description", content: "Download do roteiro personalizado para Lages, SC." },
    ],
  }),
  component: SharePage,
});

function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function SharePage() {
  const { id } = Route.useSearch();
  const [state, setState] = useState<"loading" | "ready" | "downloading" | "done" | "error">("loading");
  const [filename, setFilename] = useState("roteiro-lages.pdf");
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) { setState("error"); return; }

    loadPDF({ data: id })
      .then((entry) => {
        if (!entry) { setState("error"); return; }
        setFilename(entry.filename);
        const blob = base64ToBlob(entry.base64, "application/pdf");
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setState("ready");

        // Try auto-download on the next tick
        setTimeout(() => {
          anchorRef.current?.click();
          setState("done");
        }, 100);
      })
      .catch(() => setState("error"));

    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [id]);

  function handleManualDownload() {
    setState("downloading");
    anchorRef.current?.click();
    setTimeout(() => setState("done"), 500);
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">Roteiro não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O link pode estar expirado (válido por 48 h) ou incorreto.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Criar meu roteiro
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      {/* Hidden anchor used for programmatic download */}
      <a
        ref={anchorRef}
        href={blobUrlRef.current ?? "#"}
        download={filename}
        className="hidden"
        aria-hidden
      />

      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {state === "loading" ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <FileDown className="h-8 w-8 text-primary" />
          )}
        </div>

        <div>
          <h1 className="text-xl font-bold">
            {state === "loading" ? "Preparando PDF…" : "Roteiro em PDF"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {state === "done"
              ? "Download iniciado. Verifique seus arquivos."
              : state === "ready" || state === "downloading"
              ? "Seu roteiro de Lages está pronto para baixar."
              : "Carregando…"}
          </p>
        </div>

        {(state === "ready" || state === "downloading") && (
          <button
            onClick={handleManualDownload}
            disabled={state === "downloading"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {state === "downloading"
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Baixando…</>
              : <><FileDown className="h-4 w-4" /> Baixar PDF</>
            }
          </button>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Quer criar seu próprio roteiro?{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Acesse o ExploraiLages
          </Link>
        </p>
      </div>
    </div>
  );
}
