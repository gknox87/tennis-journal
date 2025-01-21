import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
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
  const [open, setOpen] = useState(false);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOpponents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Please log in to access opponents");
          setOpponents([]);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('opponents')
          .select('id, name, is_key_opponent')
          .eq('user_id', session.user.id)
          .order('name');
        
        if (fetchError) {
          console.error('Error fetching opponents:', fetchError);
          setError(fetchError.message);
          setOpponents([]);
          return;
        }
        
        if (data) {
          const validOpponents = data.filter(opponent => 
            opponent && opponent.name && opponent.name.trim() !== ''
          );
          setOpponents(validOpponents);
        } else {
          setOpponents([]);
        }
      } catch (err: any) {
        console.error('Error in fetchOpponents:', err);
        setError(err.message || 'An error occurred while fetching opponents');
        setOpponents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpponents();
  }, []);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
  };

  // Ensure we always have a valid array to work with
  const filteredOpponents = opponents.filter(opponent =>
    opponent.name.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Opponent Name</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex w-full items-center">
              <Input
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  setOpen(true);
                }}
                placeholder="Enter opponent name"
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="ml-2 p-2 hover:bg-accent rounded-md"
              >
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search opponents..." 
                value={value || ''}
                onValueChange={onChange}
              />
              {isLoading ? (
                <CommandEmpty>Loading opponents...</CommandEmpty>
              ) : error ? (
                <CommandEmpty>{error}</CommandEmpty>
              ) : filteredOpponents.length === 0 ? (
                <CommandEmpty>No opponent found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOpponents.map((opponent) => (
                    <CommandItem
                      key={opponent.id}
                      value={opponent.name}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === opponent.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opponent.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};