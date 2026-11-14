// "25 500 $" — thin grouping with plain spaces so it renders the same everywhere.
export function formatPrice(usd: number): string {
  return `${String(usd).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} $`;
}

export function formatKm(km: number): string {
  return `${String(km).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km`;
}

// +996 502 00 19 03 — keeps the number readable in the profile and OTP step.
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const local = digits.startsWith('996') ? digits.slice(3) : digits;
  if (local.length !== 9) return `+${digits}`;
  return `+996 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}
