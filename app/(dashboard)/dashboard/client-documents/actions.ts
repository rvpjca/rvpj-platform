"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DocumentStatus } from "@prisma/client";

// Get all client documents for admin panel
export async function getAllClientDocuments() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { documents: [], error: "Not authenticated" };
    }

    // Only allow staff/admin/partner/manager
    const allowedRoles = ["ADMIN", "PARTNER", "MANAGER", "STAFF"];
    if (!allowedRoles.includes(user.role?.key || "")) {
      return { documents: [], error: "Not authorized" };
    }

    const documents = await prisma.clientDocument.findMany({
      where: { isFromFirm: false }, // Only client uploaded documents
      orderBy: { uploadedAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true, email: true, panNumber: true },
        },
        reviewedBy: {
          select: { name: true },
        },
      },
    });

    return { documents };
  } catch (error) {
    console.error("Error fetching client documents:", error);
    return { documents: [], error: "Failed to fetch documents" };
  }
}

// Update document status
export async function updateDocumentStatus(
  documentId: string,
  status: string,
  reviewNote?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Only allow staff/admin/partner/manager
    const allowedRoles = ["ADMIN", "PARTNER", "MANAGER", "STAFF"];
    if (!allowedRoles.includes(user.role?.key || "")) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.clientDocument.update({
      where: { id: documentId },
      data: {
        status: status as DocumentStatus,
        reviewNote: reviewNote || null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/client-documents");
    return { success: true };
  } catch (error) {
    console.error("Error updating document status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// Get client documents count for dashboard stats
export async function getClientDocumentsStats() {
  try {
    const [total, pending, approved] = await Promise.all([
      prisma.clientDocument.count({ where: { isFromFirm: false } }),
      prisma.clientDocument.count({ where: { isFromFirm: false, status: "PENDING_REVIEW" } }),
      prisma.clientDocument.count({ where: { isFromFirm: false, status: "APPROVED" } }),
    ]);

    return { total, pending, approved };
  } catch (error) {
    console.error("Error fetching document stats:", error);
    return { total: 0, pending: 0, approved: 0 };
  }
}



