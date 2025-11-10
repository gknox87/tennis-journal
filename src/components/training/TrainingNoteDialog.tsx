
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { CoachInput, saveCoachToDatabase } from "@/components/training/CoachInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingNote } from "@/types/training";
import { Calendar as CalendarIcon, Clock, User2, Target, ThumbsUp, ThumbsDown, Save } from "lucide-react";
import { format, parse } from "date-fns";
import { useSport } from "@/context/SportContext";
import { cn } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingNote) {
      const date = parse(editingNote.training_date, 'yyyy-MM-dd', new Date());
      setFormData({
        coach_name: editingNote.coach_name || "",
        training_date: editingNote.training_date,
        training_time: editingNote.training_time || "",
        what_worked_on: editingNote.what_worked_on || "",
        what_felt_good: editingNote.what_felt_good || "",
        what_didnt_feel_good: editingNote.what_didnt_feel_good || "",
      });
      setSelectedDate(isNaN(date.getTime()) ? new Date() : date);
    } else {
      const today = new Date();
      setFormData({
        coach_name: "",
        training_date: format(today, 'yyyy-MM-dd'),
        training_time: "",
        what_worked_on: "",
        what_felt_good: "",
        what_didnt_feel_good: "",
      });
      setSelectedDate(today);
    }
  }, [editingNote, open]);

  // Update formData when date changes
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        training_date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date is selected
    if (!selectedDate) {
      toast({
        title: "Validation Error",
        description: "Please select a training date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in");
      }

      // Save coach to database if coach name is provided
      if (formData.coach_name && formData.coach_name.trim() !== '') {
        try {
          await saveCoachToDatabase(
            formData.coach_name.trim(),
            session.user.id,
            sport.id
          );
        } catch (coachError) {
          // Log error but don't block form submission
          console.error('Error saving coach:', coachError);
        }
      }

      const noteData = {
        ...formData,
        user_id: session.user.id,
        sport_id: sport.id,
        training_time: formData.training_time || null,
        coach_name: formData.coach_name?.trim() || null,
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

      // Refresh the parent component to show updated data
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
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{sport.terminology.trainingLabel} Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training_date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Training Date *
                </Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="training_date"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-medium h-11 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400 focus:border-blue-400 transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                      <span className="flex-1 text-sm sm:text-base">
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : <span className="text-muted-foreground">Pick a date</span>}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 rounded-2xl border-2 border-white/30 shadow-2xl z-[100] max-w-[calc(100vw-2rem)]" 
                    align="start"
                    side="bottom"
                    sideOffset={8}
                  >
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          // Close popover on mobile after selection for better UX
                          if (window.innerWidth < 640) {
                            setIsDatePickerOpen(false);
                          }
                        }
                      }}
                      initialFocus
                      className="rounded-2xl bg-white/95 backdrop-blur-sm"
                      disabled={(date) => date > new Date()}
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4 p-3 sm:p-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm sm:text-base font-semibold",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                          "h-8 w-8 sm:h-9 sm:w-9 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation active:scale-95 min-w-[32px] min-h-[32px]"
                        ),
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-10 sm:w-11 font-normal text-[0.8rem] sm:text-sm",
                        row: "flex w-full mt-2",
                        cell: "h-10 w-10 sm:h-11 sm:w-11 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-10 w-10 sm:h-11 sm:w-11 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors touch-manipulation active:scale-95 min-w-[40px] min-h-[40px]",
                          "text-sm sm:text-base"
                        ),
                        day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                        day_today: "bg-blue-100 text-blue-900 font-semibold",
                        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="training_time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Training Time
                </Label>
                <TimePicker
                  value={formData.training_time}
                  onChange={(time) => setFormData(prev => ({ ...prev, training_time: time }))}
                  placeholder="Select training time"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <CoachInput
                  value={formData.coach_name}
                  onChange={(coachName) => setFormData(prev => ({ ...prev, coach_name: coachName }))}
                  label="Coach Name"
                  placeholder="e.g., John Smith"
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
