// Host-aware routing helper.
// Production serves the full SPA on sportsjournal.app (hub redirects to apex).
// Marketing pages (landing, blog, etc.) use a flat layout; auth/app routes use the app shell.

const MARKETING_PATHS = new Set([
  "/",
  "/features",
  "/pricing",
  "/demo",
  "/help",
  "/contact",
  "/privacy",
  "/blog",
]);

const MARKETING_HOSTS = new Set([
  "sportsjournal.app",
  "www.sportsjournal.app",
  "tennis-journal.lovable.app",
  "courtmind.app",
  "www.courtmind.app",
]);

export const APP_HOST = "hub.sportsjournal.app";
export const APP_ORIGIN = `https://${APP_HOST}`;
export const MARKETING_ORIGIN = "https://sportsjournal.app";

export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injects window.Capacitor at runtime in native builds.
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

export function isMarketingHost(): boolean {
  if (typeof window === "undefined") return false;
  if (isCapacitorNative()) return false;
  return MARKETING_HOSTS.has(window.location.hostname);
}

export function isAppHost(): boolean {
  return !isMarketingHost();
}

export function isMarketingPath(pathname: string): boolean {
  if (MARKETING_PATHS.has(pathname)) return true;
  return pathname.startsWith("/blog/");
}

/** Use flat marketing layout (landing pages) vs app shell with header/nav. */
export function shouldUseMarketingLayout(pathname: string): boolean {
  if (!isMarketingHost()) return false;
  return isMarketingPath(pathname);
}

/** Link to auth/app paths from marketing CTAs. Stays on apex in production. */
export function appUrl(path: string = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (isMarketingHost()) return p;
  return `${APP_ORIGIN}${p}`;
}
