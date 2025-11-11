
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Sparkles, Save, X, Zap } from "lucide-react";
import { ScoreInput } from "@/components/ScoreInput";
import { MatchSettings } from "@/components/MatchSettings";
import { Card } from "@/components/ui/card";
import { OpponentInput } from "@/components/OpponentInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SetScore } from "@/types/match";
import { useSport } from "@/context/SportContext";

interface MatchFormProps {
  onSubmit: (formData: any) => Promise<void>;
  initialData?: {
    date: Date;
    opponent: string;
    courtType: string;
    sets: SetScore[];
    isWin: boolean;
    notes: string;
    finalSetTiebreak: boolean;
    isBestOfFive?: boolean;
    reflectionPromptUsed?: string | null;
    reflectionPromptLevel?: string | null;
  };
}

const venueGradientMap: Record<string, string> = {
  "Hard": "from-gray-500 to-slate-600",
  "Hard Court": "from-gray-500 to-slate-600",
  "Artificial Grass": "from-green-500 to-emerald-600",
  "Artificial Grass Court": "from-green-500 to-emerald-600",
  "Clay": "from-orange-500 to-red-600",
  "Clay Court": "from-orange-500 to-red-600",
  "Grass": "from-green-400 to-green-600",
  "Grass Court": "from-green-400 to-green-600",
  "Carpet": "from-blue-500 to-indigo-600",
  "Carpet Court": "from-blue-500 to-indigo-600",
};

export const MatchForm = ({ onSubmit, initialData }: MatchFormProps) => {
  const { sport } = useSport();
  const isSetBasedSport = sport.defaultScoreFormat.type === "sets";
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [opponent, setOpponent] = useState(initialData?.opponent || "");
  const [courtType, setCourtType] = useState<string>(initialData?.courtType || "");
  const [isBestOfFive, setIsBestOfFive] = useState(
    initialData?.isBestOfFive || (sport.defaultScoreFormat.type === "sets" && sport.defaultScoreFormat.maxSets === 5)
  );
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(initialData?.finalSetTiebreak || false);
  const [isWin, setIsWin] = useState(initialData?.isWin || false);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [reflectionPromptUsed, setReflectionPromptUsed] = useState<string | null>(initialData?.reflectionPromptUsed || null);
  const [reflectionPromptLevel, setReflectionPromptLevel] = useState<string | null>(initialData?.reflectionPromptLevel || null);
  const hasVenueOptions = Boolean(sport.venueOptions?.length);

  const determineSeriesLength = () => {
    const format = sport.defaultScoreFormat;
    if (format.type === "sets") {
      return isBestOfFive ? 5 : 3;
    }
    if (format.type === "rally") {
      return format.bestOf ?? 3;
    }
    if (format.type === "games") {
      return format.gamesPerMatch ?? 1;
    }
    if (format.type === "rounds") {
      return format.totalRounds ?? 1;
    }
    return 1;
  };

  // Initialize sets with proper logic
  const getInitialSets = (): SetScore[] => {
    if (initialData?.sets?.length) {
      return [...initialData.sets];
    }
    const seriesLength = determineSeriesLength();
    return Array(seriesLength).fill(null).map(() => ({
      playerScore: "",
      opponentScore: "",
      playerTiebreak: "",
      opponentTiebreak: ""
    }));
  };

  const [sets, setSets] = useState<SetScore[]>(getInitialSets());

  useEffect(() => {
    if (sport.defaultScoreFormat.type !== "sets" && isBestOfFive) {
      setIsBestOfFive(false);
    }
  }, [sport, isBestOfFive]);

  // Update sets when scoring preferences change (only for new matches)
  useEffect(() => {
    if (!initialData?.sets?.length) {
      const seriesLength = determineSeriesLength();
      setSets(Array(seriesLength).fill(null).map(() => ({
        playerScore: "",
        opponentScore: "",
        playerTiebreak: "",
        opponentTiebreak: ""
      })));
    }
  }, [isBestOfFive, initialData?.sets?.length, sport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one set is entered
    const validSets = sets.filter(set => 
      set.playerScore !== "" && set.opponentScore !== ""
    );
    
    if (validSets.length === 0) {
      return; // Let the backend handle the error message
    }

    await onSubmit({
      date,
      opponent,
      courtType,
      sets,
      isWin,
      notes,
      finalSetTiebreak,
      isBestOfFive,
      sportId: sport.id,
      reflectionPromptUsed,
      reflectionPromptLevel,
    });
  };

  const opponentLabel = `${sport.terminology.opponentLabel}`;
  const opponentPlaceholder = `${sport.icon} Enter ${sport.terminology.opponentLabel.toLowerCase()}`;
  const matchLabel = sport.terminology.matchLabel;
  const locationLabel = hasVenueOptions
    ? sport.category === "racket"
      ? "Court Surface"
      : "Venue"
    : "Venue Detail";

  useEffect(() => {
    if (hasVenueOptions) {
      const options = sport.venueOptions ?? [];
      setCourtType((current) => {
        if (current && options.includes(current)) {
          return current;
        }
        return options[0] ?? "";
      });
    }
  }, [hasVenueOptions, sport]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Opponent Section */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold gradient-text">{matchLabel} Details</h3>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">When did you play?</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-medium rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400 transition-all duration-300 hover:shadow-lg",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-blue-500" />
                  {date ? format(date, "EEEE, MMMM do") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-2 border-white/30 shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="rounded-2xl bg-white/95 backdrop-blur-sm"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <OpponentInput
              value={opponent}
              onChange={setOpponent}
              label={opponentLabel}
              placeholder={opponentPlaceholder}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Label className="text-base font-semibold text-gray-700">{locationLabel}</Label>
          {hasVenueOptions ? (
            <Select value={courtType} onValueChange={setCourtType}>
              <SelectTrigger className="w-full rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-green-200/50 hover:border-green-400 transition-all duration-300">
                <SelectValue placeholder={`Select ${locationLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
                {(sport.venueOptions ?? []).map((option) => (
                  <SelectItem key={option} value={option} className="rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${venueGradientMap[option] ?? "from-green-400 to-emerald-500"}`} />
                      <span className="font-medium">{option}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={courtType}
              onChange={(event) => setCourtType(event.target.value)}
              placeholder={`Enter ${locationLabel.toLowerCase()}`}
              className="w-full rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-green-200/50 hover:border-green-400 transition-all duration-300"
            />
          )}
        </div>
      </Card>

      {/* Score Section */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold gradient-text">{matchLabel} Score</h3>
        </div>
        
        <ScoreInput
          sets={sets}
          onSetsChange={setSets}
          isBestOfFive={isBestOfFive}
          onBestOfFiveChange={setIsBestOfFive}
          onIsWinChange={setIsWin}
          onFinalSetTiebreakChange={setFinalSetTiebreak}
          sport={sport}
        />

        {isSetBasedSport && (
          <div className="mt-6 rounded-2xl border-2 border-purple-200/60 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full transition-colors duration-300 ${finalSetTiebreak ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md" : "bg-white text-purple-600 border border-purple-200"}`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Final Set Format</p>
                <p className="text-sm text-gray-600">
                  Toggle if the deciding set used a tie-break to close the match.
                </p>
              </div>
            </div>
            <Switch
              id="final-set-tiebreak"
              checked={finalSetTiebreak}
              onCheckedChange={setFinalSetTiebreak}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>
        )}
      </Card>

      {/* Match Settings & Notes */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
        <MatchSettings
          notes={notes}
          onNotesChange={(newNotes, answers, promptUsed) => {
            setNotes(newNotes);
            if (promptUsed) {
              setReflectionPromptUsed(promptUsed);
              // Extract level from promptUsed (format: "post_match_win_standard")
              const parts = promptUsed.split('_');
              if (parts.length >= 3) {
                setReflectionPromptLevel(parts[parts.length - 1]);
              }
            } else {
              setReflectionPromptUsed(null);
              setReflectionPromptLevel(null);
            }
          }}
          isWin={isWin}
          matchDate={date}
          reflectionPromptUsed={reflectionPromptUsed}
          reflectionPromptLevel={reflectionPromptLevel}
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          type="submit" 
          className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <Save className="mr-3 h-6 w-6" />
          Save Match
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="sm:w-32 h-14 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-400 font-semibold transition-all duration-300 hover:shadow-lg"
        >
          <X className="mr-2 h-5 w-5" />
          Cancel
        </Button>
      </div>
    </form>
  );
};
