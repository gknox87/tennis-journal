import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, UserPlus, LogOut } from "lucide-react";

export const Header = () => {
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
    <header className="flex justify-between items-center mb-8">
      <div className="flex gap-2">
        <Button
          onClick={() => navigate("/add-match")}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Record Match</span>
          <span className="sm:hidden">Add</span>
        </Button>
        <Button
          onClick={() => navigate("/key-opponents")}
          variant="outline"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Opponent</span>
          <span className="sm:hidden">Opponent</span>
        </Button>
        <Button
          onClick={handleLogout}
          variant="ghost"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};