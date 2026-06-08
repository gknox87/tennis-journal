import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserRoleDialog } from "@/components/admin/UserRoleDialog";
import { useAdminUsers } from "@/hooks/useAdminData";
import {
  Search,
  Shield,
  Users,
  Filter,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  coach: "bg-blue-100 text-blue-800 border-blue-200",
  player: "bg-green-100 text-green-800 border-green-200",
};

const ROLE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Players", value: "player" },
  { label: "Coaches", value: "coach" },
  { label: "Admins", value: "admin" },
];

const AdminUsers = () => {
  const { users, isLoading, error, fetchUsers } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers(roleFilter, searchQuery);
  }, [fetchUsers, roleFilter]);

  const handleSearch = () => {
    fetchUsers(roleFilter, searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const openUserDialog = (userId: string) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleRolesChanged = () => {
    fetchUsers(roleFilter, searchQuery);
  };

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
                User Management
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage all app users, roles, and permissions
              </p>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or club..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch} variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Role Filter */}
                <div className="flex gap-1">
                  <Filter className="h-4 w-4 text-muted-foreground self-center mr-1" />
                  {ROLE_FILTERS.map((f) => (
                    <Button
                      key={f.value}
                      size="sm"
                      variant={roleFilter === f.value ? "default" : "outline"}
                      onClick={() => setRoleFilter(f.value)}
                      className="text-xs"
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
                <h3 className="text-lg font-semibold mb-1">Failed to load users</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
              </Card>
            ) : users.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-1">No users found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filter.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead className="hidden sm:table-cell">Joined</TableHead>
                        <TableHead className="hidden sm:table-cell">Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={u.avatar_url || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {u.full_name
                                    ? u.full_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)
                                    : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {u.full_name || "No name"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((role) => (
                                <Badge
                                  key={role}
                                  className={`capitalize text-xs ${ROLE_COLORS[role] || ""}`}
                                >
                                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {format(new Date(u.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {u.last_sign_in_at
                              ? format(new Date(u.last_sign_in_at), "MMM d, yyyy")
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openUserDialog(u.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 border-t text-xs text-muted-foreground text-center">
                  Showing {users.length} user{users.length !== 1 ? "s" : ""}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <UserRoleDialog
        userId={selectedUserId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRolesChanged={handleRolesChanged}
      />
    </div>
  );
};

export default AdminUsers;
