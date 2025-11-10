import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Trophy,
  LogOut, 
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
}

interface HeaderProps {
  userProfile?: Profile | null;
  className?: string;
}

export const Header = ({ userProfile, className }: HeaderProps) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Profile | null>(userProfile || null);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear any cached data first
      localStorage.removeItem('sports-journal-auth');

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, navigate to login
      navigate("/login", { replace: true });
    }
  };

  const displayName = profileData?.full_name || profileData?.username || 'Player';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600",
        "supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]",
        isScrolled && "shadow-lg",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section - Left */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-xl hover:bg-purple-700/30 active:bg-purple-700/50 transition-colors"
            aria-label="Sports Journal Home"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md border border-white/20">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Sports Journal
              </h1>
            </div>
          </button>

          {/* Right Section - Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200 hover:scale-105 active:scale-95 group"
                  aria-label="User menu"
                >
                  {profileData?.avatar_url ? (
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-white/50 hover:border-white/80 transition-all shadow-lg hover:shadow-xl">
                      <AvatarImage 
                        src={profileData.avatar_url} 
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-white text-purple-600 font-semibold text-sm sm:text-base border-2 border-white/50">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/50 hover:border-white/80 hover:bg-white transition-all duration-200 group-hover:shadow-xl">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 mt-2 mr-2 sm:mr-0 bg-white/95 backdrop-blur-xl border-gray-200 shadow-xl"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profileData?.username || 'Athlete'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer min-h-[44px] sm:min-h-[36px]"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 min-h-[44px] sm:min-h-[36px]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
