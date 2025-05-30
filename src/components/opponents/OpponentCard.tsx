
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
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
        className="match-card w-full cursor-pointer group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-white/90 to-gray-50/90"
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentOpponent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {currentOpponent.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">{winRate}% win rate</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(currentOpponent.id);
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-2 mx-auto shadow-lg">
                  <span className="text-white font-bold text-lg">{stats.wins}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Wins</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mb-2 mx-auto shadow-lg">
                  <span className="text-white font-bold text-lg">{stats.losses}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Losses</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {stats.timesPlayed} matches played
                </span>
              </div>
              
              {stats.lastMatch && (
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Last Match</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">
                      {new Date(stats.lastMatch.date).toLocaleDateString()}
                    </span>
                    <Badge 
                      variant={stats.lastMatch.is_win ? "default" : "destructive"}
                      className={`text-xs ${stats.lastMatch.is_win ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                      {stats.lastMatch.is_win ? "Won" : "Lost"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">{stats.lastMatch.score}</p>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-1 text-blue-600 text-xs font-medium mt-2">
                <Target className="w-3 h-3" />
                <span>Tap for strategy notes</span>
              </div>
            </div>
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
