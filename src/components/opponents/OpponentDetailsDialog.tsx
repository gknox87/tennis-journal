
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target, Zap, TrendingDown, Save } from "lucide-react";

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
        title: "🎯 Strategy Updated!",
        description: "Your opponent analysis has been saved successfully.",
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
      <DialogContent className="max-w-2xl modal-content border-0">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Strategy Notes: {opponent.name}
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Analyze your opponent to gain the competitive edge
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <Label htmlFor="strengths" className="text-base font-semibold text-gray-700">
                What's their biggest strength?
              </Label>
            </div>
            <Textarea
              id="strengths"
              placeholder="e.g., Powerful forehand, excellent net game, great court coverage..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="min-h-[100px] rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <Label htmlFor="weaknesses" className="text-base font-semibold text-gray-700">
                What weaknesses can you exploit?
              </Label>
            </div>
            <Textarea
              id="weaknesses"
              placeholder="e.g., Struggles with high balls, weak second serve, poor movement on clay..."
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              className="min-h-[100px] rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <Label htmlFor="tendencies" className="text-base font-semibold text-gray-700">
                Key patterns & tendencies
              </Label>
            </div>
            <Textarea
              id="tendencies"
              placeholder="e.g., Serves wide on big points, gets impatient in long rallies, double faults under pressure..."
              value={tendencies}
              onChange={(e) => setTendencies(e.target.value)}
              className="min-h-[100px] rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-2xl px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="btn-primary px-6 rounded-2xl font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Strategy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
