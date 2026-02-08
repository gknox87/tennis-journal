
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PainLevelSlider } from "./PainLevelSlider";
import {
  BodyRegion,
  PainType,
  OnsetType,
  ImpactLevel,
  InjuryTrend,
  InjuryDuration,
  BODY_REGIONS,
  PAIN_TYPES,
  ONSET_TYPES,
  IMPACT_LEVELS,
  INJURY_TRENDS,
  DURATION_OPTIONS,
  getRegionLabel,
} from "@/types/injury";
import { CreateInjuryInput } from "@/hooks/useInjuryReports";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface InjuryReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInjuryInput) => Promise<void>;
  selectedRegion: BodyRegion;
}

type Step = "body_part" | "pain" | "details" | "actions";

const STEPS: Step[] = ["body_part", "pain", "details", "actions"];
const STEP_LABELS: Record<Step, string> = {
  body_part: "Location",
  pain: "Pain Level",
  details: "Characteristics",
  actions: "Actions & Sharing",
};

export const InjuryReportDialog = ({
  open,
  onOpenChange,
  onSubmit,
  selectedRegion,
}: InjuryReportDialogProps) => {
  const [step, setStep] = useState<Step>("body_part");
  const [bodyPart, setBodyPart] = useState("");
  const [painLevel, setPainLevel] = useState(3);
  const [painTypes, setPainTypes] = useState<PainType[]>([]);
  const [onsetType, setOnsetType] = useState<OnsetType>("unknown");
  const [duration, setDuration] = useState<InjuryDuration>("acute");
  const [trend, setTrend] = useState<InjuryTrend>("new");
  const [impactOnTraining, setImpactOnTraining] = useState<ImpactLevel>("none");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [soughtMedical, setSoughtMedical] = useState(false);
  const [restrictedFromTraining, setRestrictedFromTraining] = useState(false);
  const [sharedWithCoach, setSharedWithCoach] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regionDescriptor = BODY_REGIONS.find((r) => r.value === selectedRegion);
  const bodyParts = regionDescriptor?.bodyParts || [];

  const stepIndex = STEPS.indexOf(step);
  const canGoBack = stepIndex > 0;
  const canGoForward = stepIndex < STEPS.length - 1;
  const isLastStep = stepIndex === STEPS.length - 1;

  const canProceed = () => {
    switch (step) {
      case "body_part":
        return bodyPart !== "";
      case "pain":
        return true;
      case "details":
        return painTypes.length > 0;
      case "actions":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoForward) setStep(STEPS[stepIndex + 1]);
  };

  const handleBack = () => {
    if (canGoBack) setStep(STEPS[stepIndex - 1]);
  };

  const togglePainType = (pt: PainType) => {
    setPainTypes((prev) =>
      prev.includes(pt) ? prev.filter((p) => p !== pt) : [...prev, pt]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        body_region: selectedRegion,
        body_part: bodyPart,
        pain_level: painLevel,
        impact_on_training: impactOnTraining,
        pain_types: painTypes,
        onset_type: onsetType,
        duration,
        trend,
        treatment_notes: treatmentNotes || undefined,
        sought_medical_attention: soughtMedical,
        restricted_from_training: restrictedFromTraining,
        shared_with_coach: sharedWithCoach,
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("body_part");
    setBodyPart("");
    setPainLevel(3);
    setPainTypes([]);
    setOnsetType("unknown");
    setDuration("acute");
    setTrend("new");
    setImpactOnTraining("none");
    setTreatmentNotes("");
    setSoughtMedical(false);
    setRestrictedFromTraining(false);
    setSharedWithCoach(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Injury — {getRegionLabel(selectedRegion)}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full flex-1 transition-colors",
                  i <= stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mb-3">
          Step {stepIndex + 1} of {STEPS.length}: {STEP_LABELS[step]}
        </p>

        <div className="space-y-4">
          {/* Step 1: Body Part Selection */}
          {step === "body_part" && (
            <div className="space-y-3">
              <Label>Select specific body part</Label>
              <div className="grid grid-cols-2 gap-2">
                {bodyParts.map((part) => (
                  <Button
                    key={part}
                    type="button"
                    variant={bodyPart === part ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => setBodyPart(part)}
                  >
                    {part}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Pain Level */}
          {step === "pain" && (
            <div className="space-y-4">
              <PainLevelSlider value={painLevel} onChange={setPainLevel} />

              <div>
                <Label>Impact on Training</Label>
                <Select
                  value={impactOnTraining}
                  onValueChange={(v) => setImpactOnTraining(v as ImpactLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: level.color }}
                          />
                          <span>{level.label}</span>
                          <span className="text-xs text-muted-foreground">
                            — {level.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Pain Characteristics */}
          {step === "details" && (
            <div className="space-y-4">
              {/* Pain type chips */}
              <div>
                <Label>Pain Type (select all that apply)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PAIN_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => togglePainType(pt.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                        painTypes.includes(pt.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Onset type */}
              <div>
                <Label>How did it start?</Label>
                <div className="flex gap-2 mt-2">
                  {ONSET_TYPES.map((ot) => (
                    <Button
                      key={ot.value}
                      type="button"
                      variant={onsetType === ot.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOnsetType(ot.value)}
                      className="flex-1"
                    >
                      <div className="text-center">
                        <div>{ot.label}</div>
                        <div className="text-[10px] opacity-70">{ot.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label>Duration</Label>
                <Select
                  value={duration}
                  onValueChange={(v) => setDuration(v as InjuryDuration)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trend */}
              <div>
                <Label>Trend</Label>
                <div className="flex gap-2 mt-2">
                  {INJURY_TRENDS.map((t) => (
                    <Button
                      key={t.value}
                      type="button"
                      variant={trend === t.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrend(t.value)}
                      className="flex-1"
                    >
                      <span className="mr-1">{t.icon}</span> {t.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Actions & Sharing */}
          {step === "actions" && (
            <div className="space-y-4">
              <div>
                <Label>Treatment Notes</Label>
                <Textarea
                  placeholder="What treatment have you done? Ice, rest, physio, etc."
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sought Medical Attention</Label>
                    <p className="text-xs text-muted-foreground">
                      Have you seen a doctor or physio?
                    </p>
                  </div>
                  <Switch
                    checked={soughtMedical}
                    onCheckedChange={setSoughtMedical}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Restricted from Training</Label>
                    <p className="text-xs text-muted-foreground">
                      Are you unable to train normally?
                    </p>
                  </div>
                  <Switch
                    checked={restrictedFromTraining}
                    onCheckedChange={setRestrictedFromTraining}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share with Coach</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow your coach to see this report
                    </p>
                  </div>
                  <Switch
                    checked={sharedWithCoach}
                    onCheckedChange={setSharedWithCoach}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={!canGoBack}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                size="lg"
              >
                {isSubmitting ? "Saving..." : "Save Report"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="sm"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
