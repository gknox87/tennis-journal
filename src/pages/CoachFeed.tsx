import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useSport } from "@/context/SportContext";
import { MatchCard } from "@/components/MatchCard";
import { AnnotateMatch } from "@/components/coach/AnnotateMatch";
import { DrillPrescription } from "@/components/coach/DrillPrescription";
import { Trophy, Users, Calendar, Filter, ChevronRight, BarChart3 } from "lucide-react";

interface LinkedPlayer {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  link_id: string;
  shared_data: Record<string, boolean>;
  recent_matches: any[];
  total_entries: number;
}

interface Match {
  id: string;
  date: string;
  opponent_name?: string;
  score: string;
  is_win: boolean;
  sport_id: string;
  notes?: string;
}

export default function CoachFeed() {
  const navigate = useNavigate();
  const { isCoach, isLoading: rolesLoading } = useUserRoles();
  const { sport } = useSport();
  const [players, setPlayers] = useState<LinkedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "player">("date");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showAnnotate, setShowAnnotate] = useState(false);
  const [showPrescribe, setShowPrescribe] = useState(false);

  useEffect(() => {
    if (!rolesLoading && !isCoach) {
      navigate("/dashboard");
    }
  }, [rolesLoading, isCoach, navigate]);

  useEffect(() => {
    fetchLinkedPlayers();
  }, []);

  const fetchLinkedPlayers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: links } = await supabase
        .from("coach_player_links")
        .select("*")
        .eq("coach_id", session.user.id)
        .eq("status", "approved");

      if (!links || links.length === 0) {
        setIsLoading(false);
        return;
      }

      const playerIds = links.map(l => l.player_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", playerIds);

      const enrichedPlayers: LinkedPlayer[] = [];

      for (const link of links) {
        const profile = profiles?.find(p => p.id === link.player_id);
        if (!profile) continue;

        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

        let matchesQuery = supabase
          .from("matches")
          .select("*")
          .eq("user_id", link.player_id)
          .gte("date", cutoffDate.toISOString().split("T")[0])
          .order("date", { ascending: false });

        if (sportFilter !== "all") {
          matchesQuery = matchesQuery.eq("sport_id", sportFilter);
        }

        const { data: matches } = await matchesQuery;

        // Count total journal entries
        const { count: entriesCount } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", link.player_id);

        enrichedPlayers.push({
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          link_id: link.id,
          shared_data: (link.shared_data as Record<string, boolean>) || {},
          recent_matches: matches || [],
          total_entries: entriesCount || 0,
        });
      }

      setPlayers(enrichedPlayers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching linked players:", error);
      setIsLoading(false);
    }
  };

  const filteredPlayers = selectedPlayer === "all" 
    ? players 
    : players.filter(p => p.id === selectedPlayer);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "player") {
      return (a.full_name || a.username || "").localeCompare(b.full_name || b.username || "");
    }
    return 0;
  });

  const handleAnnotateMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowAnnotate(true);
  };

  const handlePrescribeDrill = (match: Match) => {
    setSelectedMatch(match);
    setShowPrescribe(true);
  };

  if (showAnnotate && selectedMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header userProfile={null} />
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Button variant="ghost" onClick={() => setShowAnnotate(false)} className="mb-4">
            ← Back to Feed
          </Button>
          <AnnotateMatch 
            match={selectedMatch} 
            onClose={() => setShowAnnotate(false)}
          />
        </div>
      </div>
    );
  }

  if (showPrescribe && selectedMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header userProfile={null} />
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Button variant="ghost" onClick={() => setShowPrescribe(false)} className="mb-4">
            ← Back to Feed
          </Button>
          <DrillPrescription 
            match={selectedMatch}
            onClose={() => setShowPrescribe(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Coach Feed
            </h1>
            <p className="text-muted-foreground mt-1">View all your athletes' recent activity</p>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            <Users className="h-4 w-4 mr-1" />
            {players.length} Athletes
          </Badge>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="All Athletes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Athletes</SelectItem>
                {players.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name || p.username || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="padel">Padel</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="squash">Squash</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "player")}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="player">Sort by Player</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchLinkedPlayers} className="w-full mt-4" variant="outline">
            Apply Filters
          </Button>
        </Card>

        {/* Players' Feeds */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : sortedPlayers.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-1">No athletes found</h3>
            <p className="text-muted-foreground">
              Connect with athletes through teams to see their matches here.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedPlayers.map(player => (
              <div key={player.id} className="space-y-3">
                {/* Player Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {(player.full_name || player.username || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{player.full_name || player.username}</h2>
                      <p className="text-sm text-muted-foreground">
                        {player.recent_matches.length} matches · {player.total_entries} total entries
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Recent Matches */}
                {player.recent_matches.length === 0 ? (
                  <Card className="p-4 text-center text-muted-foreground">
                    No matches in selected period
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {player.recent_matches.slice(0, 5).map(match => (
                      <Card key={match.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {new Date(match.date).toLocaleDateString()}
                              </Badge>
                              {match.opponent_name && (
                                <span className="text-sm font-medium">vs {match.opponent_name}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${match.is_win ? "text-green-600" : "text-red-600"}`}>
                                {match.is_win ? "W" : "L"}
                              </span>
                              <span className="text-sm text-muted-foreground">{match.score}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAnnotateMatch(match)}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Annotate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePrescribeDrill(match)}
                            >
                              <Trophy className="h-3 w-3 mr-1" />
                              Drill
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {player.recent_matches.length > 5 && (
                      <Button variant="ghost" className="w-full" onClick={() => navigate(`/athlete/${player.id}/matches`)}>
                        View all {player.id} matches
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
