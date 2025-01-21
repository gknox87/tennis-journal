import { useState } from "react";
import { Tag as TagIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  matchId: string;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export const TagInput = ({ matchId, selectedTags, onTagsChange }: TagInputProps) => {
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      // First, try to create the tag if it doesn't exist
      const { data: existingTag } = await supabase
        .from("tags")
        .select("*")
        .eq("name", newTag.trim())
        .single();

      let tagId;
      if (!existingTag) {
        const { data: newTagData, error: createError } = await supabase
          .from("tags")
          .insert({ name: newTag.trim() })
          .select()
          .single();

        if (createError) throw createError;
        tagId = newTagData.id;
      } else {
        tagId = existingTag.id;
      }

      // Add the tag to the match
      const { error: linkError } = await supabase
        .from("match_tags")
        .insert({ match_id: matchId, tag_id: tagId });

      if (linkError) throw linkError;

      // Update the UI
      onTagsChange([...selectedTags, { id: tagId, name: newTag.trim() }]);
      setNewTag("");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from("match_tags")
        .delete()
        .eq("match_id", matchId)
        .eq("tag_id", tagId);

      if (error) throw error;

      onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error("Error removing tag:", error);
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleAddTag} className="flex gap-2">
        <div className="relative flex-1">
          <TagIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Add
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag.name}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemoveTag(tag.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};