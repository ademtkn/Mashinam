# Mashinam — handoff / roadmap

> Bu dosya, projede çalışan her yapay zeka asistanı (Claude, Codex, …) ve insan için
> devir notudur. **Bir göreve başlamadan önce oku; görevi bitirince "Done log" ve
> "Next" bölümlerini güncelle.** Owner Türkçe yazar; kod ve commit mesajları İngilizce.
> **2026-11-14:** Web (GitHub Pages) yalnızca iç önizleme; Android debug + release build'leri
> fiziksel telefonda test edildi. iOS henüz cihazda denenmedi.

## What this is
Instagram/Reels-style vertical feed for used-car listings in Kyrgyzstan.
Expo SDK 58 + Expo Router + TypeScript. Listings are posted by the administrator only,
through a structured WhatsApp form; the service is completely free. Phase 2 = Supabase
(listings, favourites, storage/CDN, push) + a real WhatsApp OTP provider.

- Repo: https://github.com/ademtkn/Mashinam (branch `main` = source, `gh-pages` = built site)
- Live preview: https://ademtkn.github.io/Mashinam/
- Sibling project: InstaHouse (`../InstaHouse`, same structure, real-estate). The owner's
  standing rule: **every task given for Mashinam must also be applied to InstaHouse** (and
  vice versa where it makes sense). **The 2026-11-14 pass is ready to port**; the next chat continues
  in InstaHouse/HANDOFF.md → "Incoming port from Mashinam (2026-11-14)".

## Run / check / publish
```bash
npm ci
npx expo start                      # dev server (web: press w)
npx tsc --noEmit && npx expo lint    # must both pass before any commit
EXPO_BASE_URL=/Mashinam npx expo export --platform web   # production web build -> dist/

# Native Android (device connected; android/ is generated, gitignored)
npx expo run:android --device <adb-id>                  # debug build + Metro
cd android && ./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a
cd android && ./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
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
`devices['iPhone 13']`) or raw CDP. Gotchas:
- **Never scroll the feed programmatically** (`scrollTo`/`scrollTop`): Chrome's scroll-snap snaps back to card 0.
  Use slow touch drags via CDP `Input.dispatchTouchEvent` (one card per drag). Pull-to-refresh = drag down from the top.
- `Page.captureScreenshot` with `--virtual-time-budget` can capture before React Native's `Animated` reveal finishes
  (the card looks empty). Wait with real time / CDP instead.
- A card active **≥ 3 s** is marked "seen" (localStorage `mashinam.seenCars.v1`) and changes the next load's order.
  On every pull / tab press the unseen pool is reshuffled; seen cards stay below.
- `?car=<id>` pins a listing to the top — use it to screenshot a specific card.
- `python3 -m http.server` has no SPA fallback: don't `reload()` on `/Mashinam/profile`; GitHub Pages serves
  `404.html` so it works live. Use the in-app tab links for screenshots.
- `Alert.alert` is a no-op on react-native-web; use in-app confirmations.
- Deferred actions run after sign-in must receive the user as an argument (closures captured before sign-in see `user = null`).
- **Local sign-in demo:** `LOCAL_AUTH_DEMO = true` in `constants/config.ts`; the 6-digit code is shown in the
  sheet as "Демо-код: XXXXXX". No network/OTP provider is involved.
- **Legal links** open `LegalSheet` (a sibling `Modal`) from sign-in / listing, and the full-page routes
  `/legal/privacy`, `/legal/terms` from Profile.
- Storage keys: `mashinam.user.v1`, `mashinam.favorites.v1.<phone>`, `mashinam.lang.v1`, `mashinam.seenCars.v1`.
- **Android device (Xiaomi/MIUI):** `adb install` fails with `INSTALL_FAILED_USER_RESTRICTED` even with
  "Install via USB" enabled; the `AdbInstallActivity` prompt auto-rejects and ignores injected taps. Workaround:
  `adb push` the APK to `/sdcard/Download/`, open it from Downloads (`am start -a android.intent.action.VIEW_DOWNLOADS
  -p com.google.android.documentsui`), then tap DEVAM → GÜNCELLE/Yükle. `uiautomator dump` gives exact bounds;
  the standard installer accepts `input tap`. The debug app needs Metro: `adb reverse tcp:8081 tcp:8081`.
- The system navigation bar is painted navy at runtime by `expo-navigation-bar` (`utils/navigationBar.android.ts`,
  `NavigationBar.setStyle('dark')` + plugin `enforceContrast: false`).
- `expo export` prints "Files (3)" but still copies `public/` into `dist/`; check `dist/media` exists (~39 MB).
- Commons only serves the pre-generated widths **330 / 500 / 960 / 1280 px**; other widths (640/800/1024) return HTTP 400. `CarFeedCard` uses 330 for the blurred fill and 960 for the main photo.
- CDP `.click()` on a leaf `Text` may not trigger a React Native `Pressable`. Click the `[role="button"]` element
  or dispatch a real mouse/touch event at its bounding box.

## Conventions & product decisions
- Every seller phone number is the owner's test number **+996 502 00 19 03**; the old demo-contact preview was removed,
  so WhatsApp/Call always open wa.me / tel:. Keep it that way until real listings exist.
- UI languages: Russian (default), Kyrgyz, Turkish — `constants/i18n.ts`. Every new string goes into all three.
  The Kyrgyz strings were written by non-native speakers; the owner should review them.
- **Accounts are one-step:** phone (+996) + WhatsApp OTP. No password, no e-mail in the form; name optional.
  `LOCAL_AUTH_DEMO` generates the code on-device for local testing; replace it with a real provider before release
  (Supabase Auth + Send SMS Hook → local SMS, or WhatsApp via Twilio Verify). Legacy plaintext passwords are
  removed from AsyncStorage on load.
- **Consent:** sign-in has a privacy/terms checkbox; the listing form has a separate consent for publishing the
  seller's phone/WhatsApp. The legal texts are drafts for placeholder company **X** and need a Kyrgyz lawyer review.
- Listings expire **15 days** after `createdAt` (`LISTING_LIFETIME_DAYS`). Demo dates are relative to "now".
- Only the admin posts listings. The "Подать" tab is a structured form that composes a Russian message and opens
  the admin WhatsApp; photos are attached in the chat. `ADMIN_CONTACTS` (Telegram/e-mail) are **placeholders**.
- The service is **free**: no paid placement, no commission, no banners.
- Cities: 15 across Kyrgyzstan (`types/car.ts`, `constants/cities.ts`); the feed has a city filter and defaults
  to "Кыргызстан". Demo listings were spread to Batken, Cholpon-Ata, Kara-Balta and Uzgen.
- Feed order: unseen listings first (shuffled on every load **and every refresh/tab press**, even with filters),
  then already-seen ones in a stable order with a wavy "you've seen everything below" divider on the first seen card.
- Demo photos come from Wikimedia Commons (CC/PD, credit shown on each card) and videos from Pexels; **never** copy
  photos from mashina.kg / lalafo (real sellers' copyrighted photos). Generator scripts: `tools/listings/README.md`.
- Brand: navy `#0B1426` + amber `#FFB020`, "M" monogram. Regenerate assets with
  `python3 tools/brand/generate_assets.py`. Bundle IDs are placeholders: `kg.mashinam.app`.

## Code map
- `app/(tabs)/index.tsx` feed (pull-to-refresh, seen tracking, deep link, language switch, city filter) ·
  `favorites.tsx` · `sell.tsx` (admin WhatsApp listing form) · `profile.tsx` (account, legal links, delete)
- `app/legal/privacy.tsx`, `app/legal/terms.tsx` · `app/_layout.tsx` (providers, tablet frame)
- `components/CarFeedCard.tsx` full-screen card (gallery, video, seller row, price drop, share) ·
  `FilterBar.tsx` (brand/price/city) · `SignInSheet.tsx` (phone + WhatsApp OTP demo) · `LegalSheet.tsx` ·
  `LegalScreen.tsx` · `LegalDocumentView.tsx` · `ConsentCheck.tsx` · `SeenDivider.tsx` · `SellerRow.tsx` ·
  `ActionButtons.tsx` (WhatsApp/call/share)
- `constants/legal.ts` (RU/KY/TR privacy + terms, company X) · `constants/cities.ts` · `constants/config.ts`
  (`LOCAL_AUTH_DEMO`, `LISTING_LIFETIME_DAYS`, `ADMIN_CONTACTS`) · `constants/i18n.ts`
- `context/` Auth, Favorites, Language · `hooks/` usePullToRefresh, useSeenCars · `utils/phone.ts` ·
  `services/carService.ts` (data access; swap for Supabase in phase 2)
- `data/mockCars.ts`, `mockCars2.ts`, `videoCars.ts` (117 listings) · `public/media/` Pexels clips re-encoded to 720×1280
- `tools/brand/generate_assets.py` (icon/splash) · `tools/listings/` (demo listing generators)

## Done log
- 2026-11-10 Prototype: vertical feed, gallery swipe, filters, WhatsApp/call buttons, favourites, first 50 demo listings.
- 2026-11-11 Reels-style videos, random order with pull-to-refresh, seen-tracking + divider, GitHub Pages publishing.
- 2026-11-12 "Today N new · M price drops" chip, NEW/price-drop badges, seller row, share with deep link, RU/KG/TR,
  9 Pexels video listings, 50 more Commons listings (117 total), 15-day lifetime, admin-only posting, device sign-in.
- 2026-11-13 Card simplified (no accident/customs/owners labels), registration with e-mail+password, Profile tab
  (edit details, notifications toggle, sign out, delete account), guest encouragement. All live.
- 2026-11-14 Cleanup: removed the unused DemoContactModal/DEMO_MODE path, `isDefaultFilters`, `daysAgo`, `orange`,
  21 unused i18n keys in RU/KY/TR and the unused `icon-512.png`. All 64 `public/media` files are still referenced;
  no unused style keys. `tsc`/lint pass, web smoke test (feed/sign-in/sell) and the rebuilt release APK on the phone
  (feed + navy nav bar) verified.
- 2026-11-14 Android device pass: built/installed the debug APK on a Poco X3 Pro (Android 12); verified feed,
  video, one-step phone + demo OTP sign-in, city modal/filter, sell form; fixed the white system navigation bar
  with `expo-navigation-bar` (`setStyle('dark')`, `enforceContrast: false`). MIUI install workaround documented.
  Built and verified a standalone release APK (34 MB, arm64) with Metro stopped. Fixed a release-only bug where the
  main card photo stayed invisible because of `expo-image`'s `transition={250}`; removing it restored 960 px photos.
- 2026-11-14 Local app-first pass: navy/amber monogram icon + adaptive icon + splash (`tools/brand`); bundle IDs and
  `expo-splash-screen`; one-step phone + WhatsApp OTP demo (no password/e-mail, legacy password purged); legal
  privacy/terms for company X + consent checkboxes and screens; structured admin WhatsApp listing form; 15-city
  KG-wide filter; every refresh reshuffles unseen cards and keeps seen ones below (3 s threshold); tablet/web
  centred frame; 960 px Commons images; profile polish. `tsc`/lint pass; web export; CDP-tested sign-in, sell form,
  legal sheet, city filter, pull/tab refresh. **Published to `gh-pages` (8109fbf) and verified live
  (https://ademtkn.github.io/Mashinam/, entry-8adf45c034ab9c39bbbb072462827851.js); main source 196994c.**

## In progress / blocked
- **Real WhatsApp OTP** is not implemented. `LOCAL_AUTH_DEMO=true` is on-device only; set it to false and wire
  Supabase Auth + a provider before any public build.
- **Legal review:** `constants/legal.ts` is a product draft for placeholder company **X**; needs a Kyrgyz
  lawyer/native review, real company details, a real contact address and a privacy-policy URL for the stores.
- **Native build:** a debug APK and a standalone **release** APK (34 MB, arm64) have been built and tested on a
  Poco X3 Pro (Android 12). The release build was launched with Metro stopped; feed + tab navigation work. It is
  signed with the generated debug keystore, so it is only for local testing. Still no EAS project/`eas.json`;
  bundle IDs are placeholders (`kg.mashinam.app`).
- **`expo-system-ui`:** not installed, so the declarative dark `userInterfaceStyle` is not applied on Android. The app
  is visually dark anyway; add it before relying on system dark-mode APIs.
- **Tablet:** the feed is a centred 560 px column on native tablets; a 2-3 column grid is still deferred.
- **Demo supply:** 117 demo listings, all pointing at the test number; real admin listings and owner-shot vertical
  videos are needed before store submission.
- **Admin contacts:** `ADMIN_CONTACTS.telegram` and `admin@mashinam.kg` are placeholders.
- **Analytics/Sentry/Supabase/push** are not installed.
- **InstaHouse port** is prepared (handoff only); the next chat applies the "Incoming port" checklist. No
  feature work has been done in InstaHouse yet.
- The GitHub Actions Pages workflow is still blocked by the account billing lock; publishing stays manual.

## Session close & InstaHouse handoff (2026-11-14)

- Mashinam final state: `main` `8e6d795`, `gh-pages` `79f23c8`; live https://ademtkn.github.io/Mashinam/.
  Standalone release APK: `android/app/build/outputs/apk/release/app-release.apk` (34 MB, arm64, local
  debug keystore). `tsc`/lint pass; web smoke test and Android feed/nav-bar verified.
- Next chat: open `../InstaHouse` and read `InstaHouse/HANDOFF.md` → **"Incoming port from Mashinam (2026-11-14)"**.
  Port the patterns, not the car content. Keep InstaHouse's `CurrencySwitch`/`CurrencyContext` (USD/som) and
  its real-estate fields (dealType, property type, rooms, area, floor, documents, condition, furnished).
  Do **not** copy the car "M" icon or the car-specific legal text; rewrite the legal docs for real estate.
- Ledger of the reference pass: `ed233be` (brand/auth/legal/admin form/cities/feed), `196994c` (960 px),
  `53f47a6` (Android nav bar/release), `b6254ca` (release image transition), `8e6d795` (cleanup).

## Next (owner's roadmap, in priority order)
1. Legal review + real company/contact details (replace X, `admin@mashinam.kg`, bundle IDs/domain).
2. Real WhatsApp OTP: Supabase Auth + Send SMS Hook (local SMS provider such as SMSPRO/Nikita) or Twilio Verify
   WhatsApp; then `LOCAL_AUTH_DEMO=false`. Keep the one-step phone flow.
3. Native dev build (EAS or local Xcode/Android) on a real phone and tablet; verify icon/splash, safe areas,
   video playback, and the OTP/consent flow.
4. Seed 200-300 real listings through the admin WhatsApp form; replace Pexels clips with owner-shot vertical videos.
5. Supabase listings/favourites/storage + CDN variants; push for price drops/saved searches; verified seller.
6. Tablet 2-3 column grid, analytics/Sentry, saved-search alerts, price history, report/block, store submission.
7. Mirror the reusable parts (auth/legal/city filter) into InstaHouse with real-estate texts.
