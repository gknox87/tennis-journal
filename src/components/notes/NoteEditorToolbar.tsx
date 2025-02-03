import { Button } from "@/components/ui/button";
import { Bold as BoldIcon, Underline as UnderlineIcon, Highlighter, ImagePlus } from "lucide-react";
import { Editor } from '@tiptap/react';

interface NoteEditorToolbarProps {
  editor: Editor | null;
  onImageUpload: () => void;
}

export const NoteEditorToolbar = ({ editor, onImageUpload }: NoteEditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 mb-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'bg-accent' : ''}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'bg-accent' : ''}
      >
        <Highlighter className="h-4 w-4" />
      </Button>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative"
          onClick={onImageUpload}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};