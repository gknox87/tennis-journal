import { useState, useMemo } from "react";
import { SPORTS, type SupportedSportId } from "@/constants/sports";
import type { SportMetadata, SportCategory } from "@/types/sport";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import {
  getSportsByCategory,
  getPopularSports,
  getCategoryDisplayName,
  getCategoryIcon,
  searchSports,
} from "@/utils/sportHelpers";

const GOAL_OPTIONS: Array<{ id: string; label: string; description: string }> = [
  {
    id: "performance",
    label: "Compete at a higher level",
    description: "Sharpen match play, decision-making, and results against top competition.",
  },
  {
    id: "consistency",
    label: "Build reliable habits",
    description: "Create repeatable routines, track practice quality, and stay accountable.",
  },
  {
    id: "fitness",
    label: "Stay match fit",
    description: "Blend physical preparation with technical reps to perform all season.",
  },
];

interface SportGoalSelectorProps {
  sportId: SupportedSportId | null;
  onSportChange: (sportId: SupportedSportId) => void;
  goalId: string;
  onGoalChange: (goalId: string) => void;
  orientation?: "vertical" | "horizontal";
}

export const SportGoalSelector = ({
  sportId,
  onSportChange,
  goalId,
  onGoalChange,
  orientation = "vertical",
}: SportGoalSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"popular" | SportCategory>("popular");

  const sportsByCategory = useMemo(() => getSportsByCategory(), []);
  const popularSports = useMemo(() => getPopularSports(8), []);

  const displayedSports = useMemo(() => {
    if (searchQuery.trim()) {
      return searchSports(searchQuery);
    }
    if (activeCategory === "popular") {
      return popularSports;
    }
    return sportsByCategory[activeCategory] || [];
  }, [searchQuery, activeCategory, sportsByCategory, popularSports]);

  const categories = useMemo(() => {
    const cats = Object.keys(sportsByCategory) as SportCategory[];
    return cats.filter(cat => sportsByCategory[cat].length > 0);
  }, [sportsByCategory]);

  const renderSportsList = (sports: SportMetadata[]) => (
    <ScrollArea className="max-h-[360px] rounded-xl border bg-muted/10 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {sports.map((sport) => {
          const selected = sport.id === sportId;
          const secondaryLabel = sport.subcategory
            ? sport.subcategory
            : getCategoryDisplayName(sport.category);

          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => onSportChange(sport.id as SupportedSportId)}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left transition-all",
                selected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                  : "border-border shadow-sm hover:border-primary/50 hover:bg-muted/30 hover:shadow"
              )}
            >
              <span className="text-2xl">{sport.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{sport.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{secondaryLabel}</p>
              </div>
              {selected && (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      {sports.length === 0 && (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <p>No sports found. Try a different search term.</p>
        </div>
      )}
    </ScrollArea>
  );

  return (
    <div
      className={cn(
        "space-y-6",
        orientation === "horizontal" && "md:grid md:grid-cols-2 md:gap-8 md:space-y-0"
      )}
    >
      <div className="space-y-3">
        <Label className="text-base">
          Choose your sport <span className="text-destructive">*</span>
        </Label>

        {/* Search Input */}
        <Input
          type="search"
          placeholder="Search sports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {/* Category Tabs */}
        {!searchQuery && (
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as SportCategory | "popular")}>
            <ScrollArea className="w-full">
              <TabsList className="flex w-max items-center gap-2 bg-transparent px-1 pb-2 pt-1">
                <TabsTrigger
                  value="popular"
                  className="shrink-0 rounded-full border border-border px-3 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  ⭐ Popular
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="shrink-0 rounded-full border border-border px-3 py-2 text-xs font-medium capitalize data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <span className="mr-1">{getCategoryIcon(category)}</span>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            <TabsContent value={activeCategory} className="mt-4">
              {renderSportsList(displayedSports)}
            </TabsContent>
          </Tabs>
        )}

        {/* Search Results (when searching) */}
        {searchQuery && (
          renderSportsList(displayedSports)
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-base">Select your focus</Label>
        <div className="grid gap-3">
          {GOAL_OPTIONS.map((goal) => {
            const selected = goal.id === goalId;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onGoalChange(goal.id)}
                className={cn(
                  "relative rounded-xl border px-4 py-3 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-muted/40 hover:shadow"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{goal.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{goal.description}</p>
                  </div>
                  {selected && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
