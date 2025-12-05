import { RoleKey } from "@prisma/client";

export const ADMIN_ACCESS_ROLES: RoleKey[] = [RoleKey.ADMIN, RoleKey.PARTNER];
export const STAFF_ACCESS_ROLES: RoleKey[] = [
  RoleKey.ADMIN,
  RoleKey.PARTNER,
  RoleKey.MANAGER,
  RoleKey.STAFF,
];

export function hasAdminAccess(role?: RoleKey | null) {
  return role ? ADMIN_ACCESS_ROLES.includes(role) : false;
}

export function getRoleLabel(role?: RoleKey | null) {
  switch (role) {
    case RoleKey.ADMIN:
      return "Admin";
    case RoleKey.PARTNER:
      return "Partner";
    case RoleKey.MANAGER:
      return "Manager";
    case RoleKey.STAFF:
      return "Staff";
    default:
      return "Viewer";
  }
}

