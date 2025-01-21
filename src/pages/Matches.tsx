import { Header } from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match } from "@/types/match";

const Matches = () => {
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
      <div className="mt-8">
        {matches.map((match) => (
          <div key={match.id} className="mb-4">
            {match.opponent_name} - {match.score}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;