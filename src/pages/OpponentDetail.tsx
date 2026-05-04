import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  Swords,
  Hash,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface MatchData {
  id: string;
  date: string;
  score: string;
  is_win: boolean;
  notes: string | null;
  final_set_tiebreak: boolean;
  court_type: string | null;
}

interface OpponentData {
  id: string;
  name: string;
  matches: MatchData[];
}

interface HeadToHeadStats {
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  lastMatch: MatchData | null;
  // Score analysis
  averageOpponentScore: number;
  averageMyScore: number;
  mostCommonScore: string;
  // Streaks
  currentStreak: { type: "win" | "loss" | null; count: number };
  longestWinStreak: number;
  longestLossStreak: number;
  // Recent form
  lastFiveResults: ("W" | "L")[];
  // Advanced
  tiebreaksPlayed: number;
  tiebreaksWon: number;
  straightSetWins: number;
  matchesOnClay: number;
  matchesOnHard: number;
  matchesOnGrass: number;
  // Match list sorted by date
  recentMatches: MatchData[];
}

const OpponentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [stats, setStats] = useState<HeadToHeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchOpponent();
  }, [id]);

  const fetchOpponent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError("Please log in");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("opponents")
        .select(`
          id,
          name,
          matches (
            id,
            date,
            score,
            is_win,
            notes,
            final_set_tiebreak,
            court_type
          )
        `)
        .eq("id", id)
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) {
        setError("Opponent not found");
        return;
      }

      setOpponent(data as OpponentData);
      setStats(calculateStats(data.matches || []));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load opponent";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (matches: MatchData[]): HeadToHeadStats => {
    const sorted = [...matches].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const wins = sorted.filter((m) => m.is_win).length;
    const losses = sorted.filter((m) => !m.is_win).length;
    const totalMatches = sorted.length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Score analysis
    let totalMyScore = 0;
    let totalOppScore = 0;
    let scoreCount = 0;
    const scoreCounts: Record<string, number> = {};

    sorted.forEach((m) => {
      if (!m.score) return;
      const setsArray = m.score.split(/,\s*|\s+/).filter(Boolean);
      setsArray.forEach((setStr) => {
        const parts = setStr.split("-");
        if (parts.length === 2) {
          const myScore = parseInt(m.is_win ? parts[0] : parts[1]);
          const oppScore = parseInt(m.is_win ? parts[1] : parts[0]);
          if (!isNaN(myScore) && !isNaN(oppScore)) {
            totalMyScore += myScore;
            totalOppScore += oppScore;
            scoreCount++;
          }
        }
        const clean = setStr.replace(/\s*\([^)]*\)/g, "").trim();
        scoreCounts[clean] = (scoreCounts[clean] || 0) + 1;
      });
    });

    const mostCommonScore =
      Object.entries(scoreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Streaks
    let currentStreak: { type: "win" | "loss" | null; count: number } = {
      type: null,
      count: 0,
    };
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let winStreak = 0;
    let lossStreak = 0;

    // Sorted chronologically for streak calculation
    const chronological = [...matches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < chronological.length; i++) {
      if (chronological[i].is_win) {
        winStreak++;
        lossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, winStreak);
      } else {
        lossStreak++;
        winStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, lossStreak);
      }
    }

    // Current streak from last match
    if (chronological.length > 0) {
      const lastMatch = chronological[chronological.length - 1];
      if (lastMatch.is_win) {
        currentStreak = { type: "win", count: winStreak };
      } else {
        currentStreak = { type: "loss", count: lossStreak };
      }
    }

    // Last five results (most recent first)
    const lastFiveResults = sorted.slice(0, 5).map((m) => (m.is_win ? "W" : "L"));

    // Tiebreaks
    const tiebreaksPlayed = sorted.filter((m) => m.final_set_tiebreak).length;
    const tiebreaksWon = sorted.filter(
      (m) => m.final_set_tiebreak && m.is_win
    ).length;

    // Straight set wins
    const straightSetWins = sorted.filter((m) => {
      if (!m.is_win || !m.score) return false;
      const sets = m.score.split(/,\s*|\s+/).filter(Boolean);
      const winsInSets = sets.filter((s) => {
        const parts = s.split("-");
        if (parts.length !== 2) return false;
        const my = parseInt(parts[0]);
        const opp = parseInt(parts[1]);
        return !isNaN(my) && !isNaN(opp) && my > opp;
      });
      const totalSets = sets.length;
      return winsInSets.length === totalSets && totalSets > 0;
    }).length;

    // Court breakdown
    const matchesOnClay = sorted.filter(
      (m) => m.court_type?.toLowerCase().includes("clay")
    ).length;
    const matchesOnHard = sorted.filter(
      (m) =>
        m.court_type?.toLowerCase().includes("hard") ||
        m.court_type?.toLowerCase().includes("acrylic")
    ).length;
    const matchesOnGrass = sorted.filter(
      (m) =>
        m.court_type?.toLowerCase().includes("grass") ||
        m.court_type?.toLowerCase().includes("carpet")
    ).length;

    return {
      wins,
      losses,
      totalMatches,
      winRate,
      lastMatch: sorted[0] || null,
      averageMyScore: scoreCount > 0 ? Math.round((totalMyScore / scoreCount) * 10) / 10 : 0,
      averageOpponentScore: scoreCount > 0 ? Math.round((totalOppScore / scoreCount) * 10) / 10 : 0,
      mostCommonScore,
      currentStreak,
      longestWinStreak,
      longestLossStreak,
      lastFiveResults,
      tiebreaksPlayed,
      tiebreaksWon,
      straightSetWins,
      matchesOnClay,
      matchesOnHard,
      matchesOnGrass,
      recentMatches: sorted.slice(0, 5),
    };
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return "text-emerald-600";
    if (rate >= 50) return "text-blue-600";
    if (rate >= 30) return "text-orange-600";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <Header userProfile={null} />
        <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
          <div className="space-y-4">
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-60 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !opponent || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <Header userProfile={null} />
        <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl text-center">
          <Button variant="ghost" className="mb-8" onClick={() => navigate("/key-opponents")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Opponents
          </Button>
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-red-500">{error || "Opponent not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/key-opponents")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Opponents
        </Button>

        {/* ─── HERO HEADER ─── */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white border-0 rounded-3xl shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {opponent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{opponent.name}</h1>
                  <p className="text-white/70 text-sm">
                    {stats.totalMatches} meetings recorded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="text-center">
                  <span className="text-3xl font-extrabold">{stats.wins}</span>
                  <p className="text-xs text-white/70">Wins</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <span className="text-3xl font-extrabold">{stats.losses}</span>
                  <p className="text-xs text-white/70">Losses</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <span className={`text-3xl font-extrabold ${getWinRateColor(stats.winRate)}`}>
                    {stats.winRate}%
                  </span>
                  <p className="text-xs text-white/70">Win Rate</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center bg-white/10 rounded-2xl p-4">
              <Swords className="w-8 h-8 text-white/80 mb-2" />
              <div className="flex gap-1">
                {stats.lastFiveResults.map((result, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      result === "W"
                        ? "bg-emerald-400 text-emerald-900"
                        : "bg-red-400 text-red-900"
                    }`}
                    title={`Match ${stats.lastFiveResults.length - i}: ${result === "W" ? "Won" : "Lost"}`}
                  >
                    {result}
                  </div>
                ))}
                {Array.from({ length: 5 - stats.lastFiveResults.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-4 h-4 rounded-full bg-white/20"
                  />
                ))}
              </div>
              <p className="text-xs text-white/60 mt-1">Last 5</p>
            </div>
          </div>

          {/* Win rate bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>0%</span>
              <span>Win Rate</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* ─── STREAKS & KEY STATS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Current Streak */}
          <Card className="p-5 border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              {stats.currentStreak.type === "win" ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <h3 className="font-bold text-gray-800">Current Streak</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold ${
                stats.currentStreak.type === "win" ? "text-emerald-600" : "text-red-500"
              }`}>
                {stats.currentStreak.count}
              </span>
              <span className="text-lg text-gray-500">
                {stats.currentStreak.type === "win" ? "wins in a row" : "losses in a row"}
              </span>
            </div>
          </Card>

          {/* Best Streaks */}
          <Card className="p-5 border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-800">Best Streaks</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Best Win Streak</p>
                <span className="text-2xl font-extrabold text-emerald-600">
                  {stats.longestWinStreak}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Worst Loss Streak</p>
                <span className="text-2xl font-extrabold text-red-500">
                  {stats.longestLossStreak}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── SCORE ANALYSIS ─── */}
        <Card className="p-5 mb-6 border-0 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-gray-800">Score Analysis</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Avg. Score (You)</p>
              <span className="text-xl font-extrabold text-blue-600">
                {stats.averageMyScore || "-"}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">per set</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Avg. Score (Opponent)</p>
              <span className="text-xl font-extrabold text-red-500">
                {stats.averageOpponentScore || "-"}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">per set</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Most Common</p>
              <span className="text-xl font-extrabold text-gray-800">
                {stats.mostCommonScore}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">set score</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Straight-Set Wins</p>
              <span className="text-xl font-extrabold text-emerald-600">
                {stats.straightSetWins}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">matches</p>
            </div>
          </div>

          {/* Tiebreaks row */}
          {stats.tiebreaksPlayed > 0 && (
            <div className="mt-4 bg-amber-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-amber-800">
                <Zap className="w-4 h-4 inline mr-1" />
                {stats.tiebreaksPlayed} tiebreak{stats.tiebreaksPlayed > 1 ? "s" : ""} played
              </span>
              <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-200">
                {stats.tiebreaksWon} won ({stats.tiebreaksPlayed > 0 ? Math.round((stats.tiebreaksWon / stats.tiebreaksPlayed) * 100) : 0}%)
              </Badge>
            </div>
          )}
        </Card>

        {/* ─── LAST 5 MEETINGS ─── */}
        <Card className="p-5 mb-6 border-0 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">Last 5 Meetings</h3>
          </div>

          {stats.recentMatches.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p>No matches recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentMatches.map((match, i) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/match/${match.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        match.is_win
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {match.is_win ? "W" : "L"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {format(parseISO(match.date), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {match.court_type && `${match.court_type} · `}
                        {match.final_set_tiebreak && "Tiebreak Decider · "}
                        {match.notes
                          ? match.notes.length > 50
                            ? match.notes.slice(0, 50) + "..."
                            : match.notes
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-800">
                      {match.score || "-"}
                    </span>
                    <Badge
                      className={
                        match.is_win
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {match.is_win ? "Won" : "Lost"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ─── COURT BREAKDOWN ─── */}
        {(stats.matchesOnClay > 0 || stats.matchesOnHard > 0 || stats.matchesOnGrass > 0) && (
          <Card className="p-5 mb-6 border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-800">Court Breakdown</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stats.matchesOnClay > 0 && (
                <div className="text-center bg-orange-50 rounded-xl p-3">
                  <span className="text-2xl font-extrabold text-orange-600">
                    {stats.matchesOnClay}
                  </span>
                  <p className="text-xs text-gray-500">Clay</p>
                </div>
              )}
              {stats.matchesOnHard > 0 && (
                <div className="text-center bg-blue-50 rounded-xl p-3">
                  <span className="text-2xl font-extrabold text-blue-600">
                    {stats.matchesOnHard}
                  </span>
                  <p className="text-xs text-gray-500">Hard</p>
                </div>
              )}
              {stats.matchesOnGrass > 0 && (
                <div className="text-center bg-emerald-50 rounded-xl p-3">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {stats.matchesOnGrass}
                  </span>
                  <p className="text-xs text-gray-500">Grass</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OpponentDetail;
