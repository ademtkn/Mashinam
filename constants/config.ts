// A listing is shown for this many days after it was posted, then it drops
// out of the feed. Sellers are told to get in touch again to extend it.
export const LISTING_LIFETIME_DAYS = 15;

// Local-only WhatsApp OTP demo: the code is generated on the device and
// shown on screen so the flow can be tested without a backend. Replace it
// with a real provider (Supabase Send SMS Hook + local SMS, or WhatsApp via
// Twilio) before a public build. Never ship with this true.
export const LOCAL_AUTH_DEMO = true;

// Only the administrator posts listings; people send their car details here.
// Telegram and e-mail are placeholders until the owner provides real ones.
export const ADMIN_CONTACTS = {
  whatsappPhone: '+996502001903',
  telegram: 'https://t.me/+996502001903',
  email: 'admin@mashinam.kg',
};
