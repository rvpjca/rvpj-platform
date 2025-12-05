"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MessageType, ChatRoomStatus } from "@prisma/client";

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

    const staffUsers = await prisma.user.findMany({
      where: {
        role: { key: { in: ["ADMIN", "PARTNER", "MANAGER", "STAFF"] } },
      },
      select: { id: true, name: true, email: true },
    });

    const users = [chatRoom.client, ...staffUsers].filter((u) => u.id !== user.id);
    return { users };
  } catch (error) {
    console.error("Error fetching mentionable users:", error);
    return { users: [] };
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

    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { lastMessageAt: new Date() },
    });

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

    revalidatePath("/dashboard/live-chat");
    return { message };
  } catch (error) {
    console.error("Error sending file:", error);
    return { error: "Failed to send file" };
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

    revalidatePath("/dashboard/live-chat");
    return { meetingUrl };
  } catch (error) {
    console.error("Error starting voice call:", error);
    return { error: "Failed to start voice call" };
  }
}

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

// Close chat room
export async function closeChatRoom(chatRoomId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Check if chat room exists first
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      return { error: "Chat room not found" };
    }

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

// Get all users (for assignment)
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          key: { in: ["ADMIN", "PARTNER", "MANAGER", "STAFF"] },
        },
      },
      select: { id: true, name: true, email: true },
    });
    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], error: "Failed to fetch users" };
  }
}

// Get all clients for starting new chat
export async function getAllClients() {
  const user = await getCurrentUser();
  if (!user) return { clients: [], error: "Not authenticated" };

  try {
    const clients = await prisma.user.findMany({
      where: {
        role: { key: "CLIENT" },
      },
      select: { id: true, name: true, email: true, panNumber: true },
      orderBy: { name: "asc" },
    });
    return { clients };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], error: "Failed to fetch clients" };
  }
}

// Start new chat with a client
export async function startNewChat(clientId: string, initialMessage?: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const allowedRoles = ["ADMIN", "PARTNER", "MANAGER", "STAFF"];
  if (!allowedRoles.includes(user.role?.key || "")) {
    return { error: "Not authorized" };
  }

  try {
    // Check if there's already an active chat room with this client
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        clientId,
        status: ChatRoomStatus.ACTIVE,
      },
    });

    // Create new room if none exists
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          clientId,
          assignedToId: user.id,
          status: ChatRoomStatus.ACTIVE,
        },
      });
    }

    // Send initial message if provided
    if (initialMessage) {
      await prisma.chatMessage.create({
        data: {
          chatRoomId: chatRoom.id,
          senderId: user.id,
          content: initialMessage,
          messageType: "TEXT",
        },
      });

      await prisma.chatRoom.update({
        where: { id: chatRoom.id },
        data: { lastMessageAt: new Date() },
      });
    }

    revalidatePath("/dashboard/live-chat");
    return { chatRoom };
  } catch (error) {
    console.error("Error starting new chat:", error);
    return { error: "Failed to start chat" };
  }
}
