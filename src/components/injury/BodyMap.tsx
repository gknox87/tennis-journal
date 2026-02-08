
import { useState } from "react";
import { BodyRegion, InjuryReport, getPainColor, getRegionLabel } from "@/types/injury";
import {
  FRONT_REGIONS,
  BACK_REGIONS,
} from "./BodyMapSvg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface BodyMapProps {
  onRegionSelect: (region: BodyRegion) => void;
  injuries?: InjuryReport[];
  selectedRegion?: BodyRegion | null;
}

export const BodyMap = ({ onRegionSelect, injuries = [], selectedRegion }: BodyMapProps) => {
  const [view, setView] = useState<"front" | "back">("front");
  const [scale, setScale] = useState(1);

  const regions = view === "front" ? FRONT_REGIONS : BACK_REGIONS;

  // Get the worst pain level for each region from active injuries
  const regionPainMap: Record<string, number> = {};
  injuries.forEach((injury) => {
    const current = regionPainMap[injury.body_region] || 0;
    if (injury.pain_level > current) {
      regionPainMap[injury.body_region] = injury.pain_level;
    }
  });

  // Count injuries per region
  const regionCountMap: Record<string, number> = {};
  injuries.forEach((injury) => {
    regionCountMap[injury.body_region] = (regionCountMap[injury.body_region] || 0) + 1;
  });

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 1.8));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.8));

  return (
    <div className="flex flex-col items-center gap-3">
      {/* View toggle + zoom */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border bg-muted p-0.5">
          <button
            onClick={() => setView("front")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "front"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Front
          </button>
          <button
            onClick={() => setView("back")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "back"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Back
          </button>
        </div>
        <div className="flex gap-0.5 ml-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body map SVG */}
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-inner"
        style={{ maxWidth: 300 }}
      >
        <svg
          viewBox="10 0 180 440"
          className="w-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
        >
          <defs>
            {/* Gradient for body fill */}
            <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            {/* Glow filter for selected region */}
            <filter id="selectedGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#6366f1" floodOpacity="0.3" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Subtle shadow for depth */}
            <filter id="bodyShadow" x="-5%" y="-2%" width="110%" height="104%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#64748b" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Tappable regions (rendered as filled shapes within the body) */}
          {regions.map((regionDef) => {
            const isSelected = selectedRegion === regionDef.region;
            const painLevel = regionPainMap[regionDef.region];
            const hasInjury = painLevel !== undefined && painLevel > 0;

            return regionDef.paths.map((pathD, idx) => (
              <path
                key={`${regionDef.region}-${idx}`}
                d={pathD}
                fill={
                  isSelected
                    ? "rgba(99, 102, 241, 0.35)"
                    : hasInjury
                    ? getPainColor(painLevel) + "50"
                    : "#cbd5e1"
                }
                stroke={
                  isSelected
                    ? "#6366f1"
                    : hasInjury
                    ? getPainColor(painLevel)
                    : "#94a3b8"
                }
                strokeWidth={isSelected ? "2" : hasInjury ? "1.5" : "0.5"}
                strokeLinejoin="round"
                filter={isSelected ? "url(#selectedGlow)" : undefined}
                className="cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  filter: isSelected
                    ? undefined
                    : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && !hasInjury) {
                    e.currentTarget.setAttribute("fill", "rgba(99, 102, 241, 0.15)");
                    e.currentTarget.setAttribute("stroke", "#a5b4fc");
                    e.currentTarget.setAttribute("stroke-width", "1.5");
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && !hasInjury) {
                    e.currentTarget.setAttribute("fill", "#cbd5e1");
                    e.currentTarget.setAttribute("stroke", "#94a3b8");
                    e.currentTarget.setAttribute("stroke-width", "0.5");
                  }
                }}
                onClick={() => onRegionSelect(regionDef.region)}
              />
            ));
          })}

          {/* Anatomical detail lines for visual polish */}
          <g stroke="#94a3b8" strokeWidth="0.3" fill="none" opacity="0.5" pointerEvents="none">
            {/* Center line */}
            <line x1="100" y1="74" x2="100" y2="198" strokeDasharray="2,3" />
            {/* Collarbone hints */}
            <path d="M 78,78 Q 90,74 100,76 Q 110,74 122,78" />
            {/* Pectoral line */}
            <path d="M 74,94 Q 100,100 126,94" />
            {/* Waist line */}
            <path d="M 76,158 Q 100,162 124,158" />
          </g>

          {/* Injury count badges — using explicit badgeCenter */}
          {regions.map((regionDef) => {
            const count = regionCountMap[regionDef.region];
            if (!count) return null;

            const { x: cx, y: cy } = regionDef.badgeCenter;

            return (
              <g key={`badge-${regionDef.region}`} pointerEvents="none">
                <circle
                  cx={cx}
                  cy={cy}
                  r="9"
                  fill={getPainColor(regionPainMap[regionDef.region] || 0)}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {count}
                </text>
              </g>
            );
          })}
        </svg>

        {/* View label pill */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          {view === "front" ? "Front" : "Back"}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
          <span>Severe</span>
        </div>
      </div>

      {/* Tap instruction or selected info */}
      {!selectedRegion ? (
        <p className="text-xs text-muted-foreground text-center">
          Tap a body area to report or view an injury
        </p>
      ) : (
        <div className="text-center bg-primary/5 rounded-lg px-4 py-2 border border-primary/10">
          <p className="text-sm font-semibold text-primary">
            {getRegionLabel(selectedRegion)}
          </p>
          {regionCountMap[selectedRegion] ? (
            <p className="text-xs text-muted-foreground">
              {regionCountMap[selectedRegion]} active report{regionCountMap[selectedRegion] !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No current injuries</p>
          )}
        </div>
      )}
    </div>
  );
};
