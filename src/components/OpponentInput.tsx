import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface OpponentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const OpponentInput = ({ value, onChange }: OpponentInputProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <Label>Opponent Name</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter opponent name"
        className="w-full"
      />
    </div>
  );
};