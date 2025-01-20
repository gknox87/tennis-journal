import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Match {
  id: string;
  date: string;
  opponent: string;
  score: string;
  is_win: boolean;
  notes?: string;
}

const EditMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    opponent: "",
    score: "",
    is_win: false,
    notes: "",
  });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setMatch(data);
          setFormData({
            date: data.date,
            opponent: data.opponent,
            score: data.score,
            is_win: data.is_win,
            notes: data.notes || "",
          });
        }
      } catch (error) {
        console.error("Error fetching match:", error);
        toast({
          title: "Error",
          description: "Failed to fetch match details.",
          variant: "destructive",
        });
      }
    };

    fetchMatch();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("matches")
        .update(formData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match updated successfully.",
      });
      navigate(`/match/${id}`);
    } catch (error) {
      console.error("Error updating match:", error);
      toast({
        title: "Error",
        description: "Failed to update match.",
        variant: "destructive",
      });
    }
  };

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p>Loading match details...</p>
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
              <input
                type="checkbox"
                id="is_win"
                checked={formData.is_win}
                onChange={(e) =>
                  setFormData({ ...formData, is_win: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_win">Win</Label>
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