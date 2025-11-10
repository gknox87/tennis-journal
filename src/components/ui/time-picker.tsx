import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const TimePicker = ({
  value,
  onChange,
  className,
  placeholder = "Select time",
  disabled = false,
}: TimePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hour, setHour] = React.useState<number | null>(null);
  const [minute, setMinute] = React.useState<number | null>(null);
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        if (h === 0) {
          setHour(12);
          setPeriod("AM");
        } else if (h < 12) {
          setHour(h);
          setPeriod("AM");
        } else if (h === 12) {
          setHour(12);
          setPeriod("PM");
        } else {
          setHour(h - 12);
          setPeriod("PM");
        }
        setMinute(m);
      }
    } else {
      setHour(null);
      setMinute(null);
      setPeriod("AM");
    }
  }, [value]);

  // Scroll to top when popover opens to ensure all content is accessible
  React.useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
          // Force scroll to top again after a brief delay to handle any layout shifts
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = 0;
            }
          }, 50);
        }
      });
    }
  }, [isOpen]);

  // Convert to 24-hour format
  const formatTime = (h: number | null, m: number | null, p: "AM" | "PM"): string => {
    if (h === null || m === null) return "";
    
    let hour24 = h;
    if (p === "PM" && h !== 12) {
      hour24 = h + 12;
    } else if (p === "AM" && h === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Display time in 12-hour format
  const displayTime = React.useMemo(() => {
    if (hour === null || minute === null) return null;
    // Hour is already in 12-hour format (1-12), so just use it directly
    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
  }, [hour, minute, period]);

  const handlePeriodToggle = (p: "AM" | "PM") => {
    setPeriod(p);
    if (hour !== null && minute !== null) {
      const time = formatTime(hour, minute, p);
      onChange(time);
    }
  };

  // Quick time slots (common training times) - optimized for mobile with larger touch targets
  const quickTimes = [
    { label: "6:00 AM", hour: 6, minute: 0, period: "AM" },
    { label: "7:00 AM", hour: 7, minute: 0, period: "AM" },
    { label: "8:00 AM", hour: 8, minute: 0, period: "AM" },
    { label: "9:00 AM", hour: 9, minute: 0, period: "AM" },
    { label: "10:00 AM", hour: 10, minute: 0, period: "AM" },
    { label: "11:00 AM", hour: 11, minute: 0, period: "AM" },
    { label: "12:00 PM", hour: 12, minute: 0, period: "PM" },
    { label: "1:00 PM", hour: 1, minute: 0, period: "PM" },
    { label: "2:00 PM", hour: 2, minute: 0, period: "PM" },
    { label: "3:00 PM", hour: 3, minute: 0, period: "PM" },
    { label: "4:00 PM", hour: 4, minute: 0, period: "PM" },
    { label: "5:00 PM", hour: 5, minute: 0, period: "PM" },
    { label: "6:00 PM", hour: 6, minute: 0, period: "PM" },
    { label: "7:00 PM", hour: 7, minute: 0, period: "PM" },
    { label: "8:00 PM", hour: 8, minute: 0, period: "PM" },
    { label: "9:00 PM", hour: 9, minute: 0, period: "PM" },
  ];

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes (0, 15, 30, 45)
  const minutes = [0, 15, 30, 45];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-medium h-11 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400 hover:bg-white/95 focus:border-blue-400 transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation",
            "text-gray-900 hover:text-gray-900",
            !value && "text-muted-foreground hover:text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
          <span className="flex-1 text-sm sm:text-base">
            {displayTime || <span className="text-muted-foreground">{placeholder}</span>}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 rounded-2xl border-2 border-white/30 shadow-2xl z-[100] max-w-[calc(100vw-2rem)] sm:max-w-none" 
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={28}
        avoidCollisions={true}
      >
        <div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl"
          style={{ 
            maxHeight: 'min(65vh, 580px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div 
            ref={scrollContainerRef}
            className="overflow-y-auto overflow-x-hidden flex-1"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'auto',
              overscrollBehavior: 'contain',
              minHeight: 0,
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem'
            }}
          >
            <div className="px-3 sm:px-4 space-y-4">
              {/* Quick Time Selection - Always shown first at the top */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">Quick Select</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {quickTimes.map((time) => (
                    <Button
                      key={time.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setHour(time.hour);
                        setMinute(time.minute);
                        setPeriod(time.period);
                        onChange(formatTime(time.hour, time.minute, time.period));
                        // Close on mobile after selection for better UX
                        if (window.innerWidth < 640) {
                          setTimeout(() => setIsOpen(false), 150);
                        }
                      }}
                      className={cn(
                        "h-10 sm:h-11 text-xs sm:text-sm font-medium touch-manipulation active:scale-95 min-h-[44px] transition-all duration-150",
                        "text-gray-900 hover:text-gray-900",
                        hour === time.hour && minute === time.minute && period === time.period
                          ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 hover:text-white shadow-md"
                          : "bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm border-gray-200"
                      )}
                    >
                      {time.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Time Selector - Shown after quick select times */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1 mb-3">Custom Time</p>
                
                {/* Hour and Minute Selectors */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 items-center justify-center pb-2">
                  {/* Hours */}
                  <div className="space-y-2 w-full sm:w-auto">
                    <label className="text-xs font-semibold text-gray-700 text-center block mb-2">Hour</label>
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                      {hours.map((h) => (
                        <Button
                          key={h}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newHour = h;
                            setHour(newHour);
                            if (minute !== null) {
                              onChange(formatTime(newHour, minute, period));
                            }
                          }}
                          className={cn(
                            "h-11 w-full sm:h-11 sm:w-11 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 min-h-[44px] transition-all duration-150",
                            "text-gray-900 hover:text-gray-900",
                            hour === h
                              ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 hover:text-white shadow-md"
                              : "bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm border-gray-200"
                          )}
                        >
                          {h}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="text-3xl sm:text-2xl font-bold text-gray-400 hidden sm:block">:</div>
                  <div className="text-lg font-bold text-gray-400 sm:hidden">—</div>

                  {/* Minutes */}
                  <div className="space-y-2 w-full sm:w-auto">
                    <label className="text-xs font-semibold text-gray-700 text-center block mb-2">Minute</label>
                    <div className="grid grid-cols-4 gap-2">
                      {minutes.map((m) => (
                        <Button
                          key={m}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMinute = m;
                            setMinute(newMinute);
                            if (hour !== null) {
                              onChange(formatTime(hour, newMinute, period));
                            }
                          }}
                          className={cn(
                            "h-11 w-full sm:h-11 sm:w-11 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 min-h-[44px] transition-all duration-150",
                            "text-gray-900 hover:text-gray-900",
                            minute === m
                              ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 hover:text-white shadow-md"
                              : "bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm border-gray-200"
                          )}
                        >
                          {m.toString().padStart(2, "0")}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex gap-2 mt-4 sm:mt-3 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePeriodToggle("AM")}
                    className={cn(
                      "flex-1 h-11 sm:h-12 font-semibold text-base touch-manipulation active:scale-95 min-h-[44px] transition-all duration-150",
                      period === "AM"
                        ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 hover:text-white shadow-md"
                        : "bg-white text-gray-900 hover:bg-blue-50 hover:text-gray-900 hover:border-blue-300 hover:shadow-sm border-gray-200"
                    )}
                  >
                    AM
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePeriodToggle("PM")}
                    className={cn(
                      "flex-1 h-11 sm:h-12 font-semibold text-base touch-manipulation active:scale-95 min-h-[44px] transition-all duration-150",
                      period === "PM"
                        ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 hover:text-white shadow-md"
                        : "bg-white text-gray-900 hover:bg-blue-50 hover:text-gray-900 hover:border-blue-300 hover:shadow-sm border-gray-200"
                    )}
                  >
                    PM
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

