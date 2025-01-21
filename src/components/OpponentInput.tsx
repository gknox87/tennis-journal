import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Opponent {
  id: string;
  name: string;
}

interface OpponentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const OpponentInput = ({ value, onChange }: OpponentInputProps) => {
  const [open, setOpen] = useState(false);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpponents = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("opponents")
          .select("*")
          .order("name");
          
        if (fetchError) {
          throw fetchError;
        }
        
        setOpponents(data || []);
      } catch (err) {
        console.error("Error fetching opponents:", err);
        setError("Failed to load opponents");
      } finally {
        setLoading(false);
      }
    };

    fetchOpponents();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col space-y-2">
        <Label htmlFor="opponent">Opponent Name</Label>
        <Input disabled placeholder="Loading opponents..." />
      </div>
    );
  }

  // Show error state with fallback to input
  if (error) {
    return (
      <div className="flex flex-col space-y-2">
        <Label htmlFor="opponent">Opponent Name</Label>
        <Input
          id="opponent"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter opponent name"
        />
      </div>
    );
  }

  // If no opponents exist, show a simple input field
  if (opponents.length === 0) {
    return (
      <div className="flex flex-col space-y-2">
        <Label htmlFor="opponent">Opponent Name</Label>
        <Input
          id="opponent"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter opponent name"
        />
      </div>
    );
  }

  // Show dropdown with existing opponents
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="opponent">Opponent Name</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || "Select or enter opponent name..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search opponent..." 
              value={value}
              onValueChange={onChange}
            />
            <CommandEmpty>No opponents found</CommandEmpty>
            {opponents.length > 0 && (
              <CommandGroup>
                {opponents.map((opponent) => (
                  <CommandItem
                    key={opponent.id}
                    value={opponent.name}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
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
    </div>
  );
};