import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { CalendarIcon, Target, Plus } from "lucide-react";
import { GOAL_TYPE_CONFIGS } from "@/types/goals";
import type { GoalType } from "@/types/goals";
import { useToast } from "@/hooks/use-toast";

interface GoalCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (goal: {
    title: string;
    description: string;
    goal_type: GoalType;
    target_value: number;
    unit: string;
    period_start: string;
    period_end: string;
  }) => Promise<void>;
}

export const GoalCreationDialog = ({
  open,
  onOpenChange,
  onCreate,
}: GoalCreationDialogProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("win_rate");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("percent");
  const [periodStart, setPeriodStart] = useState<Date>(new Date());
  const [periodEnd, setPeriodEnd] = useState<Date>(endOfMonth(addMonths(new Date(), 2)));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedConfig = GOAL_TYPE_CONFIGS.find((c) => c.id === goalType);

  const handleGoalTypeChange = (value: GoalType) => {
    setGoalType(value);
    const config = GOAL_TYPE_CONFIGS.find((c) => c.id === value);
    if (config) {
      setUnit(config.defaultUnit);
      setTargetValue(config.defaultTarget.toString());
    }
  };

  const setPresetPeriod = (preset: "month" | "quarter" | "season") => {
    const now = new Date();
    switch (preset) {
      case "month":
        setPeriodStart(startOfMonth(now));
        setPeriodEnd(endOfMonth(now));
        break;
      case "quarter":
        setPeriodStart(startOfQuarter(now));
        setPeriodEnd(endOfQuarter(now));
        break;
      case "season":
        setPeriodStart(startOfMonth(now));
        setPeriodEnd(endOfMonth(addMonths(now, 3)));
        break;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !targetValue) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const target = parseFloat(targetValue);
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Invalid target",
        description: "Target value must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        goal_type: goalType,
        target_value: target,
        unit,
        period_start: format(periodStart, "yyyy-MM-dd"),
        period_end: format(periodEnd, "yyyy-MM-dd"),
      });

      toast({ title: "Goal created! 🎯", description: `"${title}" is now being tracked.` });

      // Reset form
      setTitle("");
      setDescription("");
      setGoalType("win_rate");
      setTargetValue("");
      setUnit("percent");
      setPeriodStart(new Date());
      setPeriodEnd(endOfMonth(addMonths(new Date(), 2)));
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create goal";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Set a New Goal
          </DialogTitle>
          <DialogDescription>
            Define a target for a specific period and track your progress automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Goal Type */}
          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Select value={goalType} onValueChange={(v) => handleGoalTypeChange(v as GoalType)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {GOAL_TYPE_CONFIGS.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedConfig && (
              <p className="text-xs text-gray-500">{selectedConfig.description}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal Title *</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. "Win 70% of ${selectedConfig?.label.toLowerCase() || "matches"}"`}
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="goal-description">Description (optional)</Label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this goal important to you?"
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target Value *</Label>
            <div className="flex items-center gap-3">
              <Input
                id="goal-target"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={selectedConfig?.defaultTarget.toString() || "0"}
                className="rounded-xl"
                min={1}
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {unit === "percent" ? "%" : unit === "days" ? "days" : unit === "count" ? "" : unit}
              </span>
            </div>
          </div>

          {/* Period Presets */}
          <div className="space-y-2">
            <Label>Time Period</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setPresetPeriod("month")}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setPresetPeriod("quarter")}
              >
                This Quarter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setPresetPeriod("season")}
              >
                This Season
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl",
                      !periodStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodStart ? format(periodStart, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periodStart}
                    onSelect={(date) => date && setPeriodStart(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl",
                      !periodEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodEnd ? format(periodEnd, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periodEnd}
                    onSelect={(date) => date && setPeriodEnd(date)}
                    initialFocus
                    disabled={(date) => date < periodStart}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
