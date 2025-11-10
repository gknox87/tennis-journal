import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { User2, Clock } from "lucide-react";
import { useSport } from "@/context/SportContext";

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Please log in to access coaches");
          setSuggestions([]);
          return;
        }

        // Fetch coaches for the current user, optionally filtered by sport
        let query = supabase
          .from('coaches')
          .select('id, name, sport_id')
          .eq('user_id', session.user.id)
          .order('name');

        // Optionally filter by current sport if available
        if (sport?.id) {
          query = query.or(`sport_id.eq.${sport.id},sport_id.is.null`);
        }

        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          console.error('Error fetching coaches:', fetchError);
          // If table doesn't exist yet (migration not applied), don't show error
          // Just allow users to type coach names without autocomplete
          if (fetchError.message.includes('relation') && fetchError.message.includes('does not exist')) {
            console.warn('Coaches table does not exist yet. Migration may need to be applied.');
            setSuggestions([]);
            setError(null); // Don't show error to user
            return;
          }
          // For other errors, log but don't block the input
          setError(null);
          setSuggestions([]);
          return;
        }
        
        if (data) {
          const validCoaches = data.filter(coach => 
            coach && coach.name && coach.name.trim() !== ''
          );
          setSuggestions(validCoaches);
        } else {
          setSuggestions([]);
        }
      } catch (err: any) {
        console.error('Error in fetchCoaches:', err);
        setError(err.message || 'An error occurred while fetching coaches');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, [sport?.id]);

  const filteredSuggestions = value && showSuggestions
    ? suggestions.filter(coach =>
        coach.name.toLowerCase().includes(value.toLowerCase())
      )
    : showSuggestions && value.length === 0
    ? suggestions.slice(0, 5) // Show up to 5 recent coaches when input is empty
    : [];

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelectCoach = async (coachName: string) => {
    onChange(coachName);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputBlur = () => {
    // Small delay to allow click events on suggestions to fire
    setTimeout(() => {
      if (!suggestionsRef.current?.matches(':hover')) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Refresh suggestions when value changes (in case a new coach was added)
  useEffect(() => {
    if (onCoachSave && value && value.trim() !== '') {
      // Parent will save the coach when form is submitted
      // We can refresh suggestions after a delay to pick up new coaches
      const timer = setTimeout(() => {
        const refreshSuggestions = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            let query = supabase
              .from('coaches')
              .select('id, name, sport_id')
              .eq('user_id', session.user.id)
              .order('name');

            if (sport?.id) {
              query = query.or(`sport_id.eq.${sport.id},sport_id.is.null`);
            }

            const { data: updatedCoaches } = await query;
            if (updatedCoaches) {
              setSuggestions(updatedCoaches.filter(c => c && c.name && c.name.trim() !== ''));
            }
          } catch (err) {
            console.error('Error refreshing coaches:', err);
          }
        };

        refreshSuggestions();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, onCoachSave, sport?.id]);

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
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="bg-white/90 border-2 border-blue-200/50 focus:border-blue-400 h-11 sm:h-12 rounded-xl transition-all duration-200 touch-manipulation"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-blue-200/50 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking suggestions
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
      
      {error && (
        <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
      
      {!error && suggestions.length === 0 && !isLoading && (
        <p className="text-xs text-gray-500">
          💡 Start typing to save coach names for quick selection later
        </p>
      )}
    </div>
  );
};

// Export function to save coach (can be called from parent component)
export const saveCoachToDatabase = async (
  coachName: string,
  userId: string,
  sportId: string | null
): Promise<void> => {
  if (!coachName || coachName.trim() === '') return;

  try {
    const { error } = await supabase.rpc('get_or_create_coach', {
      p_name: coachName.trim(),
      p_user_id: userId,
      p_sport_id: sportId,
    });

    if (error) {
      console.error('Error saving coach:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error in saveCoachToDatabase:', err);
    throw err;
  }
};

