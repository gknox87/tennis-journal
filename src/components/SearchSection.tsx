
import { SearchBar } from "@/components/SearchBar";

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchSection = ({
  searchTerm,
  onSearchChange,
}: SearchSectionProps) => {
  return (
    <div className="space-y-4 px-0 sm:px-2">
      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
    </div>
  );
};
