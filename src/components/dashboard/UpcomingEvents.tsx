
import { Card } from "@/components/ui/card";
import { ScheduledEvent } from "@/types/calendar";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sessionTypeColors = {
  training: 'bg-[#F2FCE2]',
  recovery: 'bg-[#FEF7CD]',
  match: 'bg-[#FEC6A1]'
};

interface UpcomingEventsProps {
  events: ScheduledEvent[];
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const navigate = useNavigate();

  if (!events.length) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <button
          onClick={() => navigate('/calendar')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View Calendar
        </button>
      </div>
      <div className="grid gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              sessionTypeColors[event.session_type]
            }`}
            onClick={() => navigate('/calendar')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="h-4 w-4" />
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
              <span className="text-xs capitalize">{event.session_type}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
