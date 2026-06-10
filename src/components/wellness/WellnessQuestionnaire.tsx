
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { WellnessScaleSelector } from "@/components/wellness/WellnessScaleSelector";
import { WELLNESS_QUESTIONS, WELLNESS_SORENESS_DESCRIPTORS, WELLNESS_MAX_SCORE, WellnessFieldKey } from "@/types/wellness";
import { WellnessSubmitInput } from "@/hooks/useWellness";
import { calculateWellnessScore, getWellnessZone, getWellnessZoneColor, getWellnessZoneLabel } from "@/utils/wellnessCalc";
import { ChevronLeft, ChevronRight, Check, Moon, Zap, Brain, Smile, Flame, Target, Activity, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const STEP_ICONS = [Moon, Zap, Brain, Smile, Flame, Target];

interface WellnessQuestionnaireProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: WellnessSubmitInput) => Promise<void>;
}

type Step = "questions" | "extras" | "notes" | "summary";

export const WellnessQuestionnaire = ({
  open,
  onOpenChange,
  onSubmit,
}: WellnessQuestionnaireProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [step, setStep] = useState<Step>("questions");
  const [answers, setAnswers] = useState<Record<WellnessFieldKey, number | null>>({
    sleep_quality: null,
    fatigue: null,
    stress_level: null,
    mood: null,
    motivation: null,
    performance_confidence: null,
  });
  const [sleepHours, setSleepHours] = useState<string>("");
  const [muscleSoreness, setMuscleSoreness] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [appetite, setAppetite] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [menstrualDay, setMenstrualDay] = useState<string>("");
  const [showMenstrual, setShowMenstrual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("show_menstrual_tracking")
        .eq("id", sessionData.session.user.id)
        .maybeSingle();
      setShowMenstrual(data?.show_menstrual_tracking === true);
    };
    if (open) checkProfile();
  }, [open]);

  useEffect(() => {
    if (open) {
      setCurrentQuestion(0);
      setStep("questions");
      setAnswers({
        sleep_quality: null,
        fatigue: null,
        stress_level: null,
        mood: null,
        motivation: null,
        performance_confidence: null,
      });
      setSleepHours("");
      setMuscleSoreness(null);
      setEnergy(null);
      setAppetite(null);
      setNotes("");
      setMenstrualDay("");
      setIsSubmitting(false);
      setSubmitError(null);
    }
  }, [open]);

  const question = WELLNESS_QUESTIONS[currentQuestion];
  const Icon = STEP_ICONS[currentQuestion] || Smile;
  const allCoreAnswered = Object.values(answers).every((v) => v !== null);
  const totalSteps = WELLNESS_QUESTIONS.length;
  const progressPercent =
    step === "questions"
      ? ((currentQuestion + (answers[question?.key] !== null ? 1 : 0)) / totalSteps) * 70
      : step === "extras"
      ? 80
      : step === "notes"
      ? 90
      : 100;

  const handleAnswer = (value: number) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const handleBack = () => {
    if (step === "summary") {
      setStep("notes");
    } else if (step === "notes") {
      setStep("extras");
    } else if (step === "extras") {
      setCurrentQuestion(totalSteps - 1);
      setStep("questions");
    } else if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (step === "questions") {
      if (currentQuestion < totalSteps - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setStep("extras");
      }
    } else if (step === "extras") {
      setStep("notes");
    } else if (step === "notes") {
      setStep("summary");
    }
  };

  const handleSubmit = async () => {
    if (!allCoreAnswered) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        sleep_quality: answers.sleep_quality!,
        sleep_duration_hours: sleepHours ? parseFloat(sleepHours) : null,
        fatigue: answers.fatigue!,
        muscle_soreness: muscleSoreness,
        stress_level: answers.stress_level!,
        mood: answers.mood!,
        motivation: answers.motivation!,
        performance_confidence: answers.performance_confidence!,
        energy,
        appetite,
        notes: notes.trim() || null,
        menstrual_cycle_day: menstrualDay ? parseInt(menstrualDay) : null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save check-in";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewScore = allCoreAnswered
    ? calculateWellnessScore(answers as Record<WellnessFieldKey, number>)
    : null;
  const previewZone = previewScore !== null ? getWellnessZone(previewScore) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {step === "questions"
              ? `Question ${Math.min(currentQuestion + 1, totalSteps)} of ${totalSteps}`
              : step === "extras"
              ? "Optional extras"
              : step === "notes"
              ? "Notes"
              : "Summary"}
          </p>
        </div>

        <div className="px-6 pb-6">
          {step === "questions" && question && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{question.question}</h3>
              </div>

              <WellnessScaleSelector
                value={answers[question.key]}
                onChange={handleAnswer}
                descriptors={question.descriptors}
              />

              {currentQuestion === 0 && (
                <div className="pt-2 border-t">
                  <Label htmlFor="sleep-hours" className="text-sm text-muted-foreground">
                    How many hours did you sleep? (optional)
                  </Label>
                  <Input
                    id="sleep-hours"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="e.g. 7.5"
                    className="mt-1 h-10"
                  />
                </div>
              )}
            </div>
          )}

          {step === "extras" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-foreground">Optional Extras</h3>
                <p className="text-sm text-muted-foreground">
                  These are optional — skip if you prefer.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" /> Muscle soreness (1–5)
                  </Label>
                  <div className="mt-2">
                    <WellnessScaleSelector
                      value={muscleSoreness}
                      onChange={(v) => setMuscleSoreness(muscleSoreness === v ? null : v)}
                      descriptors={WELLNESS_SORENESS_DESCRIPTORS}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Energy level (1–5)</Label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEnergy(energy === v ? null : v)}
                        className={cn(
                          "flex-1 h-11 rounded-lg border-2 font-bold transition-all",
                          energy === v
                            ? "bg-primary text-white border-primary shadow-md"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Appetite (1–5)</Label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAppetite(appetite === v ? null : v)}
                        className={cn(
                          "flex-1 h-11 rounded-lg border-2 font-bold transition-all",
                          appetite === v
                            ? "bg-primary text-white border-primary shadow-md"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {showMenstrual && (
                  <div>
                    <Label htmlFor="menstrual-day" className="text-sm font-medium">
                      Menstrual cycle day (optional)
                    </Label>
                    <Input
                      id="menstrual-day"
                      type="number"
                      min="1"
                      max="60"
                      value={menstrualDay}
                      onChange={(e) => setMenstrualDay(e.target.value)}
                      placeholder="e.g. 14"
                      className="mt-1 h-10"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "notes" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-foreground">Any Notes?</h3>
                <p className="text-sm text-muted-foreground">
                  Anything else worth noting about how you feel today?
                </p>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Slept late due to travel, feeling a bit off..."
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {step === "summary" && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-foreground">Your Wellness Summary</h3>
                {previewScore !== null && previewZone !== null ? (
                  <>
                    <div
                      className="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: getWellnessZoneColor(previewZone) }}
                    >
                      <div className="text-center">
                        <span className="text-3xl font-black">{previewScore}</span>
                        <span className="text-xs block opacity-90">/{WELLNESS_MAX_SCORE}</span>
                      </div>
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: getWellnessZoneColor(previewZone) }}
                    >
                      {getWellnessZoneLabel(previewZone)}
                    </p>
                  </>
                ) : (
                  <div className="py-4">
                    <p className="text-sm text-amber-600 font-medium">
                      Complete all 6 core questions to see your wellness score.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {WELLNESS_QUESTIONS.map((q, i) => {
                  const val = answers[q.key];
                  const StepIcon = STEP_ICONS[i];
                  return (
                    <div key={q.key} className="space-y-1">
                      <StepIcon className="h-4 w-4 mx-auto text-muted-foreground" />
                      <div className="text-lg font-bold">{val ?? "—"}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        {q.title}
                      </div>
                    </div>
                  );
                })}
              </div>

              {sleepHours && (
                <p className="text-sm text-center text-muted-foreground">
                  Sleep duration: {sleepHours} hours
                </p>
              )}
              {muscleSoreness && (
                <p className="text-sm text-center text-muted-foreground">
                  Muscle soreness: {muscleSoreness}/5
                </p>
              )}
              {energy && <p className="text-sm text-center text-muted-foreground">Energy: {energy}/5</p>}
              {appetite && <p className="text-sm text-center text-muted-foreground">Appetite: {appetite}/5</p>}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === "questions" && currentQuestion === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            {step === "summary" ? (
              <div className="space-y-2 w-full">
                {submitError && (
                  <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-lg">
                    {submitError}
                  </p>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !allCoreAnswered}
                  className="gap-1 shadow-lg w-full"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save Check-in
                </Button>
              </div>
            ) : step === "extras" || step === "notes" ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleNext} className="gap-1">
                  <SkipForward className="h-4 w-4" /> Skip
                </Button>
                <Button size="sm" onClick={handleNext} className="gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={answers[question?.key] === null}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
