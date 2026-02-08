import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Activity,
  Heart,
  AlertTriangle,
  Lightbulb,
  PlusCircle,
  User,
  LogOut,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  iconBg: string;
  iconColor: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Add Entry",
    path: "/add-match",
    icon: PlusCircle,
    description: "Log a match or session",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Training Load",
    path: "/training-load",
    icon: Activity,
    description: "Monitor workload & recovery",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    label: "Wellness",
    path: "/wellness",
    icon: Heart,
    description: "Daily check-in & trends",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
  },
  {
    label: "Injury Tracker",
    path: "/injury-tracker",
    icon: AlertTriangle,
    description: "Track & manage injuries",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Improvement Tips",
    path: "/improvement-notes",
    icon: Lightbulb,
    description: "AI-powered suggestions",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
    description: "Account & settings",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
];

export const SideMenu = ({ open, onOpenChange }: SideMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCoach } = useUserRoles();

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("sports-journal-auth");
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-0 flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 px-5 pt-8 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-left text-base font-bold text-white">
                Sports Journal
              </SheetTitle>
              <SheetDescription className="text-left text-xs text-white/70">
                {isCoach ? "Coach tools & features" : "Quick access"}
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left",
                    "transition-all duration-200",
                    "min-h-[52px]",
                    "focus:outline-none",
                    active
                      ? "bg-purple-50 shadow-sm"
                      : "hover:bg-gray-50 active:bg-gray-100"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors",
                      active ? "bg-purple-100" : item.iconBg
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-purple-600" : item.iconColor
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[13px] leading-tight",
                        active
                          ? "font-semibold text-purple-700"
                          : "font-medium text-gray-800"
                      )}
                    >
                      {item.label}
                    </p>
                    <p className={cn(
                      "text-[11px] mt-0.5 truncate",
                      active ? "text-purple-400" : "text-gray-400"
                    )}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-purple-400" : "text-gray-300"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="text-[13px] font-medium">Log out</span>
          </button>
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-[11px] text-gray-300 font-medium">
              v1.7.1
            </p>
            <p className="text-[11px] text-gray-300">
              Updated 8 Feb 2026
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
