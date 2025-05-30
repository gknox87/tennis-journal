
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingNote } from "@/types/training";
import { Plus, ArrowLeft, Calendar, Clock, User2, Target, ThumbsUp, ThumbsDown } from "lucide-react";
import { TrainingNoteCard } from "@/components/training/TrainingNoteCard";
import { TrainingNoteDialog } from "@/components/training/TrainingNoteDialog";
import { format } from "date-fns";

const TrainingNotes = () => {
  const [trainingNotes, setTrainingNotes] = useState<TrainingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<TrainingNote | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTrainingNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('training_notes')
        .select('*')
        .order('training_date', { ascending: false });

      if (error) throw error;
      setTrainingNotes(data || []);
    } catch (error) {
      console.error('Error fetching training notes:', error);
      toast({
        title: "Error",
        description: "Failed to load training notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingNotes();
  }, []);

  const handleAddNote = () => {
    setEditingNote(null);
    setShowDialog(true);
  };

  const handleEditNote = (note: TrainingNote) => {
    setEditingNote(note);
    setShowDialog(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('training_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setTrainingNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: "Success",
        description: "Training note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete training note",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-md hover:bg-white/90 hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                🎾 Training Notes
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your progress and reflect on your training sessions</p>
            </div>
          </div>
          
          <div className="flex justify-center sm:justify-end">
            <Button onClick={handleAddNote} size="lg" className="w-full sm:w-auto shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Training Note
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-full flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">Total Sessions</p>
                <p className="text-lg sm:text-2xl font-bold">{trainingNotes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-full flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">This Month</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {trainingNotes.filter(note => {
                    const noteDate = new Date(note.training_date);
                    const now = new Date();
                    return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-full flex-shrink-0">
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">Positive Notes</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {trainingNotes.filter(note => note.what_felt_good).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-full flex-shrink-0">
                <User2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">With Coach</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {trainingNotes.filter(note => note.coach_name).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Training Notes List */}
        {trainingNotes.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-blue-50 to-green-50">
            <div className="max-w-md mx-auto">
              <div className="text-4xl sm:text-6xl mb-4">🎾</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Training Notes Yet</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Start tracking your training sessions to see your progress over time!
              </p>
              <Button onClick={handleAddNote} size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Training Note
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {trainingNotes.map((note) => (
              <TrainingNoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}

        <TrainingNoteDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          editingNote={editingNote}
          onSuccess={fetchTrainingNotes}
        />
      </div>
    </div>
  );
};

export default TrainingNotes;
