import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { User2 } from "lucide-react";
import { useSport } from "@/context/SportContext";
import { normalizeCoachName } from "@/utils/coachName";

interface Coach {
  id: string;
  name: string;
  sport_id: string | null;
}

interface CoachInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  onCoachSave?: () => void;
}

export const CoachInput = ({
  value,
  onChange,
  label,
  placeholder = "e.g., John Smith",
  onCoachSave,
}: CoachInputProps) => {
  const { sport } = useSport();
  const [suggestions, setSuggestions] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch unique coach names from training_notes for autocomplete
  const fetchCoachNames = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from('training_notes')
        .select('coach_name')
        .eq('user_id', session.user.id)
        .not('coach_name', 'is', null)
        .neq('coach_name', '');

      if (error) {
        console.error('Error fetching coach names:', error);
        setSuggestions([]);
        return;
      }

      // Deduplicate coach names
      const uniqueNames = new Map<string, Coach>();
      data?.forEach((row, idx) => {
        const name = normalizeCoachName(row.coach_name);
        if (name && !uniqueNames.has(name.toLowerCase())) {
          uniqueNames.set(name.toLowerCase(), {
            id: `coach-${idx}`,
            name,
            sport_id: null,
          });
        }
      });

      setSuggestions(Array.from(uniqueNames.values()));
    } catch (err) {
      console.error('Error in fetchCoachNames:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachNames();
  }, [sport?.id]);

  const filteredSuggestions = value && showSuggestions
    ? suggestions.filter(coach =>
        coach.name.toLowerCase().includes(value.toLowerCase())
      )
    : showSuggestions && value.length === 0
    ? suggestions.slice(0, 5)
    : [];

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelectCoach = (coachName: string) => {
    onChange(normalizeCoachName(coachName) || coachName);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!suggestionsRef.current?.matches(':hover')) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="coach_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User2 className="h-4 w-4" />
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id="coach_name"
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="bg-white/90 border-2 border-blue-200/50 focus:border-blue-400 h-11 sm:h-12 rounded-xl transition-all duration-200 touch-manipulation"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-blue-200/50 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredSuggestions.map((coach) => (
              <button
                key={coach.id}
                type="button"
                className="w-full px-4 py-3 cursor-pointer hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 flex items-center gap-3 border-b border-blue-100/50 last:border-b-0 text-left touch-manipulation min-h-[44px]"
                onClick={() => handleSelectCoach(coach.name)}
              >
                <User2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-gray-800 flex-1">{coach.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!isLoading && suggestions.length === 0 && (
        <p className="text-xs text-gray-500">
          💡 Start typing to save coach names for quick selection later
        </p>
      )}
    </div>
  );
};
