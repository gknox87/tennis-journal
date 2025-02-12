
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ScheduledEvent, SessionType } from "@/types/calendar";
import { format } from "date-fns";

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
  const [title, setTitle] = useState(event.title);
  const [sessionType, setSessionType] = useState<SessionType>(event.session_type);
  const [notes, setNotes] = useState(event.notes || '');
  const [startDate, setStartDate] = useState(format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"));
  const [endDate, setEndDate] = useState(format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

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
            start_time: startDate,
            end_time: endDate,
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
            start_time: startDate,
            end_time: endDate,
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
      <DialogContent>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
            <Label htmlFor="notes">Notes</Label>
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
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
