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
    setSelectedEvent({
      id: crypto.randomUUID(),
      title: "",
      start: new Date().toISOString(),
      end: new Date().toISOString(),
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
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      session_type: "training",
    });
    setShowEventDialog(true);
  };

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
            events={events}
            select={handleDateSelect}
            eventClick={(info) => handleEventClick(info.event.extendedProps as ScheduledEvent)}
            height="70vh"
            expandRows={true}
            handleWindowResize={true}
            stickyHeaderDates={true}
            nowIndicator={true}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
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
