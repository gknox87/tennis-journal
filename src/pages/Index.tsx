import { AddMatchButton } from "@/components/AddMatchButton";
import { MatchCard } from "@/components/MatchCard";
import { StatsOverview } from "@/components/StatsOverview";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  // Mock data - would be replaced with real data in future iterations
  const recentMatches = [
    {
      date: "2024-02-20",
      opponent: "John Smith",
      score: "6-4, 7-5",
      isWin: true,
    },
    {
      date: "2024-02-18",
      opponent: "Maria Garcia",
      score: "3-6, 4-6",
      isWin: false,
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tennis Match Journal</h1>
        <div className="flex gap-4">
          <AddMatchButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <StatsOverview totalMatches={10} winRate={60} />
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentMatches.map((match, index) => (
          <MatchCard key={index} {...match} />
        ))}
      </div>
    </div>
  );
};

export default Index;