// Host-aware routing helper.
// Marketing site lives on the apex (sportsjournal.app).
// The actual app lives on hub.sportsjournal.app, on preview/localhost, and inside Capacitor.

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

function isCapacitorNative(): boolean {
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

/** Absolute URL to a path on the app host (used by marketing CTAs). */
export function appUrl(path: string = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${APP_ORIGIN}${p}`;
}
