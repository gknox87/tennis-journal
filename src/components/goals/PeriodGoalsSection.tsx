import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Plus, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { usePeriodGoals } from "@/hooks/usePeriodGoals";
import { GoalCard } from "./GoalCard";
import { GoalCreationDialog } from "./GoalCreationDialog";
import { useToast } from "@/hooks/use-toast";

interface PeriodGoalsSectionProps {
  className?: string;
}

export const PeriodGoalsSection = ({ className }: PeriodGoalsSectionProps) => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const {
    activeGoals,
    completedGoals,
    isLoading,
    error,
    createGoal,
    deleteGoal,
    getGoalProgress,
  } = usePeriodGoals();

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      toast({ title: "Goal deleted" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete goal";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const displayGoals = [...activeGoals, ...completedGoals].slice(0, 3);

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">My Goals</h3>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-6 text-center text-red-500">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load goals</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">My Goals</h3>
            {activeGoals.length > 0 && (
              <p className="text-sm text-gray-500">
                {activeGoals.filter((g) => getGoalProgress(g).isOnTrack).length} of{" "}
                {activeGoals.length} on track
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Goal
        </Button>
      </div>

      {displayGoals.length === 0 ? (
        <Card className="p-6 text-center border-dashed border-2">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-700 mb-1">No goals set yet</h4>
          <p className="text-sm text-gray-500 mb-4">
            Track weekly habits like training sessions and wellness check-ins, or set outcome targets — all updated automatically.
          </p>
          <Button
            className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={getGoalProgress(goal)}
              onDelete={handleDelete}
            />
          ))}

          {activeGoals.length + completedGoals.length > 3 && (
            <Button
              variant="ghost"
              className="w-full rounded-xl text-gray-500"
              onClick={() => navigate("/goals")}
            >
              View all {activeGoals.length + completedGoals.length} goals
            </Button>
          )}
        </div>
      )}

      <GoalCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={createGoal}
      />
    </div>
  );
};
