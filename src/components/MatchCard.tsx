
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
    ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" 
    : "bg-gradient-to-br from-red-50 to-rose-100 border-red-200";

  const iconColor = isWin ? "text-green-600" : "text-red-600";
  const ResultIcon = isWin ? TrendingUp : TrendingDown;

  return (
    <Card 
      className={`match-card hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${cardGradient} hover:scale-[1.02] group relative overflow-hidden`}
      onClick={handleCardClick}
    >
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isWin ? 'bg-green-500' : 'bg-red-500'}`} />
      
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isWin ? 'bg-green-100' : 'bg-red-100'} flex-shrink-0`}>
                <ResultIcon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800 truncate">
                {opponent_name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 ml-11">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{formatDate(date)}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge 
              variant={isWin ? "default" : "destructive"}
              className={`text-xs font-bold px-3 py-1 ${
                isWin 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              <Trophy className="h-3 w-3 mr-1" />
              {isWin ? "WIN" : "LOSS"}
            </Badge>
            <MatchActions onEdit={onEdit} onDelete={handleDelete} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
            <span className="text-2xl font-bold text-gray-800">
              {score}
            </span>
          </div>
          
          {finalSetTiebreak && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1">
              Final Set TB
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
