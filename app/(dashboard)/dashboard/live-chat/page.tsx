"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Send, Paperclip, Phone, Video, FileText, Loader2, Download, Users, MessageSquare, Calendar, X, AtSign, Plus, Search } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllChatRooms,
  getChatMessages,
  sendChatMessage,
  sendFileMessage,
  startVideoCall,
  startVoiceCall,
  scheduleMeeting,
  closeChatRoom,
  getUsers,
  getMentionableUsers,
  getAllClients,
  startNewChat,
} from "./actions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChatRoom = {
  id: string;
  status: string;
  lastMessageAt: Date | null;
  client: { id: string; name: string | null; email: string; panNumber: string | null };
  assignedTo: { id: string; name: string | null } | null;
  messages: { content: string | null; createdAt: Date }[];
  _count: { messages: number };
};

type Message = {
  id: string;
  content: string | null;
  messageType: string;
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: Date;
  sender: { id: string; name: string | null; email: string };
};

type MentionUser = {
  id: string;
  name: string | null;
  email: string;
};

type Client = {
  id: string;
  name: string | null;
  email: string;
  panNumber: string | null;
};

export default function LiveChatAdminPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: "", description: "", scheduledAt: "", duration: 30 });
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [initialChatMessage, setInitialChatMessage] = useState("");
  const [mentionableUsers, setMentionableUsers] = useState<MentionUser[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadChatRooms();
      if (selectedRoom) loadMessages(selectedRoom.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  const loadChatRooms = async () => {
    const result = await getAllChatRooms();
    if (result.chatRooms) setChatRooms(result.chatRooms as ChatRoom[]);
    setIsLoading(false);
  };

  const loadMessages = async (roomId: string) => {
    const result = await getChatMessages(roomId);
    if (result.messages) setMessages(result.messages as Message[]);
  };

  const loadMentionableUsers = async (roomId: string) => {
    const result = await getMentionableUsers(roomId);
    if (result.users) setMentionableUsers(result.users as MentionUser[]);
  };

  const loadAllClients = async () => {
    const result = await getAllClients();
    if (result.clients) setAllClients(result.clients as Client[]);
  };

  const handleStartNewChat = async () => {
    if (!selectedClientId) {
      alert("Please select a client");
      return;
    }

    startTransition(async () => {
      const result = await startNewChat(selectedClientId, initialChatMessage || undefined);
      if (result.chatRoom) {
        setShowNewChatModal(false);
        setSelectedClientId(null);
        setInitialChatMessage("");
        setClientSearch("");
        await loadChatRooms();
        // Auto-select the new chat room
        const rooms = await getAllChatRooms();
        const newRoom = rooms.chatRooms?.find((r: ChatRoom) => r.id === result.chatRoom?.id);
        if (newRoom) {
          handleSelectRoom(newRoom as ChatRoom);
        }
      } else {
        alert(result.error || "Failed to start chat");
      }
    });
  };

  const openNewChatModal = async () => {
    await loadAllClients();
    setShowNewChatModal(true);
  };

  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.id);
    await loadMentionableUsers(room.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const messageContent = newMessage;
    setNewMessage("");
    setShowMentions(false);

    startTransition(async () => {
      await sendChatMessage(selectedRoom.id, messageContent);
      await loadMessages(selectedRoom.id);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setNewMessage(value);
    setCursorPosition(position);

    const textBeforeCursor = value.substring(0, position);
    const atIndex = textBeforeCursor.lastIndexOf("@");
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : " ";
      if ((charBeforeAt === " " || atIndex === 0) && !textAfterAt.includes(" ")) {
        setShowMentions(true);
        setMentionFilter(textAfterAt.toLowerCase());
        return;
      }
    }
    setShowMentions(false);
    setMentionFilter("");
  };

  const handleMentionSelect = (user: MentionUser) => {
    const textBeforeCursor = newMessage.substring(0, cursorPosition);
    const textAfterCursor = newMessage.substring(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf("@");
    
    const newText = textBeforeCursor.substring(0, atIndex) + `@${user.name || user.email} ` + textAfterCursor;
    
    setNewMessage(newText);
    setShowMentions(false);
    setMentionFilter("");
    inputRef.current?.focus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `chat-${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("rvpj-media").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("rvpj-media").getPublicUrl(filePath);

      await sendFileMessage(selectedRoom.id, file.name, urlData.publicUrl, file.size, file.type);
      await loadMessages(selectedRoom.id);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVideoCall = async () => {
    if (!selectedRoom) return;
    startTransition(async () => {
      const result = await startVideoCall(selectedRoom.id);
      if (result.meetingUrl) {
        window.open(result.meetingUrl, "_blank");
        await loadMessages(selectedRoom.id);
      }
    });
  };

  const handleVoiceCall = async () => {
    if (!selectedRoom) return;
    startTransition(async () => {
      const result = await startVoiceCall(selectedRoom.id);
      if (result.meetingUrl) {
        window.open(result.meetingUrl, "_blank");
        await loadMessages(selectedRoom.id);
      }
    });
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    startTransition(async () => {
      const result = await scheduleMeeting({ clientId: selectedRoom.client.id, ...meetingData });
      if (result.meeting) {
        setShowMeetingModal(false);
        setMeetingData({ title: "", description: "", scheduledAt: "", duration: 30 });
        alert("Meeting scheduled successfully!");
      } else {
        alert(result.error || "Failed to schedule meeting");
      }
    });
  };

  const handleCloseChat = async () => {
    if (!selectedRoom || !confirm("Are you sure you want to close this chat?")) return;
    startTransition(async () => {
      await closeChatRoom(selectedRoom.id);
      setSelectedRoom(null);
      setMessages([]);
      await loadChatRooms();
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} className="bg-blue-100 text-blue-700 rounded px-1 font-medium">{part}</span>;
      }
      return part;
    });
  };

  const parseCallMessage = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { type: "video", url: content };
    }
  };

  const filteredMentionUsers = mentionableUsers.filter(
    (u) => u.name?.toLowerCase().includes(mentionFilter) || u.email.toLowerCase().includes(mentionFilter)
  );

  const totalUnread = chatRooms.reduce((acc, room) => acc + room._count.messages, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Chat Support</h1>
          <p className="text-muted-foreground">
            {chatRooms.length} active chats{totalUnread > 0 && ` · ${totalUnread} unread`}
          </p>
        </div>
        <Button onClick={openNewChatModal}>
          <Plus className="h-4 w-4 mr-2" />
          Start New Chat
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-220px)]">
        {/* Chat List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Active Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : chatRooms.length > 0 ? (
              <div>
                {chatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full text-left p-4 border-b hover:bg-muted/50 transition ${selectedRoom?.id === room.id ? "bg-muted" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{room.client.name || room.client.email}</p>
                        <p className="text-xs text-muted-foreground">{room.client.panNumber}</p>
                      </div>
                      {room._count.messages > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">{room._count.messages}</span>
                      )}
                    </div>
                    {room.messages[0] && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{room.messages[0].content?.substring(0, 40)}...</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active chats</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedRoom ? (
            <>
              <CardHeader className="border-b py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedRoom.client.name || selectedRoom.client.email}</CardTitle>
                    <CardDescription>{selectedRoom.client.panNumber}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleVideoCall} disabled={isPending}>
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleVoiceCall} disabled={isPending}>
                      <Phone className="h-4 w-4 mr-1" />
                      Voice
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowMeetingModal(true)}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleCloseChat}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isFromClient = msg.sender.id === selectedRoom.client.id;

                    return (
                      <div key={msg.id} className={`flex ${isFromClient ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${isFromClient ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                          {msg.messageType === "TEXT" && (
                            <p className="text-sm whitespace-pre-wrap">{renderMessageContent(msg.content || "")}</p>
                          )}

                          {msg.messageType === "IMAGE" && (
                            <div>
                              <img src={msg.fileUrl!} alt={msg.fileName!} className="max-w-full rounded" />
                            </div>
                          )}

                          {msg.messageType === "FILE" && (
                            <a href={msg.fileUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                              <FileText className="h-5 w-5" />
                              <div>
                                <p className="text-sm font-medium">{msg.fileName}</p>
                                <p className="text-xs opacity-70">{formatFileSize(msg.fileSize!)}</p>
                              </div>
                            </a>
                          )}

                          {msg.messageType === "CALL_STARTED" && (() => {
                            const callData = parseCallMessage(msg.content || "");
                            return (
                              <div className="flex items-center gap-2">
                                {callData.type === "voice" ? <Phone className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                <span className="text-sm">{callData.type === "voice" ? "Voice" : "Video"} call</span>
                                <a href={callData.url} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs">
                                  Join
                                </a>
                              </div>
                            );
                          })()}

                          <p className={`text-xs mt-1 ${isFromClient ? "text-muted-foreground" : "opacity-70"}`}>
                            {msg.sender.name || "Client"} · {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input with Mention */}
                <div className="border-t p-4 relative">
                  {showMentions && filteredMentionUsers.length > 0 && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                      {filteredMentionUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleMentionSelect(user)}
                          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
                        >
                          <AtSign className="h-4 w-4 text-primary" />
                          <span className="font-medium">{user.name || user.email}</span>
                          {user.name && <span className="text-xs text-muted-foreground">{user.email}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                    </Button>
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type a message... Use @ to mention"
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isPending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Schedule Meeting</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMeetingModal(false)}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <Label>Meeting Title *</Label>
                <Input value={meetingData.title} onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })} placeholder="e.g., Tax Planning Discussion" required />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={meetingData.description} onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })} placeholder="Meeting agenda..." rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date & Time *</Label>
                  <Input type="datetime-local" value={meetingData.scheduledAt} onChange={(e) => setMeetingData({ ...meetingData, scheduledAt: e.target.value })} required />
                </div>
                <div>
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={meetingData.duration} onChange={(e) => setMeetingData({ ...meetingData, duration: parseInt(e.target.value) })} min={15} max={120} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowMeetingModal(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? "Scheduling..." : "Schedule Meeting"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Start New Chat</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowNewChatModal(false); setSelectedClientId(null); setClientSearch(""); setInitialChatMessage(""); }}>
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Client Search */}
              <div>
                <Label>Select Client *</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search by name, email, or PAN..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Client List */}
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {allClients.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No clients found</p>
                  </div>
                ) : (
                  allClients
                    .filter((c) =>
                      c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
                      c.panNumber?.toLowerCase().includes(clientSearch.toLowerCase())
                    )
                    .map((client) => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-muted/50 transition ${
                          selectedClientId === client.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <p className="font-medium text-sm">{client.name || client.email}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                        {client.panNumber && (
                          <p className="text-xs text-muted-foreground">PAN: {client.panNumber}</p>
                        )}
                      </button>
                    ))
                )}
              </div>

              {/* Initial Message (Optional) */}
              <div>
                <Label>Initial Message (Optional)</Label>
                <Textarea
                  value={initialChatMessage}
                  onChange={(e) => setInitialChatMessage(e.target.value)}
                  placeholder="Type a welcome message to start the conversation..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowNewChatModal(false); setSelectedClientId(null); setClientSearch(""); setInitialChatMessage(""); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartNewChat}
                  className="flex-1"
                  disabled={isPending || !selectedClientId}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
