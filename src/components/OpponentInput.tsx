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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOpponents = async () => {
      const { data } = await supabase
        .from("opponents")
        .select("*")
        .order("name");
      if (data) {
        setOpponents(data);
      }
    };
    fetchOpponents();
  }, []);

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
            {value
              ? opponents.find((opponent) => opponent.name === value)?.name ?? value
              : "Select opponent..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search opponent..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>No opponent found.</CommandEmpty>
            <CommandGroup>
              {opponents
                .filter(opponent => 
                  opponent.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((opponent) => (
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
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};