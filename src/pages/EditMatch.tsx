import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "@/components/TagInput";
import { Switch } from "@/components/ui/switch";
import { Match } from "@/types/match";

interface Tag {
  id: string;
  name: string;
}

const EditMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    opponent: "",
    score: "",
    is_win: false,
    notes: "",
    final_set_tiebreak: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to edit matches.",
          variant: "destructive",
        });
        navigate('/login');
        return false;
      }
      return true;
    };

    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        // Fetch match data with opponent name
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            opponents (
              name
            )
          `)
          .eq("id", id)
          .single();

        if (matchError) {
          console.error("Error fetching match:", matchError);
          throw matchError;
        }

        if (!matchData) {
          toast({
            title: "Match not found",
            description: "The requested match could not be found.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        const matchWithOpponent: Match = {
          ...matchData,
          opponent_name: matchData.opponents?.name || "Unknown Opponent"
        };

        setMatch(matchWithOpponent);
        setFormData({
          date: matchData.date,
          opponent: matchData.opponents?.name || "",
          score: matchData.score,
          is_win: matchData.is_win,
          notes: matchData.notes || "",
          final_set_tiebreak: matchData.final_set_tiebreak || false,
        });

        // Fetch associated tags
        const { data: tagData, error: tagError } = await supabase
          .from("match_tags")
          .select(`
            tag_id,
            tags:tag_id (
              id,
              name
            )
          `)
          .eq("match_id", id);

        if (tagError) {
          console.error("Error fetching tags:", tagError);
          throw tagError;
        }

        setSelectedTags(tagData.map(t => t.tags));
      } catch (error) {
        console.error("Error in fetchMatch:", error);
        toast({
          title: "Error",
          description: "Failed to load match details. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to update matches.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Update match with error handling
      const { error: matchError } = await supabase
        .from("matches")
        .update(formData)
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (matchError) throw matchError;

      // Delete existing tags with error handling
      const { error: deleteError } = await supabase
        .from("match_tags")
        .delete()
        .eq("match_id", id);

      if (deleteError) throw deleteError;

      // Insert new tags if any exist
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from("match_tags")
          .insert(
            selectedTags.map(tag => ({
              match_id: id,
              tag_id: tag.id
            }))
          );

        if (tagError) throw tagError;
      }

      toast({
        title: "Success",
        description: "Match updated successfully.",
      });
      navigate(`/match/${id}`);
    } catch (error) {
      console.error("Error updating match:", error);
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-center">
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Match</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="opponent">Opponent</Label>
              <Input
                type="text"
                id="opponent"
                value={formData.opponent}
                onChange={(e) =>
                  setFormData({ ...formData, opponent: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="score">Score</Label>
              <Input
                type="text"
                id="score"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_win"
                checked={formData.is_win}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_win: checked })
                }
              />
              <Label htmlFor="is_win">Win</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="final_set_tiebreak"
                checked={formData.final_set_tiebreak}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, final_set_tiebreak: checked })
                }
              />
              <Label htmlFor="final_set_tiebreak">Final Set Tiebreak</Label>
            </div>

            <div>
              <Label>Tags</Label>
              <TagInput
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMatch;