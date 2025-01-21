import { LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddMatchButton } from "@/components/AddMatchButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <h1 className="text-2xl font-bold">Tennis Match Journal</h1>
      <div className="flex flex-wrap gap-2">
        <AddMatchButton />
        <Button 
          variant="secondary"
          onClick={() => navigate("/key-opponents")}
          className="flex-1 sm:flex-none text-white hover:bg-secondary/90"
        >
          <Users className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Key Opponents</span>
          <span className="sm:hidden">Opponents</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="flex-1 sm:flex-none"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>
    </div>
  );
};