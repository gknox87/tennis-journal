import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface UpgradePromptProps {
  message: string;
  className?: string;
}

export const UpgradePrompt = ({ message, className = "" }: UpgradePromptProps) => {
  const navigate = useNavigate();

  return (
    <div className={`rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100 shrink-0">
          <Crown className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 mb-3">{message}</p>
          <Button
            size="sm"
            onClick={() => navigate("/pricing")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
};
