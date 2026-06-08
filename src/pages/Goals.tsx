import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, ArrowLeft } from "lucide-react";
import { usePeriodGoals } from "@/hooks/usePeriodGoals";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalCreationDialog } from "@/components/goals/GoalCreationDialog";
import { useToast } from "@/hooks/use-toast";

const Goals = () => {
  const navigate = useNavigate();
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
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-y-auto pb-24 pt-16">
<div className="container mx-auto px-4 py-8 pb-24 max-w-4xl pt-16">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-16">
<div className="container mx-auto px-4 py-8 pb-24 max-w-4xl text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-red-500">{error}</p>
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
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-16">
<div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Period Goals</h1>
              <p className="text-sm text-gray-500">
                {activeGoals.length} active · {completedGoals.length} completed · {expiredGoals.length} expired
              </p>
            </div>
          </div>
          <Button
            className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white/70 rounded-2xl border border-dashed">
            <Target className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Set goals for any period — monthly, quarterly, or a full season — and track your progress automatically from match data.
            </p>
            <Button
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="rounded-xl mb-6">
              <TabsTrigger value="active" className="rounded-lg">
                Active ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg">
                Completed ({completedGoals.length})
              </TabsTrigger>
              <TabsTrigger value="expired" className="rounded-lg">
                Expired ({expiredGoals.length})
              </TabsTrigger>
            </TabsList>

            {["active", "completed", "expired"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {goalsByTab[tab as keyof typeof goalsByTab].length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No {tab} goals
                  </div>
                ) : (
                  goalsByTab[tab as keyof typeof goalsByTab].map((goal) => (
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
