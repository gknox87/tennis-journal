import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy, Target, Users, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { StreakWidget } from '@/components/challenges/StreakWidget';

const Challenges = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('daily');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const {
    dailyChallenges,
    weeklyChallenges,
    communityChallenges,
    userBadges,
    isLoading,
    error,
    claimChallengeReward,
  } = useChallenges();

  const handleClaim = async (challengeId: string) => {
    setClaimingId(challengeId);
    try {
      const result = await claimChallengeReward(challengeId);
      if (result.success) {
        toast({
          title: 'Reward Claimed!',
          description: 'Your points have been added to your balance.',
          className: 'bg-green-500 text-white border-green-600',
        });
      } else {
        toast({
          title: 'Failed to claim',
          description: result.error,
          variant: 'destructive',
        });
      }
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Group badges by category
  const badgesByCategory = userBadges.reduce((acc, ub) => {
    const cat = ub.badge?.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ub);
    return acc;
  }, {} as Record<string, typeof userBadges>);

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Streak Widget */}
        <div className="mb-6">
          <StreakWidget onTap={() => setActiveTab('badges')} />
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Challenges & Streaks</h1>
            <p className="text-sm text-gray-500">
              Complete challenges, earn rewards, and build streaks
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="rounded-xl mb-6">
            <TabsTrigger value="daily" className="rounded-lg gap-1">
              <Flame className="w-4 h-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-lg gap-1">
              <Target className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-lg gap-1">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="badges" className="rounded-lg gap-1">
              <Medal className="w-4 h-4" />
              Badges ({userBadges.length})
            </TabsTrigger>
          </TabsList>

          {/* Daily Challenges */}
          <TabsContent value="daily" className="space-y-3">
            {dailyChallenges.length === 0 ? (
              <EmptyState
                icon={Flame}
                title="No daily challenges"
                description="Check back tomorrow for new challenges!"
              />
            ) : (
              dailyChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClaim={handleClaim}
                  isClaiming={claimingId === challenge.id}
                />
              ))
            )}
          </TabsContent>

          {/* Weekly Challenges */}
          <TabsContent value="weekly" className="space-y-3">
            {weeklyChallenges.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No weekly challenges"
                description="Check back next Monday for new challenges!"
              />
            ) : (
              weeklyChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClaim={handleClaim}
                  isClaiming={claimingId === challenge.id}
                />
              ))
            )}
          </TabsContent>

          {/* Community Challenges */}
          <TabsContent value="community" className="space-y-3">
            {communityChallenges.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No community challenges"
                description="Community challenges will appear here soon!"
              />
            ) : (
              communityChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClaim={handleClaim}
                  isClaiming={claimingId === challenge.id}
                />
              ))
            )}
          </TabsContent>

          {/* Badges Wall */}
          <TabsContent value="badges">
            {userBadges.length === 0 ? (
              <EmptyState
                icon={Medal}
                title="No badges earned yet"
                description="Complete challenges to earn badges and showcase your achievements!"
              />
            ) : (
              <div className="space-y-6">
                {Object.entries(badgesByCategory).map(([category, badges]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {badges.map((ub) => (
                        <div
                          key={ub.id}
                          className="bg-white rounded-2xl border-2 border-yellow-300 p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-4xl mb-2">{ub.badge?.icon}</div>
                          <h4 className="font-bold text-sm">{ub.badge?.name}</h4>
                          <p
                            className="text-xs font-semibold capitalize"
                            style={{ color: ub.badge?.tier_color || '#888' }}
                          >
                            {ub.badge?.tier_label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(ub.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 bg-white/70 rounded-2xl border border-dashed">
      <Icon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}

export default Challenges;
