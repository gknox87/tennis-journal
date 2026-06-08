import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminDashboard } from "@/hooks/useAdminData";
import {
  Users,
  Shield,
  Trophy,
  Swords,
  Activity,
  ClipboardList,
  Heart,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const { stats, isLoading, error, fetchStats } = useAdminDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto pb-24 pt-16">
      <div className="container mx-auto px-4 py-6 pb-24 max-w-6xl pt-16">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <div className="sm:w-48 shrink-0">
            <AdminSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-800 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">App-wide overview and statistics</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
                <h3 className="text-lg font-semibold mb-1">Failed to load stats</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
              </Card>
            ) : stats ? (
              <div className="space-y-6">
                {/* Primary KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Users className="h-5 w-5" />}
                    label="Total Users"
                    value={stats.totalUsers}
                    gradient="from-blue-500 to-blue-600"
                  />
                  <StatCard
                    icon={<Shield className="h-5 w-5" />}
                    label="Coaches"
                    value={stats.totalCoaches}
                    gradient="from-purple-500 to-purple-600"
                  />
                  <StatCard
                    icon={<Shield className="h-5 w-5" />}
                    label="Admins"
                    value={stats.totalAdmins}
                    gradient="from-red-500 to-red-600"
                  />
                  <StatCard
                    icon={<UserPlus className="h-5 w-5" />}
                    label="New (7d)"
                    value={stats.recentSignups}
                    gradient="from-green-500 to-green-600"
                  />
                </div>

                {/* Secondary KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Trophy className="h-5 w-5" />}
                    label="Teams"
                    value={stats.totalTeams}
                    gradient="from-indigo-500 to-indigo-600"
                  />
                  <StatCard
                    icon={<Swords className="h-5 w-5" />}
                    label="Matches"
                    value={stats.totalMatches}
                    gradient="from-orange-500 to-orange-600"
                  />
                  <StatCard
                    icon={<Activity className="h-5 w-5" />}
                    label="Training Sessions"
                    value={stats.totalTrainingSessions}
                    gradient="from-teal-500 to-teal-600"
                  />
                  <StatCard
                    icon={<Heart className="h-5 w-5" />}
                    label="Wellness Entries"
                    value={stats.totalWellnessEntries}
                    gradient="from-pink-500 to-pink-600"
                  />
                </div>

                {/* Training Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5 border-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-100">
                        <ClipboardList className="h-5 w-5 text-cyan-700" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalTrainingNotes}</p>
                        <p className="text-sm text-muted-foreground">Training Notes</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5 border-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <UserPlus className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.recentSignups}</p>
                        <p className="text-sm text-muted-foreground">Signups This Week</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <Card className={`p-4 text-center bg-gradient-to-r ${gradient} text-white shadow-md`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-90">{label}</p>
    </Card>
  );
}

export default AdminDashboard;
