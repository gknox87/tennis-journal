
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MatchForm } from "@/components/match/MatchForm";
import { EditMatchLoading } from "@/components/match/EditMatchLoading";
import { useMatchEdit } from "@/hooks/useMatchEdit";

const EditMatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { match, isLoading, fetchMatch, handleSubmit } = useMatchEdit(id!);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  if (isLoading) {
    return <EditMatchLoading onBack={() => navigate(-1)} />;
  }

  if (!match) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">Edit Match</h1>

      <MatchForm
        onSubmit={handleSubmit}
        initialData={{
          date: new Date(match.date),
          opponent: match.opponent_name,
          courtType: match.court_type || "",
          sets: match.sets || [],
          isWin: match.is_win,
          notes: match.notes || "",
          finalSetTiebreak: match.final_set_tiebreak || false,
        }}
      />
    </div>
  );
};

export default EditMatch;
