
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ScheduledEvent, SessionType } from "@/types/calendar";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDialogProps {
  event: ScheduledEvent;
  isOpen: boolean;
  onClose: () => void;
  isNew: boolean;
  onSave: () => void;
}

export const EventDialog = ({
  event,
  isOpen,
  onClose,
  isNew,
  onSave
}: EventDialogProps) => {
  const [title, setTitle] = useState(event.title || '');
  const [sessionType, setSessionType] = useState<SessionType>(event.session_type);
  const [notes, setNotes] = useState(event.notes || '');
  
  // Parse datetime strings into Date objects and extract date/time parts
  const parseDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isValid(date)) {
      return {
        date: date,
        dateStr: format(date, 'yyyy-MM-dd'),
        timeStr: format(date, 'HH:mm')
      };
    }
    const now = new Date();
    return {
      date: now,
      dateStr: format(now, 'yyyy-MM-dd'),
      timeStr: format(now, 'HH:mm')
    };
  };

  const startDateTime = parseDateTime(event.start_time);
  const endDateTime = parseDateTime(event.end_time);

  const [startDate, setStartDate] = useState<Date | undefined>(startDateTime.date);
  const [startTime, setStartTime] = useState(startDateTime.timeStr);
  const [endDate, setEndDate] = useState<Date | undefined>(endDateTime.date);
  const [endTime, setEndTime] = useState(endDateTime.timeStr);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update state when event changes
  useEffect(() => {
    if (isOpen) {
      const start = parseDateTime(event.start_time);
      const end = parseDateTime(event.end_time);
      setStartDate(start.date);
      setStartTime(start.timeStr);
      setEndDate(end.date);
      setEndTime(end.timeStr);
      setTitle(event.title || '');
      setSessionType(event.session_type);
      setNotes(event.notes || '');
    }
  }, [event, isOpen]);

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (!startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please select start and end times",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time into datetime strings
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTimeObj = new Date(startDate);
    startDateTimeObj.setHours(startHour, startMinute, 0, 0);
    
    const endDateTimeObj = new Date(endDate);
    endDateTimeObj.setHours(endHour, endMinute, 0, 0);

    if (!isValid(startDateTimeObj) || !isValid(endDateTimeObj)) {
      toast({
        title: "Error",
        description: "Invalid date or time format",
        variant: "destructive",
      });
      return;
    }

    if (endDateTimeObj <= startDateTimeObj) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    // Format as ISO string for database
    const startDateTimeStr = startDateTimeObj.toISOString();
    const endDateTimeStr = endDateTimeObj.toISOString();

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No authenticated user");
      }

      if (isNew) {
        const { error } = await supabase
          .from('scheduled_events')
          .insert({
            title,
            start_time: startDateTimeStr,
            end_time: endDateTimeStr,
            session_type: sessionType,
            notes,
            user_id: session.user.id
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scheduled_events')
          .update({
            title,
            start_time: startDateTimeStr,
            end_time: endDateTimeStr,
            session_type: sessionType,
            notes,
            user_id: session.user.id
          })
          .eq('id', event.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Event ${isNew ? 'created' : 'updated'} successfully`,
      });
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event.id || isNew) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Event' : 'Edit Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-medium h-11 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400 hover:bg-white/95 focus:border-blue-400 transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation",
                        "text-gray-900 hover:text-gray-900",
                        !startDate && "text-muted-foreground hover:text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                      <span className="flex-1 text-sm sm:text-base">
                        {startDate ? format(startDate, "MMM d, yyyy") : <span className="text-muted-foreground">Pick a date</span>}
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
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          // Close popover on mobile after selection
                          if (window.innerWidth < 640) {
                            setIsStartDatePickerOpen(false);
                          }
                        }
                      }}
                      initialFocus
                      className="rounded-2xl bg-white/95 backdrop-blur-sm"
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
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-9 w-9 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors touch-manipulation active:scale-95 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                        ),
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  className="h-11 sm:h-12"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-medium h-11 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400 hover:bg-white/95 focus:border-blue-400 transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation",
                        "text-gray-900 hover:text-gray-900",
                        !endDate && "text-muted-foreground hover:text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                      <span className="flex-1 text-sm sm:text-base">
                        {endDate ? format(endDate, "MMM d, yyyy") : <span className="text-muted-foreground">Pick a date</span>}
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
                      selected={endDate}
                      onSelect={(date) => {
                        if (date) {
                          setEndDate(date);
                          // Close popover on mobile after selection
                          if (window.innerWidth < 640) {
                            setIsEndDatePickerOpen(false);
                          }
                        }
                      }}
                      initialFocus
                      className="rounded-2xl bg-white/95 backdrop-blur-sm"
                      disabled={(date) => startDate ? date < startDate : false}
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
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-9 w-9 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors touch-manipulation active:scale-95 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                        ),
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  className="h-11 sm:h-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Session Type</Label>
            <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="recovery">Recovery</SelectItem>
                <SelectItem value="match">Match</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Important Info</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
            />
          </div>
        </div>

        <div className="flex justify-between">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={loading}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this event? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
