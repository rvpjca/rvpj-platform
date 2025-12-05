"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Image, 
  MessageSquare, 
  Briefcase, 
  Palette, 
  Users, 
  Settings,
  Home,
  ClipboardList,
  CalendarCheck,
  FolderOpen
} from "lucide-react";
import { signOut } from "next-auth/react";
import { RoleKey } from "@prisma/client";

import { dashboardNavLinks } from "@/lib/constants/navigation";
import { getAllowedMenuItems } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  FileText,
  Image,
  MessageSquare,
  Briefcase,
  Palette,
  Users,
  Settings,
  ClipboardList,
  CalendarCheck,
  FolderOpen,
};

type Props = {
  userName?: string | null;
  roleLabel?: string | null;
  roleKey?: RoleKey | null;
  customPermissions?: string[];
};

export function DashboardSidebar({ userName, roleLabel, roleKey, customPermissions }: Props) {
  const pathname = usePathname();
  
  // Get allowed menu items based on role (with custom permissions support)
  const allowedPaths = getAllowedMenuItems(roleKey, customPermissions);
  
  // Filter navigation links based on permissions
  const filteredNavLinks = dashboardNavLinks.filter((item) => 
    allowedPaths.includes(item.href)
  );

  return (
    <aside className="hidden w-64 flex-col border-r bg-white/95 p-4 backdrop-blur md:flex">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
          <Home size={16} />
          <span className="text-xs">View Website</span>
        </Link>
        <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Admin Portal
        </p>
        <p className="mt-1 text-lg font-semibold text-primary">R V P J & Co.</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="font-medium text-foreground">{userName ?? "Team Member"}</p>
        <p className="text-muted-foreground">{roleLabel ?? "Staff"}</p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 text-sm font-medium">
        {filteredNavLinks.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-primary",
                isActive && "bg-primary/10 text-primary font-semibold",
              )}
            >
              {Icon && <Icon size={18} />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

