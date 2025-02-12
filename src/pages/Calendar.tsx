
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDialog } from "@/components/calendar/EventDialog";
import type { ScheduledEvent } from "@/types/calendar";
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';

const Calendar = () => {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_events')
        .select('*');

      if (error) throw error;

      setEvents(data.map(event => ({
        ...event,
        start: event.start_time,
        end: event.end_time
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setIsNewEvent(true);
    setSelectedEvent({
      id: '',
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      session_type: 'training'
    });
    setShowEventDialog(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setIsNewEvent(false);
    setSelectedEvent(clickInfo.event.extendedProps as ScheduledEvent);
    setShowEventDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>
        <Button 
          onClick={() => {
            setIsNewEvent(true);
            setSelectedEvent({
              id: '',
              title: '',
              start: new Date().toISOString(),
              end: new Date(Date.now() + 3600000).toISOString(),
              session_type: 'training'
            });
            setShowEventDialog(true);
          }}
        >
          Add Event
        </Button>
      </div>
      
      <div className="bg-background rounded-lg shadow p-4">
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
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {showEventDialog && selectedEvent && (
        <EventDialog
          event={selectedEvent}
          isOpen={showEventDialog}
          onClose={() => setShowEventDialog(false)}
          isNew={isNewEvent}
          onSave={fetchEvents}
        />
      )}
    </div>
  );
};

export default Calendar;
