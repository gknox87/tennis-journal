import { useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";

// Routes that should NOT show bottom navigation
const HIDDEN_ROUTES = [
  "/login",
  "/register",
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

