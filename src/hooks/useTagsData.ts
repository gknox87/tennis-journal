import { useState, useCallback } from "react";
import { Tag } from "@/types/match";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useTagsData = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const refreshTags = useCallback(async () => {
    try {
      console.log('Refreshing tags data...');
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, redirecting to login');
        toast({
          title: "Authentication required",
          description: "Please log in to view your tags",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      
      if (error) {
        console.error('Error fetching tags:', error);
        throw error;
      }

      console.log('Fetched tags:', data);
      setAvailableTags(data || []);
    } catch (error: any) {
      console.error('Error in refreshTags:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tags. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, navigate]);

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