import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSport } from "@/context/SportContext";
import { RefreshCw } from "lucide-react";

interface ImprovementPoint {
  id: string;
  point: string;
  is_completed: boolean;
}

export const ImprovementChecklist = () => {
  const [points, setPoints] = useState<ImprovementPoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { sport } = useSport();

  const fetchImprovementPoints = async () => {
    try {
      setIsRefreshing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.session) {
        // Session might not be ready yet, just return silently
        return;
      }

      const { data, error } = await supabase
        .from('improvement_points')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', {
          ascending: false
        })
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
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateNewTips = async () => {
    try {
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.session) {
        toast({
          title: "Error",
          description: "Please log in to generate tips",
          variant: "destructive"
        });
        return;
      }

      // Fetch recent matches with notes that don't have improvement points yet
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, notes, sport_id, date')
        .eq('user_id', session.session.user.id)
        .not('notes', 'is', null)
        .neq('notes', '')
        .order('date', { ascending: false })
        .limit(5);

      if (matchesError) throw matchesError;

      if (!matches || matches.length === 0) {
        toast({
          title: "No matches found",
          description: "Add notes to your matches to generate improvement tips",
          variant: "default"
        });
        return;
      }

      // Check which matches already have improvement points
      const { data: existingPoints } = await supabase
        .from('improvement_points')
        .select('source_match_id')
        .eq('user_id', session.session.user.id)
        .not('source_match_id', 'is', null);

      const matchesWithPoints = new Set(
        existingPoints?.map(p => p.source_match_id).filter(Boolean) || []
      );

      // Find matches without improvement points
      const matchesToAnalyze = matches.filter(m => !matchesWithPoints.has(m.id));

      if (matchesToAnalyze.length === 0) {
        toast({
          title: "All matches analyzed",
          description: "Tips have already been generated for your recent matches",
          variant: "default"
        });
        // Still refresh to show existing tips
        await fetchImprovementPoints();
        return;
      }

      // Generate tips for each match
      let tipsGenerated = 0;
      for (const match of matchesToAnalyze) {
        try {
          const { data: aiResponse, error: aiError } = await supabase.functions.invoke('analyze-match-notes', {
            body: { 
              notes: match.notes,
              sport_id: match.sport_id || sport.id
            }
          });

          if (aiError) {
            console.error('AI error for match', match.id, aiError);
            continue;
          }

          if (aiResponse?.suggestions && Array.isArray(aiResponse.suggestions) && aiResponse.suggestions.length > 0) {
            const { error: insertError } = await supabase
              .from('improvement_points')
              .insert(
                aiResponse.suggestions.map((point: string) => ({
                  user_id: session.session.user.id,
                  point: point.trim(),
                  source_match_id: match.id
                }))
              );

            if (insertError) {
              console.error('Error inserting tips for match', match.id, insertError);
            } else {
              tipsGenerated += aiResponse.suggestions.length;
            }
          }
        } catch (error) {
          console.error('Error processing match', match.id, error);
        }
      }

      if (tipsGenerated > 0) {
        toast({
          title: "Success",
          description: `Generated ${tipsGenerated} new improvement tip${tipsGenerated > 1 ? 's' : ''}`,
        });
        // Refresh the list to show new tips
        await fetchImprovementPoints();
      } else {
        toast({
          title: "No new tips",
          description: "Could not generate new tips from your matches. Make sure your match notes are detailed.",
          variant: "default"
        });
        // Still refresh to show existing tips
        await fetchImprovementPoints();
      }
    } catch (error) {
      console.error('Error generating tips:', error);
      toast({
        title: "Error",
        description: "Failed to generate improvement tips",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshTips = async () => {
    // First try to generate new tips, then refresh the list
    await generateNewTips();
  };

  useEffect(() => {
    fetchImprovementPoints();
  }, []);

  const togglePoint = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('improvement_points')
        .update({
          is_completed: !currentValue
        })
        .eq('id', id);

      if (error) throw error;

      // Remove the completed point from the list
      setPoints(points.filter(point => point.id !== id));
      toast({
        title: "Success",
        description: "Progress updated successfully"
      });
    } catch (error) {
      console.error('Error updating improvement point:', error);
      toast({
        title: "Error",
        description: "Failed to update improvement point",
        variant: "destructive"
      });
    }
  };

  const isLoading = isRefreshing || isGenerating;

  if (points.length === 0) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">No active improvement points.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshTips} 
          disabled={isLoading} 
          className="mx-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating Tips...' : 'Refresh Tips'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          {points.map(point => (
            <div key={point.id} className="flex items-start space-x-3 text-left">
              <Checkbox 
                id={point.id} 
                checked={point.is_completed} 
                onCheckedChange={() => togglePoint(point.id, point.is_completed)} 
                className="mt-1 my-[3px] mx-[3px]" 
              />
              <label htmlFor={point.id} className="text-sm leading-tight">
                {point.point}
              </label>
            </div>
          ))}
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefreshTips} 
        disabled={isLoading} 
        className="w-full"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isGenerating ? 'Generating Tips...' : 'Refresh Tips'}
      </Button>
    </div>
  );
};