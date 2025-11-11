import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useJournalingStreak } from '@/hooks/useJournalingStreak';
import { normalizeDate } from '@/utils/streakCalculations';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JournalingCalendarProps {
  className?: string;
}

export function JournalingCalendar({ className }: JournalingCalendarProps) {
  const { journaledDates } = useJournalingStreak();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  // Get all dates in the selected month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Count journaled days in the month
  const journaledDaysInMonth = monthDays.filter(day => {
    const dateStr = normalizeDate(day);
    return journaledDates.has(dateStr);
  }).length;

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  // Mini calendar view (compact)
  const MiniCalendar = () => (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-gray-800">
          {format(selectedMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1.5 px-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold text-gray-500 py-1.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 px-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {monthDays.map(day => {
          const dateStr = normalizeDate(day);
          const isJournaled = journaledDates.has(dateStr);
          const isTodayDate = isToday(day);

          return (
            <TooltipProvider key={dateStr} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-150 relative cursor-pointer',
                      isJournaled
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/50',
                      isTodayDate && !isJournaled && 'ring-2 ring-blue-400 ring-offset-1 bg-blue-50',
                      isTodayDate && isJournaled && 'ring-2 ring-blue-400 ring-offset-1'
                    )}
                  >
                    {format(day, 'd')}
                    {isJournaled && (
                      <Check className="absolute top-1 right-1 h-3 w-3 text-white drop-shadow-sm" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isJournaled
                      ? `Journaled on ${format(day, 'MMM d, yyyy')}`
                      : `No journal entry on ${format(day, 'MMM d, yyyy')}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-200/60">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200/50">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-xs font-semibold text-gray-700">
              <span className="text-green-600 font-bold">{journaledDaysInMonth}</span> of {monthDays.length} days journaled
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn('bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-md', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 shadow-sm">
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            Journaling Calendar
          </CardTitle>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                View Full
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-2xl">Journaling Calendar</SheetTitle>
                <SheetDescription className="text-base">
                  Track your journaling consistency. Green days indicate you journaled.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FullCalendarView />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <MiniCalendar />
      </CardContent>
    </Card>
  );

  // Full calendar view (for sheet)
  function FullCalendarView() {
    const [fullViewMonth, setFullViewMonth] = useState(new Date());

    return (
      <div className="space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setFullViewMonth(
                new Date(fullViewMonth.getFullYear(), fullViewMonth.getMonth() - 1, 1)
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {format(fullViewMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setFullViewMonth(
                new Date(fullViewMonth.getFullYear(), fullViewMonth.getMonth() + 1, 1)
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Full calendar */}
        <div className="space-y-4">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startOfMonth(fullViewMonth).getDay() }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {eachDayOfInterval({
              start: startOfMonth(fullViewMonth),
              end: endOfMonth(fullViewMonth),
            }).map(day => {
              const dateStr = normalizeDate(day);
              const isJournaled = journaledDates.has(dateStr);
              const isTodayDate = isToday(day);

              return (
                <TooltipProvider key={dateStr} delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-150 relative cursor-pointer',
                          isJournaled
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-sm'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/50',
                          isTodayDate && !isJournaled && 'ring-2 ring-blue-400 ring-offset-1 bg-blue-50',
                          isTodayDate && isJournaled && 'ring-2 ring-blue-400 ring-offset-1'
                        )}
                      >
                        {format(day, 'd')}
                        {isJournaled && (
                          <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-white drop-shadow-sm" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isJournaled
                          ? `Journaled on ${format(day, 'MMM d, yyyy')}`
                          : `No journal entry on ${format(day, 'MMM d, yyyy')}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200/50">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm" />
            <span className="text-sm font-medium text-gray-700">Journaled</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200/50">
            <div className="h-3 w-3 rounded bg-gray-100 border border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Not journaled</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200/50">
            <div className="h-3 w-3 rounded border-2 border-blue-500 bg-blue-50" />
            <span className="text-sm font-medium text-gray-700">Today</span>
          </div>
        </div>
      </div>
    );
  }
}

