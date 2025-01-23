import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MatchActions } from "@/components/match/MatchActions";
import { MatchTags } from "@/components/match/MatchTags";

interface Tag {
  id: string;
  name: string;
}

interface MatchCardProps {
  id: string;
  date: string;
  opponent_name?: string;
  score: string;
  isWin: boolean;
  finalSetTiebreak?: boolean;
  tags?: Tag[];
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
  tags = [],
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

      // First delete associated tags
      const { error: tagError } = await supabase
        .from('match_tags')
        .delete()
        .eq('match_id', id);

      if (tagError) {
        console.error('Error deleting match tags:', tagError);
        throw new Error('Failed to delete match tags');
      }

      // Then delete the match
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

  return (
    <Card 
      className="match-card hover:shadow-lg transition-shadow cursor-pointer touch-manipulation"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-medium line-clamp-1">
            {opponent_name}
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge 
              variant={isWin ? "default" : "destructive"}
              className={`text-xs sm:text-sm ${isWin ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              {isWin ? "Win" : "Loss"}
            </Badge>
            <MatchActions onEdit={onEdit} onDelete={handleDelete} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs sm:text-sm text-muted-foreground">{date}</p>
        <p className="mt-2 text-base sm:text-lg font-semibold">{score}</p>
        {finalSetTiebreak && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Final Set Tiebreak
          </Badge>
        )}
        <MatchTags tags={tags} />
      </CardContent>
    </Card>
  );
};