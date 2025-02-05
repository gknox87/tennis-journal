
import { useState, useEffect } from "react";
import { Tag as TagIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, skipping tag fetch');
        toast({
          title: "Authentication Required",
          description: "Please log in to manage tags",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq('user_id', session.user.id)
        .order("name");

      if (error) throw error;
      
      if (data) {
        console.log('Fetched tags:', data);
        setAvailableTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to create tags",
            variant: "destructive",
          });
          return;
        }

        // Check if tag already exists
        let tag = availableTags.find(
          (t) => t.name.toLowerCase() === input.trim().toLowerCase()
        );

        if (!tag) {
          // Create new tag
          const { data, error } = await supabase
            .from("tags")
            .insert({ 
              name: input.trim(),
              user_id: session.user.id
            })
            .select()
            .single();
          
          if (error) throw error;
          
          if (data) {
            tag = data;
            setAvailableTags([...availableTags, data]);
          }
        }

        if (tag && !selectedTags.some((t) => t.id === tag!.id)) {
          onTagsChange([...selectedTags, tag]);
        }
        
        setInput("");
      } catch (error) {
        console.error("Error creating tag:", error);
        toast({
          title: "Error",
          description: "Failed to create tag",
          variant: "destructive",
        });
      }
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
