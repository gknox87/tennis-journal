import { useState, useCallback } from "react";
import { Tag } from "@/types/match";
import { useDataFetching } from "@/hooks/useDataFetching";

export const useTagsData = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const { fetchTags } = useDataFetching();

  const refreshTags = useCallback(async () => {
    console.log('Refreshing tags data...');
    const tagsData = await fetchTags();
    console.log('Fetched tags:', tagsData);
    setAvailableTags(tagsData);
  }, [fetchTags]);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  return {
    selectedTags,
    availableTags,
    setAvailableTags,
    toggleTag,
    refreshTags
  };
};