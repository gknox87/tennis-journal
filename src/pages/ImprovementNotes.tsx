import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ImprovementPoint {
  id: string;
  point: string;
  is_completed: boolean;
  source_match_id: string | null;
  created_at: string;
  matches?: {
    date: string;
    score: string;
    opponent_id: string | null;
    opponents?: {
      name: string;
    };
  };
}

const ImprovementNotes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [improvementPoints, setImprovementPoints] = useState<ImprovementPoint[]>([]);

  const fetchImprovementPoints = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const { data, error } = await supabase
        .from('improvement_points')
        .select(`
          *,
          matches (
            date,
            score,
            opponent_id,
            opponents (
              name
            )
          )
        `)
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImprovementPoints(data || []);
    } catch (error) {
      console.error('Error fetching improvement points:', error);
      toast({
        title: "Error",
        description: "Failed to fetch improvement points",
        variant: "destructive",
      });
    }
  };

  const toggleImprovementPoint = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('improvement_points')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchImprovementPoints();
      
      toast({
        title: !currentStatus ? "Point completed!" : "Point uncompleted",
        description: "Your progress has been updated",
      });
    } catch (error) {
      console.error('Error updating improvement point:', error);
      toast({
        title: "Error",
        description: "Failed to update improvement point",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImprovementPoints();

    const subscription = supabase
      .channel("improvement_points_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "improvement_points",
        },
        () => {
          fetchImprovementPoints();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
      <Header />
      <div className="mt-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">AI Improvement Notes</h1>
      </div>

      <div className="mt-6 space-y-6">
        {improvementPoints.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No improvement points found. Play some matches and add notes to get AI-generated improvement suggestions.
            </p>
          </Card>
        ) : (
          improvementPoints.map((point) => (
            <Card key={point.id} className="p-6">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5"
                  onClick={() => toggleImprovementPoint(point.id, point.is_completed)}
                >
                  {point.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1">
                  <p className={point.is_completed ? 'line-through text-gray-500' : ''}>
                    {point.point}
                  </p>
                  {point.matches && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      From match on {new Date(point.matches.date).toLocaleDateString()} against{' '}
                      {point.matches.opponents?.name} ({point.matches.score})
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ImprovementNotes;