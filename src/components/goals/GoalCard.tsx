import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type { PeriodGoal, GoalProgress } from "@/types/goals";
import { GOAL_TYPE_CONFIGS } from "@/types/goals";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface GoalCardProps {
  goal: PeriodGoal;
  progress: GoalProgress;
  onDelete?: (id: string) => void;
}

export const GoalCard = ({ goal, progress, onDelete }: GoalCardProps) => {
  const config = GOAL_TYPE_CONFIGS.find((c) => c.id === goal.goal_type);
  const isCompleted = goal.is_completed || goal.status === "completed";
  const isWeekly = goal.cadence === "weekly";
  const weekly = progress.weekly;

  const getStatusColor = () => {
    if (isCompleted) return "bg-emerald-50 border-emerald-200";
    if (goal.status === "expired") return "bg-gray-50 border-gray-200";
    if (progress.isOnTrack) return "bg-white border-green-200";
    return "bg-white border-orange-200";
  };

  const getProgressColor = () => {
    if (isCompleted) return "bg-emerald-500";
    if (progress.percentage >= 75) return "bg-blue-500";
    if (progress.percentage >= 50) return "bg-yellow-500";
    if (progress.percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatValue = (value: number) => {
    if (goal.unit === "percent") return `${value}%`;
    if (goal.unit === "days") return `${value} days`;
    return `${Math.round(value)}`;
  };

  const getWeekChipClass = (met: boolean, isPending: boolean, isCurrent: boolean) => {
    if (isPending || isCurrent) {
      return met
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-blue-50 text-blue-600 border-blue-100";
    }
    if (met) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  return (
    <Card className={cn("p-5 border-2 transition-all duration-300 hover:shadow-lg", getStatusColor())}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg",
              isCompleted
                ? "bg-emerald-100"
                : progress.isOnTrack
                ? "bg-blue-100"
                : "bg-orange-100"
            )}
          >
            {config?.icon || "🎯"}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{goal.title}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4",
                  config?.category === "process"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {config?.category === "process" ? "Process" : "Outcome"}
              </Badge>
              <span>
                {config?.label}
                {isWeekly ? " · Weekly" : ""} · {format(parseISO(goal.period_start), "MMM d")} –{" "}
                {format(parseISO(goal.period_end), "MMM d, yyyy")}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Trophy className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          {goal.status === "expired" && (
            <Badge variant="secondary" className="text-gray-600">
              Expired
            </Badge>
          )}
          {onDelete && !isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
      )}

      <div className="mt-4 space-y-2">
        {isWeekly && weekly ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                This week: {weekly.currentWeekCount} / {formatValue(goal.target_value)}
              </span>
              <span className="font-bold text-gray-900">{progress.percentage}%</span>
            </div>

            <div className="relative">
              <Progress value={progress.percentage} className="h-2.5" />
              <div
                className={cn("absolute top-0 left-0 h-2.5 rounded-full transition-all", getProgressColor())}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {weekly.weeks.map((week, index) => (
                <div
                  key={week.weekStart}
                  title={`Week ${index + 1}: ${week.count}/${goal.target_value}`}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border",
                    getWeekChipClass(week.met, week.isPending, week.isCurrent)
                  )}
                >
                  {week.isPending ? "…" : week.met ? "✓" : week.count}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {progress.daysRemaining > 0 ? `${progress.daysRemaining} days left` : "Period ended"}
                </span>
                {!isCompleted && goal.status !== "expired" && (
                  <span className="flex items-center gap-1">
                    {progress.isOnTrack ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">On track</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600">Behind pace</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {!isCompleted && goal.status !== "expired" && (
                <span className="text-gray-400">
                  {weekly.weeksMet} of {weekly.weeksElapsed} weeks met
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                {formatValue(goal.current_value)} / {formatValue(goal.target_value)} {goal.unit}
              </span>
              <span className="font-bold text-gray-900">{progress.percentage}%</span>
            </div>

            <div className="relative">
              <Progress value={progress.percentage} className="h-2.5" />
              <div
                className={cn("absolute top-0 left-0 h-2.5 rounded-full transition-all", getProgressColor())}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {progress.daysRemaining > 0 ? `${progress.daysRemaining} days left` : "Period ended"}
                </span>
                {!isCompleted && goal.status !== "expired" && (
                  <span className="flex items-center gap-1">
                    {progress.isOnTrack ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">On track</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600">Behind pace</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {!isCompleted && goal.status !== "expired" && (
                <span className="text-gray-400">
                  Projected: {formatValue(progress.projectedValue)}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {isCompleted && (
        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Congratulations! You hit your target on{" "}
            {format(parseISO(goal.completed_at || goal.updated_at), "MMM d, yyyy")}.
          </span>
        </div>
      )}
    </Card>
  );
};
