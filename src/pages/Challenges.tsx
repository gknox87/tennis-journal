import { useState } from 'react';
import { Flame, Trophy, Target, Users, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSport } from '@/context/SportContext';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { StreakWidget } from '@/components/challenges/StreakWidget';

const Challenges = () => {
  const { sport } = useSport();
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
    refreshChallenges,
    refreshBadges,
  } = useChallenges();

  const handleClaim = async (challengeId: string) => {
    setClaimingId(challengeId);
    try {
      const result = await claimChallengeReward(challengeId);
      if (result.success) {
        toast({
          title: 'Reward claimed',
          description: 'Your points have been added to your balance.',
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
      <div className="min-h-full bg-background flex items-center justify-center overflow-y-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl text-center space-y-4">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-destructive">{error}</p>
          <Button onClick={() => void Promise.all([refreshChallenges(), refreshBadges()])}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const badgesByCategory = userBadges.reduce((acc, ub) => {
    const cat = ub.badge?.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ub);
    return acc;
  }, {} as Record<string, typeof userBadges>);

  const totalActive =
    dailyChallenges.length + weeklyChallenges.length + communityChallenges.length;

  return (
    <div className="min-h-full bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Challenges & Streaks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Earn rewards and stay consistent with {sport.shortName}
            {totalActive > 0 && (
              <> · {totalActive} active challenge{totalActive !== 1 ? 's' : ''} · {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Your streak
          </h2>
          <StreakWidget />
        </section>

        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="daily" className="gap-1.5 py-2.5">
                <Flame className="w-4 h-4 shrink-0" />
                Daily ({dailyChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-1.5 py-2.5">
                <Target className="w-4 h-4 shrink-0" />
                Weekly ({weeklyChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-1.5 py-2.5">
                <Users className="w-4 h-4 shrink-0" />
                Community ({communityChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="badges" className="gap-1.5 py-2.5">
                <Medal className="w-4 h-4 shrink-0" />
                Badges ({userBadges.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4 space-y-3">
              {dailyChallenges.length === 0 ? (
                <EmptyState
                  icon={Flame}
                  title="No daily challenges"
                  description="Check back tomorrow for new challenges."
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

            <TabsContent value="weekly" className="mt-4 space-y-3">
              {weeklyChallenges.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="No weekly challenges"
                  description="Check back next Monday for new challenges."
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

            <TabsContent value="community" className="mt-4 space-y-3">
              {communityChallenges.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No community challenges"
                  description="Community challenges will appear here soon."
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

            <TabsContent value="badges" className="mt-4">
              {userBadges.length === 0 ? (
                <EmptyState
                  icon={Medal}
                  title="No badges earned yet"
                  description="Complete challenges to earn badges and showcase your achievements."
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(badgesByCategory).map(([category, badges]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {badges.map((ub) => (
                          <Card
                            key={ub.id}
                            className="p-4 text-center border-amber-200/60 bg-white/80 hover:shadow-md transition-shadow"
                          >
                            <div className="text-4xl mb-2">{ub.badge?.icon}</div>
                            <h4 className="font-bold text-sm">{ub.badge?.name}</h4>
                            <p
                              className="text-xs font-semibold capitalize mt-0.5"
                              style={{ color: ub.badge?.tier_color || undefined }}
                            >
                              {ub.badge?.tier_label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(ub.earned_at).toLocaleDateString()}
                            </p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
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
    <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-amber-50/80 to-orange-50/80">
      <Icon className="h-12 w-12 text-amber-400/60 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">{description}</p>
    </Card>
  );
}

export default Challenges;
