import { useState, useEffect } from "react";
import { Tag as TagIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export const TagInput = ({ selectedTags, onTagsChange }: TagInputProps) => {
  const [input, setInput] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .order("name");
    if (data) {
      setAvailableTags(data);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      
      // Check if tag already exists
      let tag = availableTags.find(
        (t) => t.name.toLowerCase() === input.trim().toLowerCase()
      );

      if (!tag) {
        // Create new tag
        const { data } = await supabase
          .from("tags")
          .insert({ name: input.trim() })
          .select()
          .single();
        
        if (data) {
          tag = data;
          setAvailableTags([...availableTags, data]);
        }
      }

      if (tag && !selectedTags.some((t) => t.id === tag!.id)) {
        onTagsChange([...selectedTags, tag]);
      }
      
      setInput("");
    }
  };

  const removeTag = (tagToRemove: Tag) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagToRemove.id));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="flex items-center gap-1 pr-1"
          >
            <TagIcon className="h-3 w-3" />
            {tag.name}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full hover:bg-muted p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter"
        className="mt-2"
      />
    </div>
  );
};