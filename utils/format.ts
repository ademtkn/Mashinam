// "25 500 $" — thin grouping with plain spaces so it renders the same everywhere.
export function formatPrice(usd: number): string {
  return `${String(usd).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} $`;
}

export function formatKm(km: number): string {
  return `${String(km).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km`;
}
