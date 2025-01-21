import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Opponent {
  id: string;
  name: string;
  created_at: string;
}

const KeyOpponents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeyOpponents = async () => {
      try {
        const { data, error } = await supabase
          .from('opponents')
          .select('*')
          .eq('is_key_opponent', true)
          .order('name');

        if (error) throw error;
        setOpponents(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch key opponents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKeyOpponents();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Key Opponents</h1>
      </div>

      {loading ? (
        <p>Loading key opponents...</p>
      ) : opponents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No key opponents found. Add key opponents when recording matches.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opponents.map((opponent) => (
            <Card key={opponent.id}>
              <CardHeader>
                <CardTitle>{opponent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Added on {new Date(opponent.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyOpponents;