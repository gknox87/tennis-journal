
import { InjuryReport, InjuryCheckIn, getPainColor, getRegionLabel, INJURY_TRENDS } from "@/types/injury";
import {
  getRehabMoodEmoji,
  getRehabMoodLabel,
  getRtpConfidenceLabel,
  getPsychScaleTextColor,
} from "@/constants/injuryPsychology";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";

interface InjuryTimelineProps {
  reports: InjuryReport[];
  checkIns: InjuryCheckIn[];
}

export const InjuryTimeline = ({ reports, checkIns }: InjuryTimelineProps) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No injury reports yet
      </div>
    );
  }

  const grouped: Record<string, InjuryReport[]> = {};
  reports.forEach((r) => {
    const key = r.body_part;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([bodyPart, groupReports]) => (
        <div key={bodyPart}>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: getPainColor(
                  Math.max(...groupReports.map((r) => r.pain_level))
                ),
              }}
            />
            {bodyPart}
            <span className="text-xs text-muted-foreground font-normal">
              ({getRegionLabel(groupReports[0].body_region)})
            </span>
          </h3>

          <div className="relative ml-3 border-l-2 border-muted pl-4 space-y-3">
            {groupReports.map((report) => {
              const trendInfo = INJURY_TRENDS.find((t) => t.value === report.trend);
              const painColor = getPainColor(report.pain_level);
              const reportCheckIns = checkIns
                .filter((c) => c.injury_report_id === report.id)
                .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date));

              return (
                <div key={report.id} className="relative">
                  <div
                    className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: painColor }}
                  />

                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{ color: painColor }}
                        >
                          Pain: {report.pain_level}/10
                        </span>
                        {trendInfo && (
                          <span
                            className="text-xs font-medium"
                            style={{ color: trendInfo.color }}
                          >
                            {trendInfo.icon} {trendInfo.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(report.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-1">
                      {report.pain_types.map((pt) => (
                        <span
                          key={pt}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>

                    {report.treatment_notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.treatment_notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="capitalize">{report.onset_type} onset</span>
                      <span>·</span>
                      <span className="capitalize">{report.duration}</span>
                      {report.sought_medical_attention && (
                        <>
                          <span>·</span>
                          <span className="text-blue-600">Saw medical</span>
                        </>
                      )}
                      {report.restricted_from_training && (
                        <>
                          <span>·</span>
                          <span className="text-red-600">Training restricted</span>
                        </>
                      )}
                    </div>

                    {/* Rehab check-ins for this injury */}
                    {reportCheckIns.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-muted space-y-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          Rehab check-ins
                        </p>
                        {reportCheckIns.map((checkIn) => (
                          <div
                            key={checkIn.id}
                            className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] bg-muted/40 rounded px-2 py-1"
                          >
                            <span className="text-muted-foreground font-medium">
                              {format(parseISO(checkIn.check_in_date), "MMM dd")}
                            </span>
                            {checkIn.pain_level != null && (
                              <span style={{ color: getPainColor(checkIn.pain_level) }}>
                                Pain {checkIn.pain_level}/10
                              </span>
                            )}
                            <span className={cn("font-medium", getPsychScaleTextColor(checkIn.rehab_mood))}>
                              {getRehabMoodEmoji(checkIn.rehab_mood)} {getRehabMoodLabel(checkIn.rehab_mood)}
                            </span>
                            <span className={cn("font-medium", getPsychScaleTextColor(checkIn.rtp_confidence))}>
                              RTP: {getRtpConfidenceLabel(checkIn.rtp_confidence)}
                            </span>
                            {checkIn.notes && (
                              <span className="text-muted-foreground italic w-full">
                                {checkIn.notes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
