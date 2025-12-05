"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Edit, Trash2, Search, Shield, UserCheck, UserX, X, Loader2, Info, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUsers, createUser, updateUser, deleteUser, getRoles, updateRolePermissions } from "../actions";

type User = {
  id: string;
  name: string | null;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role: { id: string; key: string; name: string; permissions: string[] } | null;
  createdAt: Date;
};

type Role = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
  isCustom: boolean;
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  PARTNER: "bg-blue-100 text-blue-700",
  MANAGER: "bg-green-100 text-green-700",
  STAFF: "bg-yellow-100 text-yellow-700",
  VIEWER: "bg-gray-100 text-gray-700",
};

// All available permissions/menu items
const allPermissions = [
  { path: "/dashboard", label: "Dashboard Overview", description: "View dashboard stats" },
  { path: "/dashboard/live-chat", label: "Live Chat", description: "Chat with clients in real-time" },
  { path: "/dashboard/whatsapp/bulk", label: "WhatsApp Bulk", description: "Broadcast & scheduled messaging" },
  { path: "/dashboard/pages", label: "Pages Manager", description: "Create and edit website pages" },
  { path: "/dashboard/media", label: "Media Library", description: "Upload and manage files" },
  { path: "/dashboard/enquiries", label: "Enquiries", description: "View and respond to enquiries" },
  { path: "/dashboard/careers", label: "Career Applications", description: "Manage job applications" },
  { path: "/dashboard/client-documents", label: "Client Documents", description: "Review client uploaded documents" },
  { path: "/dashboard/tasks", label: "Tasks", description: "Create and manage tasks" },
  { path: "/dashboard/attendance", label: "Attendance", description: "Track attendance" },
  { path: "/dashboard/theme", label: "Theme Settings", description: "Customize website appearance" },
  { path: "/dashboard/users", label: "Users & Roles", description: "Manage users and permissions" },
  { path: "/dashboard/settings", label: "Site Settings", description: "Configure site settings" },
];

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    const result = await getUsers();
    if (result.users) {
      setUsers(result.users as User[]);
    }
  };

  const loadRoles = async () => {
    const result = await getRoles();
    if (result.roles) {
      setRoles(result.roles as Role[]);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.role?.key || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    inactive: users.filter((u) => u.status !== "ACTIVE").length,
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", roleId: roles[0]?.id || "", status: "ACTIVE" });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      roleId: user.role?.id || "",
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const openRoleModal = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    setIsRoleModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingUser) {
        const selectedRole = roles.find(r => r.id === formData.roleId);
        const updateData: Parameters<typeof updateUser>[1] = {
          name: formData.name,
          email: formData.email,
          roleKey: selectedRole?.key as any,
          status: formData.status,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        const result = await updateUser(editingUser.id, updateData);
        if (result.success) {
          closeModal();
          loadUsers();
        } else {
          alert(result.error || "Failed to update user");
        }
      } else {
        if (!formData.password) {
          alert("Password is required for new users");
          return;
        }
        const selectedRole = roles.find(r => r.id === formData.roleId);
        const result = await createUser({
          ...formData,
          roleKey: selectedRole?.key as any,
        });
        if (result.success) {
          closeModal();
          loadUsers();
        } else {
          alert(result.error || "Failed to create user");
        }
      }
    });
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    startTransition(async () => {
      const result = await updateRolePermissions(editingRole.id, selectedPermissions);
      if (result.success) {
        closeRoleModal();
        loadRoles();
      } else {
        alert(result.error || "Failed to update role permissions");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    startTransition(async () => {
      const result = await deleteUser(id);
      if (result.success) {
        loadUsers();
      } else {
        alert(result.error || "Failed to delete user");
      }
    });
  };

  const togglePermission = (path: string) => {
    if (selectedPermissions.includes(path)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== path));
    } else {
      setSelectedPermissions([...selectedPermissions, path]);
    }
  };

  const getSelectedRole = () => {
    return roles.find(r => r.id === formData.roleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-muted-foreground">Manage user accounts and role permissions</p>
        </div>
        {activeTab === "users" && (
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Add New User
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === "roles"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === "users" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inactive}</p>
                    <p className="text-sm text-muted-foreground">Inactive Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage user accounts and assign roles</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Name</th>
                      <th className="pb-3 font-medium text-muted-foreground">Email</th>
                      <th className="pb-3 font-medium text-muted-foreground">Role</th>
                      <th className="pb-3 font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground">Joined</th>
                      <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-4 font-medium">{user.name || "—"}</td>
                        <td className="py-4 text-muted-foreground">{user.email}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              roleColors[user.role?.key || ""] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role?.name || user.role?.key || "N/A"}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(user.id)}
                              disabled={isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No users found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Roles Tab */
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Customize what each role can access in the admin panel. Click on a role to edit its permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-lg border p-4 hover:border-primary transition cursor-pointer"
                  onClick={() => openRoleModal(role)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${roleColors[role.key] || "bg-gray-100"}`}>
                        {role.key}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings size={16} />
                    </Button>
                  </div>
                  <h3 className="font-semibold">{role.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{role.description || "No description"}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(role.permissions?.length > 0 ? role.permissions : allPermissions.filter(p => {
                      // Default permissions based on role key
                      if (role.key === "ADMIN") return true;
                      if (role.key === "PARTNER") return p.path !== "/dashboard/settings";
                      if (role.key === "MANAGER") return ["/dashboard", "/dashboard/enquiries", "/dashboard/careers", "/dashboard/tasks", "/dashboard/attendance"].includes(p.path);
                      if (role.key === "STAFF") return ["/dashboard", "/dashboard/tasks", "/dashboard/attendance"].includes(p.path);
                      if (role.key === "VIEWER") return p.path === "/dashboard";
                      return false;
                    }).map(p => p.path)).slice(0, 4).map((path) => {
                      const perm = allPermissions.find(p => p.path === path);
                      return (
                        <span key={path} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {perm?.label.split(" ")[0] || path.split("/").pop()}
                        </span>
                      );
                    })}
                    {(role.permissions?.length || 0) > 4 && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        +{(role.permissions?.length || 0) - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john@rvpj.in"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Password {editingUser ? "(leave blank to keep current)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required={!editingUser}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="roleId">Role</Label>
                <select
                  id="roleId"
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.key})
                    </option>
                  ))}
                </select>
                
                {/* Role Permissions Info */}
                {getSelectedRole() && (
                  <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Info size={12} />
                      <span className="font-medium">{getSelectedRole()?.description || "Role permissions"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(getSelectedRole()?.permissions?.length ? getSelectedRole()?.permissions : allPermissions.filter(p => {
                        const role = getSelectedRole();
                        if (!role) return false;
                        if (role.key === "ADMIN") return true;
                        if (role.key === "PARTNER") return p.path !== "/dashboard/settings";
                        if (role.key === "MANAGER") return ["/dashboard", "/dashboard/enquiries", "/dashboard/careers", "/dashboard/tasks", "/dashboard/attendance"].includes(p.path);
                        if (role.key === "STAFF") return ["/dashboard", "/dashboard/tasks", "/dashboard/attendance"].includes(p.path);
                        if (role.key === "VIEWER") return p.path === "/dashboard";
                        return false;
                      }).map(p => p.path))?.map((path) => {
                        const perm = allPermissions.find(p => p.path === path);
                        return (
                          <span key={path} className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                            {perm?.label || path}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED",
                    })
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingUser ? (
                    "Update User"
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Modal */}
      {isRoleModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Edit Role Permissions</h2>
                <p className="text-sm text-muted-foreground">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${roleColors[editingRole.key]}`}>
                    {editingRole.key}
                  </span>
                  {" "}{editingRole.name}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeRoleModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Permissions</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose which sections this role can access in the admin panel
                </p>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {allPermissions.map((perm) => (
                    <label
                      key={perm.path}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
                        selectedPermissions.includes(perm.path)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.path)}
                        onChange={() => togglePermission(perm.path)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{perm.label}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeRoleModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Permissions"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
