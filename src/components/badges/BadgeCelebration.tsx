import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BADGES, EarnedBadge } from "@/constants/badges";
import { Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface BadgeCelebrationProps {
  earnedBadge: EarnedBadge | null;
  onDismiss: () => void;
}

export const BadgeCelebration = ({ earnedBadge, onDismiss }: BadgeCelebrationProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (earnedBadge) {
      setOpen(true);
    }
  }, [earnedBadge]);

  const handleClose = () => {
    setOpen(false);
    onDismiss();
  };

  if (!earnedBadge) return null;

  const definition = BADGES.find((b) => b.id === earnedBadge.badge_id);
  if (!definition) return null;
  const tier = definition.tiers.find((t) => t.tier === earnedBadge.tier);
  if (!tier) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm text-center border-0 rounded-3xl shadow-2xl bg-gradient-to-b from-white to-yellow-50">
        <DialogHeader>
          <div className="space-y-4">
            {/* Confetti placeholder */}
            <div className="flex justify-center gap-2">
              {["🎉", "⭐", "🎊", "✨", "🎯"].map((emoji, i) => (
                <span
                  key={i}
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            {/* Badge */}
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
              style={{
                backgroundColor: tier.color + "20",
                border: `3px solid ${tier.color}`,
              }}
            >
              {definition.icon}
            </div>

            <DialogTitle className="text-xl">Badge Earned!</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-900">
                  {definition.name}
                </p>
                <p
                  className="text-sm font-semibold capitalize"
                  style={{ color: tier.color }}
                >
                  {tier.label} Tier · {tier.icon}
                </p>
                <p className="text-xs text-gray-500">{definition.description}</p>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>

        <Button
          className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold"
          onClick={handleClose}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
};
