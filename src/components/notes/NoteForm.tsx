
import { Input } from "@/components/ui/input";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { NoteEditorToolbar } from "./NoteEditorToolbar";
import { NoteImagePreview } from "./NoteImagePreview";
import { NoteDialogFooter } from "./NoteDialogFooter";
import { PlayerNote } from "@/types/notes";
import { useEffect } from "react";

interface NoteFormProps {
  title: string;
  setTitle: (title: string) => void;
  imagePreview: string | null;
  editingNote: PlayerNote | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onDelete: () => void;
}

export const NoteForm = ({
  title,
  setTitle,
  imagePreview,
  editingNote,
  onImageUpload,
  onSubmit,
  onDelete,
}: NoteFormProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
  });

  useEffect(() => {
    if (editingNote) {
      editor?.commands.setContent(editingNote.content);
    } else {
      editor?.commands.setContent('');
    }
  }, [editingNote, editor]);

  return (
    <>
      <Input
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <NoteEditorToolbar 
        editor={editor} 
        onImageUpload={() => document.getElementById('image-upload')?.click()} 
      />
      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        onChange={onImageUpload}
      />
      <EditorContent editor={editor} />
      <NoteImagePreview 
        imagePreview={imagePreview} 
        editingNoteImageUrl={editingNote?.image_url} 
      />
      <NoteDialogFooter
        editingNote={editingNote}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />
    </>
  );
};
