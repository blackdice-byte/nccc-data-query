import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  Mail,
  Calendar,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useUserStore, type User } from "@/store/user.store";

const Users = () => {
  const { users, isLoading, fetchUsers, updateUserRole, deleteUser } = useUserStore();
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase()) ||
      (user.firstname?.toLowerCase() || "").includes(filter.toLowerCase()) ||
      (user.lastname?.toLowerCase() || "").includes(filter.toLowerCase())
  );

  const getInitials = (user: User) => {
    if (user.firstname && user.lastname) {
      return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    const newRole = selectedUser.role === "admin" ? "user" : "admin";
    const success = await updateUserRole(selectedUser._id, newRole);

    if (success) {
      toast.success(
        `${selectedUser.username} is now ${newRole === "admin" ? "an admin" : "a user"}`
      );
    } else {
      toast.error("Failed to update user role");
    }

    setActionLoading(false);
    setRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    const success = await deleteUser(selectedUser._id);

    if (success) {
      toast.success(`${selectedUser.username} has been deleted`);
    } else {
      toast.error("Failed to delete user");
    }

    setActionLoading(false);
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts • {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Users will appear here once they sign up
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Filter Results */}
      {users.length > 0 && filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No users match "{filter}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      {filteredUsers.length > 0 && (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.username}</p>
                        {user.role === "admin" && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UserCircle className="h-4 w-4" />
                        {user.authProvider}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.createdAt)}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleDialogOpen(true);
                          }}
                        >
                          {user.role === "admin" ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.role === "admin" ? "Remove admin access?" : "Grant admin access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.role === "admin"
                ? `${selectedUser?.username} will no longer have admin privileges.`
                : `${selectedUser?.username} will have full admin access to manage contracts and users.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleRole} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedUser?.role === "admin" ? (
                "Remove Admin"
              ) : (
                "Make Admin"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedUser?.username}'s account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
