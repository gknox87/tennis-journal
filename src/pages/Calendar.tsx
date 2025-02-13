
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
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_events')
        .select('*');

      if (error) throw error;

      const formattedEvents = data.map(event => ({
        ...event,
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        session_type: event.session_type,
        notes: event.notes
      }));

      setEvents(formattedEvents);
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
    const event = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      session_type: clickInfo.event.extendedProps.session_type || 'training',
      notes: clickInfo.event.extendedProps.notes || ''
    };
    setSelectedEvent(event);
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
        
        <div className="flex items-center gap-2">
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
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              const url = 'webcal://calendar.google.com/calendar/ical/YOUR_CALENDAR_ID/public/basic.ics';
              window.open(url, '_blank');
            }}
            className="hidden sm:flex items-center"
          >
            Sync Calendar
          </Button>
        </div>
      </div>
      
      <div className="bg-background rounded-lg shadow p-2 sm:p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today addEventButton',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          customButtons={{
            addEventButton: {
              text: '+ Add Event',
              click: () => {
                setIsNewEvent(true);
                setSelectedEvent({
                  id: '',
                  title: '',
                  start: new Date().toISOString(),
                  end: new Date(Date.now() + 3600000).toISOString(),
                  session_type: 'training'
                });
                setShowEventDialog(true);
              }
            }
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.5}
          expandRows={true}
          handleWindowResize={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
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
