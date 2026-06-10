export interface MentalSessionLog {
  __mental_session__: true;
  completed_at: string;
  breathing: {
    technique: '4-7-8' | 'box';
    cycles_completed: number;
  };
  imagery: {
    notes: string;
  };
  self_talk: {
    helpful: string;
    unhelpful: string;
    reframe: string;
  };
  user_notes?: string;
}

const IMAGERY_SCRIPT = `Close your eyes and picture your ideal first point. See your feet set, racket ready, and eyes on the ball. Feel calm confidence as you breathe out, then explode into your first move with clarity and intent. Replay this scene in vivid detail — colours, sounds, and the feeling of executing your game plan.`;

export function getImageryScript(): string {
  return IMAGERY_SCRIPT;
}

export function parseMentalSessionLog(notes: string | null | undefined): MentalSessionLog | null {
  if (!notes?.trim()) return null;
  try {
    const parsed = JSON.parse(notes);
    if (parsed && parsed.__mental_session__ === true) {
      return parsed as MentalSessionLog;
    }
  } catch {
    return null;
  }
  return null;
}

export function getUserNotesFromEvent(notes: string | null | undefined): string {
  const log = parseMentalSessionLog(notes);
  if (log) return log.user_notes ?? '';
  return notes ?? '';
}

export function serializeMentalSessionLog(
  log: Omit<MentalSessionLog, '__mental_session__' | 'completed_at'> & { completed_at?: string },
  userNotes?: string
): string {
  const payload: MentalSessionLog = {
    __mental_session__: true,
    completed_at: log.completed_at ?? new Date().toISOString(),
    breathing: log.breathing,
    imagery: log.imagery,
    self_talk: log.self_talk,
    user_notes: userNotes?.trim() || undefined,
  };
  return JSON.stringify(payload);
}

export function formatMentalSessionSummary(log: MentalSessionLog): string {
  const parts: string[] = [];
  parts.push(
    `Breathing: ${log.breathing.technique} (${log.breathing.cycles_completed} cycles)`
  );
  if (log.imagery.notes.trim()) {
    parts.push(`Imagery notes logged`);
  }
  if (log.self_talk.helpful || log.self_talk.unhelpful || log.self_talk.reframe) {
    parts.push('Self-talk logged');
  }
  return parts.join(' · ');
}
