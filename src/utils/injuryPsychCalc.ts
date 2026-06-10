import { InjuryCheckIn, InjuryReport } from "@/types/injury";

export interface InjuryPsychInterpretation {
  severity: "info" | "warning" | "positive";
  headline: string;
  message: string;
  injuryId?: string;
  bodyPart?: string;
}

export interface InjuryPsychChartPoint {
  date: string;
  pain: number | null;
  rehabMood: number;
  rtpConfidence: number;
}

export function getCheckInHistory(
  checkIns: InjuryCheckIn[],
  injuryId: string
): InjuryCheckIn[] {
  return checkIns
    .filter((c) => c.injury_report_id === injuryId)
    .sort((a, b) => a.check_in_date.localeCompare(b.check_in_date));
}

export function getLatestCheckIn(
  checkIns: InjuryCheckIn[],
  injuryId: string
): InjuryCheckIn | null {
  const history = getCheckInHistory(checkIns, injuryId);
  return history.length > 0 ? history[history.length - 1] : null;
}

export function buildPsychChartData(
  checkIns: InjuryCheckIn[],
  injury: InjuryReport
): InjuryPsychChartPoint[] {
  const history = getCheckInHistory(checkIns, injury.id);
  return history.map((c) => ({
    date: c.check_in_date,
    pain: c.pain_level ?? injury.pain_level,
    rehabMood: c.rehab_mood,
    rtpConfidence: c.rtp_confidence,
  }));
}

export function getInjuryPsychInterpretations(
  reports: InjuryReport[],
  checkIns: InjuryCheckIn[]
): InjuryPsychInterpretation[] {
  const interpretations: InjuryPsychInterpretation[] = [];

  const activeReports = reports.filter(
    (r) => r.trend !== "improving" || r.pain_level > 0
  );

  for (const injury of activeReports) {
    const history = getCheckInHistory(checkIns, injury.id);
    if (history.length === 0) continue;

    const latest = history[history.length - 1];
    const pain = latest.pain_level ?? injury.pain_level;

    if (pain <= 2 && latest.rtp_confidence <= 2) {
      interpretations.push({
        severity: "warning",
        headline: "Confidence lag",
        message:
          "Tissue may be ready before you feel ready. Re-injury is often a confidence problem, not a tissue problem.",
        injuryId: injury.id,
        bodyPart: injury.body_part,
      });
    }

    if (history.length >= 2) {
      const recent = history.slice(-2);
      if (recent.every((c) => c.rehab_mood <= 2)) {
        interpretations.push({
          severity: "info",
          headline: "Frustration building",
          message:
            "Low mood for several check-ins is common in rehab. Be patient with the process — consider talking to your coach or a sports psychologist if it persists.",
          injuryId: injury.id,
          bodyPart: injury.body_part,
        });
      }
    }

    if (pain <= 2 && latest.rtp_confidence >= 4 && latest.rehab_mood >= 4) {
      interpretations.push({
        severity: "positive",
        headline: "Ready signal",
        message:
          "Pain is low and confidence is strong. This is a positive sign — but always follow medical guidance before returning to full play.",
        injuryId: injury.id,
        bodyPart: injury.body_part,
      });
    }
  }

  return interpretations;
}
