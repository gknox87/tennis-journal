
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { ScheduledEvent } from "@/types/calendar";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Camera } from "lucide-react";
import { useState, memo, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const MemoizedStatsSection = memo(StatsSection);
const MemoizedImprovementChecklist = memo(ImprovementChecklist);

interface DashboardContentProps {
  matches: Match[];
  filteredMatches: Match[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  playerNotes: PlayerNote[];
  onMatchDelete: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const DashboardContent = ({
  matches,
  filteredMatches,
  searchTerm,
  onSearchChange,
  playerNotes,
  onMatchDelete,
  onDeleteNote,
}: DashboardContentProps) => {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduledEvent[]>([]);
  const navigate = useNavigate();

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;

      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const handleEditNote = (note: PlayerNote) => {
    setEditingNote(note);
    setShowNotesDialog(true);
  };

  const recentMatches = filteredMatches.slice(0, 9);

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="relative bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl md:rounded-3xl -z-10"></div>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }>
          <MemoizedStatsSection matches={matches} />
        </Suspense>
      </div>

      {/* Serve Analysis Quick Access */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Activity className="h-6 w-6" />
            Analyze Your Serve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-green-700 mb-2">
                Get instant biomechanical feedback on your tennis serve with AI-powered analysis.
              </p>
              <p className="text-sm text-green-600">
                Record live, upload video, or analyze from different angles.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/serve-analysis')}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 whitespace-nowrap"
            >
              <Camera className="h-4 w-4" />
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }>
          <UpcomingEvents events={upcomingEvents} />
        </Suspense>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold gradient-text mb-6 text-center">🎯 Level Up Your Game</h2>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        }>
          <MemoizedImprovementChecklist />
        </Suspense>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      }>
        <NotesSection
          playerNotes={playerNotes}
          onAddNote={() => {
            setEditingNote(null);
            setShowNotesDialog(true);
          }}
          onEditNote={handleEditNote}
          onDeleteNote={onDeleteNote}
        />
      </Suspense>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }>
        <MatchList
          matches={recentMatches}
          onMatchDelete={onMatchDelete}
        />
      </Suspense>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
        onDelete={onDeleteNote}
      />
    </div>
  );
};
