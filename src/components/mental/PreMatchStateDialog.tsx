import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PreMatchStateForm, hasPreMatchData } from '@/components/mental/PreMatchStateForm';
import type { PreMatchState } from '@/types/mental';
import { Brain } from 'lucide-react';

interface PreMatchStateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  initialState?: PreMatchState | null;
  onSave: (state: PreMatchState) => Promise<void>;
}

export function PreMatchStateDialog({
  open,
  onOpenChange,
  eventTitle,
  initialState,
  onSave,
}: PreMatchStateDialogProps) {
  const [state, setState] = useState<PreMatchState>(initialState ?? {});
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setState(initialState ?? {});
    }
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (!hasPreMatchData(state)) return;
    setSaving(true);
    try {
      await onSave({ ...state, logged_at: new Date().toISOString() });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Pre-match state
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{eventTitle}</p>
        </DialogHeader>

        <PreMatchStateForm value={state} onChange={setState} compact />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasPreMatchData(state) || saving}
          >
            {saving ? 'Saving…' : 'Save pre-match log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
