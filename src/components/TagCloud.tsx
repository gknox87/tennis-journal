import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface TagCloudProps {
  availableTags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

export const TagCloud = ({ availableTags, selectedTags, onTagToggle }: TagCloudProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className={`cursor-pointer flex items-center gap-1 ${
              selectedTags.includes(tag.id) ? "bg-primary" : ""
            }`}
            onClick={() => onTagToggle(tag.id)}
          >
            <TagIcon className="h-3 w-3" />
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};