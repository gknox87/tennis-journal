import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  full_name: string | null;
  club: string | null;
  ranking: string | null;
  preferred_surface: string | null;
  avatar_url: string | null;
}

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    club: "",
    ranking: "",
    preferred_surface: "",
    avatar_url: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "No active session found",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          club: data.club || "",
          ranking: data.ranking || "",
          preferred_surface: data.preferred_surface || "",
          avatar_url: data.avatar_url || null,
        });
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "No active session found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.avatar_url || ""} />
              <AvatarFallback>{profileData.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileData.full_name || ""}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="club">Club</Label>
              <Input
                id="club"
                value={profileData.club || ""}
                onChange={(e) => setProfileData({ ...profileData, club: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ranking">Current Ranking</Label>
              <Input
                id="ranking"
                value={profileData.ranking || ""}
                onChange={(e) => setProfileData({ ...profileData, ranking: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="surface">Preferred Surface</Label>
              <Select
                value={profileData.preferred_surface || ""}
                onValueChange={(value) => setProfileData({ ...profileData, preferred_surface: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a surface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Hard Court</SelectItem>
                  <SelectItem value="clay">Clay Court</SelectItem>
                  <SelectItem value="grass">Grass Court</SelectItem>
                  <SelectItem value="carpet">Carpet Court</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}