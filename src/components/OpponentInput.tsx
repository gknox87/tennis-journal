
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Users, Star } from "lucide-react";

interface Opponent {
  id: string;
  name: string;
  is_key_opponent: boolean;
}

interface OpponentInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const OpponentInput = ({
  value,
  onChange,
  label = "Who did you play against?",
  placeholder = "Enter opponent name",
}: OpponentInputProps) => {
  const [suggestions, setSuggestions] = useState<Opponent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchOpponents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Please log in to access opponents");
          setSuggestions([]);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('opponents')
          .select('id, name, is_key_opponent')
          .eq('user_id', session.user.id)
          .eq('is_key_opponent', true) // Only fetch key opponents
          .order('name');
        
        if (fetchError) {
          console.error('Error fetching opponents:', fetchError);
          setError(fetchError.message);
          setSuggestions([]);
          return;
        }
        
        if (data) {
          const validOpponents = data.filter(opponent => 
            opponent && opponent.name && opponent.name.trim() !== ''
          );
          setSuggestions(validOpponents);
        } else {
          setSuggestions([]);
        }
      } catch (err: any) {
        console.error('Error in fetchOpponents:', err);
        setError(err.message || 'An error occurred while fetching opponents');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpponents();
  }, []);

  const filteredSuggestions = value && showSuggestions
    ? suggestions.filter(opponent =>
        opponent.name.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelectOpponent = (opponentName: string) => {
    onChange(opponentName);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    // Small delay to allow click events on suggestions to fire
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-500" />
        {label}
      </Label>
      <div className="relative">
        <Input
          value={value || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full h-12 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-purple-200/50 hover:border-purple-400 focus:border-purple-500 transition-all duration-300 text-base font-medium pl-4"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-purple-200/50 rounded-2xl shadow-2xl overflow-hidden">
            {filteredSuggestions.map((opponent) => (
              <div
                key={opponent.id}
                className="px-4 py-3 cursor-pointer hover:bg-purple-50 transition-colors duration-200 flex items-center gap-3 border-b border-purple-100/50 last:border-b-0"
                onClick={() => handleSelectOpponent(opponent.name)}
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-800">{opponent.name}</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                  Key Opponent
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isLoading && (
        <p className="text-sm text-purple-600 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          Loading opponents...
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
          {error}
        </p>
      )}
      
      {suggestions.length > 0 && !showSuggestions && (
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-200">
          💡 <strong>Tip:</strong> Start typing to see your key opponents or enter a new name!
        </div>
      )}
    </div>
  );
};
