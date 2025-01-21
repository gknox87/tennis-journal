import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  return (
    <div className="flex flex-col space-y-4">
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
      <div className="flex items-center space-x-2">
        <Switch
          id="key-opponent"
          checked={isKeyOpponent}
          onCheckedChange={onKeyOpponentChange}
        />
        <Label htmlFor="key-opponent">Key Opponent</Label>
      </div>
    </div>
  );
};