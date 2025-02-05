
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditMatchLoadingProps {
  onBack: () => void;
}

export const EditMatchLoading = ({ onBack }: EditMatchLoadingProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="flex items-center justify-center">
        <p>Loading match details...</p>
      </div>
    </div>
  );
};
