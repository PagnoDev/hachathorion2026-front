import * as mock from "./mockApi";
import * as real from "./realApi";

type AnyFn = (...args: never[]) => Promise<unknown>;

async function withFallback<F extends AnyFn>(
  realFn: F,
  mockFn: F,
  args: Parameters<F>,
): Promise<Awaited<ReturnType<F>>> {
  try {
    return (await realFn(...args)) as Awaited<ReturnType<F>>;
  } catch {
    return (await mockFn(...args)) as Awaited<ReturnType<F>>;
  }
}

export const getCategories: typeof mock.getCategories = (...args) =>
  withFallback(real.getCategories, mock.getCategories, args);

export const getAttractions: typeof mock.getAttractions = (...args) =>
  withFallback(real.getAttractions, mock.getAttractions, args);

export const getAttraction: typeof mock.getAttraction = (...args) =>
  withFallback(real.getAttraction, mock.getAttraction, args);

export const getEventCalendar: typeof mock.getEventCalendar = (...args) =>
  withFallback(real.getEventCalendar, mock.getEventCalendar, args);

export const generateItinerary: typeof mock.generateItinerary = (...args) =>
  withFallback(real.generateItinerary, mock.generateItinerary, args);
