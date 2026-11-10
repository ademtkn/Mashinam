import { mockCars } from '../data/mockCars';
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

// The feed is shown in a fresh random order on every load.
export async function fetchCars(): Promise<Car[]> {
  await new Promise((r) => setTimeout(r, 350));
  return shuffle(mockCars);
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
