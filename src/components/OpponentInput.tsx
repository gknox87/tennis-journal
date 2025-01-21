import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Opponent {
  id: string;
  name: string;
}

interface OpponentInputProps {
  value: string;
  onChange: (value: string) => void;
  isKeyOpponent?: boolean;
  onKeyOpponentChange?: (value: boolean) => void;
}

export const OpponentInput = ({ 
  value, 
  onChange,
  isKeyOpponent = false,
  onKeyOpponentChange
}: OpponentInputProps) => {
  const [keyOpponents, setKeyOpponents] = useState<Opponent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeyOpponents = async () => {
      try {
        const { data, error } = await supabase
          .from('opponents')
          .select('id, name')
          .eq('is_key_opponent', true)
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setKeyOpponents(data);
        }
      } catch (err: any) {
        console.error('Error fetching key opponents:', err);
        setError(err.message);
      }
    };

    fetchKeyOpponents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Opponent Name</Label>
        <div className="space-y-4">
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="Enter opponent name"
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="key-opponent"
              checked={isKeyOpponent}
              onCheckedChange={onKeyOpponentChange}
            />
            <Label htmlFor="key-opponent">Add as a key opponent</Label>
          </div>
          {keyOpponents.length > 0 && (
            <div className="space-y-2">
              <Label>Or select a key opponent</Label>
              <Select onValueChange={onChange} value={value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a key opponent" />
                </SelectTrigger>
                <SelectContent>
                  {keyOpponents.map((opponent) => (
                    <SelectItem key={opponent.id} value={opponent.name}>
                      {opponent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};