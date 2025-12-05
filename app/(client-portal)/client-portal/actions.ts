"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

// ============== DOCUMENTS ACTIONS ==============

export async function getClientDocuments(clientId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { documents: [], error: "Not authenticated" };
    }

    const targetClientId = clientId || user.id;

    const documents = await prisma.clientDocument.findMany({
      where: { 
        clientId: targetClientId,
        isFromFirm: false, // Client's own uploads
      },
      orderBy: { uploadedAt: "desc" },
      include: {
        reviewedBy: { select: { name: true } },
      },
    });
    return { documents };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { documents: [], error: "Failed to fetch documents" };
  }
}

export async function getDocumentsFromFirm(clientId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { documents: [], error: "Not authenticated" };
    }

    const targetClientId = clientId || user.id;

    const documents = await prisma.clientDocument.findMany({
      where: { 
        clientId: targetClientId,
        isFromFirm: true, // Documents from firm
      },
      orderBy: { uploadedAt: "desc" },
    });
    return { documents };
  } catch (error) {
    console.error("Error fetching firm documents:", error);
    return { documents: [], error: "Failed to fetch documents" };
  }
}

export async function uploadDocument(data: {
  title: string;
  description?: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
  financialYear?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const document = await prisma.clientDocument.create({
      data: {
        clientId: user.id,
        title: data.title,
        description: data.description,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        financialYear: data.financialYear,
        status: "PENDING_REVIEW",
        isFromFirm: false,
      },
    });

    revalidatePath("/client-portal/documents");
    revalidatePath("/client-portal");
    return { success: true, document };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false, error: "Failed to upload document" };
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const document = await prisma.clientDocument.findFirst({
      where: { id: documentId, clientId: user.id },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    await prisma.clientDocument.delete({ where: { id: documentId } });

    revalidatePath("/client-portal/documents");
    revalidatePath("/client-portal");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}

// ============== MESSAGES ACTIONS ==============

export async function getClientMessages() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { messages: [], error: "Not authenticated" };
    }

    const messages = await prisma.clientMessage.findMany({
      where: { clientId: user.id, parentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { name: true, email: true } },
        replies: {
          include: {
            sender: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return { messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], error: "Failed to fetch messages" };
  }
}

export async function sendMessage(data: {
  subject: string;
  message: string;
  parentId?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const newMessage = await prisma.clientMessage.create({
      data: {
        clientId: user.id,
        senderId: user.id,
        subject: data.subject,
        message: data.message,
        isFromClient: true,
        parentId: data.parentId,
      },
    });

    revalidatePath("/client-portal/messages");
    revalidatePath("/client-portal");
    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.clientMessage.update({
      where: { id: messageId, clientId: user.id },
      data: { isRead: true },
    });

    revalidatePath("/client-portal/messages");
    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { success: false, error: "Failed to update message" };
  }
}

// ============== ADMIN ACTIONS (for firm staff) ==============

export async function uploadDocumentForClient(data: {
  clientId: string;
  title: string;
  description?: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
  financialYear?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "PARTNER", "MANAGER", "STAFF"].includes(user.role?.key || "")) {
      return { success: false, error: "Not authorized" };
    }

    const document = await prisma.clientDocument.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        financialYear: data.financialYear,
        status: "APPROVED",
        isFromFirm: true,
      },
    });

    return { success: true, document };
  } catch (error) {
    console.error("Error uploading document for client:", error);
    return { success: false, error: "Failed to upload document" };
  }
}

export async function reviewDocument(
  documentId: string, 
  status: DocumentStatus, 
  reviewNote?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "PARTNER", "MANAGER", "STAFF"].includes(user.role?.key || "")) {
      return { success: false, error: "Not authorized" };
    }

    const document = await prisma.clientDocument.update({
      where: { id: documentId },
      data: {
        status,
        reviewNote,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    return { success: true, document };
  } catch (error) {
    console.error("Error reviewing document:", error);
    return { success: false, error: "Failed to review document" };
  }
}

export async function replyToClientMessage(data: {
  clientId: string;
  parentId: string;
  subject: string;
  message: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "PARTNER", "MANAGER", "STAFF"].includes(user.role?.key || "")) {
      return { success: false, error: "Not authorized" };
    }

    const newMessage = await prisma.clientMessage.create({
      data: {
        clientId: data.clientId,
        senderId: user.id,
        subject: data.subject,
        message: data.message,
        isFromClient: false,
        parentId: data.parentId,
      },
    });

    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Error replying to message:", error);
    return { success: false, error: "Failed to send reply" };
  }
}



