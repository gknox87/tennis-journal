
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingNote } from "@/types/training";
import { Calendar, Clock, User2, Target, ThumbsUp, ThumbsDown, Save } from "lucide-react";
import { format } from "date-fns";
import { useSport } from "@/context/SportContext";

interface TrainingNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: TrainingNote | null;
  onSuccess: () => void;
}

export const TrainingNoteDialog = ({ open, onOpenChange, editingNote, onSuccess }: TrainingNoteDialogProps) => {
  const { sport } = useSport();
  const [formData, setFormData] = useState({
    coach_name: "",
    training_date: format(new Date(), 'yyyy-MM-dd'),
    training_time: "",
    what_worked_on: "",
    what_felt_good: "",
    what_didnt_feel_good: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingNote) {
      setFormData({
        coach_name: editingNote.coach_name || "",
        training_date: editingNote.training_date,
        training_time: editingNote.training_time || "",
        what_worked_on: editingNote.what_worked_on || "",
        what_felt_good: editingNote.what_felt_good || "",
        what_didnt_feel_good: editingNote.what_didnt_feel_good || "",
      });
    } else {
      setFormData({
        coach_name: "",
        training_date: format(new Date(), 'yyyy-MM-dd'),
        training_time: "",
        what_worked_on: "",
        what_felt_good: "",
        what_didnt_feel_good: "",
      });
    }
  }, [editingNote, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in");
      }

      const noteData = {
        ...formData,
        user_id: session.user.id,
        sport_id: sport.id,
        training_time: formData.training_time || null,
        coach_name: formData.coach_name || null,
        what_worked_on: formData.what_worked_on || null,
        what_felt_good: formData.what_felt_good || null,
        what_didnt_feel_good: formData.what_didnt_feel_good || null,
      };

      if (editingNote) {
        const { error } = await supabase
          .from('training_notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) throw error;

        toast({
          title: `Success! ${sport.icon}`,
          description: "Training note updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('training_notes')
          .insert(noteData);

        if (error) throw error;

        toast({
          title: `Success! ${sport.icon}`,
          description: "Training note added successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving training note:', error);
      toast({
        title: "Error",
        description: "Failed to save training note",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-green-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {editingNote ? "✏️ Edit Training Note" : "🆕 Add Training Note"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{sport.terminology.trainingLabel} Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training_date" className="text-sm font-semibold text-gray-700">
                  Training Date *
                </Label>
                <Input
                  id="training_date"
                  type="date"
                  value={formData.training_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, training_date: e.target.value }))}
                  required
                  className="bg-white/90 border-2 border-blue-200/50 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="training_time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Training Time
                </Label>
                <Input
                  id="training_time"
                  type="time"
                  value={formData.training_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, training_time: e.target.value }))}
                  className="bg-white/90 border-2 border-blue-200/50 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coach_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  Coach Name
                </Label>
                <Input
                  id="coach_name"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={formData.coach_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, coach_name: e.target.value }))}
                  className="bg-white/90 border-2 border-blue-200/50 focus:border-blue-400"
                />
              </div>
            </div>
          </Card>

          {/* What We Worked On */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">What Did You Work On?</h3>
            </div>
            <Textarea
              id="what_worked_on"
              placeholder={`e.g., ${sport.icon} technical drills, tactical patterns, physical blocks...`}
              value={formData.what_worked_on}
              onChange={(e) => setFormData(prev => ({ ...prev, what_worked_on: e.target.value }))}
              className="bg-white/90 border-2 border-blue-200/50 focus:border-blue-400 min-h-[100px]"
            />
          </Card>

          {/* What Felt Good */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-green-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                <ThumbsUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">What Felt Good?</h3>
            </div>
            <Textarea
              id="what_felt_good"
              placeholder="e.g., My backhand was really clicking today, felt more confident at the net..."
              value={formData.what_felt_good}
              onChange={(e) => setFormData(prev => ({ ...prev, what_felt_good: e.target.value }))}
              className="bg-white/90 border-2 border-green-200/50 focus:border-green-400 min-h-[100px]"
            />
          </Card>

          {/* What Didn't Feel Good */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                <ThumbsDown className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">What Didn't Feel Good?</h3>
            </div>
            <Textarea
              id="what_didnt_feel_good"
              placeholder="e.g., Struggled with consistency on my serve, need to work on follow through..."
              value={formData.what_didnt_feel_good}
              onChange={(e) => setFormData(prev => ({ ...prev, what_didnt_feel_good: e.target.value }))}
              className="bg-white/90 border-2 border-orange-200/50 focus:border-orange-400 min-h-[100px]"
            />
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
