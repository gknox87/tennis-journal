import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag as TagIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Tag {
  id: string;
  name: string;
}

interface MatchCardProps {
  id: string;
  date: string;
  opponent: string;
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
  opponent, 
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
      className="match-card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{opponent}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isWin ? "default" : "destructive"}
              className={isWin ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isWin ? "Win" : "Loss"}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              data-edit-button="true"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-delete-button="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Match</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this match? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{date}</p>
        <p className="mt-2 text-lg font-semibold">{score}</p>
        {finalSetTiebreak && (
          <Badge variant="secondary" className="mt-2">
            Final Set Tiebreak
          </Badge>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};