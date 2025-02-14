
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ScheduledEvent, SessionType } from "@/types/calendar";

interface MobileCalendarViewProps {
  events: ScheduledEvent[];
  onEventClick: (event: ScheduledEvent) => void;
  onAddEvent: () => void;
}

export const MobileCalendarView = ({ events, onEventClick, onAddEvent }: MobileCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));

  const todayEvents = events.filter(event => 
    isSameDay(new Date(event.start_time), selectedDate)
  ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const handlePreviousDay = () => {
    setSelectedDate(current => addDays(current, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(current => addDays(current, 1));
  };

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case 'training':
        return 'bg-blue-500';
      case 'match':
        return 'bg-green-500';
      case 'recovery':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'EEEE, MMM d')}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {todayEvents.length > 0 ? (
          todayEvents.map((event) => (
            <Card
              key={event.id}
              className="p-3 cursor-pointer hover:bg-accent"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getSessionTypeColor(event.session_type)}`} />
                <div className="flex-1">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No events scheduled for this day
          </div>
        )}
      </div>

      <Button onClick={onAddEvent} className="w-full">
        Add Event
      </Button>
    </div>
  );
};
