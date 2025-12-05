"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MessageType, ChatRoomStatus } from "@prisma/client";

// ============== CHAT ROOM ACTIONS ==============

// Get or create chat room for client
export async function getOrCreateChatRoom() {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Check if client has an active chat room
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        clientId: user.id,
        status: ChatRoomStatus.ACTIVE,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Create new room if none exists
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          clientId: user.id,
          status: ChatRoomStatus.ACTIVE,
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    }

    return { chatRoom };
  } catch (error) {
    console.error("Error getting/creating chat room:", error);
    return { error: "Failed to get chat room" };
  }
}

// Get all active chat rooms (for admin)
export async function getAllChatRooms() {
  const user = await getCurrentUser();
  if (!user) return { chatRooms: [], error: "Not authenticated" };

  const allowedRoles = ["ADMIN", "PARTNER", "MANAGER", "STAFF"];
  if (!allowedRoles.includes(user.role?.key || "")) {
    return { chatRooms: [], error: "Not authorized" };
  }

  try {
    const chatRooms = await prisma.chatRoom.findMany({
      where: { status: ChatRoomStatus.ACTIVE },
      include: {
        client: { select: { id: true, name: true, email: true, panNumber: true } },
        assignedTo: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: { where: { isRead: false } },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return { chatRooms };
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return { chatRooms: [], error: "Failed to fetch chat rooms" };
  }
}

// ============== MESSAGES ACTIONS ==============

// Get messages for a chat room
export async function getChatMessages(chatRoomId: string) {
  const user = await getCurrentUser();
  if (!user) return { messages: [], error: "Not authenticated" };

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { chatRoomId },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        chatRoomId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], error: "Failed to fetch messages" };
  }
}

// Send a text message
export async function sendChatMessage(chatRoomId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: user.id,
        content,
        messageType: "TEXT",
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    // Update last message time on chat room
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { lastMessageAt: new Date() },
    });

    revalidatePath("/client-portal/chat");
    revalidatePath("/dashboard/live-chat");
    return { message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

// Send file/image message
export async function sendFileMessage(
  chatRoomId: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  mimeType: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const messageType: MessageType = mimeType.startsWith("image/") ? "IMAGE" : "FILE";

  try {
    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: user.id,
        messageType,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { lastMessageAt: new Date() },
    });

    revalidatePath("/client-portal/chat");
    revalidatePath("/dashboard/live-chat");
    return { message };
  } catch (error) {
    console.error("Error sending file:", error);
    return { error: "Failed to send file" };
  }
}

// ============== MEETING ACTIONS ==============

// Schedule a meeting
export async function scheduleMeeting(data: {
  clientId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const allowedRoles = ["ADMIN", "PARTNER", "MANAGER", "STAFF"];
  if (!allowedRoles.includes(user.role?.key || "")) {
    return { error: "Not authorized" };
  }

  try {
    // Generate Jitsi meeting URL
    const meetingId = `rvpj-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const meetingUrl = `https://meet.jit.si/${meetingId}`;

    const meeting = await prisma.scheduledMeeting.create({
      data: {
        clientId: data.clientId,
        hostId: user.id,
        title: data.title,
        description: data.description,
        meetingUrl,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration || 30,
      },
    });

    return { meeting };
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    return { error: "Failed to schedule meeting" };
  }
}

// Get upcoming meetings
export async function getUpcomingMeetings(clientId?: string) {
  const user = await getCurrentUser();
  if (!user) return { meetings: [], error: "Not authenticated" };

  try {
    const where = clientId
      ? { clientId, scheduledAt: { gte: new Date() } }
      : user.role?.key === "CLIENT"
      ? { clientId: user.id, scheduledAt: { gte: new Date() } }
      : { scheduledAt: { gte: new Date() } };

    const meetings = await prisma.scheduledMeeting.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        host: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return { meetings };
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return { meetings: [], error: "Failed to fetch meetings" };
  }
}

// Start instant video call
export async function startVideoCall(chatRoomId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const meetingId = `rvpj-video-${Date.now()}`;
    const meetingUrl = `https://meet.jit.si/${meetingId}#config.startWithVideoMuted=false&config.startWithAudioMuted=false`;

    await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: user.id,
        messageType: "CALL_STARTED",
        content: JSON.stringify({ type: "video", url: meetingUrl }),
      },
    });

    revalidatePath("/client-portal/chat");
    revalidatePath("/dashboard/live-chat");
    return { meetingUrl };
  } catch (error) {
    console.error("Error starting video call:", error);
    return { error: "Failed to start video call" };
  }
}

// Start instant voice call
export async function startVoiceCall(chatRoomId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const meetingId = `rvpj-voice-${Date.now()}`;
    const meetingUrl = `https://meet.jit.si/${meetingId}#config.startWithVideoMuted=true&config.startWithAudioMuted=false`;

    await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: user.id,
        messageType: "CALL_STARTED",
        content: JSON.stringify({ type: "voice", url: meetingUrl }),
      },
    });

    revalidatePath("/client-portal/chat");
    revalidatePath("/dashboard/live-chat");
    return { meetingUrl };
  } catch (error) {
    console.error("Error starting voice call:", error);
    return { error: "Failed to start voice call" };
  }
}

// Legacy function for backward compatibility
export async function startInstantCall(chatRoomId: string) {
  return startVideoCall(chatRoomId);
}

// Assign staff to chat room
export async function assignChatRoom(chatRoomId: string, staffId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const allowedRoles = ["ADMIN", "PARTNER", "MANAGER"];
  if (!allowedRoles.includes(user.role?.key || "")) {
    return { error: "Not authorized" };
  }

  try {
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { assignedToId: staffId },
    });

    revalidatePath("/dashboard/live-chat");
    return { success: true };
  } catch (error) {
    console.error("Error assigning chat room:", error);
    return { error: "Failed to assign chat room" };
  }
}

// Close chat room
export async function closeChatRoom(chatRoomId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { status: ChatRoomStatus.CLOSED },
    });

    revalidatePath("/dashboard/live-chat");
    return { success: true };
  } catch (error) {
    console.error("Error closing chat room:", error);
    return { error: "Failed to close chat room" };
  }
}

// Get mentionable users for a chat room
export async function getMentionableUsers(chatRoomId: string) {
  const user = await getCurrentUser();
  if (!user) return { users: [] };

  try {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!chatRoom) return { users: [] };

    // Get all staff members who can be mentioned
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          key: { in: ["ADMIN", "PARTNER", "MANAGER", "STAFF"] },
        },
      },
      select: { id: true, name: true, email: true },
    });

    // Combine client and staff for mention list
    const users = [
      chatRoom.client,
      ...staffUsers,
    ].filter((u) => u.id !== user.id); // Exclude current user

    return { users };
  } catch (error) {
    console.error("Error fetching mentionable users:", error);
    return { users: [] };
  }
}

