import type {
  AttractionDto,
  CategoryDto,
  EventCalendarDto,
  GenerateItineraryRequest,
  ItineraryDto,
} from "@/types/tourism";

const BASE_URL = "https://hachathorion2026-production.up.railway.app";

// ─────────────────────────────────────────────────────────────────────────────
// Enum maps — index = integer value returned/expected by the API.
// Verify the order matches your C# enum definitions if something looks wrong.
// ─────────────────────────────────────────────────────────────────────────────
const ENTRY_TYPE = ["free", "paid"] as const;
const ENTRY_PREF = ["free", "paid", "both"] as const;
const ACCESSIBILITY = ["unknown", "yes", "no"] as const;
const AUDIENCE = [
  "all", "families", "adults", "children", "elderly", "tourists", "residents",
] as const;
const PLACE_TYPE = ["attraction", "event"] as const;
const TRAVEL_REASON = [
  "leisure", "work", "familyVisit", "events", "passingThrough",
] as const;
const TOURISM_CATEGORY = [
  "cultural", "historical", "religious", "gastronomy", "nature",
  "ecotourism", "adventure", "rural", "experience", "events",
  "business", "shopping", "leisure", "sports", "scienceTechnology",
  "accessible", "family", "petFriendly",
] as const;

const ENTRY_PREF_TO_INT: Record<string, number> = {
  free: 0, paid: 1, both: 2,
};
const CATEGORY_TO_INT: Record<string, number> = Object.fromEntries(
  TOURISM_CATEGORY.map((c, i) => [c, i]),
);
const TRAVEL_REASON_TO_INT: Record<string, number> = Object.fromEntries(
  TRAVEL_REASON.map((r, i) => [r, i]),
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  console.group(`[API] ${method} ${path}`);
  if (init?.body) console.log("Request body:", JSON.parse(init.body as string));

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    console.error("Erro:", res.status, res.statusText);
    console.groupEnd();
    throw new Error(`API ${res.status}: ${path}`);
  }

  const data = await res.json();
  console.log("Response:", data);
  console.groupEnd();
  return data as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(raw: any): CategoryDto {
  return {
    ...raw,
    slug: TOURISM_CATEGORY[raw.slug as number] ?? raw.slug,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAttraction(raw: any): AttractionDto {
  return {
    ...raw,
    categories: raw.categories?.map(mapCategory) ?? [],
    price: {
      ...raw.price,
      entryType: ENTRY_TYPE[raw.price?.entryType as number] ?? "free",
    },
    accessibility: ACCESSIBILITY[raw.accessibility as number] ?? "unknown",
    audience: (raw.audience ?? []).map(
      (a: number) => AUDIENCE[a] ?? "all",
    ),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(raw: any) {
  return {
    ...raw,
    categories: raw.categories?.map(mapCategory) ?? [],
    price: {
      ...raw.price,
      entryType: ENTRY_TYPE[raw.price?.entryType as number] ?? "free",
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItineraryItem(raw: any) {
  return {
    ...raw,
    placeType: PLACE_TYPE[raw.placeType as number] ?? "attraction",
    categories: raw.categories?.map(mapCategory) ?? [],
    price: {
      ...raw.price,
      entryType: ENTRY_TYPE[raw.price?.entryType as number] ?? "free",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported functions (same signatures as mockApi)
// ─────────────────────────────────────────────────────────────────────────────
export async function getCategories(): Promise<CategoryDto[]> {
  const raw = await apiFetch<unknown[]>("/api/categories");
  return raw.map(mapCategory);
}

export async function getAttractions(): Promise<AttractionDto[]> {
  const raw = await apiFetch<{ attractions: unknown[] }>("/api/attractions");
  return raw.attractions.map(mapAttraction);
}

export async function getAttraction(id: string): Promise<AttractionDto | null> {
  try {
    const raw = await apiFetch<unknown>(`/api/attractions/${id}`);
    return mapAttraction(raw);
  } catch {
    return null;
  }
}

export async function getEventCalendar(
  year: number,
  month: number,
): Promise<EventCalendarDto> {
  const raw = await apiFetch<{ year: number; month: number; days: unknown[]; events: unknown[] }>(
    `/api/events/calendar?year=${year}&month=${month}`,
  );
  return {
    year: raw.year,
    month: raw.month,
    days: raw.days as EventCalendarDto["days"],
    events: raw.events.map(mapEvent),
  };
}

export async function generateItinerary(
  request: GenerateItineraryRequest,
): Promise<ItineraryDto> {
  const body = {
    travelReason: TRAVEL_REASON_TO_INT[request.travelReason] ?? 0,
    categories: request.categories.map((c) => CATEGORY_TO_INT[c] ?? 0),
    entryPreference: ENTRY_PREF_TO_INT[request.entryPreference] ?? 2,
    lodgingLocation: request.lodgingLocation,
    arrivalDate: request.arrivalDate,
    departureDate: request.departureDate,
  };

  const raw = await apiFetch<{ id: string; generatedAt: string; days: unknown[] }>(
    "/api/itineraries/generate",
    { method: "POST", body: JSON.stringify(body) },
  );

  return {
    id: raw.id,
    generatedAt: raw.generatedAt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    days: raw.days.map((day: any) => ({
      ...day,
      items: day.items?.map(mapItineraryItem) ?? [],
    })),
  };
}
