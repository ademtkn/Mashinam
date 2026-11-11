import { mockCars } from '../data/mockCars';
import { videoCars } from '../data/videoCars';
import type { Car, CarFilters, PriceRangeId } from '../types/car';
import { shuffle } from '../utils/shuffle';

// Phase 2: replace the body of these functions with Supabase queries.
// Screens only talk to this module, so nothing else needs to change.

export const PRICE_RANGES: { id: PriceRangeId; label: string; min: number; max: number }[] = [
  { id: 'all', label: 'Tüm fiyatlar', min: 0, max: Infinity },
  { id: 'lt15', label: '< 15K $', min: 0, max: 15000 },
  { id: '15to30', label: '15K – 30K $', min: 15000, max: 30000 },
  { id: 'gt30', label: '30K $ +', min: 30000, max: Infinity },
];

export async function fetchCars(): Promise<Car[]> {
  await new Promise((r) => setTimeout(r, 350));
  return [...mockCars, ...videoCars];
}

export interface FeedArrangement {
  cars: Car[];
  // Ids that were already seen when this order was built. The first card in the
  // feed with one of these ids gets the "you've seen everything below" divider.
  seenAtLoad: Set<string>;
}

// Feed order, Instagram style: listings this device hasn't seen yet come first,
// freshly shuffled on every load; the ones it has seen follow in a stable order
// (oldest view first). Once everything has been seen, the whole feed is shuffled.
export function arrangeFeed(cars: Car[], seen: Map<string, number>): FeedArrangement {
  const unseen = cars.filter((c) => !seen.has(c.id));
  if (unseen.length === 0 || unseen.length === cars.length) {
    return { cars: shuffle(cars), seenAtLoad: new Set() };
  }
  const seenCars = cars
    .filter((c) => seen.has(c.id))
    .sort((a, b) => (seen.get(a.id) ?? 0) - (seen.get(b.id) ?? 0));
  return {
    cars: [...shuffle(unseen), ...seenCars],
    seenAtLoad: new Set(seenCars.map((c) => c.id)),
  };
}

export function isDefaultFilters(f: CarFilters) {
  return f.brand === null && f.priceRange === 'all';
}

export function getBrands(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((c) => c.brand))).sort();
}

export function filterCars(cars: Car[], filters: CarFilters): Car[] {
  const range = PRICE_RANGES.find((r) => r.id === filters.priceRange) ?? PRICE_RANGES[0];
  return cars.filter(
    (c) =>
      (!filters.brand || c.brand === filters.brand) &&
      c.priceUsd >= range.min &&
      c.priceUsd < range.max,
  );
}
