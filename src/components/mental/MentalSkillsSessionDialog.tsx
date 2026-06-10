import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  getImageryScript,
  serializeMentalSessionLog,
  getUserNotesFromEvent,
} from '@/utils/mentalSessionLog';
import { Wind, Eye, MessageCircle, Check } from 'lucide-react';

type BreathingTechnique = '4-7-8' | 'box';

const BREATHING_PHASES: Record<BreathingTechnique, { label: string; duration: number }[]> = {
  '4-7-8': [
    { label: 'Inhale', duration: 4 },
    { label: 'Hold', duration: 7 },
    { label: 'Exhale', duration: 8 },
  ],
  box: [
    { label: 'Inhale', duration: 4 },
    { label: 'Hold', duration: 4 },
    { label: 'Exhale', duration: 4 },
    { label: 'Hold', duration: 4 },
  ],
};

interface MentalSkillsSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  existingNotes?: string | null;
  onSaved?: () => void;
}

export function MentalSkillsSessionDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  existingNotes,
  onSaved,
}: MentalSkillsSessionDialogProps) {
  const { toast } = useToast();
  const [technique, setTechnique] = useState<BreathingTechnique>('4-7-8');
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [imageryNotes, setImageryNotes] = useState('');
  const [helpfulTalk, setHelpfulTalk] = useState('');
  const [unhelpfulTalk, setUnhelpfulTalk] = useState('');
  const [reframeTalk, setReframeTalk] = useState('');
  const [saving, setSaving] = useState(false);

  const phases = BREATHING_PHASES[technique];
  const currentPhase = phases[phaseIndex];

  const resetBreathing = useCallback(() => {
    setIsBreathing(false);
    setPhaseIndex(0);
    setPhaseSecondsLeft(0);
    setCyclesCompleted(0);
  }, []);

  useEffect(() => {
    if (!open) {
      resetBreathing();
      setImageryNotes('');
      setHelpfulTalk('');
      setUnhelpfulTalk('');
      setReframeTalk('');
    }
  }, [open, resetBreathing]);

  useEffect(() => {
    if (!isBreathing) return;

    if (phaseSecondsLeft <= 0) {
      const nextPhase = phaseIndex + 1;
      if (nextPhase >= phases.length) {
        setCyclesCompleted((c) => c + 1);
        setPhaseIndex(0);
        setPhaseSecondsLeft(phases[0].duration);
      } else {
        setPhaseIndex(nextPhase);
        setPhaseSecondsLeft(phases[nextPhase].duration);
      }
      return;
    }

    const timer = setTimeout(() => {
      setPhaseSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isBreathing, phaseSecondsLeft, phaseIndex, phases]);

  const startBreathing = () => {
    setPhaseIndex(0);
    setPhaseSecondsLeft(phases[0].duration);
    setIsBreathing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const notesJson = serializeMentalSessionLog(
        {
          breathing: { technique, cycles_completed: cyclesCompleted },
          imagery: { notes: imageryNotes },
          self_talk: {
            helpful: helpfulTalk,
            unhelpful: unhelpfulTalk,
            reframe: reframeTalk,
          },
        },
        getUserNotesFromEvent(existingNotes)
      );

      const { error } = await supabase
        .from('scheduled_events')
        .update({ notes: notesJson })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Session saved',
        description: 'Your mental skills work has been logged.',
      });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving mental session:', err);
      toast({
        title: 'Error',
        description: 'Could not save session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mental skills session — {eventTitle}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="breathing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breathing" className="text-xs">
              <Wind className="h-3 w-3 mr-1" />
              Breathing
            </TabsTrigger>
            <TabsTrigger value="imagery" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Imagery
            </TabsTrigger>
            <TabsTrigger value="selftalk" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Self-talk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breathing" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={technique === '4-7-8' ? 'default' : 'outline'}
                onClick={() => { setTechnique('4-7-8'); resetBreathing(); }}
                disabled={isBreathing}
              >
                4-7-8
              </Button>
              <Button
                type="button"
                size="sm"
                variant={technique === 'box' ? 'default' : 'outline'}
                onClick={() => { setTechnique('box'); resetBreathing(); }}
                disabled={isBreathing}
              >
                Box (4-4-4-4)
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-purple-50 border border-purple-100">
              {isBreathing ? (
                <>
                  <p className="text-3xl font-bold text-purple-800">{currentPhase?.label}</p>
                  <p className="text-5xl font-bold text-purple-600 mt-2">{phaseSecondsLeft}</p>
                  <p className="text-sm text-purple-700 mt-2">Cycle {cyclesCompleted + 1}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={resetBreathing}
                  >
                    Stop
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-purple-800 text-center mb-4">
                    {technique === '4-7-8'
                      ? 'Inhale 4s · Hold 7s · Exhale 8s'
                      : 'Inhale 4s · Hold 4s · Exhale 4s · Hold 4s'}
                  </p>
                  <p className="text-lg font-semibold text-purple-700 mb-2">
                    {cyclesCompleted} cycle{cyclesCompleted !== 1 ? 's' : ''} completed
                  </p>
                  <Button type="button" onClick={startBreathing}>
                    {cyclesCompleted > 0 ? 'Continue breathing' : 'Start breathing'}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="imagery" className="space-y-3 mt-4">
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-sm text-indigo-900 leading-relaxed">
              {getImageryScript()}
            </div>
            <div className="space-y-2">
              <Label htmlFor="imagery-notes">Your imagery notes</Label>
              <Textarea
                id="imagery-notes"
                value={imageryNotes}
                onChange={(e) => setImageryNotes(e.target.value)}
                placeholder="What did you see, feel, or focus on?"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="selftalk" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label htmlFor="helpful-talk">Helpful self-talk you used</Label>
              <Textarea
                id="helpful-talk"
                value={helpfulTalk}
                onChange={(e) => setHelpfulTalk(e.target.value)}
                placeholder="e.g. Trust my legs, one point at a time"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unhelpful-talk">Unhelpful thoughts that showed up</Label>
              <Textarea
                id="unhelpful-talk"
                value={unhelpfulTalk}
                onChange={(e) => setUnhelpfulTalk(e.target.value)}
                placeholder="e.g. I always choke in tiebreaks"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reframe-talk">Reframe — what you'll say instead</Label>
              <Textarea
                id="reframe-talk"
                value={reframeTalk}
                onChange={(e) => setReframeTalk(e.target.value)}
                placeholder="e.g. I've trained for this — compete one point at a time"
                rows={2}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button
          type="button"
          className="w-full"
          onClick={handleSave}
          disabled={saving || cyclesCompleted === 0}
        >
          <Check className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Complete session'}
        </Button>
        {cyclesCompleted === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Complete at least one breathing cycle before saving.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
