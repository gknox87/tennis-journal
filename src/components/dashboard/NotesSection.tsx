
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, BookOpen, Sparkles } from "lucide-react";
import { useSport } from "@/context/SportContext";
import { PlayerNote } from "@/types/notes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface NotesSectionProps {
  playerNotes: PlayerNote[];
  onAddNote: () => void;
  onEditNote: (note: PlayerNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesSection = ({
  playerNotes,
  onAddNote,
  onEditNote,
  onDeleteNote
}: NotesSectionProps) => {
  const { sport } = useSport();

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl md:text-2xl font-bold gradient-text">{sport.terminology.matchLabel} Journal</h2>
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground mb-6">Capture your {sport.name.toLowerCase()} insights and improve your game</p>
        
        <Button 
          onClick={onAddNote} 
          className="btn-primary text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Entry
        </Button>
      </div>

      {playerNotes.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {playerNotes.map((note, index) => (
            <Card 
              key={note.id} 
              className="match-card cursor-pointer group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0"
              onClick={() => onEditNote(note)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3 space-y-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold line-clamp-1 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote(note);
                      }}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-100 rounded-full" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()} className="modal-content border-0">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-800">Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to delete this journal entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-xl"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNote(note.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 rounded-xl"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {stripHtmlTags(note.content)}
                </p>
                <div className="mt-3 flex items-center text-xs text-gray-400">
                  <span>Tap to read more</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glassmorphism border-2 border-dashed border-purple-200 p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Tennis Journal</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Record your match insights, opponent analysis, and improvement notes to elevate your game!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
