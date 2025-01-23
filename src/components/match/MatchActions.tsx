import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface MatchActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const MatchActions = ({ onEdit, onDelete }: MatchActionsProps) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        data-edit-button="true"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            data-delete-button="true"
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
              onDelete();
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};