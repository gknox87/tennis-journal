import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, BookOpen, Calendar, Ellipsis, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRoles } from "@/hooks/useUserRoles";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const playerNavItems: NavItem[] = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Matches", path: "/matches", icon: Trophy },
  { label: "Notes", path: "/training-notes", icon: BookOpen },
  { label: "Planner", path: "/calendar", icon: Calendar },
  {
    label: "More",
    path: "#more",
    icon: Ellipsis,
    children: [
      { label: "Training Load", path: "/training-load", icon: Trophy },
      { label: "Wellness", path: "/wellness", icon: BookOpen },
      { label: "Injury Tracker", path: "/injury-tracker", icon: Calendar },
      { label: "Opponents", path: "/key-opponents", icon: Calendar },
      { label: "Goals", path: "/goals", icon: Calendar },
      { label: "Challenges", path: "/challenges", icon: Trophy },
      { label: "Reminders", path: "/notification-settings", icon: Bell },
    ],
  },
];

const coachNavItems: NavItem[] = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Matches", path: "/matches", icon: Trophy },
  { label: "Athlete Feed", path: "/coach-feed", icon: BookOpen },
  { label: "Planner", path: "/calendar", icon: Calendar },
  {
    label: "More",
    path: "#more",
    icon: Ellipsis,
    children: [
      { label: "Training Load", path: "/training-load", icon: Trophy },
      { label: "Wellness", path: "/wellness", icon: BookOpen },
      { label: "Injury Tracker", path: "/injury-tracker", icon: Calendar },
      { label: "Key Opponents", path: "/key-opponents", icon: Calendar },
      { label: "Goals", path: "/goals", icon: Calendar },
      { label: "Coach Dashboard", path: "/coach", icon: Calendar },
      { label: "Reminders", path: "/notification-settings", icon: Bell },
    ],
  },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCoach } = useUserRoles();
  const [showMore, setShowMore] = useState(false);

  const navItems = isCoach ? coachNavItems : playerNavItems;

  const isActive = (path: string) => {
    if (path === "#more") {
      // Highlight More when on any tool page
      return ["/training-load", "/wellness", "/injury-tracker", "/key-opponents", "/goals"].some(
        (p) => location.pathname === p || location.pathname.startsWith(p + "/")
      );
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    if (path === "/coach") {
      return location.pathname === "/coach" || location.pathname.startsWith("/team/");
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border p-2 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-1 p-2">
              {(navItems.find((i) => i.path === "#more")?.children || []).map((child) => (
                <button
                  key={child.path}
                  onClick={() => {
                    navigate(child.path);
                    setShowMore(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-lg">{child.label === "Training Load" ? "📊" : child.label === "Wellness" ? "❤️" : child.label === "Injury Tracker" ? "🩺" : child.label === "Opponents" || child.label === "Key Opponents" ? "👥" : "🎯"}</span>
                  <span className="text-sm font-medium text-gray-700">{child.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => item.path === "#more" ? setShowMore(!showMore) : navigate(item.path)}
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
    </>
  );
};
