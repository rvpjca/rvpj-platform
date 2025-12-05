import Link from "next/link";
import { FileText, Upload, Download, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ClientPortalDashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Fetch client stats
  const [totalDocuments, pendingDocuments, approvedDocuments, unreadMessages] = await Promise.all([
    prisma.clientDocument.count({ where: { clientId: user.id } }),
    prisma.clientDocument.count({ where: { clientId: user.id, status: "PENDING_REVIEW" } }),
    prisma.clientDocument.count({ where: { clientId: user.id, status: "APPROVED" } }),
    prisma.clientMessage.count({ where: { clientId: user.id, isRead: false, isFromClient: false } }),
  ]);

  // Fetch recent documents
  const recentDocuments = await prisma.clientDocument.findMany({
    where: { clientId: user.id },
    orderBy: { uploadedAt: "desc" },
    take: 5,
  });

  // Fetch recent messages
  const recentMessages = await prisma.clientMessage.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      sender: { select: { name: true } },
    },
  });

  const quickActions = [
    {
      title: "Upload Document",
      description: "Upload tax returns, receipts, and other documents",
      icon: Upload,
      href: "/client-portal/upload",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "View Documents",
      description: "Access all your uploaded documents",
      icon: FileText,
      href: "/client-portal/documents",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Downloads from Firm",
      description: "Documents shared by our team",
      icon: Download,
      href: "/client-portal/downloads",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Messages",
      description: "Communicate with our team",
      icon: MessageSquare,
      href: "/client-portal/messages",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welcome back, {user.name || "Client"}!</h2>
        <p className="text-muted-foreground">Here&apos;s an overview of your account.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDocuments}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingDocuments}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedDocuments}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadMessages}</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-lg border p-4 hover:border-primary hover:shadow-md transition"
                >
                  <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client-portal/documents">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-muted p-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.documentType.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.status === "APPROVED" 
                          ? "bg-green-100 text-green-700"
                          : doc.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {doc.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No documents yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/client-portal/upload">Upload your first document</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Messages</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client-portal/messages">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className={`rounded-full p-2 ${msg.isRead ? "bg-muted" : "bg-primary/10"}`}>
                      <MessageSquare className={`h-4 w-4 ${msg.isRead ? "text-muted-foreground" : "text-primary"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!msg.isRead ? "font-semibold" : ""}`}>{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {msg.isFromClient ? "You" : msg.sender.name || "R V P J & Co."} · {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!msg.isRead && !msg.isFromClient && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/client-portal/messages">Send a message</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Our team is here to assist you with any questions about your documents or services.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="tel:+919978781078">Call Us</a>
              </Button>
              <Button asChild>
                <Link href="/client-portal/messages">Send Message</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



