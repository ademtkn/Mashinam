import { LISTING_LIFETIME_DAYS } from '../constants/config';
import type { Lang } from '../constants/i18n';

// Demo data is dated relative to "now" so "today's listings" never go stale.
const LOADED_AT = Date.now();
export const hoursAgo = (h: number) => new Date(LOADED_AT - h * 3600_000).toISOString();

export const NEW_WINDOW_MS = 24 * 3600_000;

// Listings live for LISTING_LIFETIME_DAYS after posting.
export const daysLeft = (createdAt: string) =>
  Math.ceil((Date.parse(createdAt) + LISTING_LIFETIME_DAYS * 86_400_000 - Date.now()) / 86_400_000);
export const isLive = (createdAt: string) => daysLeft(createdAt) > 0;
export const isNew = (iso: string) => Date.now() - Date.parse(iso) < NEW_WINDOW_MS;

// "2 сағ назад" / "3 күн мурун" / "5 dk önce"
export function timeAgo(iso: string, lang: Lang): string {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  const u = UNITS[lang];
  if (mins < 60) return u.min(mins);
  if (hours < 24) return u.hour(hours);
  return u.day(days);
}

const UNITS: Record<Lang, { min: (n: number) => string; hour: (n: number) => string; day: (n: number) => string }> = {
  ru: { min: (n) => `${n} мин назад`, hour: (n) => `${n} ч назад`, day: (n) => `${n} дн. назад` },
  ky: { min: (n) => `${n} мүн. мурун`, hour: (n) => `${n} саат мурун`, day: (n) => `${n} күн мурун` },
  tr: { min: (n) => `${n} dk önce`, hour: (n) => `${n} sa önce`, day: (n) => `${n} gün önce` },
};
