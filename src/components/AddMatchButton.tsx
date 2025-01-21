import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AddMatchButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate("/add-match")}
      className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-white"
    >
      <Plus className="mr-2 h-4 w-4" />
      <span className="hidden sm:inline">Record Match</span>
      <span className="sm:hidden">Add</span>
    </Button>
  );
};