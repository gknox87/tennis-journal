
interface NoteImagePreviewProps {
  imagePreview: string | null;
  editingNoteImageUrl?: string | null;
}

export const NoteImagePreview = ({ imagePreview, editingNoteImageUrl }: NoteImagePreviewProps) => {
  const imageUrl = imagePreview || editingNoteImageUrl;
  
  if (!imageUrl) return null;

  return (
    <div className="mt-4 relative">
      <img
        src={imageUrl}
        alt="Note image"
        className="max-h-48 rounded-md object-cover w-full"
        onError={(e) => {
          console.error('Error loading image:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};
