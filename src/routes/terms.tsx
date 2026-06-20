import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — ExploraiLages" },
      {
        name: "description",
        content: "Termos de uso demonstrativos do MVP ExploraiLages.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Termos de Uso
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}
      </p>
      <div className="prose mt-8 max-w-none text-foreground/85 space-y-4">
        <p>
          ExploraiLages é um MVP demonstrativo criado para ajudar
          visitantes a descobrir atrativos e eventos em Lages, Santa Catarina.
          Ao usar este aplicativo, você reconhece e aceita o seguinte:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Este roteiro é apenas uma recomendação.</li>
          <li>Os horários de funcionamento podem mudar sem aviso prévio.</li>
          <li>Eventos podem ser cancelados, adiados ou alterados.</li>
          <li>Condições climáticas podem afetar atrativos e atividades ao ar livre.</li>
          <li>
            O visitante deve sempre confirmar os detalhes com o local oficial
            ou organizador do evento antes de viajar.
          </li>
          <li>
            Não coletamos dados pessoais neste MVP — não há login nem conta de
            usuário.
          </li>
        </ul>
        <p>
          Para mais informações sobre o destino, acesse os canais oficiais de
          turismo da Prefeitura de Lages.
        </p>
      </div>
      <Link
        to="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Voltar ao início
      </Link>
    </article>
  );
}
