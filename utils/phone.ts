// Kyrgyz mobile numbers are +996 followed by 9 digits. Accept spaces, dashes
// and a leading 996; store the canonical 12-digit form (996XXXXXXXXX).
export function localDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('996') ? digits.slice(3) : digits;
}

export function isValidKgPhone(raw: string): boolean {
  return /^[1-9]\d{8}$/.test(localDigits(raw));
}

export function fullKgPhone(raw: string): string {
  return `996${localDigits(raw)}`;
}
