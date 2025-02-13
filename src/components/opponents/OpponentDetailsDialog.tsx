
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OpponentDetailsDialogProps {
  opponent: {
    id: string;
    name: string;
    strengths?: string;
    weaknesses?: string;
    tendencies?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const OpponentDetailsDialog = ({ 
  opponent, 
  isOpen, 
  onClose,
  onUpdate 
}: OpponentDetailsDialogProps) => {
  const [strengths, setStrengths] = useState(opponent.strengths || '');
  const [weaknesses, setWeaknesses] = useState(opponent.weaknesses || '');
  const [tendencies, setTendencies] = useState(opponent.tendencies || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('opponents')
        .update({
          strengths,
          weaknesses,
          tendencies
        })
        .eq('id', opponent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Opponent details updated successfully.",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating opponent:', error);
      toast({
        title: "Error",
        description: "Failed to update opponent details.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{opponent.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="strengths">What was my opponent's biggest strength?</Label>
            <Textarea
              id="strengths"
              placeholder="Forehand, net game, movement?"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weaknesses">What is my opponent's weakness, and do I exploit it?</Label>
            <Textarea
              id="weaknesses"
              placeholder="Struggles with high balls, weak second serve"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tendencies">Include opponent tendencies?</Label>
            <Textarea
              id="tendencies"
              placeholder="Tends to serve wide on big points"
              value={tendencies}
              onChange={(e) => setTendencies(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
