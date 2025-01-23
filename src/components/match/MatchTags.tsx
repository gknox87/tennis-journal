import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface MatchTagsProps {
  tags: Tag[];
}

export const MatchTags = ({ tags }: MatchTagsProps) => {
  if (tags.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge 
          key={tag.id} 
          variant="outline" 
          className="text-xs flex items-center gap-1"
        >
          <TagIcon className="h-2.5 w-2.5" />
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};