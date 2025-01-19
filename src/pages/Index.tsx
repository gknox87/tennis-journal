import { AddMatchButton } from "@/components/AddMatchButton";
import { MatchCard } from "@/components/MatchCard";
import { StatsOverview } from "@/components/StatsOverview";

const Index = () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tennis Match Journal</h1>
        <AddMatchButton />
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