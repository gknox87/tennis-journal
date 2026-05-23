## Goal

Serve the marketing landing page at `https://sportsjournal.app/` and the authenticated app at `https://hub.sportsjournal.app/`, while keeping a single codebase that Capacitor can wrap for iOS/Android.

## Architecture options

**Option A — Single codebase, host-aware routing (recommended)**
Keep one Lovable project. The router checks `window.location.hostname` and renders either the marketing routes or the app routes. Both subdomains point to the same Lovable deployment.

Pros: one deploy, shared design system / Supabase client, Capacitor build just bundles the app shell with no domain logic needed (native app forces "app mode").
Cons: marketing bundle ships with app bundle (mitigated by lazy-loading app routes).

**Option B — Two separate Lovable projects**
One project for marketing (`sportsjournal.app`), one for the app (`hub.sportsjournal.app`).

Pros: clean separation, smaller marketing bundle, marketing team can iterate without touching app.
Cons: duplicate design tokens / auth setup, two deploys, harder to share components.

I recommend **Option A** because your current project already mixes both and Capacitor needs the app code anyway.

## Plan (Option A)

### 1. Domain setup in Lovable
- Keep `sportsjournal.app` connected to this project (already done).
- Add `hub.sportsjournal.app` as a second custom domain on the same project (Project Settings → Domains → Connect Domain → type `hub.sportsjournal.app`).
- DNS: add an `A` record for `hub` → `185.158.133.1` at your registrar, plus the `_lovable` TXT record Lovable shows you.
- Set `sportsjournal.app` as Primary.

### 2. Host-aware routing in `src/App.tsx`
Introduce a small helper:

```text
isAppHost = hostname === 'hub.sportsjournal.app'
         || hostname.endsWith('.lovableproject.com')   // preview
         || hostname === 'localhost'
         || isCapacitorNative()                         // Capacitor app
```

- If `isAppHost` → mount app routes (`/dashboard`, `/matches`, `/login`, `/register`, …). Root `/` redirects to `/dashboard` (or `/login`).
- Else (marketing host) → mount only marketing routes (`/`, `/pricing`, `/features`, `/contact`, `/privacy`, `/demo`). Any unknown path redirects to `hub.sportsjournal.app` equivalent.
- Cross-domain links: "Sign In" / "Get Started" on the landing page link to `https://hub.sportsjournal.app/login` and `/register`.

### 3. Auth redirect URLs
Update Supabase Auth → URL Configuration:
- Site URL: `https://hub.sportsjournal.app`
- Additional redirect URLs: `https://hub.sportsjournal.app/**`, `https://sportsjournal.app/**`, Capacitor scheme (e.g. `app.lovable.f2286dad...://**`), preview URL.

### 4. SEO split
- Marketing host: keep current title/description, sitemap with marketing routes only.
- App host: `<meta name="robots" content="noindex">` injected when `isAppHost`, no sitemap entries.

### 5. Capacitor build
- App identifier: `app.lovable.f2286dad18c6499399cda86418e4d866`, app name `Sports Journal`.
- In `capacitor.config.ts`, **do not** point `server.url` at `hub.sportsjournal.app` for production — bundle the web assets locally so the app works offline and passes store review. Use `server.url` only for dev hot-reload against the Lovable sandbox.
- Native app always behaves as "app host" via `Capacitor.isNativePlatform()` check, regardless of domain.
- Deep links: configure `app.sportsjournal.app` Universal Links / Android App Links later (separate task) so emails open the native app.

### 6. Verification
- Visit `https://sportsjournal.app/` → landing only, `/dashboard` should redirect away.
- Visit `https://hub.sportsjournal.app/` → app (login or dashboard).
- Auth sign-in/sign-up works on hub, email confirmation redirects back to hub.
- Capacitor `npx cap run ios` shows app shell, can log in.

## What I need from you before building

1. Confirm Option A (single project) vs Option B (split projects).
2. Confirm you can add the `hub` DNS record at your registrar.
3. Should `sportsjournal.app/login` keep working, or hard-redirect to `hub.sportsjournal.app/login`? (Recommend redirect.)
4. Capacitor setup — do it now in this same plan, or as a follow-up task after the domain split is live?
