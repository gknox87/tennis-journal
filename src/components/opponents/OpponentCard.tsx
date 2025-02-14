
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
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

  const handleUpdate = (updatedOpponent: typeof opponent) => {
    setCurrentOpponent(updatedOpponent);
  };

  return (
    <>
      <Card 
        className="w-full hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">{currentOpponent.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(currentOpponent.id);
              }}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <Badge variant="default" className="bg-green-500 mb-1">
                  {stats.wins}
                </Badge>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <Badge variant="destructive" className="mb-1">
                  {stats.losses}
                </Badge>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Times Played: {stats.timesPlayed}</p>
              {stats.lastMatch && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Last Match:</p>
                  <p>
                    {new Date(stats.lastMatch.date).toLocaleDateString()} -{" "}
                    {stats.lastMatch.is_win ? (
                      <span className="text-green-600">Won</span>
                    ) : (
                      <span className="text-red-600">Lost</span>
                    )}{" "}
                    {stats.lastMatch.score}
                  </p>
                </div>
              )}
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
