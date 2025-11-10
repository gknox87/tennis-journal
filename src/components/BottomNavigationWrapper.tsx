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
];

export const BottomNavigationWrapper = () => {
  const location = useLocation();

  // Check if current route should show bottom navigation
  const shouldShow = () => {
    // Don't show on public routes
    if (HIDDEN_ROUTES.some(route => location.pathname === route)) {
      return false;
    }

    // Show on protected routes
    return PROTECTED_ROUTES.some(route => 
      location.pathname === route || location.pathname.startsWith(route + "/")
    );
  };

  if (!shouldShow()) {
    return null;
  }

  return <BottomNavigation />;
};

