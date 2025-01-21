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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Tennis Match Journal</h1>
      <div className="flex gap-2 sm:gap-4">
        <AddMatchButton />
        <Button 
          variant="outline"
          onClick={() => navigate("/key-opponents")}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Users className="mr-2 h-4 w-4" />
          Key Opponents
        </Button>
        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};