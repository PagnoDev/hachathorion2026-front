export type TravelReason =
  | "leisure"
  | "work"
  | "familyVisit"
  | "events"
  | "passingThrough";

export type TourismCategory =
  | "cultural"
  | "historical"
  | "religious"
  | "gastronomy"
  | "nature"
  | "ecotourism"
  | "adventure"
  | "rural"
  | "experience"
  | "events"
  | "business"
  | "shopping"
  | "leisure"
  | "sports"
  | "scienceTechnology"
  | "accessible"
  | "family"
  | "petFriendly";

export type EntryType = "free" | "paid";
export type EntryPreference = "free" | "paid" | "both";
export type PlaceType = "attraction" | "event";
export type AccessibilityStatus = "yes" | "no" | "unknown";
export type AudienceType =
  | "all"
  | "families"
  | "adults"
  | "children"
  | "elderly"
  | "tourists"
  | "residents";

export interface LocationDto {
  name: string;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: TourismCategory;
  color: string;
}

export interface PriceDto {
  entryType: EntryType;
  amount: number | null;
  description: string;
}

export interface ExternalLinkDto {
  label: string;
  url: string;
}

export interface MediaDto {
  url: string;
  type: "image" | "video" | "virtualTour";
  title: string | null;
}

export interface AttractionDto {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  categories: CategoryDto[];
  location: LocationDto;
  openingHoursText: string;
  price: PriceDto;
  accessibility: AccessibilityStatus;
  audience: AudienceType[];
  petFriendly: boolean | null;
  rating: number;
  coverImageUrl: string | null;
  media: MediaDto[];
  externalLinks: ExternalLinkDto[];
  isOutdoor: boolean;
}

export interface EventDto {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  categories: CategoryDto[];
  location: LocationDto;
  startDateTime: string;
  endDateTime: string | null;
  price: PriceDto;
  rating: number | null;
  externalLinks: ExternalLinkDto[];
  isOutdoor: boolean;
}

export interface GenerateItineraryRequest {
  travelReason: TravelReason;
  categories: TourismCategory[];
  entryPreference: EntryPreference;
  lodgingLocation: LocationDto;
  arrivalDate: string;
  departureDate: string;
}

export interface ItineraryItemDto {
  id: string;
  placeType: PlaceType;
  placeId: string;
  name: string;
  categories: CategoryDto[];
  location: LocationDto;
  openingHoursText: string;
  price: PriceDto;
  rating: number | null;
  distanceKm: number;
  distanceText: string;
  suggestedTime: string | null;
  weatherAlert: string | null;
  externalLinks: ExternalLinkDto[];
}

export interface ItineraryDayDto {
  dayNumber: number;
  date: string;
  title: string;
  items: ItineraryItemDto[];
}

export interface ItineraryDto {
  id: string;
  generatedAt: string;
  days: ItineraryDayDto[];
}

export interface CalendarDayDto {
  date: string;
  hasEvents: boolean;
  eventCount: number;
  colors: string[];
}

export interface EventCalendarDto {
  year: number;
  month: number;
  days: CalendarDayDto[];
  events: EventDto[];
}

export interface TouristGuideDto {
  attractions: AttractionDto[];
}

export interface FieldErrorDto {
  field: string;
  message: string;
}

export interface ApiErrorDto {
  message: string;
  errors: FieldErrorDto[];
}

export interface GeneratedItineraryResult {
  request: GenerateItineraryRequest;
  itinerary: ItineraryDto;
}
