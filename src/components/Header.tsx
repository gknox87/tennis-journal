
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut } from "lucide-react";

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
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Tennis Match Chronicle</h1>
        {userProfile && (
          <span className="text-muted-foreground">
            Welcome, {userProfile.full_name || userProfile.username || 'Player'}
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => navigate("/add-match")}
          className="btn-primary"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Match
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="lg"
          className="rounded-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
