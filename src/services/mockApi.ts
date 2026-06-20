// Mock API service layer. Replace with fetch/axios calls to .NET backend.
import { ATTRACTIONS, CATEGORIES, EVENTS } from "@/data/mockData";
import type {
  AttractionDto,
  CategoryDto,
  EventCalendarDto,
  EventDto,
  GenerateItineraryRequest,
  ItineraryDayDto,
  ItineraryDto,
  ItineraryItemDto,
} from "@/types/tourism";

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function getCategories(): Promise<CategoryDto[]> {
  await wait();
  return CATEGORIES;
}

export async function getAttractions(): Promise<AttractionDto[]> {
  await wait();
  return ATTRACTIONS;
}

export async function getAttraction(id: string): Promise<AttractionDto | null> {
  await wait();
  return ATTRACTIONS.find((a) => a.id === id) ?? null;
}

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getEventCalendar(
  year: number,
  month: number,
): Promise<EventCalendarDto> {
  await wait();
  const monthEvents = EVENTS.filter((e) => {
    const start = new Date(e.startDateTime);
    const end = e.endDateTime ? new Date(e.endDateTime) : start;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    return end >= monthStart && start <= monthEnd;
  });
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1, i + 1));
    const iso = date.toISOString().slice(0, 10);
    const matching = monthEvents.filter((e) => {
      const s = new Date(e.startDateTime).toISOString().slice(0, 10);
      const en = (e.endDateTime
        ? new Date(e.endDateTime)
        : new Date(e.startDateTime))
        .toISOString()
        .slice(0, 10);
      return iso >= s && iso <= en;
    });
    return {
      date: iso,
      hasEvents: matching.length > 0,
      eventCount: matching.length,
      colors: matching
        .flatMap((e) => e.categories.map((c) => c.color))
        .slice(0, 3),
    };
  });
  return { year, month, days, events: monthEvents };
}

export async function generateItinerary(
  request: GenerateItineraryRequest,
): Promise<ItineraryDto> {
  await wait(400);
  const { categories, entryPreference, lodgingLocation } = request;

  let pool: AttractionDto[] = ATTRACTIONS;
  if (categories.length) {
    pool = pool.filter((a) =>
      a.categories.some((c) => categories.includes(c.slug)),
    );
  }
  if (entryPreference !== "both") {
    pool = pool.filter((a) => a.price.entryType === entryPreference);
  }
  if (pool.length === 0) pool = ATTRACTIONS.slice();

  const lat = lodgingLocation.latitude ?? -27.8159;
  const lng = lodgingLocation.longitude ?? -50.3261;

  const ranked = pool
    .map((a) => ({
      a,
      dist:
        a.location.latitude && a.location.longitude
          ? haversine(lat, lng, a.location.latitude, a.location.longitude)
          : 5,
    }))
    .sort((x, y) => y.a.rating - x.a.rating || x.dist - y.dist);

  const start = new Date(request.arrivalDate);
  const end = new Date(request.departureDate);
  const totalDays =
    Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
    );

  const days: ItineraryDayDto[] = [];
  let idx = 0;
  for (let d = 0; d < totalDays; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const isoDate = date.toISOString().slice(0, 10);
    const perDay = Math.min(4, Math.max(2, Math.ceil(ranked.length / totalDays)));
    const items: ItineraryItemDto[] = [];
    const times = ["09:00", "11:30", "14:30", "17:00"];
    for (let i = 0; i < perDay; i++) {
      if (ranked.length === 0) break;
      const { a, dist } = ranked[idx % ranked.length];
      idx++;
      items.push({
        id: `${a.id}-${d}-${i}`,
        placeType: "attraction",
        placeId: a.id,
        name: a.name,
        categories: a.categories,
        location: a.location,
        openingHoursText: a.openingHoursText,
        price: a.price,
        rating: a.rating,
        distanceKm: Number(dist.toFixed(1)),
        distanceText: `${dist.toFixed(1)} km da sua hospedagem`,
        suggestedTime: times[i] ?? null,
        weatherAlert:
          d === 0 && a.isOutdoor
            ? "Possibilidade de chuva fraca — considere levar um casaco."
            : null,
        externalLinks: a.externalLinks,
      });
    }

    // Inject matching events on this date
    const matchingEvents: EventDto[] = EVENTS.filter((e) => {
      const s = new Date(e.startDateTime).toISOString().slice(0, 10);
      const en = (e.endDateTime
        ? new Date(e.endDateTime)
        : new Date(e.startDateTime))
        .toISOString()
        .slice(0, 10);
      return (
        isoDate >= s &&
        isoDate <= en &&
        (categories.length === 0 ||
          e.categories.some((c) => categories.includes(c.slug))) &&
        (entryPreference === "both" || e.price.entryType === entryPreference)
      );
    });
    matchingEvents.slice(0, 1).forEach((e, i) => {
      items.push({
        id: `${e.id}-${d}-evt-${i}`,
        placeType: "event",
        placeId: e.id,
        name: e.name,
        categories: e.categories,
        location: e.location,
        openingHoursText: new Date(e.startDateTime).toLocaleString("pt-BR", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        price: e.price,
        rating: e.rating,
        distanceKm:
          e.location.latitude && e.location.longitude
            ? Number(haversine(lat, lng, e.location.latitude, e.location.longitude).toFixed(1))
            : 0,
        distanceText: "Evento em Lages",
        suggestedTime: "20:00",
        weatherAlert: null,
        externalLinks: e.externalLinks,
      });
    });

    days.push({
      dayNumber: d + 1,
      date: isoDate,
      title: `Dia ${d + 1}`,
      items: items.slice(0, 4),
    });
  }

  return {
    id: `itin-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    days,
  };
}
