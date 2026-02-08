
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useSport } from "@/context/SportContext";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { LogSessionDialog } from "@/components/training/LogSessionDialog";
import { LoadDashboard } from "@/components/training/LoadDashboard";
import { Plus, Zap, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ACTIVITY_TYPES } from "@/types/trainingLoad";
import { useNavigate } from "react-router-dom";

const TrainingLoad = () => {
  const { sport } = useSport();
  const { sessions, isLoading, logSession, deleteSession, metrics } = useTrainingLoad();
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  // Recent sessions (last 7 days)
  const recentSessions = sessions.slice(-20).reverse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" /> Training Load
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Session-RPE monitoring for {sport.shortName}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/training-notes")}>
              Add a training note
            </Button>
          </div>
          {sessions.length > 0 && (
          <div className="flex gap-2 mt-3">
            <Button onClick={() => setShowDialog(true)} size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Log Session
            </Button>
            <Button variant="outline" onClick={() => navigate("/training-notes")}>
              Training Notes
            </Button>
          </div>
        )}
        </div>

        {sessions.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-blue-50 to-green-50">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Logged Yet</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Log your first training session to start tracking your workload and injury risk.
            </p>
            <Button onClick={() => setShowDialog(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" /> Log first training load journal
            </Button>
          </Card>
        ) : (
          <>
            <LoadDashboard sessions={sessions} metrics={metrics} />

            {/* Recent sessions */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Recent Sessions</h2>
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <Card key={s.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {s.rpe}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ACTIVITY_TYPES.find((a) => a.value === s.activity_type)?.label || s.activity_type}
                          {s.sport_specific && ` — ${s.sport_specific}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(s.session_date), "MMM dd")} · {s.duration_minutes} min · Load: {s.training_load}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive/60 hover:text-destructive"
                      onClick={() => deleteSession(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        <LogSessionDialog open={showDialog} onOpenChange={setShowDialog} onSubmit={logSession} />
      </div>
    </div>
  );
};

export default TrainingLoad;
