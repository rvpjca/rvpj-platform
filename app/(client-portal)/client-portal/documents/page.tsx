"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { FileText, Upload, Download, Trash2, Search, Filter, Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientDocuments, deleteDocument } from "../actions";

type Document = {
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
  reviewedBy: { name: string | null } | null;
};

const statusColors: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REQUIRES_REVISION: "bg-orange-100 text-orange-700",
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    const result = await getClientDocuments();
    if (result.documents) {
      setDocuments(result.documents as Document[]);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    startTransition(async () => {
      const result = await deleteDocument(id);
      if (result.success) {
        loadDocuments();
      } else {
        alert(result.error || "Failed to delete document");
      }
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || doc.documentType === filterType;
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Documents</h1>
          <p className="text-muted-foreground">View and manage your uploaded documents</p>
        </div>
        <Button asChild>
          <Link href="/client-portal/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>{documents.length} documents uploaded</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading documents...</p>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
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
                    <tr key={doc.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded bg-muted p-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.fileName} · {formatFileSize(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {documentTypeLabels[doc.documentType] || doc.documentType}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {doc.financialYear || "—"}
                      </td>
                      <td className="py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[doc.status]}`}>
                          {doc.status.replace("_", " ")}
                        </span>
                        {doc.reviewNote && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={doc.reviewNote}>
                            Note: {doc.reviewNote}
                          </p>
                        )}
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
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleDelete(doc.id)}
                            disabled={isPending}
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
              {documents.length === 0 ? (
                <>
                  <p className="font-medium">No documents uploaded yet</p>
                  <p className="text-sm mt-1">Upload your first document to get started</p>
                  <Button className="mt-4" asChild>
                    <Link href="/client-portal/upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Link>
                  </Button>
                </>
              ) : (
                <p>No documents match your filters</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



