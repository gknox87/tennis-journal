import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User,
  Menu,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import { SideMenu } from "@/components/SideMenu";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  updated_at?: string | null;
}

interface HeaderProps {
  userProfile?: Profile | null;
  className?: string;
}

export const Header = ({ userProfile, className }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState<Profile | null>(userProfile || null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Pages only accessible from the hamburger side menu (not in bottom nav)
  const SIDE_MENU_ONLY_PATHS = [
    "/add-match",
    "/training-load",
    "/wellness",
    "/injury-tracker",
    "/improvement-notes",
    "/profile",
  ];
  const isOnSideMenuPage = SIDE_MENU_ONLY_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );

  // Fetch profile data if not provided
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userProfile) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (data) {
              // Fallback: populate full_name from auth user_metadata if empty
              if (!data.full_name) {
                const meta = session.user.user_metadata;
                const first = meta?.first_name || "";
                const last = meta?.last_name || "";
                const metaName = [first, last].filter(Boolean).join(" ")
                  || meta?.full_name || meta?.name || "";
                if (metaName) {
                  data.full_name = metaName;
                }
              }
              setProfileData(data);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfileData(userProfile);
      }
    };

    fetchProfile();
  }, [userProfile]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .eq("read", false);

        setUnreadNotifications(count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotifications();
  }, []);

  const displayName = profileData?.full_name || profileData?.username || 'Player';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full shadow-md transition-shadow duration-300",
        "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600",
        "pt-[var(--safe-area-top)]",
        className
      )}
    >
      <div
        className="flex items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: "var(--header-toolbar-pt)",
          paddingBottom: "var(--header-toolbar-pb)",
          minHeight: "var(--app-header-bar)",
        }}
      >
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSideMenuOpen(true)}
              className={cn(
                "relative flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-colors",
                isOnSideMenuPage
                  ? "bg-white/20 ring-2 ring-white/40"
                  : "hover:bg-purple-700/30 active:bg-purple-700/50"
              )}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-white" />
              {isOnSideMenuPage && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-purple-600" />
              )}
            </button>
          </div>

          {/* Right Section - Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="View notifications"
            >
              <Bell className="h-6 w-6 text-white" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 animate-pulse">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </button>

            {/* Profile Link */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200 hover:scale-105 active:scale-95 group"
              aria-label="Go to profile"
            >
              {profileData?.avatar_url ? (
                <Avatar className="h-9 w-9 border-2 border-white/50 hover:border-white/80 transition-all shadow-lg hover:shadow-xl">
                  <AvatarImage 
                    src={profileData.avatar_url} 
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white text-purple-600 font-semibold text-sm border-2 border-white/50">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/50 hover:border-white/80 hover:bg-white transition-all duration-200 group-hover:shadow-xl">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
              )}
            </button>
          </div>
        </div>
    </header>

      <SideMenu open={sideMenuOpen} onOpenChange={setSideMenuOpen} />
    </>
  );
};
