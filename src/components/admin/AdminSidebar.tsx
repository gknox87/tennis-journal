import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Trophy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Teams", path: "/admin/teams", icon: Trophy },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full">
      {/* Back to app */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to App
      </button>

      <h2 className="text-lg font-bold text-foreground mb-4">Admin Panel</h2>

      <nav className="flex sm:flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
