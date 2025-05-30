
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MatchActions } from "@/components/match/MatchActions";
import { Trophy, Calendar, Target, TrendingUp, TrendingDown } from "lucide-react";

interface MatchCardProps {
  id: string;
  date: string;
  opponent_name?: string;
  score: string;
  isWin: boolean;
  finalSetTiebreak?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export const MatchCard = ({ 
  id, 
  date, 
  opponent_name = "Unknown Opponent", 
  score, 
  isWin,
  finalSetTiebreak,
  onDelete,
  onEdit 
}: MatchCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to delete matches.",
          variant: "destructive",
        });
        return;
      }

      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (matchError) {
        console.error('Error deleting match:', matchError);
        throw new Error('Failed to delete match');
      }

      toast({
        title: "Match deleted",
        description: "The match has been successfully deleted.",
      });

      onDelete();
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isDeleteDialog = target.closest('[role="dialog"]');
    const isDeleteButton = target.closest('button[data-delete-button="true"]');
    const isEditButton = target.closest('button[data-edit-button="true"]');

    if (isDeleteDialog || isDeleteButton || isEditButton) {
      e.stopPropagation();
      return;
    }

    navigate(`/match/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const cardGradient = isWin 
    ? "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200/50" 
    : "bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-red-200/50";

  const iconColor = isWin ? "text-green-600" : "text-red-600";
  const ResultIcon = isWin ? TrendingUp : TrendingDown;

  return (
    <Card 
      className={`match-card hover:shadow-xl transition-all duration-300 cursor-pointer touch-manipulation border-2 ${cardGradient} hover:scale-105 group`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isWin ? 'bg-green-100' : 'bg-red-100'} group-hover:scale-110 transition-transform duration-300`}>
              <ResultIcon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-gray-900 transition-colors">
                {opponent_name}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isWin ? "default" : "destructive"}
              className={`text-sm font-semibold px-3 py-1 ${
                isWin 
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" 
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg"
              } group-hover:scale-105 transition-transform duration-300`}
            >
              <Trophy className="h-3 w-3 mr-1" />
              {isWin ? "WIN" : "LOSS"}
            </Badge>
            <MatchActions onEdit={onEdit} onDelete={handleDelete} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className={`h-4 w-4 ${iconColor}`} />
            <span className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
              {score}
            </span>
          </div>
          {finalSetTiebreak && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200">
              Final Set TB
            </Badge>
          )}
        </div>
        
        {/* Subtle gradient overlay for extra visual appeal */}
        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
          isWin ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-rose-400'
        }`} />
      </CardContent>
    </Card>
  );
};
