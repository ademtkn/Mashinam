export type FuelType = 'Benzin' | 'Dizel' | 'Hibrit' | 'Gaz/Benzin' | 'Elektrik';
export type Transmission = 'Otomatik' | 'Manuel';
export type City = 'Bişkek' | 'Oş' | 'Karakol' | 'Celalabad' | 'Tokmok' | 'Narın' | 'Talas';

export interface Photo {
  uri: string;
  // Credit fields are only needed for licensed stock photos (demo data).
  author?: string;
  license?: string;
  source?: string;
}

// Field names map 1:1 to the planned Supabase `cars` table (snake_case there).
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  priceUsd: number;
  mileageKm: number;
  fuel: FuelType;
  transmission: Transmission;
  city: City;
  photos: Photo[];
  sellerName: string;
  sellerPhone: string; // E.164, e.g. +996555123456
  whatsappPhone: string;
  createdAt: string;
}

export type PriceRangeId = 'all' | 'lt15' | '15to30' | 'gt30';

export interface CarFilters {
  brand: string | null;
  priceRange: PriceRangeId;
}
