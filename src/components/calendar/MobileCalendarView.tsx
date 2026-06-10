
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Plus } from "lucide-react";
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
import { ScheduledEvent, getSessionTypeColor, getSessionTypeLabel } from "@/types/calendar";
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
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Calendar Grid */}
        <Card className="overflow-hidden border-0 shadow-lg sm:shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-sm">
          <div className="p-2 xs:p-3 sm:p-5 md:p-6 lg:p-8">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentDate}
              onMonthChange={setCurrentDate}
              className="rounded-xl w-full"
              classNames={{
                months: "flex flex-col space-y-3 sm:space-y-4 w-full",
                month: "space-y-3 sm:space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-2 sm:mb-4",
                caption_label: "text-base sm:text-lg md:text-xl font-bold text-gray-800",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-white/80 hover:bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 sm:hover:scale-105"
                ),
                nav_button_previous: "absolute left-0 sm:left-1",
                nav_button_next: "absolute right-0 sm:right-1",
                table: "w-full border-collapse",
                head_row: "flex w-full mb-1 sm:mb-2",
                head_cell: "text-gray-500 rounded-lg flex-1 text-center font-semibold text-[10px] xs:text-xs sm:text-xs uppercase tracking-wider",
                row: "flex w-full mt-0.5 sm:mt-1",
                cell: "flex-1 aspect-square text-center text-xs sm:text-sm p-0 relative rounded-lg transition-all duration-200",
                day: cn(
                  "w-full h-full p-0 font-medium rounded-lg transition-all duration-200",
                  "hover:bg-purple-100 hover:text-purple-700 active:scale-95 sm:hover:scale-110",
                  "focus:bg-purple-100 focus:text-purple-700",
                  "min-h-[36px] sm:min-h-[40px] md:min-h-[44px] lg:min-h-[48px]",
                  "flex items-center justify-center"
                ),
                day_selected: "bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold shadow-lg hover:from-purple-600 hover:to-blue-600 hover:shadow-xl sm:scale-110",
                day_today: "bg-gradient-to-br from-orange-100 to-pink-100 text-orange-700 font-bold border-2 border-orange-300",
                day_outside: "text-gray-300 opacity-40",
                day_disabled: "text-gray-200 opacity-30",
                day_range_middle: "bg-purple-50 text-purple-700",
                day_hidden: "invisible",
              }}
              modifiers={{
                hasEvents: datesWithEvents
              }}
              modifiersClassNames={{
                hasEvents: "relative after:content-[''] after:absolute after:bottom-0.5 sm:after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 sm:after:w-1.5 sm:after:h-1.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:rounded-full after:shadow-sm"
              }}
            />
          </div>
        </Card>

        {/* Selected Date Events */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
              {format(selectedDate, 'EEEE, MMM d')}
            </h3>
            {isToday(selectedDate) && (
              <span className="px-2 py-0.5 sm:px-2.5 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm flex-shrink-0">
                Today
              </span>
            )}
          </div>
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {getEventsForDate(selectedDate).map((event) => {
                const eventStart = parseISO(event.start_time);
                const isAllDay = isAllDayEvent(event);
                return (
                  <Card
                    key={`${event.id}-${selectedDate.getTime()}`}
                    className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] sm:hover:-translate-y-1 bg-gradient-to-r from-white to-purple-50/50 overflow-hidden"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="p-3 sm:p-4 md:p-5">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={`w-1 h-full min-h-[40px] sm:min-h-[48px] rounded-full flex-shrink-0 ${getSessionTypeColor(event.session_type, 'mobile')} shadow-sm`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1">
                            <h3 className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-700 transition-colors truncate">
                              {event.title || 'Untitled Event'}
                            </h3>
                            <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${getSessionTypeColor(event.session_type, 'mobile')} text-white shadow-sm flex-shrink-0`}>
                              {getSessionTypeLabel(event.session_type)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <div className="w-1 h-1 bg-purple-400 rounded-full flex-shrink-0"></div>
                              <span className="font-medium truncate">
                                {isAllDay ? (
                                  "All Day"
                                ) : (
                                  `${format(eventStart, 'h:mm a')} - ${format(parseISO(event.end_time), 'h:mm a')}`
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-purple-50/30">
              <div className="text-center py-6 sm:py-8 md:py-10 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">No events scheduled</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Tap "Add Event" to schedule something</p>
              </div>
            </Card>
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
      <div className="space-y-3 sm:space-y-4">
        {/* Week Events List */}
        {weekEvents.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {weekEvents.map((event) => {
              const eventStart = parseISO(event.start_time);
              const eventDate = startOfDay(eventStart);
              const isEventToday = isToday(eventDate);
              const isAllDay = isAllDayEvent(event);
              
              return (
                <Card
                  key={event.id}
                  className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] sm:hover:-translate-y-1 bg-gradient-to-r from-white to-purple-50/50 overflow-hidden"
                  onClick={() => onEventClick(event)}
                >
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className={`w-1 h-full min-h-[40px] sm:min-h-[48px] rounded-full flex-shrink-0 ${getSessionTypeColor(event.session_type, 'mobile')} shadow-sm`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1">
                          <h3 className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-700 transition-colors truncate">
                            {event.title || 'Untitled Event'}
                          </h3>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {isEventToday && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                                Today
                              </span>
                            )}
                            <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${getSessionTypeColor(event.session_type, 'mobile')} text-white shadow-sm`}>
                              {getSessionTypeLabel(event.session_type)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-1 h-1 bg-purple-400 rounded-full flex-shrink-0"></div>
                            <span className="font-semibold">
                              {format(eventStart, 'EEE, MMM d')}
                            </span>
                          </div>
                          <span className="text-gray-300 hidden xs:inline">•</span>
                          <span className="font-medium">
                            {isAllDay ? (
                              "All Day"
                            ) : (
                              `${format(eventStart, 'h:mm a')} - ${format(parseISO(event.end_time), 'h:mm a')}`
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-purple-50/30">
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <List className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">No events scheduled for this week</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Tap "Add Event" to schedule something</p>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      {/* View Toggle and Navigation */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex gap-1 sm:gap-1.5 bg-gradient-to-r from-purple-100/50 to-blue-100/50 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-purple-200/50 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('month')}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-md sm:rounded-lg h-8 sm:h-9 px-2.5 sm:px-3",
              view === 'month' 
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:from-purple-600 hover:to-blue-600" 
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Month</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('week')}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-md sm:rounded-lg h-8 sm:h-9 px-2.5 sm:px-3",
              view === 'week' 
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:from-purple-600 hover:to-blue-600" 
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            )}
          >
            <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Week</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToday} 
            className="text-xs sm:text-sm font-semibold border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 shadow-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            Today
          </Button>
          <div className="flex gap-0.5 sm:gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePreviousPeriod} 
              className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 shadow-sm active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextPeriod} 
              className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 shadow-sm active:scale-95"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Period Title - Only show for week view */}
      {view === 'week' && (
        <div className="text-center py-1 sm:py-2">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Week of {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')}
          </h2>
        </div>
      )}

      {/* View Content */}
      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Add Event Button */}
      <Button 
        onClick={onAddEvent} 
        className="w-full h-11 sm:h-12 md:h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] sm:hover:scale-[1.02] rounded-xl"
      >
        <Plus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Add Event
      </Button>
    </div>
  );
};
