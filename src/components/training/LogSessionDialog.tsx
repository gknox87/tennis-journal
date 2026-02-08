
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RPESlider } from "./RPESlider";
import { ACTIVITY_TYPES, ActivityType } from "@/types/trainingLoad";
import { calculateTrainingLoad } from "@/utils/trainingLoadCalc";
import { format } from "date-fns";
import { Zap } from "lucide-react";

interface LogSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    rpe: number;
    duration_minutes: number;
    activity_type: ActivityType;
    sport_specific?: string;
    session_date?: string;
    notes?: string;
  }) => Promise<void>;
}

export const LogSessionDialog = ({ open, onOpenChange, onSubmit }: LogSessionDialogProps) => {
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("technical");
  const [sportSpecific, setSportSpecific] = useState("");
  const [sessionDate, setSessionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationNum = parseInt(duration) || 0;
  const trainingLoad = calculateTrainingLoad(rpe, durationNum);

  const handleSubmit = async () => {
    if (!durationNum || durationNum <= 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        rpe,
        duration_minutes: durationNum,
        activity_type: activityType,
        sport_specific: sportSpecific || undefined,
        session_date: sessionDate,
        notes: notes || undefined,
      });
      // Reset form
      setRpe(5);
      setDuration("");
      setActivityType("technical");
      setSportSpecific("");
      setSessionDate(format(new Date(), "yyyy-MM-dd"));
      setNotes("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Log Training Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <RPESlider value={rpe} onChange={setRpe} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                min={1}
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
          </div>

          {/* Live training load preview */}
          {durationNum > 0 && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Training Load:</span>
              <span className="text-2xl font-black text-primary">{trainingLoad}</span>
              <span className="text-xs text-muted-foreground">({rpe} × {durationNum} min)</span>
            </div>
          )}

          <div>
            <Label>Activity Type *</Label>
            <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sport-Specific Detail</Label>
            <Input
              placeholder="e.g., serve practice, 3v3 drills"
              value={sportSpecific}
              onChange={(e) => setSportSpecific(e.target.value)}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="How did the session feel?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !durationNum}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Logging..." : "Log Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
