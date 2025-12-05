import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  Image, 
  MessageSquare, 
  Briefcase, 
  ArrowRight,
  Activity,
  Inbox
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=dashboard");
  }

  if (!hasAdminAccess(user.role?.key)) {
    redirect("/");
  }

  // Fetch real stats from database
  const [pagesCount, enquiriesCount, newEnquiriesCount, applicationsCount, usersCount, recentEnquiries, recentApplications] = await Promise.all([
    prisma.page.count(),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { isRead: false } }),
    prisma.careerApplication.count(),
    prisma.user.count(),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.careerApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const stats = {
    pages: pagesCount,
    media: 0, // Will be updated when Supabase media is integrated
    enquiries: enquiriesCount,
    newEnquiries: newEnquiriesCount,
    applications: applicationsCount,
    users: usersCount,
  };

  const quickLinks = [
    { label: "Manage Pages", href: "/dashboard/pages", icon: FileText, color: "bg-blue-100 text-blue-600" },
    { label: "Media Library", href: "/dashboard/media", icon: Image, color: "bg-purple-100 text-purple-600" },
    { label: "View Enquiries", href: "/dashboard/enquiries", icon: MessageSquare, color: "bg-green-100 text-green-600" },
    { label: "Career Applications", href: "/dashboard/careers", icon: Briefcase, color: "bg-orange-100 text-orange-600" },
  ];

  // Helper function for relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pages</p>
                <p className="text-3xl font-bold">{stats.pages}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Media Files</p>
                <p className="text-3xl font-bold">{stats.media}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enquiries</p>
                <p className="text-3xl font-bold">{stats.enquiries}</p>
                <p className="text-xs text-green-600">+{stats.newEnquiries} new</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{stats.applications}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 rounded-lg border p-4 transition hover:border-primary hover:bg-muted/50"
              >
                <div className={`rounded-full p-3 ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.label}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Enquiries</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/enquiries">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEnquiries.length > 0 ? (
              <div className="space-y-4">
                {recentEnquiries.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.subject || "General Enquiry"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{getRelativeTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No enquiries yet</p>
                <p className="text-xs">Enquiries will appear here when received</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/careers">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.role || "General Application"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{getRelativeTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No applications yet</p>
                <p className="text-xs">Job applications will appear here when received</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

