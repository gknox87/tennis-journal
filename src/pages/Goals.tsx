import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus } from "lucide-react";
import { useSport } from "@/context/SportContext";
import { usePeriodGoals } from "@/hooks/usePeriodGoals";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalCreationDialog } from "@/components/goals/GoalCreationDialog";
import { useToast } from "@/hooks/use-toast";

const Goals = () => {
  const { sport } = useSport();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const {
    goals,
    activeGoals,
    completedGoals,
    expiredGoals,
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

  if (isLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center overflow-y-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const goalsByTab = {
    active: activeGoals,
    completed: completedGoals,
    expired: expiredGoals,
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-500" /> Goals
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track process and outcome goals for {sport.shortName}
                {goals.length > 0 && (
                  <> · {activeGoals.length} active · {completedGoals.length} completed · {expiredGoals.length} expired</>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> New Goal
            </Button>
          </div>
        </div>

        {goals.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-purple-50 to-pink-50">
            <Target className="h-12 w-12 mx-auto mb-4 text-purple-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
              Set process goals like weekly training sessions or wellness check-ins — progress updates automatically from your journal. Outcome goals like win rate are tracked too.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" /> Create Your First Goal
            </Button>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                Active ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed ({completedGoals.length})
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex-1">
                Expired ({expiredGoals.length})
              </TabsTrigger>
            </TabsList>

            {(["active", "completed", "expired"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
                {goalsByTab[tab].length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No {tab} goals</p>
                  </Card>
                ) : (
                  goalsByTab[tab].map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      progress={getGoalProgress(goal)}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <GoalCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={createGoal}
      />
    </div>
  );
};

export default Goals;
