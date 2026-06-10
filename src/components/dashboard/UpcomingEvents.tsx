
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScheduledEvent, getSessionTypeDashboardColors, getSessionTypeLabel } from "@/types/calendar";
import { format, differenceInHours, isFuture } from "date-fns";
import { Calendar, Clock, Sparkles, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PreMatchStateDialog } from "@/components/mental/PreMatchStateDialog";
import { saveScheduledPreMatchState } from "@/utils/preMatchState";
import { hasPreMatchData, scheduledStateToPreMatchState } from "@/components/mental/PreMatchStateForm";
import type { PreMatchState } from "@/types/mental";

interface UpcomingEventsProps {
  events: ScheduledEvent[];
  onPreMatchSaved?: () => void;
}

export const UpcomingEvents = ({ events, onPreMatchSaved }: UpcomingEventsProps) => {
  const navigate = useNavigate();
  const [dialogEvent, setDialogEvent] = useState<ScheduledEvent | null>(null);

  if (!events.length) {
    return null;
  }

  const isMatchWithin24h = (event: ScheduledEvent) => {
    if (event.session_type !== 'match') return false;
    const start = new Date(event.start_time);
    if (!isFuture(start)) return false;
    return differenceInHours(start, new Date()) <= 24;
  };

  const handleSavePreMatch = async (state: PreMatchState) => {
    if (!dialogEvent) return;
    await saveScheduledPreMatchState(dialogEvent.id, state);
    onPreMatchSaved?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl md:text-2xl font-bold gradient-text">What's Next?</h2>
        </div>
        <button
          onClick={() => navigate('/planner')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          View Full Calendar →
        </button>
      </div>
      
      <div className="grid gap-4">
        {events.map((event, index) => {
          const colors = getSessionTypeDashboardColors(event.session_type);
          const showPreMatchCta = isMatchWithin24h(event);
          const preState = scheduledStateToPreMatchState(event.pre_match_state);
          const hasLogged = hasPreMatchData(preState);

          return (
            <Card
              key={event.id}
              className={`p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-r ${colors.bg} ${colors.border} border-2 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex items-center space-x-4 min-w-0 flex-1 cursor-pointer"
                  onClick={() => navigate('/planner')}
                >
                  <div className={`p-3 rounded-full bg-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Calendar className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 truncate">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{format(new Date(event.start_time), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold ${colors.icon} bg-white px-3 py-1 rounded-full shadow-sm`}>
                    {getSessionTypeLabel(event.session_type)}
                  </span>
                  {showPreMatchCta && (
                    <Button
                      size="sm"
                      variant={hasLogged ? "outline" : "default"}
                      className="text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogEvent(event);
                      }}
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      {hasLogged ? 'Update pre-match' : 'Log pre-match state'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {dialogEvent && (
        <PreMatchStateDialog
          open={Boolean(dialogEvent)}
          onOpenChange={(open) => !open && setDialogEvent(null)}
          eventTitle={dialogEvent.title}
          initialState={scheduledStateToPreMatchState(dialogEvent.pre_match_state)}
          onSave={handleSavePreMatch}
        />
      )}
    </div>
  );
};
