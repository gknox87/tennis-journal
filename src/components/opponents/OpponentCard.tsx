
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Trophy, Target, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OpponentDetailsDialog } from "./OpponentDetailsDialog";

interface OpponentCardProps {
  opponent: {
    id: string;
    name: string;
    matches: {
      is_win: boolean;
      date: string;
      score: string;
    }[];
    strengths?: string;
    weaknesses?: string;
    tendencies?: string;
  };
  onDelete: (id: string) => void;
}

export const OpponentCard = ({ opponent, onDelete }: OpponentCardProps) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [currentOpponent, setCurrentOpponent] = useState(opponent);
  
  const stats = {
    wins: currentOpponent.matches.filter(match => match.is_win).length,
    losses: currentOpponent.matches.filter(match => !match.is_win).length,
    timesPlayed: currentOpponent.matches.length,
    lastMatch: currentOpponent.matches.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  };

  const winRate = stats.timesPlayed > 0 ? Math.round((stats.wins / stats.timesPlayed) * 100) : 0;

  const handleUpdate = (updatedOpponent: typeof opponent) => {
    setCurrentOpponent(updatedOpponent);
  };

  return (
    <>
      <Card 
        className="w-full cursor-pointer group transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 border-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl bg-white"
        onClick={() => setShowDetails(true)}
      >
        {/* Win rate accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />

        <CardContent className="p-4 sm:p-5">
          {/* Header: Avatar + Name + Delete */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0">
              {currentOpponent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                {currentOpponent.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-500">{winRate}% win rate</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(currentOpponent.id);
              }}
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Stats row */}
          <div className="flex items-stretch gap-2 sm:gap-3 mb-3">
            <div className="flex-1 bg-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">{stats.wins}</span>
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-500 uppercase tracking-wide mt-0.5">Wins</p>
            </div>
            <div className="flex-1 bg-rose-50 rounded-xl p-2.5 sm:p-3 text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-rose-500">{stats.losses}</span>
              <p className="text-[10px] sm:text-xs font-semibold text-rose-400 uppercase tracking-wide mt-0.5">Losses</p>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-2.5 sm:p-3 text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-600">{stats.timesPlayed}</span>
              <p className="text-[10px] sm:text-xs font-semibold text-blue-400 uppercase tracking-wide mt-0.5">Played</p>
            </div>
          </div>

          {/* Last match info */}
          {stats.lastMatch && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {new Date(stats.lastMatch.date).toLocaleDateString()}
                </span>
                <span className="text-xs text-gray-400 font-mono flex-shrink-0">{stats.lastMatch.score}</span>
              </div>
              <Badge 
                variant={stats.lastMatch.is_win ? "default" : "destructive"}
                className={`text-[10px] sm:text-xs px-2 py-0.5 flex-shrink-0 ${stats.lastMatch.is_win ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
              >
                {stats.lastMatch.is_win ? "Won" : "Lost"}
              </Badge>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-3 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 text-purple-500 text-[10px] sm:text-xs font-medium">
              <Target className="w-3 h-3" />
              <span>Tap for notes</span>
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/opponent/${currentOpponent.id}`);
              }}
              className="flex items-center gap-1.5 text-indigo-500 text-[10px] sm:text-xs font-medium hover:text-indigo-600"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Full Stats</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <OpponentDetailsDialog
        opponent={currentOpponent}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdate={() => {
          // Fetch the updated opponent data
          const fetchUpdatedOpponent = async () => {
            const { data, error } = await supabase
              .from('opponents')
              .select(`
                *,
                matches (
                  is_win,
                  date,
                  score
                )
              `)
              .eq('id', currentOpponent.id)
              .single();

            if (!error && data) {
              handleUpdate(data);
            }
          };
          fetchUpdatedOpponent();
        }}
      />
    </>
  );
};
