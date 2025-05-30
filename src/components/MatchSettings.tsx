
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Zap, Sparkles } from "lucide-react";

interface MatchSettingsProps {
  notes: string;
  onNotesChange: (value: string) => void;
  finalSetTiebreak: boolean;
  onFinalSetTiebreakChange: (value: boolean) => void;
}

export const MatchSettings = ({
  notes,
  onNotesChange,
  finalSetTiebreak,
  onFinalSetTiebreakChange,
}: MatchSettingsProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold gradient-text">Match Details</h3>
      </div>

      {/* Final Set Tiebreak Toggle */}
      <div className="grid gap-6">
        <div className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
          finalSetTiebreak 
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-lg' 
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full transition-all duration-300 ${
              finalSetTiebreak 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg' 
                : 'bg-gray-300'
            }`}>
              <Zap className={`w-6 h-6 ${finalSetTiebreak ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div>
              <Label htmlFor="finalSetTiebreak" className="text-lg font-bold text-gray-800 cursor-pointer">
                {finalSetTiebreak ? '⚡ Final Set Tiebreak!' : 'Final Set Format'}
              </Label>
              <p className="text-sm text-gray-600">
                {finalSetTiebreak ? 'Decided by tiebreak!' : 'Was the final set a tiebreak?'}
              </p>
            </div>
          </div>
          <Switch
            id="finalSetTiebreak"
            checked={finalSetTiebreak}
            onCheckedChange={onFinalSetTiebreakChange}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <Label htmlFor="notes" className="text-lg font-bold text-gray-800">
            📝 Match Journal
          </Label>
        </div>
        
        <div className="relative">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="✨ How did you play today? What went well? What could be improved? Share your thoughts..."
            className="w-full min-h-[140px] rounded-2xl border-2 border-blue-200/50 bg-gradient-to-br from-white/90 to-blue-50/30 backdrop-blur-sm px-6 py-4 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:shadow-lg focus:shadow-xl resize-none"
            style={{
              fontFamily: 'inherit',
              lineHeight: '1.6'
            }}
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
            {notes.length} characters
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200/30">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Tip:</strong> Recording your thoughts helps you improve faster! Note what worked, what didn't, and your strategy.
          </p>
        </div>
      </div>
    </div>
  );
};
