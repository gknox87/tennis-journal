
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventDialog } from "@/components/calendar/EventDialog";
import { MobileCalendarView } from "@/components/calendar/MobileCalendarView";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useIsMobile } from "@/hooks/use-mobile";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { eachDayOfInterval, parseISO, format } from "date-fns";
import type { ScheduledEvent } from "@/types/calendar";

const Calendar = () => {
  const navigate = useNavigate();
  const { fetchScheduledEvents } = useDataFetching();
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const isMobile = useIsMobile();

  const fetchEvents = async () => {
    try {
      const eventsData = await fetchScheduledEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = () => {
    setIsNewEvent(true);
    const now = new Date();
    setSelectedEvent({
      id: crypto.randomUUID(),
      title: "",
      start_time: now.toISOString(),
      end_time: now.toISOString(),
      session_type: "training",
    });
    setShowEventDialog(true);
  };

  const handleEventClick = (event: ScheduledEvent) => {
    setIsNewEvent(false);
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    setIsNewEvent(true);
    setSelectedEvent({
      id: crypto.randomUUID(),
      title: "",
      start_time: selectInfo.startStr,
      end_time: selectInfo.endStr,
      session_type: "training",
    });
    setShowEventDialog(true);
  };

  const handleFullCalendarEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      handleEventClick(event);
    }
  };

  // Expand multi-day events for FullCalendar
  const expandedEvents = events.flatMap(event => {
    const startDate = parseISO(event.start_time);
    const endDate = parseISO(event.end_time);
    
    // If it's a multi-day event, create an entry for each day
    if (startDate.toDateString() !== endDate.toDateString()) {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.map((day, index) => ({
        id: `${event.id}-${index}`,
        title: event.title,
        start: format(day, 'yyyy-MM-dd'),
        end: format(day, 'yyyy-MM-dd'),
        allDay: true,
        extendedProps: { originalEvent: event }
      }));
    }
    
    // Single day event
    return [{
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      extendedProps: { originalEvent: event }
    }];
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="bg-background rounded-lg shadow p-2 sm:p-4">
        {isMobile ? (
          <MobileCalendarView
            events={events}
            onEventClick={handleEventClick}
            onAddEvent={handleAddEvent}
          />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={expandedEvents}
            select={handleDateSelect}
            eventClick={handleFullCalendarEventClick}
            height="70vh"
            expandRows={true}
            handleWindowResize={true}
            stickyHeaderDates={true}
            nowIndicator={true}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
          />
        )}
      </div>

      {showEventDialog && selectedEvent && (
        <EventDialog
          event={selectedEvent}
          isOpen={showEventDialog}
          onClose={() => {
            setShowEventDialog(false);
            setSelectedEvent(null);
          }}
          isNew={isNewEvent}
          onSave={() => {
            fetchEvents();
            setShowEventDialog(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
