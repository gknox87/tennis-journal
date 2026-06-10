import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error as string };
      }

      await supabase.auth.signOut();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete account";
      return { success: false, error: message };
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAccount, isDeleting };
}
