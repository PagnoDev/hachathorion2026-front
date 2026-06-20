import type {
  AttractionDto,
  CategoryDto,
  EventDto,
  TourismCategory,
} from "@/types/tourism";

export const CATEGORY_LABELS: Record<TourismCategory, string> = {
  cultural: "Cultural",
  historical: "Histórico",
  religious: "Religioso",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  ecotourism: "Ecoturismo",
  adventure: "Aventura",
  rural: "Rural",
  experience: "Experiência",
  events: "Eventos",
  business: "Negócios",
  shopping: "Compras",
  leisure: "Lazer",
  sports: "Esportes",
  scienceTechnology: "Ciência e Tec.",
  accessible: "Acessível",
  family: "Família",
  petFriendly: "Pet Friendly",
};

const COLORS: Record<TourismCategory, string> = {
  cultural: "#7c3aed",
  historical: "#a16207",
  religious: "#0ea5e9",
  gastronomy: "#dc2626",
  nature: "#059669",
  ecotourism: "#16a34a",
  adventure: "#ea580c",
  rural: "#65a30d",
  experience: "#db2777",
  events: "#9333ea",
  business: "#475569",
  shopping: "#e11d48",
  leisure: "#0891b2",
  sports: "#2563eb",
  scienceTechnology: "#6366f1",
  accessible: "#0d9488",
  family: "#f59e0b",
  petFriendly: "#84cc16",
};

export const CATEGORIES: CategoryDto[] = (
  Object.keys(CATEGORY_LABELS) as TourismCategory[]
).map((slug) => ({
  id: slug,
  name: CATEGORY_LABELS[slug],
  slug,
  color: COLORS[slug],
}));

const cat = (slug: TourismCategory) =>
  CATEGORIES.find((c) => c.slug === slug)!;

const loc = (
  name: string,
  address: string,
  neighborhood: string | null,
  lat: number,
  lng: number,
) => ({
  name,
  address,
  neighborhood,
  city: "Lages",
  state: "SC",
  latitude: lat,
  longitude: lng,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
});

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`;

export const ATTRACTIONS: AttractionDto[] = [
  {
    id: "mercado-publico",
    name: "Mercado Público de Lages",
    shortDescription:
      "Mercado público histórico com artesanato local, queijos e comidas regionais.",
    description:
      "Centenário ponto de encontro da cultura serrana, o Mercado Público reúne produtores locais oferecendo pinhão, queijos, embutidos, artesanato e pratos típicos. Parada obrigatória para quem busca os sabores autênticos da Serra Catarinense.",
    categories: [cat("gastronomy"), cat("cultural"), cat("shopping")],
    location: loc(
      "Mercado Público Municipal",
      "Rua Correia Pinto, 76 - Centro",
      "Centro",
      -27.8159,
      -50.3261,
    ),
    openingHoursText: "Seg–Sáb 08:00–18:00",
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    accessibility: "yes",
    audience: ["all", "families", "tourists"],
    petFriendly: true,
    rating: 4.6,
    coverImageUrl: img("1504674900247-0877df9cc836"),
    media: [],
    externalLinks: [
      { label: "Página oficial", url: "https://lages.sc.gov.br" },
    ],
    isOutdoor: false,
  },
  {
    id: "catedral-diocesana",
    name: "Catedral Diocesana de Lages",
    shortDescription:
      "Catedral em estilo neogótico que se destaca no centro histórico.",
    description:
      "Construída no século XX, a Catedral Diocesana Nossa Senhora dos Prazeres é um dos marcos mais icônicos de Lages, com vitrais e imponente fachada em pedra.",
    categories: [cat("religious"), cat("historical"), cat("cultural")],
    location: loc(
      "Catedral Diocesana",
      "Praça João Costa, s/n - Centro",
      "Centro",
      -27.8156,
      -50.3266,
    ),
    openingHoursText: "Diariamente 07:00–19:00",
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    accessibility: "yes",
    audience: ["all"],
    petFriendly: false,
    rating: 4.7,
    coverImageUrl: img("1548013146-72479768bada"),
    media: [],
    externalLinks: [],
    isOutdoor: false,
  },
  {
    id: "museu-thiago-castro",
    name: "Museu Histórico Thiago de Castro",
    shortDescription:
      "Museu de história regional em um charmoso edifício do início do século XX.",
    description:
      "Inaugurado em 1977, o museu conta a história de Lages e da Serra Catarinense por meio de documentos, fotografias e objetos da era dos tropeiros.",
    categories: [cat("historical"), cat("cultural")],
    location: loc(
      "Museu Thiago de Castro",
      "Rua Hercílio Luz, 1015 - Centro",
      "Centro",
      -27.8163,
      -50.3279,
    ),
    openingHoursText: "Ter–Sex 09:00–17:00",
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    accessibility: "unknown",
    audience: ["all", "families"],
    petFriendly: false,
    rating: 4.4,
    coverImageUrl: img("1565060169187-5283c2a14e3e"),
    media: [],
    externalLinks: [],
    isOutdoor: false,
  },
  {
    id: "morro-da-cruz",
    name: "Morro da Cruz",
    shortDescription:
      "Mirante panorâmico de Lages coroado por uma cruz luminosa.",
    description:
      "Do alto, os visitantes têm a melhor vista 360° da cidade e da Serra. Popular ao pôr do sol e em noites frias quando a geada cobre os telhados abaixo.",
    categories: [cat("nature"), cat("leisure"), cat("religious")],
    location: loc(
      "Morro da Cruz",
      "Acesso pela Av. Belisário Ramos",
      "Coral",
      -27.8023,
      -50.3197,
    ),
    openingHoursText: "Aberto 24h",
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    accessibility: "no",
    audience: ["all", "tourists"],
    petFriendly: true,
    rating: 4.5,
    coverImageUrl: img("1469474968028-56623f02e42e"),
    media: [],
    externalLinks: [],
    isOutdoor: true,
  },
  {
    id: "parque-jonas-ramos",
    name: "Parque Jonas Ramos (Tanque)",
    shortDescription:
      "Parque urbano com lago, trilhas e áreas de lazer para a família.",
    description:
      "Conhecido como 'O Tanque', o parque é o preferido de corredores, famílias e piqueniques de fim de semana, com lago, parquinho e anfiteatro para eventos.",
    categories: [cat("nature"), cat("family"), cat("leisure"), cat("sports")],
    location: loc(
      "Parque Jonas Ramos",
      "Av. Belisário Ramos, s/n",
      "Centro",
      -27.81,
      -50.31,
    ),
    openingHoursText: "Diariamente 06:00–22:00",
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    accessibility: "yes",
    audience: ["all", "families", "children"],
    petFriendly: true,
    rating: 4.6,
    coverImageUrl: img("1501785888041-af3ef285b470"),
    media: [],
    externalLinks: [],
    isOutdoor: true,
  },
  {
    id: "salto-caveiras",
    name: "Salto Caveiras",
    shortDescription:
      "Imponente cachoeira no rio Caveiras cercada por mata nativa.",
    description:
      "Uma queda d'água de 30 m em meio à floresta de araucárias, ideal para amantes da natureza e fotógrafos. Trilhas de dificuldade moderada levam aos mirantes.",
    categories: [cat("nature"), cat("ecotourism"), cat("adventure")],
    location: loc(
      "Salto Caveiras",
      "Estrada do Caminho das Águas",
      "Caveiras",
      -27.84,
      -50.36,
    ),
    openingHoursText: "Diariamente 08:00–17:00",
    price: { entryType: "paid", amount: 20, description: "R$ 20 por pessoa" },
    accessibility: "no",
    audience: ["adults", "tourists"],
    petFriendly: true,
    rating: 4.8,
    coverImageUrl: img("1432405972618-c60b0225b8f9"),
    media: [],
    externalLinks: [],
    isOutdoor: true,
  },
  {
    id: "orion-parque",
    name: "Orion Parque Tecnológico",
    shortDescription:
      "Polo de inovação que fomenta startups, pesquisa e turismo tecnológico.",
    description:
      "Primeiro parque tecnológico do Brasil focado nos setores agro e florestal, oferece visitas guiadas aos seus laboratórios e ambientes de inovação.",
    categories: [cat("scienceTechnology"), cat("business")],
    location: loc(
      "Orion Parque",
      "Av. Luiz de Camões, 2090",
      "Conta Dinheiro",
      -27.79,
      -50.34,
    ),
    openingHoursText: "Seg–Sex 09:00–17:00",
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    accessibility: "yes",
    audience: ["adults", "tourists"],
    petFriendly: false,
    rating: 4.3,
    coverImageUrl: img("1497366216548-37526070297c"),
    media: [],
    externalLinks: [],
    isOutdoor: false,
  },
  {
    id: "casarao-juca-antunes",
    name: "Casarão Juca Antunes",
    shortDescription:
      "Casarão histórico que conta a história da elite cafeeira e pecuarista de Lages.",
    description:
      "Mansão restaurada do século XIX que abriga exposições culturais e revela a arquitetura da aristocracia da Serra Catarinense.",
    categories: [cat("historical"), cat("cultural"), cat("experience")],
    location: loc(
      "Casarão Juca Antunes",
      "Rua Cel. Manoel Thiago de Castro, 220",
      "Centro",
      -27.8169,
      -50.3257,
    ),
    openingHoursText: "Qua–Dom 10:00–17:00",
    price: { entryType: "paid", amount: 10, description: "R$ 10 por pessoa" },
    accessibility: "unknown",
    audience: ["all", "families"],
    petFriendly: false,
    rating: 4.5,
    coverImageUrl: img("1464822759023-fed622ff2c3b"),
    media: [],
    externalLinks: [],
    isOutdoor: false,
  },
];

const year = new Date().getFullYear();
const iso = (m: number, d: number, h = 19) =>
  new Date(Date.UTC(year, m - 1, d, h)).toISOString();

export const EVENTS: EventDto[] = [
  {
    id: "festa-do-pinhao",
    name: "Festa Nacional do Pinhão",
    shortDescription:
      "Maior festival de inverno da Serra, celebrando o pinhão.",
    description:
      "Festa tradicional com shows ao vivo, gastronomia, rodeios e exposições celebrando a semente icônica da Araucária.",
    categories: [cat("events"), cat("gastronomy"), cat("cultural"), cat("family")],
    location: loc(
      "Parque Conta Dinheiro",
      "Av. Luiz de Camões, s/n",
      "Conta Dinheiro",
      -27.79,
      -50.34,
    ),
    startDateTime: iso(6, 14, 18),
    endDateTime: iso(6, 23, 23),
    price: { entryType: "paid", amount: 30, description: "A partir de R$ 30" },
    rating: 4.7,
    externalLinks: [
      { label: "Site oficial", url: "https://festadopinhao.com.br" },
    ],
    isOutdoor: true,
  },
  {
    id: "sapecada",
    name: "Sapecada da Canção Nativa",
    shortDescription:
      "Festival icônico de música nativista da Serra Catarinense.",
    description:
      "Celebra a cultura gaúcho-serrana, com compositores, dança tradicional e comida regional.",
    categories: [cat("events"), cat("cultural"), cat("rural")],
    location: loc(
      "Centro de Eventos Gustavo Kuerten",
      "Av. Luiz de Camões, 1500",
      "Conta Dinheiro",
      -27.792,
      -50.342,
    ),
    startDateTime: iso(8, 8, 20),
    endDateTime: iso(8, 10, 23),
    price: { entryType: "paid", amount: 50, description: "A partir de R$ 50" },
    rating: 4.6,
    externalLinks: [],
    isOutdoor: false,
  },
  {
    id: "musica-na-serra",
    name: "Festival Música na Serra",
    shortDescription: "Festival de música ao ar livre que mistura folk e contemporâneo.",
    description:
      "Festival ao ar livre de dois dias com artistas regionais e nacionais no coração de Lages.",
    categories: [cat("events"), cat("cultural"), cat("leisure")],
    location: loc(
      "Parque Jonas Ramos",
      "Av. Belisário Ramos, s/n",
      "Centro",
      -27.81,
      -50.31,
    ),
    startDateTime: iso(10, 18, 17),
    endDateTime: iso(10, 19, 23),
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    rating: 4.4,
    externalLinks: [],
    isOutdoor: true,
  },
  {
    id: "estacao-inverno",
    name: "Estação Inverno",
    shortDescription:
      "Celebração do inverno com fogueiras, vinho quente e música ao vivo.",
    description:
      "Programação por toda a cidade convidando os visitantes a aproveitarem a estação mais fria do Brasil com a hospitalidade serrana.",
    categories: [cat("events"), cat("gastronomy"), cat("experience")],
    location: loc(
      "Centro de Lages",
      "Praça João Costa",
      "Centro",
      -27.8156,
      -50.3266,
    ),
    startDateTime: iso(7, 5, 18),
    endDateTime: iso(7, 28, 22),
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    rating: 4.5,
    externalLinks: [],
    isOutdoor: true,
  },
  {
    id: "natal-felizcidade",
    name: "Natal FelizCidade",
    shortDescription:
      "Decoração natalina mágica e apresentações pelo centro de Lages.",
    description:
      "Cerimônias de iluminação, desfiles e apresentações de corais que trazem o espírito natalino à cidade.",
    categories: [cat("events"), cat("family"), cat("cultural")],
    location: loc(
      "Centro de Lages",
      "Praça João Costa",
      "Centro",
      -27.8156,
      -50.3266,
    ),
    startDateTime: iso(12, 1, 19),
    endDateTime: iso(12, 23, 22),
    price: { entryType: "free", amount: null, description: "Entrada gratuita" },
    rating: 4.8,
    externalLinks: [],
    isOutdoor: true,
  },
];
