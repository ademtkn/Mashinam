export type FuelType = 'Benzin' | 'Dizel' | 'Hibrit' | 'Gaz/Benzin' | 'Elektrik';
export type Transmission = 'Otomatik' | 'Manuel';
export type City = 'Bişkek' | 'Oş' | 'Karakol' | 'Celalabad' | 'Tokmok' | 'Narın' | 'Talas';
// Where the car was imported from. 'KG' = bought new locally / unknown.
export type ImportSource = 'JP' | 'KR' | 'US' | 'DE' | 'RU' | 'CN' | 'KG';

export interface VideoSource {
  uri: string;
  mime: string; // e.g. 'video/webm', 'video/mp4', 'video/quicktime'
}

// One page of a listing's gallery: a photo, or a short (<= 40 s) video.
// For videos, `uri` is the poster frame shown while loading.
export interface Photo {
  uri: string;
  video?: VideoSource[];
  // Portrait (9:16) media fills the whole screen like a reel instead of being letterboxed.
  fullBleed?: boolean;
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
  oldPriceUsd?: number; // set when the seller lowered the price
  mileageKm: number;
  fuel: FuelType;
  transmission: Transmission;
  city: City;
  importedFrom: ImportSource;
  accidentFree: boolean;
  customsCleared: boolean; // "растаможен" — the first thing buyers in KG ask
  owners: number;
  views: number;
  likes: number;
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
  onlyNew: boolean; // listed in the last 24 h, or price lowered
}
