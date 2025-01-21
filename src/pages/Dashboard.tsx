import { Header } from "@/components/Header";
import { StatsSection } from "@/components/StatsSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match } from "@/types/match";

const Dashboard = () => {
  const { data: matches = [] } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Match[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <StatsSection matches={matches} />
    </div>
  );
};

export default Dashboard;