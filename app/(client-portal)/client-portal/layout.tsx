import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RoleKey } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";
import { ClientPortalSidebar } from "@/components/layout/client-portal/sidebar";

export default async function ClientPortalDashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  // Check if user is logged in and is a client
  if (!user) {
    redirect("/client-login");
  }

  if (user.role?.key !== RoleKey.CLIENT) {
    redirect("/client-login?error=not_client");
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <ClientPortalSidebar userName={user.name} userEmail={user.email} />
      <div className="flex flex-1 flex-col">
        <header className="border-b bg-white px-4 py-4 md:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user.name ?? "Client"}
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">Client Portal</h1>
              </div>
              <Link 
                href="/"
                className="text-sm text-primary hover:underline"
              >
                Visit Main Website →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your documents, communicate with our team, and track your services.
            </p>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

