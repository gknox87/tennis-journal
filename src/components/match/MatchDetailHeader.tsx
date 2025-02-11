
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MatchDetailHeaderProps {
  onBack: () => void;
}

export const MatchDetailHeader = ({ onBack }: MatchDetailHeaderProps) => {
  return (
    <Button 
      variant="ghost" 
      onClick={onBack}
      className="w-full sm:w-auto flex items-center justify-center"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Dashboard
    </Button>
  );
};
