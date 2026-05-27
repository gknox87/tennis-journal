import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, Trophy, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { SPORTS } from "@/constants/sports";

interface PartnerStats {
  id: string;
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  setsWon: number;
  setsLost: number;
}

interface DoublesStats {
  totalDoublesMatches: number;
  doublesWins: number;
  doublesLosses: number;
  doublesWinRate: number;
  totalSetsWon: number;
  totalSetsLost: number;
  bestPartner: PartnerStats | null;
  mostPlayedPartner: PartnerStats | null;
}

const PadelStats = () => {
  const navigate = useNavigate();
  const { sport } = useSport();
  const [loading, setLoading] = useState(true);
  const [doublesStats, setDoublesStats] = useState<DoublesStats | null>(null);
  const [partners, setPartners] = useState<PartnerStats[]>([]);
  const [courtBreakdown, setCourtBreakdown] = useState<Record<string, { played: number; wins: number }>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (sport.id !== "padel") {
      navigate("/dashboard");
      return;
    }
    loadPartnerStats();
  }, [sport.id, navigate]);

  const loadPartnerStats = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get all doubles matches for padel
      const { data: doublesMatches, error: matchesError } = await supabase
        .from("matches")
        .select(`
          id,
          score,
          is_win,
          court_type,
          partner_id,
          sets,
          date
        `)
        .eq("user_id", session.user.id)
        .eq("sport_id", "padel")
        .eq("match_type", "doubles")
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      // Calculate doubles stats
      const totalDoubles = doublesMatches?.length || 0;
      const doublesWins = doublesMatches?.filter(m => m.is_win).length || 0;
      const doublesLosses = totalDoubles - doublesWins;
      const doublesWinRate = totalDoubles > 0 ? (doublesWins / totalDoubles) * 100 : 0;

      // Calculate court breakdown
      const courtStats: Record<string, { played: number; wins: number }> = {};
      doublesMatches?.forEach(match => {
        const court = match.court_type || "Unknown";
        if (!courtStats[court]) {
          courtStats[court] = { played: 0, wins: 0 };
        }
        courtStats[court].played++;
        if (match.is_win) courtStats[court].wins++;
      });

      // Get partners and their stats
      const partnerMap = new Map<string, PartnerStats>();
      
      if (doublesMatches) {
        for (const match of doublesMatches) {
          if (match.partner_id) {
            const existing = partnerMap.get(match.partner_id);
            if (existing) {
              existing.matchesPlayed++;
              if (match.is_win) existing.wins++;
              else existing.losses++;
            } else {
              partnerMap.set(match.partner_id, {
                id: match.partner_id,
                name: "Partner", // Will be populated from partners table
                matchesPlayed: 1,
                wins: match.is_win ? 1 : 0,
                losses: match.is_win ? 0 : 1,
                winRate: match.is_win ? 100 : 0,
                setsWon: 0,
                setsLost: 0,
              });
            }
          }
        }
      }

      // Fetch partner names from partners table
      const partnerIds = Array.from(partnerMap.keys());
      if (partnerIds.length > 0) {
        const { data: partnerData } = await supabase
          .from("partners")
          .select("id, name")
          .in("id", partnerIds);
        
        if (partnerData) {
          partnerData.forEach(p => {
            const stats = partnerMap.get(p.id);
            if (stats) {
              stats.name = p.name;
              stats.winRate = stats.matchesPlayed > 0 
                ? (stats.wins / stats.matchesPlayed) * 100 
                : 0;
            }
          });
        }
      }

      const partnerList = Array.from(partnerMap.values());
      
      // Find best and most played partners
      const bestPartner = partnerList.length > 0 
        ? partnerList.reduce((best, p) => p.winRate > best.winRate ? p : best, partnerList[0])
        : null;
      const mostPlayedPartner = partnerList.length > 0
        ? partnerList.reduce((most, p) => p.matchesPlayed > most.matchesPlayed ? p : most, partnerList[0])
        : null;

      setDoublesStats({
        totalDoublesMatches: totalDoubles,
        doublesWins,
        doublesLosses,
        doublesWinRate,
        totalSetsWon: 0, // Calculated from score parsing if needed
        totalSetsLost: 0,
        bestPartner,
        mostPlayedPartner,
      });

      setPartners(partnerList);
      setCourtBreakdown(courtStats);
    } catch (error) {
      console.error("Error loading partner stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header userProfile={null} />
      
      {/* Back Navigation */}
      <div className="relative z-10 container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 pb-24 sm:pb-28 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            🏸 Padel First-Class Support
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Padel <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Doubles Stats</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Track your doubles performance, partner statistics, and court-specific results.
          </p>
        </div>

        {/* Doubles Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Doubles</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{doublesStats?.totalDoublesMatches || 0}</p>
          </Card>

          <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-green-100">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Doubles Wins</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{doublesStats?.doublesWins || 0}</p>
          </Card>

          <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Win Rate</span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {doublesStats?.doublesWinRate.toFixed(1) || 0}%
            </p>
          </Card>

          <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-amber-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Partners</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{partners.length}</p>
          </Card>
        </div>

        {/* Best Partner & Most Played */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {doublesStats?.bestPartner && (
            <Card className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 to-yellow-50/50 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-bold text-gray-800">Best Partner</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{doublesStats.bestPartner.name}</p>
                  <p className="text-gray-500 text-sm">{doublesStats.bestPartner.matchesPlayed} matches together</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-green-600">{doublesStats.bestPartner.winRate.toFixed(0)}%</p>
                  <p className="text-gray-500 text-xs">win rate</p>
                </div>
              </div>
            </Card>
          )}

          {doublesStats?.mostPlayedPartner && (
            <Card className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 backdrop-blur-sm border-2 border-blue-200/50 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤝</span>
                <h3 className="text-lg font-bold text-gray-800">Most Played</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{doublesStats.mostPlayedPartner.name}</p>
                  <p className="text-gray-500 text-sm">{doublesStats.mostPlayedPartner.matchesPlayed} matches</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-600">{doublesStats.mostPlayedPartner.winRate.toFixed(0)}%</p>
                  <p className="text-gray-500 text-xs">win rate</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Court Breakdown */}
        {Object.keys(courtBreakdown).length > 0 && (
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Court Surface Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(courtBreakdown).map(([court, stats]) => (
                <div key={court} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <span className="font-semibold text-gray-700">{court}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500">{stats.played} matches</span>
                    <span className="font-bold text-gray-900">{((stats.wins / stats.played) * 100).toFixed(0)}% wins</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Partners List */}
        {partners.length > 0 && (
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">All Partners</h3>
            <div className="space-y-3">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{partner.name}</p>
                      <p className="text-sm text-gray-500">{partner.matchesPlayed} matches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900">{partner.winRate.toFixed(0)}%</p>
                    <p className="text-sm text-gray-500">{partner.wins}W - {partner.losses}L</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {doublesStats?.totalDoublesMatches === 0 && (
          <Card className="p-12 rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-white/30 shadow-xl text-center">
            <div className="text-6xl mb-4">🏸</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Doubles Matches Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start logging your padel doubles matches to see your partner stats here. 
              Toggle to doubles mode when adding a match and select your partner.
            </p>
            <Button
              onClick={() => navigate("/add-match")}
              className="h-12 px-8 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Log Your First Doubles Match
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PadelStats;