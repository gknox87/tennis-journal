import { Trophy, Flame, Target, Users, Check, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChallengeWithProgress } from '@/hooks/useChallenges';

interface ChallengeCardProps {
  challenge: ChallengeWithProgress;
  onClaim?: (challengeId: string) => void;
  isClaiming?: boolean;
}

const typeConfig = {
  daily: {
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Daily',
  },
  weekly: {
    icon: Target,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Weekly',
  },
  community: {
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Community',
  },
};

const stateConfig = {
  available: {
    bgClass: 'bg-white',
    borderClass: 'border-gray-200',
    opacity: '',
  },
  in_progress: {
    bgClass: 'bg-amber-50/50',
    borderClass: 'border-amber-200',
    opacity: '',
  },
  completed: {
    bgClass: 'bg-green-50/50',
    borderClass: 'border-green-200',
    opacity: '',
  },
  expired: {
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-100',
    opacity: 'opacity-60',
  },
};

export function ChallengeCard({ challenge, onClaim, isClaiming }: ChallengeCardProps) {
  const type = typeConfig[challenge.type];
  const state = stateConfig[challenge.state];
  const TypeIcon = type.icon;

  const canClaim = challenge.state === 'completed' && !challenge.user_progress?.claimed_at;
  const isClaimed = !!challenge.user_progress?.claimed_at;

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 p-4 transition-all duration-300',
        'hover:shadow-md',
        state.bgClass,
        state.borderClass,
        state.opacity
      )}
    >
      {/* Header: Type badge + Reward */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', type.bgColor)}>
            <TypeIcon className={cn('w-4 h-4', type.color)} />
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', type.bgColor, type.color)}>
            {type.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">{challenge.reward_points}</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="font-bold text-gray-900 mb-1">{challenge.title}</h3>
      {challenge.description && (
        <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
      )}

      {/* Target Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">
            {challenge.target_type.replace('_', ' ')}
          </span>
          <span className="font-semibold">
            {challenge.user_progress?.progress || 0} / {challenge.target_value}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              challenge.state === 'completed' ? 'bg-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
            )}
            style={{ width: `${challenge.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Footer: CTA Button */}
      <div className="flex items-center justify-between">
        {challenge.state === 'expired' ? (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Expired</span>
          </div>
        ) : challenge.state === 'completed' ? (
          isClaimed ? (
            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <Check className="w-4 h-4" />
              <span>Claimed</span>
            </div>
          ) : canClaim ? (
            <Button
              size="sm"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold hover:from-amber-500 hover:to-orange-600"
              onClick={() => onClaim?.(challenge.id)}
              disabled={isClaiming}
            >
              {isClaiming ? 'Claiming...' : 'Claim Reward'}
            </Button>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Lock className="w-4 h-4" />
              <span>Complete to claim</span>
            </div>
          )
        ) : (
          <div className="text-xs text-gray-400">
            {challenge.progress_percentage}% complete
          </div>
        )}

        {/* State indicator */}
        {challenge.state === 'completed' && !isClaimed && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
