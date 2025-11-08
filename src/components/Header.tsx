
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, User, Users, Calendar, BookOpen } from "lucide-react";

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
}

interface HeaderProps {
  userProfile?: Profile | null;
}

export const Header = ({ userProfile }: HeaderProps) => {
  const navigate = useNavigate();

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

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm text-muted-foreground">Welcome back</span>
              <span className="font-medium">
                {userProfile?.full_name || userProfile?.username || 'Player'}
              </span>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/add-match")}
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Match
          </Button>
          <Button
            onClick={() => navigate("/training-notes")}
            variant="outline"
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Training Notes
          </Button>
          <Button
            onClick={() => navigate("/key-opponents")}
            variant="outline"
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <Users className="mr-2 h-4 w-4" />
            Key Opponents
          </Button>
          <Button
            onClick={() => navigate("/calendar")}
            variant="outline"
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>
    </header>
  );
};
