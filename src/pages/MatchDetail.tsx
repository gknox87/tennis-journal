
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { MatchDetailView } from "@/components/match/MatchDetailView";
import { MatchDetailHeader } from "@/components/match/MatchDetailHeader";
import { MatchActionButtons } from "@/components/match/MatchActionButtons";
import { MatchShareButtons } from "@/components/match/MatchShareButtons";
import { Header } from "@/components/Header";

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("matches")
          .select(`
            *,
            opponents (
              name
            )
          `)
          .eq("id", id)
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching match:", error);
          navigate('/');
          return;
        }

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
      } finally {
        setIsLoading(false);
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
        .eq('id', id)
        .eq('user_id', session.user.id);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header userProfile={null} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-28">
          <MatchDetailHeader onBack={() => navigate('/')} />
          <div className="flex items-center justify-center mt-8 sm:mt-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header userProfile={null} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-28">
          <MatchDetailHeader onBack={() => navigate('/')} />
          <div className="flex items-center justify-center mt-8 sm:mt-12">
            <p className="text-gray-600">Match not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header userProfile={null} />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-16 w-12 h-12 sm:w-16 sm:h-16 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-10 h-10 sm:w-12 sm:h-12 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-32 w-18 h-18 sm:w-24 sm:h-24 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-28 max-w-4xl">
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MatchDetailHeader onBack={() => navigate('/')} />
          <MatchActionButtons
            matchId={id!}
            onEdit={() => navigate(`/edit-match/${id}`)}
            onDelete={handleDelete}
          />
        </div>

        <MatchDetailView match={match} />

        <div className="mt-6 sm:mt-8">
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
