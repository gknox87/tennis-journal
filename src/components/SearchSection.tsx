import { SearchBar } from "@/components/SearchBar";
import { TagCloud } from "@/components/TagCloud";

interface Tag {
  id: string;
  name: string;
}

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableTags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

export const SearchSection = ({
  searchTerm,
  onSearchChange,
  availableTags,
  selectedTags,
  onTagToggle,
}: SearchSectionProps) => {
  return (
    <div className="space-y-4 px-0 sm:px-2">
      <TagCloud
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
      />
      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
    </div>
  );
};