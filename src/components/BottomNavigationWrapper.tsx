import { useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";

// Auth pages: no header chrome, no shell top padding
export const AUTH_ROUTES = ["/login", "/register"];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

// Routes that should NOT show bottom navigation
const HIDDEN_ROUTES = [
  ...AUTH_ROUTES,
  "/",
];

// Routes that should show bottom navigation (protected routes)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/matches",
  "/training-notes",
  "/calendar",
  "/key-opponents",
  "/add-match",
  "/edit-match",
  "/match",
  "/profile",
  "/improvement-notes",
  "/coach",
  "/team",
  "/wellness",
  "/injury-tracker",
  "/training-load",
  "/notifications",
];

export function shouldShowBottomNav(pathname: string): boolean {
  if (HIDDEN_ROUTES.some((route) => pathname === route)) {
    return false;
  }

  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export const BottomNavigationWrapper = () => {
  const location = useLocation();

  if (!shouldShowBottomNav(location.pathname)) {
    return null;
  }

  return <BottomNavigation />;
};

