import { RoleKey } from "@prisma/client";

// Default permissions for each role (used when no custom permissions are set)
export const defaultRolePermissions: Record<RoleKey, string[]> = {
  // ADMIN - Full access to everything
  ADMIN: [
    "/dashboard",
    "/dashboard/live-chat",
    "/dashboard/whatsapp/bulk",
    "/dashboard/pages",
    "/dashboard/media",
    "/dashboard/enquiries",
    "/dashboard/careers",
    "/dashboard/client-documents",
    "/dashboard/tasks",
    "/dashboard/attendance",
    "/dashboard/theme",
    "/dashboard/users",
    "/dashboard/settings",
  ],

  // PARTNER - Almost full access (can manage users but not site settings)
  PARTNER: [
    "/dashboard",
    "/dashboard/live-chat",
    "/dashboard/whatsapp/bulk",
    "/dashboard/pages",
    "/dashboard/media",
    "/dashboard/enquiries",
    "/dashboard/careers",
    "/dashboard/client-documents",
    "/dashboard/tasks",
    "/dashboard/attendance",
    "/dashboard/theme",
    "/dashboard/users",
  ],

  // MANAGER - Can manage tasks, attendance, enquiries, careers
  MANAGER: [
    "/dashboard",
    "/dashboard/live-chat",
    "/dashboard/whatsapp/bulk",
    "/dashboard/enquiries",
    "/dashboard/careers",
    "/dashboard/client-documents",
    "/dashboard/tasks",
    "/dashboard/attendance",
  ],

  // STAFF - Can view and manage their own tasks and attendance
  STAFF: [
    "/dashboard",
    "/dashboard/live-chat",
    "/dashboard/client-documents",
    "/dashboard/tasks",
    "/dashboard/attendance",
  ],

  // VIEWER - Read-only access to dashboard
  VIEWER: [
    "/dashboard",
  ],

  // CLIENT - Access to client portal only (no admin dashboard)
  CLIENT: [],
};

// Check if a role has access to a specific path
export function hasAccessToPath(
  roleKey: RoleKey | undefined | null, 
  path: string,
  customPermissions?: string[]
): boolean {
  if (!roleKey) return false;
  
  // Use custom permissions if available, otherwise use defaults
  const allowedPaths = customPermissions?.length 
    ? customPermissions 
    : defaultRolePermissions[roleKey] || [];
  
  // Check exact match or if the path starts with an allowed path
  return allowedPaths.some((allowedPath) => {
    if (allowedPath === path) return true;
    if (path.startsWith(allowedPath + "/")) return true;
    return false;
  });
}

// Get allowed menu items for a role (with optional custom permissions)
export function getAllowedMenuItems(
  roleKey: RoleKey | undefined | null,
  customPermissions?: string[]
): string[] {
  if (!roleKey) return [];
  
  // Use custom permissions if available, otherwise use defaults
  return customPermissions?.length 
    ? customPermissions 
    : defaultRolePermissions[roleKey] || [];
}

// Role hierarchy for display
export const roleHierarchy: Record<RoleKey, { level: number; label: string; description: string }> = {
  ADMIN: {
    level: 5,
    label: "Administrator",
    description: "Full access to all features including site settings and user management",
  },
  PARTNER: {
    level: 4,
    label: "Partner",
    description: "Can manage content, users, theme, enquiries, tasks, and attendance",
  },
  MANAGER: {
    level: 3,
    label: "Manager",
    description: "Can manage enquiries, careers, tasks, and attendance",
  },
  STAFF: {
    level: 2,
    label: "Staff",
    description: "Can view and manage tasks and attendance",
  },
  VIEWER: {
    level: 1,
    label: "Viewer",
    description: "Read-only access to dashboard overview",
  },
};

// Check if a user can manage another user based on role hierarchy
export function canManageUser(managerRoleKey: RoleKey | undefined, targetRoleKey: RoleKey): boolean {
  if (!managerRoleKey) return false;
  
  const managerLevel = roleHierarchy[managerRoleKey]?.level || 0;
  const targetLevel = roleHierarchy[targetRoleKey]?.level || 0;
  
  // Can only manage users with lower role level
  return managerLevel > targetLevel;
}

