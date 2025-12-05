"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Upload,
  Download,
  MessageCircle, 
  User,
  Home,
  Calendar
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const clientNavLinks = [
  { label: "Dashboard", href: "/client-portal", icon: LayoutDashboard },
  { label: "Live Chat", href: "/client-portal/chat", icon: MessageCircle },
  { label: "My Documents", href: "/client-portal/documents", icon: FileText },
  { label: "Upload Documents", href: "/client-portal/upload", icon: Upload },
  { label: "Downloads from Firm", href: "/client-portal/downloads", icon: Download },
  { label: "Meetings", href: "/client-portal/meetings", icon: Calendar },
  { label: "My Profile", href: "/client-portal/profile", icon: User },
];

type Props = {
  userName?: string | null;
  userEmail?: string | null;
};

export function ClientPortalSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 md:flex">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
          <Home size={16} />
          <span className="text-xs">Back to Website</span>
        </Link>
        <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Client Portal
        </p>
        <p className="mt-1 text-lg font-semibold text-primary">R V P J & Co.</p>
      </div>

      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-3 text-sm">
        <p className="font-medium text-foreground">{userName ?? "Client"}</p>
        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 text-sm font-medium">
        {clientNavLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== "/client-portal" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-primary",
                isActive && "bg-primary/10 text-primary font-semibold",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4 space-y-2">
        <p className="text-xs text-muted-foreground px-3">
          Need help? Contact us at<br />
          <a href="mailto:info@rvpj.in" className="text-primary hover:underline">info@rvpj.in</a>
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/client-login" })}
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

