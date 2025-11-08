
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { ArrowLeft, User, MapPin, Trophy, Calendar, Save, Edit3, Camera } from "lucide-react";

interface ProfileData {
  full_name: string | null;
  club: string | null;
  ranking: string | null;
  preferred_surface: string | null;
  avatar_url: string | null;
}

interface LiveStats {
  matchesWon: number;
  trainingSessions: number;
  keyOpponents: number;
}

const Profile = () => {
  const { sport } = useSport();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    club: "",
    ranking: "",
    preferred_surface: "",
    avatar_url: null,
  });
  const [liveStats, setLiveStats] = useState<LiveStats>({
    matchesWon: 0,
    trainingSessions: 0,
    keyOpponents: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchLiveStats();
  }, []);

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

  const fetchLiveStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch matches won
      const { data: matchesData } = await supabase
        .from("matches")
        .select("is_win")
        .eq("user_id", session.user.id);

      const matchesWon = matchesData?.filter(match => match.is_win).length || 0;

      // Fetch training sessions
      const { data: trainingData } = await supabase
        .from("training_notes")
        .select("id")
        .eq("user_id", session.user.id);

      const trainingSessions = trainingData?.length || 0;

      // Fetch key opponents
      const { data: opponentsData } = await supabase
        .from("opponents")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("is_key_opponent", true);

      const keyOpponents = opponentsData?.length || 0;

      setLiveStats({
        matchesWon,
        trainingSessions,
        keyOpponents,
      });
    } catch (error) {
      console.error("Error fetching live stats:", error);
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
      setIsEditing(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 shadow-lg hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg font-medium">
              Manage Your {sport.name} Profile & Preferences
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={profileData.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {profileData.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {profileData.full_name || `${sport.name} Player`}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm opacity-90">
                  {profileData.club && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.club}</span>
                    </div>
                  )}
                  {profileData.ranking && (
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>Rank: {profileData.ranking}</span>
                    </div>
                  )}
                  {profileData.preferred_surface && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{profileData.preferred_surface} Court</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Details */}
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.full_name || ""}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 disabled:bg-gray-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club" className="text-gray-700 font-medium">{sport.name} Club</Label>
                  <Input
                    id="club"
                    value={profileData.club || ""}
                    onChange={(e) => setProfileData({ ...profileData, club: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 disabled:bg-gray-100"
                    placeholder={`Enter your ${sport.name.toLowerCase()} club`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ranking" className="text-gray-700 font-medium">Current Ranking</Label>
                  <Input
                    id="ranking"
                    value={profileData.ranking || ""}
                    onChange={(e) => setProfileData({ ...profileData, ranking: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 disabled:bg-gray-100"
                    placeholder="e.g., 4.5, Advanced, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surface" className="text-gray-700 font-medium">Preferred Surface</Label>
                  <Select
                    value={profileData.preferred_surface || ""}
                    onValueChange={(value) => setProfileData({ ...profileData, preferred_surface: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 disabled:bg-gray-100">
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

              {isEditing && (
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Live Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-gradient-to-r from-green-500 to-green-600 text-white">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{liveStats.matchesWon}</p>
              <p className="text-sm opacity-90">{sport.terminology.matchLabel}s Won</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{liveStats.trainingSessions}</p>
              <p className="text-sm opacity-90">Training Sessions</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <User className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{liveStats.keyOpponents}</p>
              <p className="text-sm opacity-90">Key {sport.terminology.opponentLabel}s</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
