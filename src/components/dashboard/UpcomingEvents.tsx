
import { Card } from "@/components/ui/card";
import { ScheduledEvent } from "@/types/calendar";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sessionTypeColors = {
  training: { bg: 'from-green-100 to-emerald-50', icon: 'text-green-600', border: 'border-green-200' },
  recovery: { bg: 'from-yellow-100 to-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
  match: { bg: 'from-red-100 to-pink-50', icon: 'text-red-600', border: 'border-red-200' }
};

interface UpcomingEventsProps {
  events: ScheduledEvent[];
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const navigate = useNavigate();

  if (!events.length) {
    return (
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
          <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No upcoming events</h3>
          <p className="text-gray-600 mb-4">Schedule your next training session or match!</p>
          <button
            onClick={() => navigate('/calendar')}
            className="btn-primary px-6 py-2 rounded-2xl font-semibold"
          >
            Open Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl md:text-2xl font-bold gradient-text">What's Next?</h2>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          View Full Calendar →
        </button>
      </div>
      
      <div className="grid gap-4">
        {events.map((event, index) => {
          const colors = sessionTypeColors[event.session_type];
          return (
            <Card
              key={event.id}
              className={`p-4 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-r ${colors.bg} ${colors.border} border-2 group`}
              onClick={() => navigate('/calendar')}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full bg-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Calendar className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(event.start_time), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold ${colors.icon} bg-white px-3 py-1 rounded-full shadow-sm capitalize`}>
                    {event.session_type}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
