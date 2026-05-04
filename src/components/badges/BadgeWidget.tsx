import { useMemo } from "react";
import { useBadges } from "@/hooks/useBadges";
import { BadgeCelebration } from "./BadgeCelebration";
import { BADGES } from "@/constants/badges";
import { Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BadgeWidget = () => {
  const navigate = useNavigate();
  const { totalEarned, totalBadges, recentlyEarned, dismissCelebration, earnedBadges } = useBadges();

  const percentage = totalBadges > 0 ? Math.round((totalEarned / totalBadges) * 100) : 0;
  const recentBadges = earnedBadges.slice(0, 5);

  const badgeLookup = useMemo(() => {
    const map = new Map<string, { icon: string; name: string; color: string; label: string }>();
    for (const def of BADGES) {
      for (const t of def.tiers) {
        map.set(`${def.id}-${t.tier}`, {
          icon: def.icon,
          name: def.name,
          color: t.color,
          label: t.label,
        });
      }
    }
    return map;
  }, []);

  return (
    <>
      <BadgeCelebration earnedBadge={recentlyEarned} onDismiss={dismissCelebration} />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-800">Badges</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-yellow-600">
              {totalEarned}/{totalBadges}
            </span>
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {recentBadges.length === 0 ? (
          <div className="text-center py-4">
            <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No badges yet. Keep logging to earn them!</p>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentBadges.map((badge) => {
              const info = badgeLookup.get(`${badge.badge_id}-${badge.tier}`);
              return (
                <div
                  key={`${badge.badge_id}-${badge.tier}`}
                  className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: info?.color ? info.color + "20" : "#fef3c7",
                    border: info?.color ? `2px solid ${info.color}` : "2px solid #f59e0b",
                  }}
                  title={`${info?.name || "Badge"} - ${info?.label || ""}`}
                >
                  {info?.icon || "🏅"}
                </div>
              );
            })}
          </div>
        )}

        {totalEarned > 5 && (
          <button
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium"
            onClick={() => navigate("/profile#badges")}
          >
            View all badges
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </>
  );
};
