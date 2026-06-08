
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MatchForm } from "@/components/match/MatchForm";
import { EditMatchLoading } from "@/components/match/EditMatchLoading";
import { useMatchEdit } from "@/hooks/useMatchEdit";
import { Header } from "@/components/Header";

const EditMatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { match, isLoading, fetchMatch, handleSubmit } = useMatchEdit(id!);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-y-auto pb-24 pt-16">
<EditMatchLoading onBack={() => navigate(-1)} />
      </div>
    );
  }

  if (!match) return null;

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-16">
<div className="container mx-auto px-4 py-8 pb-24 sm:pb-28 pt-16">
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
          isBestOfFive: match.sets && match.sets.length > 3,
          reflectionPromptUsed: match.reflection_prompt_used || null,
          reflectionPromptLevel: match.reflection_prompt_level || null,
        }}
      />
      </div>
    </div>
  );
};

export default EditMatch;
