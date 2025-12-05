"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Search, FolderOpen, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentsFromFirm } from "../actions";

type Document = {
  id: string;
  title: string;
  description: string | null;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string | null;
  uploadedAt: Date;
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

export default function DownloadsFromFirmPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    const result = await getDocumentsFromFirm();
    if (result.documents) {
      setDocuments(result.documents as Document[]);
    }
    setIsLoading(false);
  };

  const filteredDocuments = documents.filter((doc) => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Group documents by financial year
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const year = doc.financialYear || "Other";
    if (!acc[year]) acc[year] = [];
    acc[year].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Downloads from Firm</h1>
        <p className="text-muted-foreground">
          Documents shared with you by R V P J & Co.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Shared Documents</CardTitle>
              <CardDescription>
                {documents.length} documents available for download
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading documents...</p>
            </div>
          ) : Object.keys(groupedDocuments).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedDocuments)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, docs]) => (
                  <div key={year}>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      FY {year}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-lg border p-4 hover:border-primary hover:shadow-md transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded bg-primary/10 p-2 shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" title={doc.title}>
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {documentTypeLabels[doc.documentType] || doc.documentType}
                              </p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.fileSize)}
                                </span>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={doc.fileUrl} download={doc.fileName}>
                                    <Download className="mr-1 h-3 w-3" />
                                    Download
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              {documents.length === 0 ? (
                <>
                  <p className="font-medium">No documents shared yet</p>
                  <p className="text-sm mt-1">
                    Documents shared by our team will appear here
                  </p>
                </>
              ) : (
                <p>No documents match your search</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



