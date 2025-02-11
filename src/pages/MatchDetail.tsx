
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/types/match";
import { MatchDetailView } from "@/components/match/MatchDetailView";
import { MatchDetailHeader } from "@/components/match/MatchDetailHeader";
import { MatchActionButtons } from "@/components/match/MatchActionButtons";
import { MatchShareButtons } from "@/components/match/MatchShareButtons";

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
          .select(`
            *,
            opponents (
              name
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const matchWithOpponent: Match = {
            ...data,
            opponent_name: data.opponents?.name || "Unknown Opponent"
          };
          setMatch(matchWithOpponent);
        }
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
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to delete matches.",
          variant: "destructive",
        });
        return;
      }

      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (matchError) throw matchError;

      toast({
        title: "Match deleted",
        description: "The match has been successfully deleted.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = async (recipientEmail: string) => {
    if (!match) return;

    try {
      const { error } = await supabase.functions.invoke('share-match-notes', {
        body: {
          recipientEmail,
          matchDetails: {
            opponent: match.opponent_name,
            date: new Date(match.date).toLocaleDateString(),
            score: match.score,
            notes: match.notes || '',
            isWin: match.is_win,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match notes have been shared via email.",
      });
    } catch (error) {
      console.error('Error sharing via email:', error);
      toast({
        title: "Error",
        description: "Failed to share match notes. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-6">
        <MatchDetailHeader onBack={() => navigate('/')} />
        <p>Loading match details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex flex-col gap-4 mb-6">
        <MatchDetailHeader onBack={() => navigate('/')} />
        <MatchActionButtons
          matchId={id!}
          onEdit={() => navigate(`/edit-match/${id}`)}
          onDelete={handleDelete}
        />
      </div>

      <MatchDetailView match={match} />

      <MatchShareButtons
        match={match}
        onEmailShare={handleEmailShare}
      />
    </div>
  );
};

export default MatchDetail;
