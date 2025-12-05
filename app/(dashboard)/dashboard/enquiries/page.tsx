"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Eye, CheckCircle, Clock, MessageSquare, Trash2, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEnquiries, updateEnquiryStatus, deleteEnquiry } from "../actions";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    const result = await getEnquiries();
    if (result.enquiries) {
      setEnquiries(result.enquiries as Enquiry[]);
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enquiry.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "NEW" && !enquiry.isRead) ||
      (statusFilter === "READ" && enquiry.isRead);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => !e.isRead).length,
    read: enquiries.filter((e) => e.isRead).length,
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    startTransition(async () => {
      const result = await updateEnquiryStatus(id, isRead);
      if (result.success) {
        loadEnquiries();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    startTransition(async () => {
      const result = await deleteEnquiry(id);
      if (result.success) {
        loadEnquiries();
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry(null);
        }
      }
    });
  };

  const openEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    if (!enquiry.isRead) {
      handleMarkAsRead(enquiry.id, true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
          <p className="text-muted-foreground">Manage contact form submissions and enquiries</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New/Unread</p>
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
                <p className="text-2xl font-bold">{stats.read}</p>
                <p className="text-sm text-muted-foreground">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Enquiries</CardTitle>
              <CardDescription>View and respond to customer enquiries</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="ALL">All</option>
                <option value="NEW">Unread</option>
                <option value="READ">Read</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search enquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className={`rounded-lg border p-4 transition hover:border-primary cursor-pointer ${
                  !enquiry.isRead ? "bg-blue-50/50 border-blue-200" : "hover:bg-muted/30"
                }`}
                onClick={() => openEnquiry(enquiry)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{enquiry.name}</h3>
                      {!enquiry.isRead && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {enquiry.email} {enquiry.phone && `• ${enquiry.phone}`}
                    </p>
                    {enquiry.subject && (
                      <p className="mt-2 font-medium text-primary">{enquiry.subject}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {enquiry.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEnquiry(enquiry);
                      }}
                    >
                      <Eye size={14} />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(enquiry.id);
                      }}
                      disabled={isPending}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEnquiries.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {enquiries.length === 0
                ? "No enquiries yet."
                : "No enquiries found matching your criteria."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Enquiry Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEnquiry(null)}>
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedEnquiry.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedEnquiry.subject && (
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedEnquiry.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">
                  {selectedEnquiry.message}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleMarkAsRead(selectedEnquiry.id, !selectedEnquiry.isRead);
                    setSelectedEnquiry({ ...selectedEnquiry, isRead: !selectedEnquiry.isRead });
                  }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedEnquiry.isRead ? (
                    "Mark as Unread"
                  ) : (
                    "Mark as Read"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
