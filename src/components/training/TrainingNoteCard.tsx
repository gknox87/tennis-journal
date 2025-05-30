
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainingNote } from "@/types/training";
import { format } from "date-fns";
import { Edit2, Trash2, Calendar, Clock, User2, Target, ThumbsUp, ThumbsDown } from "lucide-react";

interface TrainingNoteCardProps {
  note: TrainingNote;
  onEdit: (note: TrainingNote) => void;
  onDelete: (noteId: string) => void;
}

export const TrainingNoteCard = ({ note, onEdit, onDelete }: TrainingNoteCardProps) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this training note?")) {
      onDelete(note.id);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">
              {format(new Date(note.training_date), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="h-8 w-8 hover:bg-blue-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 hover:bg-red-100 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Time and Coach */}
        <div className="flex gap-4 text-sm text-gray-600">
          {note.training_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{note.training_time}</span>
            </div>
          )}
          {note.coach_name && (
            <div className="flex items-center gap-1">
              <User2 className="h-4 w-4" />
              <span>Coach {note.coach_name}</span>
            </div>
          )}
        </div>

        {/* What Worked On */}
        {note.what_worked_on && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">What We Worked On</span>
            </div>
            <p className="text-gray-700 text-sm pl-6 bg-blue-50 p-3 rounded-lg">
              {note.what_worked_on}
            </p>
          </div>
        )}

        {/* What Felt Good */}
        {note.what_felt_good && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-700">What Felt Good</span>
            </div>
            <p className="text-gray-700 text-sm pl-6 bg-green-50 p-3 rounded-lg">
              {note.what_felt_good}
            </p>
          </div>
        )}

        {/* What Didn't Feel Good */}
        {note.what_didnt_feel_good && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-700">Areas to Improve</span>
            </div>
            <p className="text-gray-700 text-sm pl-6 bg-orange-50 p-3 rounded-lg">
              {note.what_didnt_feel_good}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Added {format(new Date(note.created_at), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
    </Card>
  );
};
