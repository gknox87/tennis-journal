
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react";
import { 
  format, 
  addMonths,
  addWeeks,
  startOfDay, 
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  isSameDay, 
  eachDayOfInterval, 
  parseISO,
  isToday
} from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScheduledEvent, SessionType } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface MobileCalendarViewProps {
  events: ScheduledEvent[];
  onEventClick: (event: ScheduledEvent) => void;
  onAddEvent: () => void;
}

type ViewType = 'month' | 'week';

export const MobileCalendarView = ({ events, onEventClick, onAddEvent }: MobileCalendarViewProps) => {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));

  // Group events by date and expand multi-day events
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);
      
      // For all-day events or multi-day events, show on each day
      if (eventStart.toDateString() !== eventEnd.toDateString()) {
        const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });
        return eventDays.some(eventDay => isSameDay(eventDay, date));
      }
      
      return isSameDay(eventStart, date);
    }).sort((a, b) => {
      // Sort by time, all-day events first
      const aStart = parseISO(a.start_time);
      const bStart = parseISO(b.start_time);
      const aIsAllDay = aStart.getHours() === 0 && aStart.getMinutes() === 0;
      const bIsAllDay = bStart.getHours() === 0 && bStart.getMinutes() === 0;
      
      if (aIsAllDay && !bIsAllDay) return -1;
      if (!aIsAllDay && bIsAllDay) return 1;
      
      return aStart.getTime() - bStart.getTime();
    });
  };


  const handlePreviousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(current => startOfMonth(addMonths(current, -1)));
    } else {
      setCurrentDate(current => addWeeks(current, -1));
    }
  };

  const handleNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(current => startOfMonth(addMonths(current, 1)));
    } else {
      setCurrentDate(current => addWeeks(current, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    if (view === 'month') {
      setCurrentDate(startOfMonth(today));
    } else {
      setCurrentDate(startOfWeek(today, { weekStartsOn: 1 }));
    }
    setSelectedDate(startOfDay(today));
  };

  // Update currentDate when view changes to keep it in sync
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (newView === 'month') {
      setCurrentDate(startOfMonth(selectedDate));
    } else {
      setCurrentDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
    }
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

  const isAllDayEvent = (event: ScheduledEvent) => {
    const start = parseISO(event.start_time);
    const end = parseISO(event.end_time);
    return start.getHours() === 0 && start.getMinutes() === 0 && 
           end.getHours() === 23 && end.getMinutes() === 59;
  };

  // Get dates with events for calendar highlighting
  const datesWithEvents = events.map(event => {
    const eventStart = parseISO(event.start_time);
    const eventEnd = parseISO(event.end_time);
    
    // For multi-day events, include all days
    if (eventStart.toDateString() !== eventEnd.toDateString()) {
      const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });
      return eventDays.map(day => startOfDay(day));
    }
    
    return [startOfDay(eventStart)];
  }).flat();

  // Render monthly view
  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        {/* Calendar Grid */}
        <div className="border rounded-lg p-2 bg-white">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentDate}
            onMonthChange={setCurrentDate}
            className="rounded-md"
            classNames={{
              months: "flex flex-col space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              ),
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            modifiers={{
              hasEvents: datesWithEvents
            }}
            modifiersClassNames={{
              hasEvents: "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full"
            }}
          />
        </div>

        {/* Selected Date Events */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map((event) => (
              <Card
                key={`${event.id}-${selectedDate.getTime()}`}
                className="p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSessionTypeColor(event.session_type)}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {isAllDayEvent(event) ? (
                        "All day"
                      ) : (
                        `${format(parseISO(event.start_time), 'h:mm a')} - ${format(parseISO(event.end_time), 'h:mm a')}`
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No events scheduled
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render weekly view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Get all events for the week and sort them chronologically
    const weekEvents = events
      .filter(event => {
        const eventStart = parseISO(event.start_time);
        const eventEnd = parseISO(event.end_time);
        
        // Check if event overlaps with the week
        if (eventStart.toDateString() !== eventEnd.toDateString()) {
          const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });
          return eventDays.some(eventDay => 
            weekDays.some(weekDay => isSameDay(eventDay, weekDay))
          );
        }
        
        return weekDays.some(weekDay => isSameDay(eventStart, weekDay));
      })
      .sort((a, b) => {
        // Sort by time, all-day events first
        const aStart = parseISO(a.start_time);
        const bStart = parseISO(b.start_time);
        const aIsAllDay = aStart.getHours() === 0 && aStart.getMinutes() === 0;
        const bIsAllDay = bStart.getHours() === 0 && bStart.getMinutes() === 0;
        
        if (aIsAllDay && !bIsAllDay) return -1;
        if (!aIsAllDay && bIsAllDay) return 1;
        
        return aStart.getTime() - bStart.getTime();
      });

    return (
      <div className="space-y-4">
        {/* Week Events List */}
        {weekEvents.length > 0 ? (
          <div className="space-y-2">
            {weekEvents.map((event) => {
              const eventStart = parseISO(event.start_time);
              const eventDate = startOfDay(eventStart);
              const isEventToday = isToday(eventDate);
              
              return (
                <Card
                  key={event.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${getSessionTypeColor(event.session_type)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{event.title}</h3>
                        {isEventToday && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {format(eventStart, 'EEE, MMM d')}
                        </span>
                        <span>•</span>
                        <span>
                          {isAllDayEvent(event) ? (
                            "All day"
                          ) : (
                            `${format(eventStart, 'h:mm a')} - ${format(parseISO(event.end_time), 'h:mm a')}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No events scheduled for this week</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Toggle and Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('month')}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              view === 'month' 
                ? "bg-white text-gray-900 shadow-sm hover:bg-white hover:text-gray-900" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Month</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('week')}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              view === 'week' 
                ? "bg-white text-gray-900 shadow-sm hover:bg-white hover:text-gray-900" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span>Week</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handlePreviousPeriod} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextPeriod} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Period Title */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {view === 'month' 
            ? format(currentDate, 'MMMM yyyy')
            : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')}`
          }
        </h2>
      </div>

      {/* View Content */}
      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Add Event Button */}
      <Button onClick={onAddEvent} className="w-full">
        Add Event
      </Button>
    </div>
  );
};
