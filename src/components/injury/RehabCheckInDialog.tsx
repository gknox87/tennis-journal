
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WellnessScaleSelector } from "@/components/wellness/WellnessScaleSelector";
import { PainLevelSlider } from "./PainLevelSlider";
import { InjuryReport } from "@/types/injury";
import { CreateCheckInInput } from "@/hooks/useInjuryReports";
import {
  REHAB_MOOD_DESCRIPTORS,
  RTP_CONFIDENCE_DESCRIPTORS,
} from "@/constants/injuryPsychology";
import { differenceInDays, format, parseISO } from "date-fns";
import { Brain, Heart } from "lucide-react";

interface RehabCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  injury: InjuryReport;
  onSubmit: (data: CreateCheckInInput) => Promise<void>;
}

export const RehabCheckInDialog = ({
  open,
  onOpenChange,
  injury,
  onSubmit,
}: RehabCheckInDialogProps) => {
  const [rehabMood, setRehabMood] = useState<number | null>(null);
  const [rtpConfidence, setRtpConfidence] = useState<number | null>(null);
  const [updatePain, setUpdatePain] = useState(false);
  const [painLevel, setPainLevel] = useState(injury.pain_level);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysSince = differenceInDays(new Date(), parseISO(injury.created_at));

  const handleSubmit = async () => {
    if (rehabMood == null || rtpConfidence == null) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        injury_report_id: injury.id,
        rehab_mood: rehabMood,
        rtp_confidence: rtpConfidence,
        pain_level: updatePain ? painLevel : undefined,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      setRehabMood(null);
      setRtpConfidence(null);
      setUpdatePain(false);
      setPainLevel(injury.pain_level);
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = rehabMood != null && rtpConfidence != null && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-500" />
            Rehab Check-in
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-semibold">{injury.body_part}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reported {format(parseISO(injury.created_at), "MMM dd, yyyy")}
              {daysSince > 0 && ` · Day ${daysSince + 1} of recovery`}
            </p>
          </div>

          <div>
            <Label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Heart className="h-4 w-4 text-pink-500" />
              How is your mood during rehab?
            </Label>
            <WellnessScaleSelector
              value={rehabMood}
              onChange={setRehabMood}
              descriptors={REHAB_MOOD_DESCRIPTORS}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Brain className="h-4 w-4 text-blue-500" />
              Return-to-play confidence
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              How confident are you about returning without re-injury?
            </p>
            <WellnessScaleSelector
              value={rtpConfidence}
              onChange={setRtpConfidence}
              descriptors={RTP_CONFIDENCE_DESCRIPTORS}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="update-pain" className="text-sm">
                Update pain level today
              </Label>
              <Switch
                id="update-pain"
                checked={updatePain}
                onCheckedChange={setUpdatePain}
              />
            </div>
            {updatePain && (
              <PainLevelSlider value={painLevel} onChange={setPainLevel} />
            )}
          </div>

          <div>
            <Label htmlFor="check-in-notes" className="text-sm">
              Notes (optional)
            </Label>
            <Textarea
              id="check-in-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else about today's rehab..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Save Check-in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
