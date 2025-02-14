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
import { useIsMobile } from "@/hooks/use-mobile";

// Color mapping for different session types
const sessionTypeColors = {
  training: '#F2FCE2',
  recovery: '#FEF7CD',
  match: '#FEC6A1'
};

const Calendar = () => {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        backgroundColor: sessionTypeColors[event.session_type],
        borderColor: sessionTypeColors[event.session_type],
        textColor: '#000000',
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

  const handleAddEvent = () => {
    setIsNewEvent(true);
    setSelectedEvent({
      id: '',
      title: '',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      session_type: 'training'
    });
    setShowEventDialog(true);
  };

  const handleCalendarSync = () => {
    // Generate .ics file content
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tennis Schedule//EN',
      ...events.map(event => [
        'BEGIN:VEVENT',
        `DTSTART:${new Date(event.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '')}`,
        `DTEND:${new Date(event.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '')}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.notes || ''}`,
        'END:VEVENT'
      ].join('\n')),
      'END:VCALENDAR'
    ].join('\n');

    // Create and download the .ics file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'tennis-schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Calendar Export Ready",
      description: "Your calendar has been exported. Import this file into your preferred calendar app.",
    });
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
        
        <Button 
          variant="outline"
          onClick={handleCalendarSync}
          className="hidden sm:flex items-center"
        >
          Sync Calendar
        </Button>
      </div>
      
      <div className="bg-background rounded-lg shadow p-2 sm:p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={{
            left: isMobile ? 'prev,next' : 'prev,next today addEventButton',
            center: 'title',
            right: isMobile ? 'addEventButton' : 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          customButtons={{
            addEventButton: {
              text: isMobile ? '+' : '+ Add Event',
              click: handleAddEvent
            }
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height={isMobile ? "auto" : "70vh"}
          contentHeight={isMobile ? "auto" : "70vh"}
          aspectRatio={isMobile ? 0.8 : 1.5}
          expandRows={true}
          handleWindowResize={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          slotDuration="01:00:00"
          slotLabelInterval="01:00"
        />
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
