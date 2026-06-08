import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useSubscription } from "@/hooks/useSubscription";
import { ArrowLeft, User, MapPin, Trophy, Calendar, Save, Edit3, Camera, Shield, Calendar as CalendarIcon, Crown, Download } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";

interface ProfileData {
  full_name: string | null;
  club: string | null;
  ranking: string | null;
  preferred_surface: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  show_menstrual_tracking: boolean;
}

interface LiveStats {
  matchesWon: number;
  trainingSessions: number;
  keyOpponents: number;
}

const Profile = () => {
  const { sport } = useSport();
  const { roles, isCoach, isAdmin } = useUserRoles();
  const { plan, isFreePlan, isTrial, trialDaysLeft, aiUsageThisMonth, aiLimit, keyOpponentCount, keyOpponentLimit } = useSubscription();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    club: "",
    ranking: "",
    preferred_surface: "",
    avatar_url: null,
    date_of_birth: null,
    show_menstrual_tracking: false,
  });
  const [liveStats, setLiveStats] = useState<LiveStats>({
    matchesWon: 0,
    trainingSessions: 0,
    keyOpponents: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDobPickerOpen, setIsDobPickerOpen] = useState(false);
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
        toast({ title: "Error", description: "No active session found", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({ title: "Error", description: "Failed to fetch profile data", variant: "destructive" });
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
          date_of_birth: data.date_of_birth || null,
          show_menstrual_tracking: data.show_menstrual_tracking === true,
        });
      } else if (fullName) {
        // Profile row didn't exist yet but we have a name from metadata
        setProfileData(prev => ({ ...prev, full_name: fullName }));
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const fetchLiveStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: matchesData } = await supabase
        .from("matches")
        .select("is_win")
        .eq("user_id", session.user.id);
      const matchesWon = matchesData?.filter(match => match.is_win).length || 0;

      const { data: trainingData } = await supabase
        .from("training_notes")
        .select("id")
        .eq("user_id", session.user.id);
      const trainingSessions = trainingData?.length || 0;

      const { data: opponentsData } = await supabase
        .from("opponents")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("is_key_opponent", true);
      const keyOpponents = opponentsData?.length || 0;

      setLiveStats({ matchesWon, trainingSessions, keyOpponents });
    } catch (error) {
      console.error("Error fetching live stats:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "No active session found", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          full_name: profileData.full_name,
          club: profileData.club,
          ranking: profileData.ranking,
          preferred_surface: profileData.preferred_surface,
          avatar_url: profileData.avatar_url,
          date_of_birth: profileData.date_of_birth || null,
          show_menstrual_tracking: profileData.show_menstrual_tracking,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error updating profile:", error);
        toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
        return;
      }

      toast({ title: "Success", description: "Profile updated successfully" });
      setIsEditing(false);
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-y-auto">
<div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
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
            className="shadow-md hover:shadow-lg transition-all duration-200"
            size="default"
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
                    {profileData.full_name
                      ? profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : "U"}
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
                {/* Role Badges */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                  {/* Plan badge */}
                  <Badge className={`capitalize border ${
                    plan === 'team' ? 'bg-purple-500/30 text-white border-purple-300' :
                    plan === 'pro' ? 'bg-blue-500/30 text-white border-blue-300' :
                    'bg-white/20 text-white border-white/30'
                  }`}>
                    <Crown className="h-3 w-3 mr-1" />
                    {plan} plan
                  </Badge>
                  {roles.map((role) => (
                    <Badge key={role} className="capitalize bg-white/20 text-white border-white/30">
                      <Shield className="h-3 w-3 mr-1" />
                      {role}
                    </Badge>
                  ))}
                </div>
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
                  {profileData.preferred_surface && sport.venueOptions?.length && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{sport.venueOptions.find(v => v.toLowerCase().replace(/\s+/g, '_') === profileData.preferred_surface) || profileData.preferred_surface}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Coach Dashboard Link */}
          {isCoach && (
            <Card
              className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-primary/20 hover:border-primary/40"
              onClick={() => navigate("/coach")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Coach Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Manage your teams and players</p>
                </div>
                <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
              </div>
            </Card>
          )}

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <Card
              className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-red-200/50 hover:border-red-400/60"
              onClick={() => navigate("/admin")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Admin Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Manage users, roles, and teams</p>
                </div>
                <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
              </div>
            </Card>
          )}

          {/* Export Data Link */}
          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-blue-200/50 hover:border-blue-400/60"
            onClick={() => navigate("/data-export")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Export Data & Privacy</h3>
                <p className="text-sm text-muted-foreground">Download your data, generate PDF reports, manage GDPR rights</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>
          </Card>

          {/* Profile Details */}
          <Card className="p-6 sm:p-8 bg-white border-2 border-gray-200/50 shadow-xl">
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
                    className="h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white disabled:bg-gray-50 disabled:border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-gray-700 font-medium">Date of Birth</Label>
                  <Popover open={isDobPickerOpen} onOpenChange={isEditing ? setIsDobPickerOpen : undefined}>
                    <PopoverTrigger asChild>
                      <Button
                        id="dob"
                        type="button"
                        variant="outline"
                        disabled={!isEditing}
                        className={cn(
                          "w-full justify-start text-left font-medium h-12 rounded-xl bg-white border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:border-gray-200 disabled:opacity-100",
                          !profileData.date_of_birth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="flex-1 text-sm">
                          {profileData.date_of_birth
                            ? format(parse(profileData.date_of_birth, 'yyyy-MM-dd', new Date()), "MMM d, yyyy")
                            : "Select date of birth"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 rounded-2xl border-2 border-white/30 shadow-2xl z-[100] max-w-[calc(100vw-2rem)]"
                      align="start"
                      side="bottom"
                      sideOffset={8}
                    >
                      <CalendarComponent
                        mode="single"
                        selected={profileData.date_of_birth ? parse(profileData.date_of_birth, 'yyyy-MM-dd', new Date()) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setProfileData({ ...profileData, date_of_birth: format(date, 'yyyy-MM-dd') });
                            setIsDobPickerOpen(false);
                          }
                        }}
                        defaultMonth={profileData.date_of_birth ? parse(profileData.date_of_birth, 'yyyy-MM-dd', new Date()) : undefined}
                        captionLayout="dropdown-buttons"
                        fromYear={1930}
                        toYear={new Date().getFullYear()}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="rounded-2xl bg-white/95 backdrop-blur-sm"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club" className="text-gray-700 font-medium">{sport.name} Club</Label>
                  <Input
                    id="club"
                    value={profileData.club || ""}
                    onChange={(e) => setProfileData({ ...profileData, club: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white disabled:bg-gray-50 disabled:border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm"
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
                    className="h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white disabled:bg-gray-50 disabled:border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm"
                    placeholder="e.g., 4.5, Advanced, etc."
                  />
                </div>

                {sport.venueOptions && sport.venueOptions.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="surface" className="text-gray-700 font-medium">Preferred Venue</Label>
                    <Select
                      value={profileData.preferred_surface || ""}
                      onValueChange={(value) => setProfileData({ ...profileData, preferred_surface: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white disabled:bg-gray-50 disabled:border-gray-200 text-gray-900 shadow-sm">
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

              {isEditing && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 font-medium">Menstrual Cycle Tracking</Label>
                      <p className="text-xs text-gray-500 mt-0.5">Show cycle day field in wellness check-ins</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={profileData.show_menstrual_tracking}
                      onClick={() => setProfileData({ ...profileData, show_menstrual_tracking: !profileData.show_menstrual_tracking })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileData.show_menstrual_tracking ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileData.show_menstrual_tracking ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

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

          {/* Plan & Usage Stats */}
          {isFreePlan && (
            <Card className="p-4 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Free Plan Usage</h3>
                <Button
                  size="sm"
                  onClick={() => navigate("/pricing")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Crown className="mr-1 h-3 w-3" /> Upgrade
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-gray-500">AI analyses this month</p>
                  <p className="font-bold text-gray-800">
                    {isFreePlan ? `${aiUsageThisMonth} / ${aiLimit}` : "Unlimited"}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Key opponents</p>
                  <p className="font-bold text-gray-800">{isFreePlan ? `${keyOpponentCount} / ${keyOpponentLimit}` : keyOpponentCount}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Live Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-gradient-to-r from-green-500 to-green-600 text-white">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{liveStats.matchesWon}</p>
              <p className="text-sm opacity-90">Matches Won</p>
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
