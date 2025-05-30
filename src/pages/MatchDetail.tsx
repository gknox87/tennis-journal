
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { MatchDetailView } from "@/components/match/MatchDetailView";
import { MatchDetailHeader } from "@/components/match/MatchDetailHeader";
import { MatchActionButtons } from "@/components/match/MatchActionButtons";
import { MatchShareButtons } from "@/components/match/MatchShareButtons";

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        navigate('/');
      }
    };

    fetchMatch();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (matchError) throw matchError;

      navigate('/');
    } catch (error) {
      console.error('Error in delete operation:', error);
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

    } catch (error) {
      console.error('Error sharing via email:', error);
      throw error;
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-6">
          <MatchDetailHeader onBack={() => navigate('/')} />
          <div className="flex items-center justify-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6 mb-8">
          <MatchDetailHeader onBack={() => navigate('/')} />
          <MatchActionButtons
            matchId={id!}
            onEdit={() => navigate(`/edit-match/${id}`)}
            onDelete={handleDelete}
          />
        </div>

        <MatchDetailView match={match} />

        <div className="mt-8">
          <MatchShareButtons
            match={match}
            onEmailShare={handleEmailShare}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
