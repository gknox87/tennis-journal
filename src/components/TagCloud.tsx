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
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className={`cursor-pointer text-xs sm:text-sm flex items-center gap-1 touch-manipulation ${
              selectedTags.includes(tag.id) ? "bg-primary" : ""
            }`}
            onClick={() => onTagToggle(tag.id)}
          >
            <TagIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};