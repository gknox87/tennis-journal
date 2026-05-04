import { BadgeDefinition, BadgeTier, BADGES, EarnedBadge } from "@/constants/badges";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badgeId: string;
  tier: BadgeTier;
  earned?: EarnedBadge;
  isLocked?: boolean;
  currentValue?: number;
}

export const BadgeCard = ({ badgeId, tier, earned, isLocked, currentValue }: BadgeCardProps) => {
  const definition = BADGES.find((b) => b.id === badgeId);
  if (!definition) return null;

  const isEarned = !!earned;
  const progress = tier.requirement > 0
    ? Math.min(100, Math.round(((currentValue || 0) / tier.requirement) * 100))
    : 0;

  return (
    <div
      className={cn(
        "relative p-4 rounded-2xl border-2 text-center transition-all duration-300",
        isEarned
          ? "bg-white border-yellow-300 shadow-md hover:shadow-lg"
          : isLocked
          ? "bg-gray-50 border-gray-100 opacity-70"
          : "bg-white border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {/* Tier badge */}
      <div className="absolute -top-2 -right-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm"
          style={{ backgroundColor: tier.color + "30", border: `1.5px solid ${tier.color}` }}
        >
          {tier.icon}
        </div>
      </div>

      {/* Icon */}
      <div
        className={cn(
          "w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl mb-3 transition-all",
          isEarned
            ? "bg-yellow-50 ring-2 ring-yellow-300"
            : "bg-gray-100 grayscale"
        )}
      >
        {definition.icon}
      </div>

      {/* Name */}
      <h4 className={cn(
        "font-bold text-sm mb-1",
        isEarned ? "text-gray-900" : "text-gray-500"
      )}>
        {tier.tier > 1 ? definition.name : definition.name}
      </h4>

      {/* Tier label */}
      <p
        className="text-xs font-semibold capitalize mb-2"
        style={{ color: tier.color }}
      >
        {tier.label}
      </p>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {definition.description}
      </p>

      {/* Progress bar or earned date */}
      {isEarned && earned ? (
        <p className="text-xs text-green-600 font-semibold">
          ✓ Earned {new Date(earned.earned_at).toLocaleDateString()}
        </p>
      ) : (
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: tier.color,
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400">
            {currentValue || 0} / {tier.requirement}
          </p>
        </div>
      )}
    </div>
  );
};
