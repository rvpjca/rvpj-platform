"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, FileText, Trash2, Copy, Search, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data for demo
const mockMedia = [
  { id: "1", name: "hero-banner.jpg", type: "image/jpeg", size: 245000, url: "/placeholder.jpg", folder: "banners" },
  { id: "2", name: "team-photo.png", type: "image/png", size: 512000, url: "/placeholder.jpg", folder: "team" },
  { id: "3", name: "service-audit.jpg", type: "image/jpeg", size: 180000, url: "/placeholder.jpg", folder: "services" },
  { id: "4", name: "brochure.pdf", type: "application/pdf", size: 1024000, url: "/placeholder.pdf", folder: "documents" },
  { id: "5", name: "logo.svg", type: "image/svg+xml", size: 12000, url: "/placeholder.svg", folder: "brand" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = mockMedia.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    // TODO: Implement actual upload to Supabase
    setTimeout(() => {
      setIsUploading(false);
      alert("Upload functionality will be connected to Supabase storage");
    }, 1000);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage images, documents, and files</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            multiple
          />
          <Button onClick={handleUploadClick} className="gap-2" disabled={isUploading}>
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Media</CardTitle>
              <CardDescription>
                Max file size: 10 MB • Supported: Images, PDFs, Documents
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMedia.map((file) => (
              <div
                key={file.id}
                className="group relative overflow-hidden rounded-lg border bg-muted/30 transition hover:border-primary"
              >
                <div className="flex h-32 items-center justify-center bg-muted">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon size={48} className="text-muted-foreground" />
                  ) : (
                    <FileText size={48} className="text-muted-foreground" />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <FolderOpen size={12} />
                    <span>{file.folder}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyUrl(file.url)}
                  >
                    <Copy size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No media files found</p>
              <p className="text-sm">Upload files to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



