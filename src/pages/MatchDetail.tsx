import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";
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

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        setMatch(data);
      } catch (error) {
        console.error("Error fetching match:", error);
        toast({
          title: "Error",
          description: "Failed to fetch match details.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    fetchMatch();
  }, [id]);

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p>Loading match details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => navigate(`/edit-match/${id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Match
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{match.opponent}</CardTitle>
            <Badge 
              variant={match.is_win ? "default" : "destructive"}
              className={match.is_win ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {match.is_win ? "Win" : "Loss"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Date</h3>
            <p>{new Date(match.date).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Score</h3>
            <p className="text-xl">{match.score}</p>
          </div>
          {match.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="whitespace-pre-wrap">{match.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchDetail;