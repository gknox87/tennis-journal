import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSport } from "@/context/SportContext";
import { Trophy, Filter, Check, Calendar, Search, AlertCircle } from "lucide-react";

interface Drill {
  id: string;
  sport_id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  instructions: string;
}

interface Match {
  id: string;
  date: string;
  opponent_name?: string;
  score: string;
  is_win: boolean;
  sport_id: string;
  user_id?: string;
}

interface DrillPrescriptionProps {
  match?: Match;
  playerId?: string;
  onClose: () => void;
}

export function DrillPrescription({ match, playerId, onClose }: DrillPrescriptionProps) {
  const { toast } = useToast();
  const { sport } = useSport();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDrills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [drills, categoryFilter, difficultyFilter, searchQuery]);

  const fetchDrills = async () => {
    try {
      const sportId = match?.sport_id || sport.id;
      const { data, error } = await supabase
        .from("drills")
        .select("*")
        .eq("sport_id", sportId)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setDrills(data || []);
    } catch (error) {
      console.error("Error fetching drills:", error);
      toast({
        title: "Error",
        description: "Could not load drill library",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...drills];

    if (categoryFilter !== "all") {
      result = result.filter(d => d.category === categoryFilter);
    }

    if (difficultyFilter !== "all") {
      result = result.filter(d => d.difficulty === difficultyFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query)
      );
    }

    setFilteredDrills(result);
  };

  const categories = [...new Set(drills.map(d => d.category))];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const prescribeDrill = async () => {
    if (!selectedDrill) return;

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Determine target player
      const targetPlayerId = playerId || match?.user_id;
      if (!targetPlayerId) throw new Error("No player specified");

      // Get athlete's coach link info
      const { data: linkData } = await supabase
        .from("coach_player_links")
        .select("*")
        .eq("coach_id", session.user.id)
        .eq("player_id", targetPlayerId)
        .eq("status", "approved")
        .single();

      if (!linkData) throw new Error("No link to this athlete");

      const prescription = {
        coach_id: session.user.id,
        player_id: targetPlayerId,
        match_id: match?.id || null,
        drill_id: selectedDrill.id,
        notes: notes || null,
        due_date: dueDate || null,
        completed: false,
      };

      const { error } = await supabase
        .from("coach_drill_prescriptions")
        .insert(prescription);

      if (error) throw error;

      // Trigger notification via edge function
      await supabase.functions.invoke("notify-athlete", {
        body: {
          player_id: targetPlayerId,
          type: "drill_prescription",
          title: "New drill prescribed",
          body: `Your coach assigned: ${selectedDrill.name}`,
          link: `/drills`,
        },
      });

      toast({ title: "Drill prescribed", description: "Athlete will be notified" });
      onClose();
    } catch (error) {
      console.error("Error prescribing drill:", error);
      toast({
        title: "Error",
        description: "Could not prescribe drill",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-yellow-100 text-yellow-700";
      case "advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-lg">Prescribe Drill</h3>
        </div>

        {/* Selected Drill Summary */}
        {selectedDrill && (
          <Card className="p-3 bg-purple-50 border-purple-200 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{selectedDrill.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedDrill.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{selectedDrill.category}</Badge>
                  <Badge className={`text-xs ${getDifficultyColor(selectedDrill.difficulty)}`}>
                    {selectedDrill.difficulty}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDrill(null)}>
                Change
              </Button>
            </div>
          </Card>
        )}

        {/* Drill Selection Form */}
        {!selectedDrill && (
          <>
            {/* Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drills..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Drill List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredDrills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No drills found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredDrills.map(drill => (
                  <button
                    key={drill.id}
                    onClick={() => setSelectedDrill(drill)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{drill.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{drill.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">{drill.category}</Badge>
                        <Badge className={`text-xs ${getDifficultyColor(drill.difficulty)}`}>
                          {drill.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Prescription Form */}
        {selectedDrill && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add specific focus areas or instructions..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Due Date (optional)</label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={prescribeDrill} 
                disabled={isSaving}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? "Prescribing..." : "Prescribe to Athlete"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
