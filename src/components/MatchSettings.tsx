
import { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { MessageCircle, Sparkles, PenTool, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ReflectionPrompts } from "@/components/notes/ReflectionPrompts";
import { useJournalingExperience } from "@/hooks/useJournalingExperience";
import { usePromptPreferences } from "@/hooks/usePromptPreferences";
import type { PromptType, PromptLevel, PromptAnswers } from "@/types/reflection";
import { getPromptIdentifier } from "@/constants/reflectionPrompts";
import { differenceInDays } from "date-fns";

interface MatchSettingsProps {
  notes: string;
  onNotesChange: (value: string, answers?: PromptAnswers, promptUsed?: string) => void;
  isWin?: boolean;
  matchDate?: Date;
  reflectionPromptUsed?: string | null;
  reflectionPromptLevel?: string | null;
}

export const MatchSettings = ({
  notes,
  onNotesChange,
  isWin,
  matchDate,
  reflectionPromptUsed,
  reflectionPromptLevel,
}: MatchSettingsProps) => {
  const [useGuidedPrompts, setUseGuidedPrompts] = useState(true);
  const [promptAnswers, setPromptAnswers] = useState<PromptAnswers>({});
  const { experienceLevel, totalEntries } = useJournalingExperience();
  const { promptLevel, setPromptLevel, isLoading: preferencesLoading } = usePromptPreferences();

  // Determine if this is a new entry or editing existing one
  const isExistingEntry = Boolean(reflectionPromptUsed);
  
  // Determine prompt type based on match outcome
  const promptType: PromptType = useMemo(() => {
    if (isWin === undefined) {
      // Default to win if not specified (for new matches)
      return 'post_match_win';
    }
    return isWin ? 'post_match_win' : 'post_match_loss';
  }, [isWin]);

  // Determine if match is being logged immediately (same day) or later
  const isImmediateReflection = useMemo(() => {
    if (!matchDate) return true;
    const daysSince = differenceInDays(new Date(), matchDate);
    return daysSince <= 1;
  }, [matchDate]);

  // Initialize guided prompts preference
  useEffect(() => {
    // For new users (beginner), default to guided prompts
    // For existing entries with prompts, use guided mode
    if (isExistingEntry && reflectionPromptUsed) {
      setUseGuidedPrompts(true);
    } else if (totalEntries === 0) {
      setUseGuidedPrompts(true);
    } else {
      // For existing users, check if they have existing notes
      // If notes exist and don't look like prompt format, default to free-form
      const hasPromptFormat = notes.includes('\n\n') && notes.split('\n\n').length > 1;
      setUseGuidedPrompts(hasPromptFormat || totalEntries < 5);
    }
  }, [isExistingEntry, reflectionPromptUsed, totalEntries, notes]);

  // Initialize prompt level from existing entry or preferences
  const currentPromptLevel: PromptLevel = useMemo(() => {
    if (reflectionPromptLevel && ['quick', 'standard', 'deep'].includes(reflectionPromptLevel)) {
      return reflectionPromptLevel as PromptLevel;
    }
    return promptLevel;
  }, [reflectionPromptLevel, promptLevel]);

  // Parse existing notes if they were created with prompts
  useEffect(() => {
    if (isExistingEntry && reflectionPromptUsed && notes) {
      // Try to parse existing prompt-based notes
      // Format: "Question\nAnswer\n\nQuestion\nAnswer"
      const sections = notes.split('\n\n').filter(s => s.trim());
      const parsedAnswers: PromptAnswers = {};
      
      sections.forEach(section => {
        const lines = section.split('\n');
        if (lines.length >= 2) {
          const question = lines[0].trim();
          const answer = lines.slice(1).join('\n').trim();
          // Try to match question to prompt ID (simplified - in production might need better matching)
          // For now, we'll just store by question text
          parsedAnswers[question] = answer;
        }
      });
      
      if (Object.keys(parsedAnswers).length > 0) {
        setPromptAnswers(parsedAnswers);
      }
    }
  }, [isExistingEntry, reflectionPromptUsed, notes]);

  const handlePromptAnswersChange = (
    formattedNotes: string,
    answers: PromptAnswers,
    promptUsed: string
  ) => {
    setPromptAnswers(answers);
    onNotesChange(formattedNotes, answers, promptUsed);
  };

  const handlePromptLevelChange = async (level: PromptLevel) => {
    await setPromptLevel(level);
    // Clear answers when changing level
    setPromptAnswers({});
    onNotesChange('', {}, '');
  };

  const handleModeToggle = (enabled: boolean) => {
    setUseGuidedPrompts(enabled);
    if (!enabled) {
      // Switching to free-form: clear prompt answers
      setPromptAnswers({});
      onNotesChange(notes, {}, '');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold gradient-text">Match Journal</h3>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <Label htmlFor="guided-mode" className="text-base font-semibold text-gray-800 cursor-pointer">
              Guided Reflection Prompts
            </Label>
            <p className="text-xs text-gray-600 mt-0.5">
              {useGuidedPrompts
                ? 'Answer structured questions to guide your reflection'
                : 'Write freely about your match experience'}
            </p>
          </div>
        </div>
        <Switch
          id="guided-mode"
          checked={useGuidedPrompts}
          onCheckedChange={handleModeToggle}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        {useGuidedPrompts ? (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <Label className="text-lg font-bold text-gray-800">
                📝 Reflection Prompts
              </Label>
            </div>
            <ReflectionPrompts
              promptType={promptType}
              promptLevel={currentPromptLevel}
              onAnswersChange={handlePromptAnswersChange}
              initialAnswers={promptAnswers}
              onPromptLevelChange={handlePromptLevelChange}
            />
            {!preferencesLoading && experienceLevel === 'beginner' && totalEntries < 5 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200/30">
                <p className="text-sm text-gray-700 text-center">
                  💡 <strong>Tip:</strong> Guided prompts help you reflect more effectively. You can switch to free-form mode anytime!
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <Label htmlFor="notes" className="text-lg font-bold text-gray-800">
                📝 Match Notes
              </Label>
            </div>
            <div className="relative">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value, {}, '')}
                placeholder="✨ How did you play today? What went well? What could be improved? Share your thoughts..."
                className="w-full min-h-[160px] rounded-2xl border-2 border-blue-300 bg-white px-6 py-4 text-base text-gray-800 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                style={{
                  fontFamily: 'inherit',
                  lineHeight: '1.6'
                }}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                {notes.length} characters
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200/30">
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>Tip:</strong> Recording your thoughts helps you improve faster! Note what worked, what didn't, and your strategy.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
