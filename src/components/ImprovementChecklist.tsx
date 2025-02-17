
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

interface ImprovementPoint {
  id: string;
  point: string;
  is_completed: boolean;
}

export const ImprovementChecklist = () => {
  const [points, setPoints] = useState<ImprovementPoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchImprovementPoints = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('improvement_points')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Convert asterisks to bold text and filter out completed points
      const processedPoints = data?.map(point => ({
        ...point,
        point: point.point.replace(/\*\*(.*?)\*\*/g, '$1')
      })).filter(point => !point.is_completed) || [];
      
      setPoints(processedPoints);
    } catch (error) {
      console.error('Error fetching improvement points:', error);
      toast({
        title: "Error",
        description: "Failed to load improvement points",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImprovementPoints();
  }, []);

  const togglePoint = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('improvement_points')
        .update({ is_completed: !currentValue })
        .eq('id', id);

      if (error) throw error;

      // Remove the completed point from the list
      setPoints(points.filter(point => point.id !== id));
      
      toast({
        title: "Success",
        description: "Progress updated successfully",
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

  if (points.length === 0) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">No active improvement points.</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchImprovementPoints}
          disabled={isRefreshing}
          className="mx-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Tips
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          {points.map((point) => (
            <div key={point.id} className="flex items-start space-x-3 text-left">
              <Checkbox
                id={point.id}
                checked={point.is_completed}
                onCheckedChange={() => togglePoint(point.id, point.is_completed)}
                className="mt-1"
              />
              <label
                htmlFor={point.id}
                className="text-sm leading-tight"
              >
                {point.point}
              </label>
            </div>
          ))}
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={fetchImprovementPoints}
        disabled={isRefreshing}
        className="w-full"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh Tips
      </Button>
    </div>
  );
};
