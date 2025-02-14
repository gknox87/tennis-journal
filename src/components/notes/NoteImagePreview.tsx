
interface NoteImagePreviewProps {
  imagePreview: string | null;
  editingNoteImageUrl?: string | null;
}

export const NoteImagePreview = ({ imagePreview, editingNoteImageUrl }: NoteImagePreviewProps) => {
  if (!imagePreview && !editingNoteImageUrl) return null;

  return (
    <div className="mt-4">
      <img
        src={imagePreview || editingNoteImageUrl}
        alt="Note image"
        className="max-h-48 rounded-md object-cover w-full"
      />
    </div>
  );
};
