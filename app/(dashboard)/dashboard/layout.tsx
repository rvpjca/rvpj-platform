import type { ReactNode } from "react";
import Link from "next/link";
import { RoleKey } from "@prisma/client";

import { DashboardSidebar } from "@/components/layout/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { dashboardNavLinks } from "@/lib/constants/navigation";
import { getAllowedMenuItems } from "@/lib/permissions";
import { getRoleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const roleLabel = getRoleLabel(user?.role?.key);
  const roleKey = user?.role?.key as RoleKey | undefined;
  const customPermissions = user?.role?.permissions || [];
  
  // Get allowed paths for mobile nav (with custom permissions support)
  const allowedPaths = getAllowedMenuItems(roleKey, customPermissions);
  const filteredNavLinks = dashboardNavLinks.filter((item) => allowedPaths.includes(item.href));

  return (
    <div className="min-h-screen bg-muted/20 md:flex">
      <DashboardSidebar 
        userName={user?.name} 
        roleLabel={roleLabel} 
        roleKey={roleKey}
        customPermissions={customPermissions}
      />
      <div className="flex flex-1 flex-col">
        <header className="border-b bg-white px-4 py-4 md:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name ?? "Team Member"}
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/contact">Need Support?</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Track enquiries, internal tasks, attendance, and firm-wide updates from a single
              workspace.
            </p>
          </div>

          {/* Mobile navigation - filtered by role */}
          <div className="mt-4 flex flex-wrap gap-2 md:hidden">
            {filteredNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs text-muted-foreground",
                  item.href === "/dashboard" && "border-primary bg-primary/10 text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

