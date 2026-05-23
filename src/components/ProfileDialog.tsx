
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { Camera } from "lucide-react";

interface ProfileData {
  full_name: string | null;
  club: string | null;
  ranking: string | null;
  preferred_surface: string | null;
  avatar_url: string | null;
}

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { sport } = useSport();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    club: "",
    ranking: "",
    preferred_surface: "",
    avatar_url: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      let fullName = data?.full_name || "";

      // Fallback: populate full_name from auth user_metadata if profile name is empty
      if (!fullName) {
        const meta = session.user.user_metadata;
        const first = meta?.first_name || "";
        const last = meta?.last_name || "";
        const metaName = [first, last].filter(Boolean).join(" ")
          || meta?.full_name || meta?.name || "";
        if (metaName) {
          fullName = metaName;
          // Persist to profiles so it sticks for future loads
          await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              full_name: metaName,
              updated_at: new Date().toISOString(),
            });
        }
      }

      if (data) {
        setProfileData({
          full_name: fullName,
          club: data.club || "",
          ranking: data.ranking || "",
          preferred_surface: data.preferred_surface || "",
          avatar_url: data.avatar_url || null,
        });
      } else if (fullName) {
        setProfileData(prev => ({ ...prev, full_name: fullName }));
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
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
        return;
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Error in handleSave:", err);
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
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar_url || ""} />
                <AvatarFallback>{profileData.full_name ? profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "U"}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
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
            {sport.venueOptions && sport.venueOptions.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="surface">Preferred Venue</Label>
                <Select
                  value={profileData.preferred_surface || ""}
                  onValueChange={(value) => setProfileData({ ...profileData, preferred_surface: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sport.venueOptions.map((venue) => (
                      <SelectItem key={venue} value={venue.toLowerCase().replace(/\s+/g, '_')}>
                        {venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}