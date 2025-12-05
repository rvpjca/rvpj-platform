"use client";

import { useState, useEffect, useTransition } from "react";
import { MessageSquare, Send, Plus, User, Building2, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientMessages, sendMessage, markMessageAsRead } from "../actions";

type Message = {
  id: string;
  subject: string;
  message: string;
  isRead: boolean;
  isFromClient: boolean;
  createdAt: Date;
  sender: { name: string | null; email: string };
  replies: {
    id: string;
    message: string;
    isFromClient: boolean;
    createdAt: Date;
    sender: { name: string | null; email: string };
  }[];
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState({ subject: "", message: "" });
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    const result = await getClientMessages();
    if (result.messages) {
      setMessages(result.messages as Message[]);
    }
    setIsLoading(false);
  };

  const handleSendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.subject || !newMessage.message) return;

    startTransition(async () => {
      const result = await sendMessage(newMessage);
      if (result.success) {
        setNewMessage({ subject: "", message: "" });
        setIsNewMessageOpen(false);
        loadMessages();
      } else {
        alert(result.error || "Failed to send message");
      }
    });
  };

  const handleSendReply = async () => {
    if (!replyText || !selectedMessage) return;

    startTransition(async () => {
      const result = await sendMessage({
        subject: `Re: ${selectedMessage.subject}`,
        message: replyText,
        parentId: selectedMessage.id,
      });
      if (result.success) {
        setReplyText("");
        loadMessages();
        // Update selected message with new reply
        const updated = await getClientMessages();
        const updatedMsg = updated.messages?.find((m: Message) => m.id === selectedMessage.id);
        if (updatedMsg) setSelectedMessage(updatedMsg as Message);
      } else {
        alert(result.error || "Failed to send reply");
      }
    });
  };

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    
    // Mark as read if it's unread and from firm
    if (!msg.isRead && !msg.isFromClient) {
      await markMessageAsRead(msg.id);
      loadMessages();
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead && !m.isFromClient).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with our team
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setIsNewMessageOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : messages.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full text-left p-4 border-b hover:bg-muted/50 transition ${
                      selectedMessage?.id === msg.id ? "bg-muted" : ""
                    } ${!msg.isRead && !msg.isFromClient ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        msg.isFromClient ? "bg-green-100" : "bg-blue-100"
                      }`}>
                        {msg.isFromClient ? (
                          <User className="h-4 w-4 text-green-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm truncate ${
                            !msg.isRead && !msg.isFromClient ? "text-primary" : ""
                          }`}>
                            {msg.subject}
                          </p>
                          {!msg.isRead && !msg.isFromClient && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {msg.message.substring(0, 50)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleDateString()}
                          {msg.replies.length > 0 && ` · ${msg.replies.length} replies`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground px-4">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm mt-1">Start a conversation with our team</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedMessage.subject}</CardTitle>
                    <CardDescription>
                      Started {new Date(selectedMessage.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
                  {/* Original message */}
                  <div className={`flex gap-3 ${selectedMessage.isFromClient ? "flex-row-reverse" : ""}`}>
                    <div className={`rounded-full p-2 h-fit ${
                      selectedMessage.isFromClient ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      {selectedMessage.isFromClient ? (
                        <User className="h-4 w-4 text-green-600" />
                      ) : (
                        <Building2 className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 max-w-[80%] ${
                      selectedMessage.isFromClient 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                      <p className={`text-xs mt-2 ${
                        selectedMessage.isFromClient ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {selectedMessage.isFromClient ? "You" : selectedMessage.sender.name || "R V P J & Co."} · 
                        {new Date(selectedMessage.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedMessage.replies.map((reply) => (
                    <div key={reply.id} className={`flex gap-3 ${reply.isFromClient ? "flex-row-reverse" : ""}`}>
                      <div className={`rounded-full p-2 h-fit ${
                        reply.isFromClient ? "bg-green-100" : "bg-blue-100"
                      }`}>
                        {reply.isFromClient ? (
                          <User className="h-4 w-4 text-green-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 max-w-[80%] ${
                        reply.isFromClient 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                        <p className={`text-xs mt-2 ${
                          reply.isFromClient ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {reply.isFromClient ? "You" : reply.sender.name || "R V P J & Co."} · 
                          {new Date(reply.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendReply} 
                      disabled={isPending || !replyText}
                      className="shrink-0"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="py-20 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to view</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Message Modal */}
      {isNewMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Message</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsNewMessageOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSendNewMessage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="e.g., Query about ITR filing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Write your message here..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewMessageOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



