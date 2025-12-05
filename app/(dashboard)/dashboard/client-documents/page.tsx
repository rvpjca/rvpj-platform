"use client";

import { useState, useEffect, useTransition } from "react";
import { FileText, Search, Eye, Download, CheckCircle, XCircle, AlertCircle, Clock, User, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllClientDocuments, updateDocumentStatus } from "./actions";

type ClientDocument = {
  id: string;
  title: string;
  description: string | null;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string | null;
  status: string;
  reviewNote: string | null;
  uploadedAt: Date;
  reviewedAt: Date | null;
  client: { id: string; name: string | null; email: string; panNumber: string | null };
  reviewedBy: { name: string | null } | null;
};

const statusColors: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REQUIRES_REVISION: "bg-orange-100 text-orange-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING_REVIEW: <Clock className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
  REQUIRES_REVISION: <AlertCircle className="h-4 w-4" />,
};

const documentTypeLabels: Record<string, string> = {
  TAX_RETURN: "Tax Return",
  FINANCIAL_STATEMENT: "Financial Statement",
  INVOICE: "Invoice",
  RECEIPT: "Receipt",
  CONTRACT: "Contract",
  IDENTITY_PROOF: "Identity Proof",
  ADDRESS_PROOF: "Address Proof",
  BANK_STATEMENT: "Bank Statement",
  GST_RETURN: "GST Return",
  TDS_CERTIFICATE: "TDS Certificate",
  AUDIT_REPORT: "Audit Report",
  OTHER: "Other",
};

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  // Review Modal State
  const [selectedDoc, setSelectedDoc] = useState<ClientDocument | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    const result = await getAllClientDocuments();
    if (result.documents) {
      setDocuments(result.documents as ClientDocument[]);
    }
    setIsLoading(false);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.panNumber?.includes(searchQuery.toUpperCase());
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    const matchesType = !filterType || doc.documentType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.status === "PENDING_REVIEW").length,
    approved: documents.filter((d) => d.status === "APPROVED").length,
    rejected: documents.filter((d) => d.status === "REJECTED" || d.status === "REQUIRES_REVISION").length,
  };

  const openReviewModal = (doc: ClientDocument) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.status);
    setReviewNote(doc.reviewNote || "");
  };

  const closeReviewModal = () => {
    setSelectedDoc(null);
    setReviewStatus("");
    setReviewNote("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedDoc || !reviewStatus) return;

    startTransition(async () => {
      const result = await updateDocumentStatus(selectedDoc.id, reviewStatus, reviewNote);
      if (result.success) {
        closeReviewModal();
        loadDocuments();
      } else {
        alert(result.error || "Failed to update status");
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Client Documents</h1>
        <p className="text-muted-foreground">Review and manage documents uploaded by clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
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
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected/Revision</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Client Documents</CardTitle>
              <CardDescription>Click on a document to review and update its status</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search client/PAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="REQUIRES_REVISION">Requires Revision</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading documents...</div>
          ) : filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Client</th>
                    <th className="pb-3 font-medium text-muted-foreground">Document</th>
                    <th className="pb-3 font-medium text-muted-foreground">Type</th>
                    <th className="pb-3 font-medium text-muted-foreground">Year</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Uploaded</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-1.5">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.client.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{doc.client.panNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileName} · {formatFileSize(doc.fileSize)}
                        </p>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {documentTypeLabels[doc.documentType] || doc.documentType}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {doc.financialYear || "—"}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[doc.status]}`}>
                          {statusIcons[doc.status]}
                          {doc.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" title="View">
                              <Eye size={16} />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={doc.fileUrl} download={doc.fileName} title="Download">
                              <Download size={16} />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openReviewModal(doc)}
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              {documents.length === 0 
                ? "No client documents uploaded yet"
                : "No documents match your filters"
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Review Document</h2>
                <p className="text-sm text-muted-foreground">{selectedDoc.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeReviewModal}>✕</Button>
            </div>

            {/* Document Info */}
            <div className="mb-4 p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{selectedDoc.client.name} ({selectedDoc.client.panNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{documentTypeLabels[selectedDoc.documentType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Financial Year:</span>
                <span>{selectedDoc.financialYear || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File:</span>
                <a href={selectedDoc.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  View Document ↗
                </a>
              </div>
              {selectedDoc.description && (
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{selectedDoc.description}</p>
                </div>
              )}
            </div>

            {/* Update Status */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReviewStatus("APPROVED")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition ${
                      reviewStatus === "APPROVED" 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => setReviewStatus("REJECTED")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition ${
                      reviewStatus === "REJECTED" 
                        ? "border-red-500 bg-red-50 text-red-700" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => setReviewStatus("REQUIRES_REVISION")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition ${
                      reviewStatus === "REQUIRES_REVISION" 
                        ? "border-orange-500 bg-orange-50 text-orange-700" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <AlertCircle size={18} />
                    Needs Revision
                  </button>
                  <button
                    onClick={() => setReviewStatus("PENDING_REVIEW")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition ${
                      reviewStatus === "PENDING_REVIEW" 
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <Clock size={18} />
                    Pending
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-note">Review Note (Optional)</Label>
                <Textarea
                  id="review-note"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add a note for the client about this document..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={closeReviewModal} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus} className="flex-1" disabled={isPending}>
                  {isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



