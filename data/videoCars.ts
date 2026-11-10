import type { Car, Photo } from '../types/car';
import { mediaUrl } from '../utils/media';

// Demo listings built from free Pexels clips (Pexels License: free to use,
// credit optional). Videos are re-encoded to 720p and kept under 40 s; the
// photos are frames from the same clip, so they always show the same car.
// Files live in public/media/. Specs and prices are invented.

const PEXELS_PAGES: Record<string, string> = {
  '28677720': 'scenic-road-drive-at-sunset-28677720',
  '33596416': 'sleek-white-sports-car-in-outdoor-setting-33596416',
  '38822139': 'suv-driving-through-desert-landscape-38822139',
  '39371401': 'sleek-red-sports-car-driving-on-urban-highway-39371401',
  '35143674': 'rugged-pickup-truck-in-vast-mountain-landscape-35143674',
  '39285143': 'dynamic-orange-sports-car-on-city-waterfront-39285143',
  '29195381': 'vintage-car-on-rainy-street-at-night-29195381',
};

const credit = (pexelsId: string) => ({
  author: 'Pexels',
  license: 'Pexels License',
  source: `https://www.pexels.com/video/${PEXELS_PAGES[pexelsId]}/`,
});

const video = (file: string, pexelsId: string): Photo => ({
  uri: mediaUrl(`${file}-poster.jpg`),
  video: [{ uri: mediaUrl(`${file}.mp4`), mime: 'video/mp4' }],
  fullBleed: true,
  ...credit(pexelsId),
});

const photo = (file: string, pexelsId: string): Photo => ({
  uri: mediaUrl(`${file}.jpg`),
  fullBleed: true,
  ...credit(pexelsId),
});

export const videoCars: Car[] = [
  {
    id: 'p1',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2021,
    priceUsd: 36500,
    mileageKm: 46000,
    fuel: 'Dizel',
    transmission: 'Otomatik',
    city: 'Karakol',
    photos: [
      video('hilux', '35143674'),
      photo('hilux-1', '35143674'),
      photo('hilux-2', '35143674'),
    ],
    sellerName: 'Nurbek',
    sellerPhone: '+996502001903',
    whatsappPhone: '+996502001903',
    createdAt: '2026-11-11T08:10:00Z',
  },
  {
    id: 'p2',
    brand: 'Toyota',
    model: 'Land Cruiser 200',
    year: 2016,
    priceUsd: 52000,
    mileageKm: 132000,
    fuel: 'Dizel',
    transmission: 'Otomatik',
    city: 'Oş',
    photos: [
      video('lc200', '38822139'),
      photo('lc200-1', '38822139'),
      photo('lc200-2', '38822139'),
    ],
    sellerName: 'Erlan',
    sellerPhone: '+996502001903',
    whatsappPhone: '+996502001903',
    createdAt: '2026-11-11T07:45:00Z',
  },
  {
    id: 'p3',
    brand: 'Fiat',
    model: 'Egea',
    year: 2019,
    priceUsd: 11500,
    mileageKm: 78000,
    fuel: 'Benzin',
    transmission: 'Manuel',
    city: 'Bişkek',
    photos: [
      video('fiat-egea', '28677720'),
      photo('fiat-egea-1', '28677720'),
      photo('fiat-egea-2', '28677720'),
    ],
    sellerName: 'Aidana',
    sellerPhone: '+996502001903',
    whatsappPhone: '+996502001903',
    createdAt: '2026-11-11T06:30:00Z',
  },
  {
    id: 'p4',
    brand: 'Toyota',
    model: 'GT86',
    year: 2017,
    priceUsd: 19500,
    mileageKm: 54000,
    fuel: 'Benzin',
    transmission: 'Manuel',
    city: 'Bişkek',
    photos: [
      video('gt86-white', '33596416'),
      photo('gt86-white-1', '33596416'),
      photo('gt86-white-2', '33596416'),
    ],
    sellerName: 'Timur',
    sellerPhone: '+996502001903',
    whatsappPhone: '+996502001903',
    createdAt: '2026-11-10T21:15:00Z',
  },
  {
    id: 'p5',
    brand: 'Toyota',
    model: 'GT86',
    year: 2014,
    priceUsd: 16800,
    mileageKm: 89000,
    fuel: 'Benzin',
    transmission: 'Manuel',
    city: 'Bişkek',
    photos: [
      video('gt86-orange-a', '39285143'),
      video('gt86-orange-b', '39371401'),
      photo('gt86-orange-1', '39285143'),
      photo('gt86-orange-2', '39285143'),
    ],
    sellerName: 'Daniyar',
    sellerPhone: '+996502001903',
    whatsappPhone: '+996502001903',
    createdAt: '2026-11-10T19:40:00Z',
  },
  {
    id: 'p6',
    brand: 'Mercedes-Benz',
    model: '280 E (W123)',
    year: 1983,
    priceUsd: 6800,
    mileageKm: 310000,
    fuel: 'Benzin',
    transmission: 'Otomatik',
    city: 'Bişkek',
    photos: [
      video('mercedes-w123', '29195381'),
      photo('mercedes-w123-1', '29195381'),
    ],
    sellerName: 'Kubat',
    sellerPhone: '+996502001903',
    whatsappPhone: '+996502001903',
    createdAt: '2026-11-10T17:05:00Z',
  },
];
