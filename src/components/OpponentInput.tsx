import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Opponent {
  id: string;
  name: string;
  is_key_opponent: boolean;
}

interface OpponentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const OpponentInput = ({ 
  value, 
  onChange,
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
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Opponent Name</Label>
        <div className="relative">
          <Input
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleInputBlur}
            placeholder="Enter opponent name"
            className="w-full"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {filteredSuggestions.map((opponent) => (
                <div
                  key={opponent.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectOpponent(opponent.name)}
                >
                  {opponent.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {isLoading && <p className="text-sm text-muted-foreground">Loading opponents...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};