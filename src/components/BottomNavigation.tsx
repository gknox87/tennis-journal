import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, BookOpen, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Performances",
    path: "/matches",
    icon: Trophy,
  },
  {
    label: "Notes",
    path: "/training-notes",
    icon: BookOpen,
  },
  {
    label: "Planner",
    path: "/calendar",
    icon: Calendar,
  },
  {
    label: "Opponents",
    path: "/key-opponents",
    icon: Users,
  },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route matches any nav item (including sub-routes)
  const isActive = (path: string) => {
    // Special handling for dashboard - only match exact path or root
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white border-t border-gray-200",
        "supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]",
        "shadow-lg"
      )}
    >
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16 sm:h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "min-h-[44px] min-w-[44px] sm:min-h-[56px] sm:min-w-[56px]",
                  "px-3 py-2 rounded-xl",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                  active
                    ? "text-purple-600"
                    : "text-gray-500 hover:text-gray-700 active:text-purple-600"
                )}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6",
                    "transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium mt-1",
                    "transition-all duration-200",
                    active ? "font-semibold" : "font-normal"
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-1/2 -translate-x-1/2",
                      "w-8 h-1 bg-purple-600 rounded-t-full",
                      "transition-all duration-200"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

