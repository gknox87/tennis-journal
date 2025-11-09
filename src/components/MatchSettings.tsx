
import { Label } from "@/components/ui/label";
import { MessageCircle, Sparkles } from "lucide-react";

interface MatchSettingsProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export const MatchSettings = ({
  notes,
  onNotesChange,
}: MatchSettingsProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold gradient-text">Match Journal</h3>
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <Label htmlFor="notes" className="text-lg font-bold text-gray-800">
            📝 Match Notes
          </Label>
        </div>
        
        <div className="relative">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="✨ How did you play today? What went well? What could be improved? Share your thoughts..."
            className="w-full min-h-[160px] rounded-2xl border-2 border-blue-300 bg-white px-6 py-4 text-base text-gray-800 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
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
