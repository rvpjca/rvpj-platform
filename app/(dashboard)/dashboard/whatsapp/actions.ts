"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { WhatsAppMessageStatus, WhatsAppMessageType } from "@prisma/client";

// ============== CONTACTS ==============

export async function getWhatsAppContacts(search?: string) {
  const user = await getCurrentUser();
  if (!user) return { contacts: [], error: "Not authenticated" };

  try {
    const contacts = await prisma.whatsAppContact.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phoneNumber: { contains: search } },
            ],
          }
        : undefined,
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: "desc" },
    });
    return { contacts };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { contacts: [], error: "Failed to fetch contacts" };
  }
}

export async function createWhatsAppContact(data: {
  phoneNumber: string;
  name?: string;
  clientId?: string;
  tags?: string[];
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Format phone number (remove +, spaces, etc.)
    const formattedPhone = data.phoneNumber.replace(/\D/g, "");

    const contact = await prisma.whatsAppContact.create({
      data: {
        phoneNumber: formattedPhone,
        name: data.name,
        clientId: data.clientId,
        tags: data.tags || [],
      },
    });

    revalidatePath("/dashboard/whatsapp");
    return { contact };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { error: "Failed to create contact. Phone number may already exist." };
  }
}

export async function importClientsAsContacts() {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Get all clients with phone numbers
    const clients = await prisma.user.findMany({
      where: {
        role: { key: "CLIENT" },
        phone: { not: null },
      },
      select: { id: true, name: true, phone: true },
    });

    let imported = 0;
    for (const client of clients) {
      if (!client.phone) continue;

      const formattedPhone = client.phone.replace(/\D/g, "");
      
      // Check if already exists
      const existing = await prisma.whatsAppContact.findUnique({
        where: { phoneNumber: formattedPhone },
      });

      if (!existing) {
        await prisma.whatsAppContact.create({
          data: {
            phoneNumber: formattedPhone,
            name: client.name,
            clientId: client.id,
            tags: ["client"],
          },
        });
        imported++;
      }
    }

    revalidatePath("/dashboard/whatsapp");
    return { imported };
  } catch (error) {
    console.error("Error importing clients:", error);
    return { error: "Failed to import clients" };
  }
}

// ============== MESSAGES ==============

export async function getContactMessages(contactId: string) {
  const user = await getCurrentUser();
  if (!user) return { messages: [], error: "Not authenticated" };

  try {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { contactId },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return { messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], error: "Failed to fetch messages" };
  }
}

export async function sendWhatsAppMessage(data: {
  contactId: string;
  content: string;
  messageType?: WhatsAppMessageType;
  mediaUrl?: string;
  scheduledAt?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const isScheduled = data.scheduledAt && new Date(data.scheduledAt) > new Date();

    const message = await prisma.whatsAppMessage.create({
      data: {
        contactId: data.contactId,
        senderId: user.id,
        content: data.content,
        messageType: data.messageType || "TEXT",
        mediaUrl: data.mediaUrl,
        status: isScheduled ? "SCHEDULED" : "PENDING",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });

    // Update contact's last message time
    await prisma.whatsAppContact.update({
      where: { id: data.contactId },
      data: { lastMessageAt: new Date() },
    });

    // TODO: Here you would integrate with WhatsApp API to actually send the message
    // For now, we'll simulate it by marking as sent
    if (!isScheduled) {
      await prisma.whatsAppMessage.update({
        where: { id: message.id },
        data: { 
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }

    revalidatePath("/dashboard/whatsapp");
    return { message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

// ============== TEMPLATES ==============

export async function getWhatsAppTemplates() {
  const user = await getCurrentUser();
  if (!user) return { templates: [], error: "Not authenticated" };

  try {
    const templates = await prisma.whatsAppTemplate.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { templates: [], error: "Failed to fetch templates" };
  }
}

export async function createWhatsAppTemplate(data: {
  name: string;
  content: string;
  category?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const template = await prisma.whatsAppTemplate.create({
      data: {
        name: data.name,
        content: data.content,
        category: data.category || "MARKETING",
        createdById: user.id,
      },
    });

    revalidatePath("/dashboard/whatsapp");
    return { template };
  } catch (error) {
    console.error("Error creating template:", error);
    return { error: "Failed to create template" };
  }
}

// ============== BROADCASTS ==============

export async function getWhatsAppBroadcasts() {
  const user = await getCurrentUser();
  if (!user) return { broadcasts: [], error: "Not authenticated" };

  try {
    const broadcasts = await prisma.whatsAppBroadcast.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { broadcasts };
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    return { broadcasts: [], error: "Failed to fetch broadcasts" };
  }
}

export async function createWhatsAppBroadcast(data: {
  name: string;
  content: string;
  messageType?: WhatsAppMessageType;
  targetTags?: string[];
  targetAll?: boolean;
  scheduledAt?: string;
  mediaUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Count target contacts
    const whereClause = data.targetAll
      ? { isOptedIn: true }
      : { tags: { hasSome: data.targetTags || [] }, isOptedIn: true };

    const totalContacts = await prisma.whatsAppContact.count({ where: whereClause });

    const broadcast = await prisma.whatsAppBroadcast.create({
      data: {
        name: data.name,
        content: data.content,
        messageType: data.messageType || "TEXT",
        targetTags: data.targetTags || [],
        targetAll: data.targetAll || false,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        mediaUrl: data.mediaUrl,
        totalContacts,
        status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
        createdById: user.id,
      },
    });

    revalidatePath("/dashboard/whatsapp");
    return { broadcast };
  } catch (error) {
    console.error("Error creating broadcast:", error);
    return { error: "Failed to create broadcast" };
  }
}

export async function sendBroadcast(broadcastId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const broadcast = await prisma.whatsAppBroadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) return { error: "Broadcast not found" };

    // Get target contacts
    const whereClause = broadcast.targetAll
      ? { isOptedIn: true }
      : { tags: { hasSome: broadcast.targetTags }, isOptedIn: true };

    const contacts = await prisma.whatsAppContact.findMany({ where: whereClause });

    // Update broadcast status
    await prisma.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: { status: "SENDING" },
    });

    // Create messages for each contact
    let sentCount = 0;
    for (const contact of contacts) {
      try {
        await prisma.whatsAppMessage.create({
          data: {
            contactId: contact.id,
            senderId: user.id,
            content: broadcast.content,
            messageType: broadcast.messageType,
            mediaUrl: broadcast.mediaUrl,
            status: "SENT",
            sentAt: new Date(),
          },
        });
        sentCount++;

        // Update contact's last message time
        await prisma.whatsAppContact.update({
          where: { id: contact.id },
          data: { lastMessageAt: new Date() },
        });
      } catch {
        // Continue on error
      }
    }

    // Update broadcast stats
    await prisma.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: {
        status: "COMPLETED",
        sentCount,
      },
    });

    revalidatePath("/dashboard/whatsapp");
    return { sentCount };
  } catch (error) {
    console.error("Error sending broadcast:", error);
    return { error: "Failed to send broadcast" };
  }
}

// ============== SCHEDULED MESSAGES ==============

export async function getScheduledMessages() {
  const user = await getCurrentUser();
  if (!user) return { messages: [], error: "Not authenticated" };

  try {
    const messages = await prisma.whatsAppMessage.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gte: new Date() },
      },
      include: {
        contact: { select: { id: true, name: true, phoneNumber: true } },
        sender: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return { messages };
  } catch (error) {
    console.error("Error fetching scheduled messages:", error);
    return { messages: [], error: "Failed to fetch scheduled messages" };
  }
}

export async function cancelScheduledMessage(messageId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    await prisma.whatsAppMessage.delete({
      where: { id: messageId, status: "SCHEDULED" },
    });

    revalidatePath("/dashboard/whatsapp");
    return { success: true };
  } catch (error) {
    console.error("Error canceling message:", error);
    return { error: "Failed to cancel message" };
  }
}

// ============== STATS ==============

export async function getWhatsAppStats() {
  const user = await getCurrentUser();
  if (!user) return { stats: null, error: "Not authenticated" };

  try {
    const [totalContacts, totalMessages, scheduledCount, broadcastCount] = await Promise.all([
      prisma.whatsAppContact.count(),
      prisma.whatsAppMessage.count(),
      prisma.whatsAppMessage.count({ where: { status: "SCHEDULED" } }),
      prisma.whatsAppBroadcast.count(),
    ]);

    // Today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await prisma.whatsAppMessage.count({
      where: { createdAt: { gte: today } },
    });

    return {
      stats: {
        totalContacts,
        totalMessages,
        todayMessages,
        scheduledCount,
        broadcastCount,
      },
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { stats: null, error: "Failed to fetch stats" };
  }
}



