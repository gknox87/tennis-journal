import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Sparkles, Save, X, Zap, Users, Brain } from "lucide-react";
import { ScoreInput } from "@/components/ScoreInput";
import { UniversalScoreInput } from "@/components/scoring/UniversalScoreInput";
import { MatchSettings } from "@/components/MatchSettings";
import { PreMatchStateForm, hasPreMatchData } from "@/components/mental/PreMatchStateForm";
import { findMatchingScheduledEvent } from "@/utils/preMatchState";
import type { PreMatchState } from "@/types/mental";
import { Card } from "@/components/ui/card";
import { OpponentInput } from "@/components/OpponentInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SetScore } from "@/types/match";
import { useSport } from "@/context/SportContext";
import type { ScoreFormat } from "@/types/sport";
import { supabase } from "@/integrations/supabase/client";
import {
  validateMatchForm,
  hasMatchFormErrors,
  type MatchFormErrors,
} from "@/utils/matchFormValidation";
import { getVenueLabel } from "@/utils/sportLabels";

export interface MatchFormData {
  date: Date;
  opponent: string;
  partner?: string;
  courtType: string;
  sets: SetScore[];
  isWin: boolean;
  notes: string;
  finalSetTiebreak: boolean;
  isBestOfFive?: boolean;
  reflectionPromptUsed?: string | null;
  reflectionPromptLevel?: string | null;
  matchType?: 'singles' | 'doubles';
  sportId?: string;
  preNerves?: number | null;
  preConfidence?: number | null;
  preArousal?: number | null;
  processGoal?: string | null;
  preEmotionTags?: string[];
  postEmotionTags?: string[];
  scheduledEventId?: string | null;
}

interface MatchFormProps {
  onSubmit: (formData: MatchFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: MatchFormData;
  focusReflection?: boolean;
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

export const MatchForm = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  focusReflection = false,
}: MatchFormProps) => {
  const { sport } = useSport();
  const scoreFormat = sport.defaultScoreFormat;
  const isSetBasedSport = scoreFormat.type === "sets" || scoreFormat.type === "rally" || scoreFormat.type === "games";
  
  // Check if sport supports doubles (has partnerLabel)
  const supportsDoubles = Boolean(sport.terminology.partnerLabel);
  
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [opponent, setOpponent] = useState(initialData?.opponent || "");
  const [partner, setPartner] = useState(initialData?.partner || "");
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>(initialData?.matchType || 'singles');
  const [courtType, setCourtType] = useState<string>(initialData?.courtType || "");
  const [isBestOfFive, setIsBestOfFive] = useState(
    initialData?.isBestOfFive || (scoreFormat.type === "sets" && scoreFormat.maxSets === 5)
  );
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(initialData?.finalSetTiebreak || false);
  const [isWin, setIsWin] = useState(initialData?.isWin || false);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [reflectionPromptUsed, setReflectionPromptUsed] = useState<string | null>(initialData?.reflectionPromptUsed || null);
  const [reflectionPromptLevel, setReflectionPromptLevel] = useState<string | null>(initialData?.reflectionPromptLevel || null);
  const [preMatchState, setPreMatchState] = useState<PreMatchState>(() =>
    initialData
      ? {
          nerves: initialData.preNerves ?? null,
          confidence: initialData.preConfidence ?? null,
          arousal: initialData.preArousal ?? null,
          process_goal: initialData.processGoal ?? null,
          emotion_tags: initialData.preEmotionTags ?? [],
        }
      : {}
  );
  const [postEmotionTags, setPostEmotionTags] = useState<string[]>(initialData?.postEmotionTags ?? []);
  const [scheduledEventId, setScheduledEventId] = useState<string | null>(initialData?.scheduledEventId ?? null);
  const reflectionSectionRef = useRef<HTMLDivElement>(null);
  const hasVenueOptions = Boolean(sport.venueOptions?.length);

  useEffect(() => {
    if (focusReflection && reflectionSectionRef.current) {
      reflectionSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusReflection]);
  
  // Partner suggestions state
  const [partnerSuggestions, setPartnerSuggestions] = useState<string[]>([]);

  // Universal score state for time/distance/numeric/rounds sports
  const [universalPlayerScore, setUniversalPlayerScore] = useState(
    initialData?.sets?.[0]?.playerScore || ""
  );
  const [universalOpponentScore, setUniversalOpponentScore] = useState(
    initialData?.sets?.[0]?.opponentScore || ""
  );

  // Load partner suggestions for padel/doubles sports
  useEffect(() => {
    if (supportsDoubles) {
      loadPartnerSuggestions();
    }
  }, [supportsDoubles]);

  const loadPartnerSuggestions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: partners } = await supabase
        .from("partners")
        .select("name")
        .eq("user_id", session.user.id)
        .eq("sport_id", sport.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (partners) {
        setPartnerSuggestions(partners.map(p => p.name));
      }
    } catch (error) {
      console.error("Error loading partner suggestions:", error);
    }
  };

  const determineSeriesLength = () => {
    const fmt = sport.defaultScoreFormat;
    if (fmt.type === "sets") {
      return isBestOfFive ? 5 : 3;
    }
    if (fmt.type === "rally") {
      return fmt.bestOf ?? 3;
    }
    if (fmt.type === "games") {
      return fmt.gamesPerMatch ?? 1;
    }
    if (fmt.type === "rounds") {
      return fmt.totalRounds ?? 1;
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
  const [formErrors, setFormErrors] = useState<MatchFormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

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

  const scrollToFirstError = () => {
    requestAnimationFrame(() => {
      const firstError = formRef.current?.querySelector("[data-field-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateMatchForm({
      opponent,
      partner,
      matchType,
      sets,
      scoreFormat,
      sportId: sport.id,
      universalPlayerScore: universalPlayerScore,
      supportsDoubles,
    });

    if (hasMatchFormErrors(errors)) {
      setFormErrors(errors);
      scrollToFirstError();
      return;
    }

    setFormErrors({});

    await onSubmit({
      date,
      opponent,
      partner: matchType === 'doubles' ? partner : undefined,
      courtType,
      sets,
      isWin,
      notes,
      finalSetTiebreak,
      isBestOfFive,
      sportId: sport.id,
      reflectionPromptUsed,
      reflectionPromptLevel,
      matchType,
      preNerves: preMatchState.nerves ?? null,
      preConfidence: preMatchState.confidence ?? null,
      preArousal: preMatchState.arousal ?? null,
      processGoal: preMatchState.process_goal ?? null,
      preEmotionTags: preMatchState.emotion_tags ?? [],
      postEmotionTags,
      scheduledEventId,
    });
  };

  const opponentLabel = `${sport.terminology.opponentLabel}`;
  const opponentPlaceholder = `${sport.icon} Enter ${sport.terminology.opponentLabel.toLowerCase()}`;
  const matchLabel = sport.terminology.matchLabel;
  const locationLabel = getVenueLabel(sport);

  useEffect(() => {
    if (hasVenueOptions) {
      const options = sport.venueOptions ?? [];
      setCourtType((current) => {
        if (current && options.includes(current)) {
          return current;
        }
        return options[0] ?? "";
      });
    } else {
      setCourtType("");
    }
  }, [hasVenueOptions, sport]);

  // Pre-fill pre-match state from calendar event when date/opponent changes
  useEffect(() => {
    if (initialData?.preNerves != null || initialData?.scheduledEventId) return;

    const loadScheduledPreMatch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !date) return;

      const matchDate = date.toISOString().split('T')[0];
      const matched = await findMatchingScheduledEvent(
        session.user.id,
        matchDate,
        opponent || undefined
      );

      if (matched?.pre_match_state && hasPreMatchData(matched.pre_match_state)) {
        setPreMatchState(matched.pre_match_state);
        setScheduledEventId(matched.id);
      } else if (matched) {
        setScheduledEventId(matched.id);
      }
    };

    void loadScheduledPreMatch();
  }, [date, opponent, initialData?.preNerves, initialData?.scheduledEventId]);

  const handleOpponentChange = (value: string) => {
    setOpponent(value);
    if (formErrors.opponent) {
      setFormErrors((prev) => ({ ...prev, opponent: undefined }));
    }
  };

  const handlePartnerChange = (value: string) => {
    setPartner(value);
    if (formErrors.partner) {
      setFormErrors((prev) => ({ ...prev, partner: undefined }));
    }
  };

  const handleSetsChange = (newSets: SetScore[]) => {
    setSets(newSets);
    if (formErrors.score || formErrors.sets) {
      setFormErrors((prev) => ({ ...prev, score: undefined, sets: undefined }));
    }
  };

  const handleUniversalPlayerScoreChange = (val: string) => {
    setUniversalPlayerScore(val);
    setSets([{ playerScore: val, opponentScore: universalOpponentScore, playerTiebreak: "", opponentTiebreak: "" }]);
    if (formErrors.score) {
      setFormErrors((prev) => ({ ...prev, score: undefined }));
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
              onChange={handleOpponentChange}
              label={opponentLabel}
              placeholder={opponentPlaceholder}
              validationError={formErrors.opponent}
            />
          </div>
        </div>

        {/* Doubles Toggle for sports that support it */}
        {supportsDoubles && (
          <div className="mt-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200/50">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full transition-colors duration-300 ${matchType === 'doubles' ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md" : "bg-white text-amber-600 border border-amber-200"}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Doubles Match</p>
                  <p className="text-sm text-gray-600">
                    Toggle on to log with a partner
                  </p>
                </div>
              </div>
              <Switch
                id="match-type"
                checked={matchType === 'doubles'}
                onCheckedChange={(checked) => setMatchType(checked ? 'doubles' : 'singles')}
                className="data-[state=checked]:bg-amber-500 ml-auto"
              />
            </div>
          </div>
        )}

        {/* Partner Input - shown when doubles is selected */}
        {supportsDoubles && matchType === 'doubles' && (
          <div className="mt-4 space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              {sport.terminology.partnerLabel || "Partner"}
            </Label>
            <Input
              value={partner}
              onChange={(e) => handlePartnerChange(e.target.value)}
              placeholder={`Enter ${sport.terminology.partnerLabel?.toLowerCase() || "partner"} name`}
              list="partner-suggestions"
              aria-invalid={!!formErrors.partner}
              className={`w-full rounded-2xl bg-white/80 backdrop-blur-sm border-2 transition-all duration-300 ${
                formErrors.partner
                  ? "border-red-400 bg-red-50/50"
                  : "border-amber-200/50 hover:border-amber-400"
              }`}
            />
            {formErrors.partner && (
              <p className="text-sm text-red-500" data-field-error="partner">
                {formErrors.partner}
              </p>
            )}
            {partnerSuggestions.length > 0 && (
              <datalist id="partner-suggestions">
                {partnerSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            )}
            <p className="text-xs text-gray-500">
              Start typing to see suggestions from your previous partners
            </p>
          </div>
        )}

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
        
        {isSetBasedSport ? (
          <ScoreInput
            sets={sets}
            onSetsChange={handleSetsChange}
            isBestOfFive={isBestOfFive}
            onBestOfFiveChange={setIsBestOfFive}
            onIsWinChange={setIsWin}
            onFinalSetTiebreakChange={setFinalSetTiebreak}
            sport={sport}
            setErrors={formErrors.sets}
            scoreError={formErrors.score}
          />
        ) : (
          <div className="space-y-6">
            {formErrors.score && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-200" data-field-error="score">
                {formErrors.score}
              </p>
            )}
            <UniversalScoreInput
              format={scoreFormat}
              value={universalPlayerScore}
              onChange={handleUniversalPlayerScoreChange}
              label={`Your ${scoreFormat.type === "time" ? "Time" : scoreFormat.type === "distance" ? "Distance" : scoreFormat.type === "rounds" ? "Result" : "Score"}`}
            />
            {scoreFormat.type !== "time" && scoreFormat.type !== "distance" && scoreFormat.type !== "numeric" && (
              <UniversalScoreInput
                format={scoreFormat}
                value={universalOpponentScore}
                onChange={(val) => {
                  setUniversalOpponentScore(val);
                  handleSetsChange([{ playerScore: universalPlayerScore, opponentScore: val, playerTiebreak: "", opponentTiebreak: "" }]);
                }}
                label={`Opponent ${(scoreFormat.type as string) === "time" ? "Time" : (scoreFormat.type as string) === "distance" ? "Distance" : scoreFormat.type === "rounds" ? "Result" : "Score"}`}
              />
            )}
            {scoreFormat.type === "time" || scoreFormat.type === "distance" || scoreFormat.type === "numeric" ? (
              <div className="flex items-center gap-3">
                <Switch
                  id="is-win"
                  checked={isWin}
                  onCheckedChange={setIsWin}
                  className="data-[state=checked]:bg-purple-500"
                />
                <Label htmlFor="is-win" className="font-semibold text-gray-700">
                  {isWin ? "Won / Personal Best" : "Did you win or achieve a PB?"}
                </Label>
              </div>
            ) : null}
          </div>
        )}

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

      {/* Pre-match State */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold gradient-text">Pre-match State</h3>
            <p className="text-sm text-gray-600">How did you feel before you stepped on court?</p>
          </div>
        </div>
        <PreMatchStateForm value={preMatchState} onChange={setPreMatchState} />
      </Card>

      {/* Match Settings & Notes */}
      <Card
        ref={reflectionSectionRef}
        id="match-reflection-section"
        className={cn(
          "p-6 rounded-3xl bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-sm border-2 shadow-xl",
          focusReflection ? "border-teal-300 ring-2 ring-teal-200" : "border-white/30"
        )}
      >
        <MatchSettings
          notes={notes}
          onNotesChange={(newNotes, answers, promptUsed) => {
            setNotes(newNotes);
            if (promptUsed) {
              setReflectionPromptUsed(promptUsed);
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
          postEmotionTags={postEmotionTags}
          onPostEmotionTagsChange={setPostEmotionTags}
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save className="mr-3 h-6 w-6" />
          {isSubmitting ? "Saving..." : "Save Match"}
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