"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Send, Paperclip, Phone, Video, FileText, Loader2, Download, AtSign } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getOrCreateChatRoom,
  getChatMessages,
  sendChatMessage,
  sendFileMessage,
  startVideoCall,
  startVoiceCall,
  getUpcomingMeetings,
  getMentionableUsers,
} from "@/lib/chat-actions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

type Meeting = {
  id: string;
  title: string;
  meetingUrl: string;
  scheduledAt: Date;
  duration: number;
  host: { name: string | null };
};

type MentionUser = {
  id: string;
  name: string | null;
  email: string;
};

export default function ClientChatPage() {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [mentionableUsers, setMentionableUsers] = useState<MentionUser[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeChat();
    loadMeetings();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatRoomId) return;
    const interval = setInterval(() => {
      loadMessages(chatRoomId);
    }, 3000);
    return () => clearInterval(interval);
  }, [chatRoomId]);

  const initializeChat = async () => {
    setIsLoading(true);
    const result = await getOrCreateChatRoom();
    if (result.chatRoom) {
      setChatRoomId(result.chatRoom.id);
      await loadMessages(result.chatRoom.id);
      await loadMentionableUsers(result.chatRoom.id);
    }
    setIsLoading(false);
  };

  const loadMessages = async (roomId: string) => {
    const result = await getChatMessages(roomId);
    if (result.messages) {
      setMessages(result.messages as Message[]);
    }
  };

  const loadMeetings = async () => {
    const result = await getUpcomingMeetings();
    if (result.meetings) {
      setMeetings(result.meetings as Meeting[]);
    }
  };

  const loadMentionableUsers = async (roomId: string) => {
    const result = await getMentionableUsers(roomId);
    if (result.users) {
      setMentionableUsers(result.users as MentionUser[]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoomId) return;

    const messageContent = newMessage;
    setNewMessage("");
    setShowMentions(false);

    startTransition(async () => {
      await sendChatMessage(chatRoomId, messageContent);
      await loadMessages(chatRoomId);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setNewMessage(value);
    setCursorPosition(position);

    // Check for @ mention trigger
    const textBeforeCursor = value.substring(0, position);
    const atIndex = textBeforeCursor.lastIndexOf("@");
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      // Only show if @ is at start or after a space, and no space after @
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
    
    const newText = 
      textBeforeCursor.substring(0, atIndex) + 
      `@${user.name || user.email} ` + 
      textAfterCursor;
    
    setNewMessage(newText);
    setShowMentions(false);
    setMentionFilter("");
    inputRef.current?.focus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatRoomId) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `chat-${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("rvpj-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("rvpj-media")
        .getPublicUrl(filePath);

      await sendFileMessage(chatRoomId, file.name, urlData.publicUrl, file.size, file.type);
      await loadMessages(chatRoomId);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVideoCall = async () => {
    if (!chatRoomId) return;
    startTransition(async () => {
      const result = await startVideoCall(chatRoomId);
      if (result.meetingUrl) {
        window.open(result.meetingUrl, "_blank");
        await loadMessages(chatRoomId);
      }
    });
  };

  const handleVoiceCall = async () => {
    if (!chatRoomId) return;
    startTransition(async () => {
      const result = await startVoiceCall(chatRoomId);
      if (result.meetingUrl) {
        window.open(result.meetingUrl, "_blank");
        await loadMessages(chatRoomId);
      }
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

  // Render message content with mention highlighting
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="bg-primary/20 text-primary rounded px-1 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Parse call message
  const parseCallMessage = (content: string) => {
    try {
      const data = JSON.parse(content);
      return data;
    } catch {
      return { type: "video", url: content };
    }
  };

  const filteredMentionUsers = mentionableUsers.filter(
    (u) =>
      (u.name?.toLowerCase().includes(mentionFilter) || u.email.toLowerCase().includes(mentionFilter))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Chat Support</h1>
        <p className="text-muted-foreground">Chat with our team in real-time</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Support Chat</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleVideoCall} disabled={isPending}>
                  <Video className="h-4 w-4 mr-1" />
                  Video Call
                </Button>
                <Button variant="outline" size="sm" onClick={handleVoiceCall} disabled={isPending}>
                  <Phone className="h-4 w-4 mr-1" />
                  Voice Call
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation with our team!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender.email !== "admin@rvpj.in";
                  
                  return (
                    <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {msg.messageType === "TEXT" && (
                          <p className="text-sm whitespace-pre-wrap">{renderMessageContent(msg.content || "")}</p>
                        )}

                        {msg.messageType === "IMAGE" && (
                          <div>
                            <img src={msg.fileUrl!} alt={msg.fileName!} className="max-w-full rounded" />
                            <p className="text-xs mt-1 opacity-70">{msg.fileName}</p>
                          </div>
                        )}

                        {msg.messageType === "FILE" && (
                          <a href={msg.fileUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                            <FileText className="h-5 w-5" />
                            <div>
                              <p className="text-sm font-medium">{msg.fileName}</p>
                              <p className="text-xs opacity-70">{formatFileSize(msg.fileSize!)}</p>
                            </div>
                            <Download className="h-4 w-4 ml-2" />
                          </a>
                        )}

                        {msg.messageType === "CALL_STARTED" && (() => {
                          const callData = parseCallMessage(msg.content || "");
                          return (
                            <div className="flex items-center gap-2">
                              {callData.type === "voice" ? <Phone className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                              <span className="text-sm">{callData.type === "voice" ? "Voice" : "Video"} call started</span>
                              <a href={callData.url} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium">
                                Join Call
                              </a>
                            </div>
                          );
                        })()}

                        <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input with Mention */}
            <div className="border-t p-4 relative">
              {/* Mention Dropdown */}
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
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
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
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length > 0 ? (
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="rounded-lg border p-3">
                      <p className="font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(meeting.scheduledAt).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration: {meeting.duration} mins</p>
                      <Button size="sm" className="mt-2 w-full" onClick={() => window.open(meeting.meetingUrl, "_blank")}>
                        <Video className="h-3 w-3 mr-1" />
                        Join Meeting
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>📎 Click paperclip to share files</p>
              <p>📹 Video Call - with camera</p>
              <p>📞 Voice Call - audio only</p>
              <p>@ Type @ to mention someone</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
