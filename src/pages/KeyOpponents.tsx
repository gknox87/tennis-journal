
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { OpponentSearchSection } from "@/components/opponents/OpponentSearchSection";
import { OpponentList } from "@/components/opponents/OpponentList";
import { DeleteOpponentDialog } from "@/components/opponents/DeleteOpponentDialog";
import type { Opponent } from "@/types/opponents";
import { Header } from "@/components/Header";

const KeyOpponents = () => {
  const navigate = useNavigate();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteOpponentId, setDeleteOpponentId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOpponents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to view key opponents.",
          variant: "destructive",
        });
        return;
      }

      const { data: opponentsData, error } = await supabase
        .from("opponents")
        .select(`
          id,
          name,
          matches (
            is_win,
            date,
            score
          )
        `)
        .eq("is_key_opponent", true)
        .eq("user_id", session.user.id)
        .order('name');

      if (error) throw error;

      setOpponents(opponentsData || []);
    } catch (error) {
      console.error("Error fetching opponents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch key opponents.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOpponents();
  }, []);

  const handleAddOpponent = async (name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to add key opponents.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("opponents")
        .insert({
          name,
          user_id: session.user.id,
          is_key_opponent: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Key opponent added successfully.",
      });

      fetchOpponents();
    } catch (error) {
      console.error("Error adding opponent:", error);
      toast({
        title: "Error",
        description: "Failed to add key opponent.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOpponent = async () => {
    if (!deleteOpponentId) return;

    try {
      const { error } = await supabase
        .from("opponents")
        .delete()
        .eq("id", deleteOpponentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Key opponent deleted successfully.",
      });

      setDeleteOpponentId(null);
      fetchOpponents();
    } catch (error) {
      console.error("Error deleting opponent:", error);
      toast({
        title: "Error",
        description: "Failed to delete key opponent.",
        variant: "destructive",
      });
    }
  };

  const filteredOpponents = opponents.filter(opponent =>
    opponent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-8 pb-24 sm:pb-28">
      <OpponentSearchSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddOpponent={handleAddOpponent}
      />

      <OpponentList
        opponents={filteredOpponents}
        onDelete={(id) => setDeleteOpponentId(id)}
      />

      <DeleteOpponentDialog
        isOpen={!!deleteOpponentId}
        onClose={() => setDeleteOpponentId(null)}
        onConfirm={handleDeleteOpponent}
      />
      </div>
    </div>
  );
};

export default KeyOpponents;
