import type { GeneratedItineraryResult } from "@/types/tourism";

const KEY = "lst.itinerary.v1";

export function saveItinerary(result: GeneratedItineraryResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(result));
}

export function loadItinerary(): GeneratedItineraryResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
