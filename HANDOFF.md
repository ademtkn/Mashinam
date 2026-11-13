# Mashinam — handoff / roadmap

> Bu dosya, projede çalışan her yapay zeka asistanı (Claude, Codex, …) ve insan için
> devir notudur. **Bir göreve başlamadan önce oku; görevi bitirince "Done log" ve
> "Next" bölümlerini güncelle.** Owner Türkçe yazar; kod ve commit mesajları İngilizce.

## What this is
Instagram/Reels-style vertical feed for used-car listings in Kyrgyzstan.
Expo SDK 58 + Expo Router + TypeScript, runs as a web app (GitHub Pages) and as a
native app (not yet built). Phase 1 = frontend with demo data; Phase 2 = Supabase
(auth with SMS, listings, favourites, push).

- Repo: https://github.com/ademtkn/Mashinam (branch `main` = source, `gh-pages` = built site)
- Live: https://ademtkn.github.io/Mashinam/
- Sibling project: InstaHouse (`../InstaHouse`, same structure, real-estate). The owner's
  standing rule: **every task given for Mashinam must also be applied to InstaHouse** (and
  vice versa where it makes sense).

## Run / check / publish
```bash
npm ci
npx expo start                      # dev server (web: press w)
npx tsc --noEmit && npx expo lint    # must both pass before any commit
EXPO_BASE_URL=/Mashinam npx expo export --platform web   # production web build -> dist/
```
Publishing is **manual** (the owner's GitHub account is billing-locked, so the
`.github/workflows/deploy-pages.yml` workflow never runs):
```bash
git clone --branch gh-pages https://github.com/ademtkn/Mashinam.git /tmp/ghp
cd /tmp/ghp && git rm -rq . && cp -R <repo>/dist/. . && cp index.html 404.html && touch .nojekyll
git add -A && git commit -m "Web build for GitHub Pages (from main <sha>)" && git push origin gh-pages
# live after ~20-80 s; verify: curl -s https://ademtkn.github.io/Mashinam/ | grep -oE 'entry-[a-f0-9]+\.js'
```
Commit messages end with a `Co-Authored-By:` line naming the assistant that wrote the change.

## Testing the web build (what has worked)
Serve `dist/` under the base path (`mkdir site && cp -R dist site/Mashinam && cd site && python3 -m http.server 8099`)
and drive it with Playwright + Chrome (`executablePath: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
`devices['iPhone 13']`). Gotchas:
- **Never scroll the feed programmatically** (`scrollTo`/`scrollTop`): Chrome's scroll-snap snaps back to card 0.
  Use slow touch drags via CDP `Input.dispatchTouchEvent` (one card per drag). Pull-to-refresh = drag down from the top.
- Far cards render as empty placeholders on web, so only ~3 titles exist in the DOM at a time.
- A card active ≥ 1.5 s is marked "seen" (localStorage `mashinam.seenCars.v1`) and changes the next load's order.
- `?car=<id>` pins a listing to the top — use it to screenshot a specific card.
- `python3 -m http.server` has no SPA fallback: don't `reload()` on `/Mashinam/profile`; GitHub Pages serves `404.html` so it works live.
- `Alert.alert` is a no-op on react-native-web; use in-app confirmations.
- Deferred actions run after sign-in must receive the user as an argument (closures captured before sign-in see `user = null`).
- Storage keys: `mashinam.user.v1`, `mashinam.favorites.v1.<phone>`, `mashinam.lang.v1`, `mashinam.seenCars.v1`.

## Conventions & product decisions
- Every seller phone number is the owner's test number **+996 502 00 19 03**; `DEMO_MODE` (constants/config.ts) is off so
  WhatsApp/Call really open wa.me / tel:. Keep it that way until real listings exist.
- UI languages: Russian (default), Kyrgyz, Turkish — `constants/i18n.ts`. Every new string goes into all three.
  The Kyrgyz strings were written by non-native speakers; the owner should review them.
- Listings expire **15 days** after `createdAt` (`LISTING_LIFETIME_DAYS`). Demo dates are relative to "now" and clamped ≤ 14 days.
- Only the admin posts listings: the "Подать" tab shows WhatsApp / Telegram / e-mail buttons (`ADMIN_CONTACTS`).
  Telegram link and `admin@mashinam.kg` are **placeholders** until the owner provides real ones.
- Accounts are on-device only (name, phone, optional e-mail, password ≥ 4, notifications flag). The app is fully usable
  without an account; only liking/favourites require one.
- Demo photos come from Wikimedia Commons (CC/PD, credit shown on each card) and videos from Pexels; **never** copy
  photos from mashina.kg / lalafo (real sellers' copyrighted photos). Generator scripts: `tools/listings/README.md`.
- Feed order: unseen listings first (shuffled on every load/refresh), then already-seen ones in a stable order with a
  wavy "you've seen everything below" divider on the first seen card; all seen → full shuffle.

## Code map
- `app/(tabs)/index.tsx` feed (pull-to-refresh, seen tracking, deep link, language switch) · `favorites.tsx` · `sell.tsx` (admin contacts) · `profile.tsx`
- `components/CarFeedCard.tsx` full-screen card (gallery, video, seller row, price drop, share) · `FilterBar.tsx` · `SignInSheet.tsx` · `SeenDivider.tsx` · `SellerRow.tsx` · `ActionButtons.tsx` (WhatsApp/call/share)
- `context/` Auth, Favorites, Language · `hooks/` usePullToRefresh, useSeenCars · `services/carService.ts` (data access; swap for Supabase in phase 2)
- `data/mockCars.ts`, `mockCars2.ts`, `videoCars.ts` (117 listings) · `public/media/` Pexels clips re-encoded to 720×1280

## Done log
- 2026-11-10 Prototype: vertical feed, gallery swipe, filters, WhatsApp/call buttons, favourites, first 50 demo listings.
- 2026-11-11 Reels-style videos, random order with pull-to-refresh, seen-tracking + divider, GitHub Pages publishing.
- 2026-11-12 "Today N new · M price drops" chip, NEW/price-drop badges, seller row, share with deep link, RU/KG/TR,
  9 Pexels video listings, 50 more Commons listings (117 total), 15-day lifetime, admin-only posting, device sign-in.
- 2026-11-13 Card simplified (no accident/customs/owners labels), registration with e-mail+password, Profile tab
  (edit details, notifications toggle, sign out, delete account), guest encouragement. All live.

## In progress / blocked
- Nothing in progress. The InstaHouse mirror of the 2026-11-13 changes is done and live (`../InstaHouse/HANDOFF.md`).

## Next (owner's roadmap, in priority order)
1. Real admin Telegram handle and e-mail in `constants/config.ts`.
2. Native-speaker review of the Kyrgyz strings in `constants/i18n.ts`.
3. Owner-shot vertical videos from the Bishkek car market to replace the Pexels clips.
4. Phase 2: Supabase — SMS auth replacing the device account, `cars`/`favorites` tables, image/video storage with
   resized variants (CDN), push notifications for price drops on favourites, admin upload tool.
5. Personalised ranking from favourites/filters; "seen" + favourites synced across devices.
6. If the GitHub billing lock is lifted: switch Pages source to "GitHub Actions" so pushes to `main` auto-deploy.
