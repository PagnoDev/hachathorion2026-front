import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveMapUrl(location: {
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): string | null {
  if (location.mapUrl) return location.mapUrl;
  if (location.latitude != null && location.longitude != null)
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  return null;
}
