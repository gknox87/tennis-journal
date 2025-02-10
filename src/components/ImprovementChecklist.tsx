
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImprovementPoint {
  id: string;
  point: string;
  is_completed: boolean;
}

export const ImprovementChecklist = () => {
  const [points, setPoints] = useState<ImprovementPoint[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchImprovementPoints();
  }, []);

  const fetchImprovementPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('improvement_points')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Convert asterisks to bold text
      const processedPoints = data?.map(point => ({
        ...point,
        point: point.point.replace(/\*\*(.*?)\*\*/g, '$1')
      })) || [];
      
      setPoints(processedPoints);
    } catch (error) {
      console.error('Error fetching improvement points:', error);
      toast({
        title: "Error",
        description: "Failed to load improvement points",
        variant: "destructive",
      });
    }
  };

  const togglePoint = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('improvement_points')
        .update({ is_completed: !currentValue })
        .eq('id', id);

      if (error) throw error;

      setPoints(points.map(point => 
        point.id === id 
          ? { ...point, is_completed: !currentValue }
          : point
      ));
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
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-semibold">Improvement Points</h2>
      <div className="space-y-2">
        {points.map((point) => (
          <div key={point.id} className="flex items-start space-x-2">
            <Checkbox
              id={point.id}
              checked={point.is_completed}
              onCheckedChange={() => togglePoint(point.id, point.is_completed)}
            />
            <label
              htmlFor={point.id}
              className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                point.is_completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              <span className="font-semibold">{point.point}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
