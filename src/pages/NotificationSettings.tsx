import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSmartNotifications, ReminderPreferences } from "@/hooks/useSmartNotifications";
import { Bell, Clock, BellRing, MapPin, Brain, ChevronRight, Save } from "lucide-react";
import { Header } from "@/components/Header";

interface DayOption {
  value: string;
  label: string;
  short: string;
}

const DAYS: DayOption[] = [
  { value: "mon", label: "Monday", short: "M" },
  { value: "tue", label: "Tuesday", short: "T" },
  { value: "wed", label: "Wednesday", short: "W" },
  { value: "thu", label: "Thursday", short: "T" },
  { value: "fri", label: "Friday", short: "F" },
  { value: "sat", label: "Saturday", short: "S" },
  { value: "sun", label: "Sunday", short: "S" },
];

interface TimeInputProps {
  value: string;
  onChange: (time: string) => void;
}

function TimeInput({ value, onChange }: TimeInputProps) {
  const [hour, minute] = value.split(":").map(Number);

  const handleHourChange = (newHour: number) => {
    const h = Math.max(0, Math.min(23, newHour));
    onChange(`${h.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
  };

  const handleMinuteChange = (newMinute: number) => {
    const m = Math.max(0, Math.min(59, newMinute));
    onChange(`${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  };

  return (
    <div className="flex items-center gap-1">
      <select
        value={hour}
        onChange={(e) => handleHourChange(Number(e.target.value))}
        className="border rounded px-2 py-1 text-center bg-white dark:bg-gray-800"
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="text-lg font-bold">:</span>
      <select
        value={minute}
        onChange={(e) => handleMinuteChange(Number(e.target.value))}
        className="border rounded px-2 py-1 text-center bg-white dark:bg-gray-800"
      >
        {[0, 15, 30, 45].map((m) => (
          <option key={m} value={m}>
            {m.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const { preferences, isLoading, updatePreferences, refreshPreferences } = useSmartNotifications();

  const [localPrefs, setLocalPrefs] = useState<Partial<ReminderPreferences>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when preferences load
  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleToggle = (field: keyof ReminderPreferences) => {
    const newValue = !localPrefs[field as keyof Partial<ReminderPreferences>];
    setLocalPrefs((prev) => ({ ...prev, [field]: newValue }));
    setHasChanges(true);
  };

  const handleTimeChange = (time: string) => {
    setLocalPrefs((prev) => ({ ...prev, reminder_time: time }));
    setHasChanges(true);
  };

  const handleWellnessTimeChange = (time: string) => {
    setLocalPrefs((prev) => ({ ...prev, wellness_reminder_time: time }));
    setHasChanges(true);
  };

  const handleDayToggle = (day: string) => {
    const currentDays = localPrefs.reminder_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setLocalPrefs((prev) => ({ ...prev, reminder_days: newDays }));
    setHasChanges(true);
  };

  const handleWellnessDayToggle = (day: string) => {
    const currentDays = localPrefs.wellness_reminder_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setLocalPrefs((prev) => ({ ...prev, wellness_reminder_days: newDays }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePreferences(localPrefs);
      setHasChanges(false);
      toast({ title: "Preferences saved", description: "Your notification preferences have been updated." });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "Failed to save preferences. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const isDayActive = (day: string) => {
    return (localPrefs.reminder_days || []).includes(day);
  };

  const isWellnessDayActive = (day: string) => {
    return (localPrefs.wellness_reminder_days || []).includes(day);
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-y-auto pb-24 pt-16">
        <Header title="Notification Settings" showBack backTo="/profile" />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24 pt-16">
      <Header title="Notification Settings" showBack backTo="/profile" />

      <div
        className="container mx-auto px-4 py-6 max-w-2xl space-y-6"
        onChange={() => setHasChanges(true)}
      >
        {/* Time-Based Reminders */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Time-Based Reminders</h2>
              <p className="text-sm text-muted-foreground">Daily reminder to journal</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <Label htmlFor="reminder_enabled" className="cursor-pointer">
                  Daily reminder
                </Label>
              </div>
              <Switch
                id="reminder_enabled"
                checked={localPrefs.reminder_enabled ?? true}
                onCheckedChange={() => handleToggle("reminder_enabled")}
              />
            </div>

            {/* Time picker */}
            {localPrefs.reminder_enabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder_time" className="cursor-pointer">
                    Reminder time
                  </Label>
                  <TimeInput
                    value={localPrefs.reminder_time ?? "20:00"}
                    onChange={handleTimeChange}
                  />
                </div>

                {/* Days of week */}
                <div>
                  <Label className="mb-2 block">Remind me on</Label>
                  <div className="flex gap-1 justify-between">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => handleDayToggle(day.value)}
                        className={`
                          w-10 h-10 rounded-full text-sm font-medium
                          transition-all duration-200
                          ${isDayActive(day.value)
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }
                        `}
                        title={day.label}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Wellness Check-in Reminders */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Wellness Check-in</h2>
              <p className="text-sm text-muted-foreground">Proactive nudge to log sleep, stress, mood, and readiness</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-gray-500" />
                <Label htmlFor="wellness_reminder_enabled" className="cursor-pointer">
                  Daily wellness reminder
                </Label>
              </div>
              <Switch
                id="wellness_reminder_enabled"
                checked={localPrefs.wellness_reminder_enabled ?? true}
                onCheckedChange={() => handleToggle("wellness_reminder_enabled")}
              />
            </div>

            {localPrefs.wellness_reminder_enabled !== false && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="wellness_reminder_time" className="cursor-pointer">
                    Reminder time
                  </Label>
                  <TimeInput
                    value={localPrefs.wellness_reminder_time ?? "08:00"}
                    onChange={handleWellnessTimeChange}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Remind me on</Label>
                  <div className="flex gap-1 justify-between">
                    {DAYS.map((day) => (
                      <button
                        key={`wellness-${day.value}`}
                        onClick={() => handleWellnessDayToggle(day.value)}
                        className={`
                          w-10 h-10 rounded-full text-sm font-medium
                          transition-all duration-200
                          ${isWellnessDayActive(day.value)
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }
                        `}
                        title={day.label}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Event-Based Reminders */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellRing className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Event-Based Reminders</h2>
              <p className="text-sm text-muted-foreground">Reminders triggered by your activity</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gray-500" />
                <Label htmlFor="after_match_reminder" className="cursor-pointer">
                  After a match, remind me to reflect
                </Label>
              </div>
              <Switch
                id="after_match_reminder"
                checked={localPrefs.after_match_reminder ?? true}
                onCheckedChange={() => handleToggle("after_match_reminder")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-gray-500" />
                <Label htmlFor="pre_match_reminder" className="cursor-pointer">
                  Before upcoming matches, prompt for pre-match state
                </Label>
              </div>
              <Switch
                id="pre_match_reminder"
                checked={localPrefs.pre_match_reminder ?? true}
                onCheckedChange={() => handleToggle("pre_match_reminder")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <Label htmlFor="after_training_reminder" className="cursor-pointer">
                  After a training session, prompt for notes
                </Label>
              </div>
              <Switch
                id="after_training_reminder"
                checked={localPrefs.after_training_reminder ?? true}
                onCheckedChange={() => handleToggle("after_training_reminder")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Label htmlFor="weekly_summary" className="cursor-pointer">
                  Weekly summary on Monday
                </Label>
              </div>
              <Switch
                id="weekly_summary"
                checked={localPrefs.weekly_summary_enabled ?? true}
                onCheckedChange={() => handleToggle("weekly_summary_enabled")}
              />
            </div>
          </div>
        </Card>

        {/* Smart Notifications */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Smart Notifications</h2>
              <p className="text-sm text-muted-foreground">AI-powered nudge system</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-gray-500" />
                <Label htmlFor="smart_nudge" className="cursor-pointer">
                  Smart nudge if inactive
                </Label>
              </div>
              <Switch
                id="smart_nudge"
                checked={localPrefs.smart_nudge_enabled ?? true}
                onCheckedChange={() => handleToggle("smart_nudge_enabled")}
              />
            </div>

            {localPrefs.smart_nudge_enabled && (
              <div className="pl-6 text-sm text-muted-foreground">
                Sends a friendly reminder when you haven't logged in for{' '}
                <span className="font-medium text-foreground">
                  {localPrefs.smart_nudge_threshold_days ?? 3}+ days
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Location-Based Reminders (Opt-in) */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Location-Based Reminders</h2>
              <p className="text-sm text-muted-foreground">Detect when you play</p>
            </div>
            <Badge variant="outline" className="ml-auto text-xs">Beta</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Label htmlFor="location_tracking" className="cursor-pointer">
                  Enable location detection
                </Label>
              </div>
              <Switch
                id="location_tracking"
                checked={localPrefs.location_tracking_enabled ?? false}
                onCheckedChange={() => handleToggle("location_tracking_enabled")}
              />
            </div>

            {localPrefs.location_tracking_enabled && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                <p className="text-orange-800">
                  <strong>Coming soon:</strong> We'll detect when you're at a tennis or padel court
                  and remind you to log your match if you haven't done so within 2 hours.
                  Your location data is only used to detect court visits and is never stored permanently.
                </p>
              </div>
            )}

            {!localPrefs.location_tracking_enabled && (
              <div className="text-sm text-muted-foreground">
                When enabled, we can detect when you visit a tennis/padel club and remind you to log your play.
              </div>
            )}
          </div>
        </Card>

        {/* Save button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 text-base font-medium"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper components for icons in this file
function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
