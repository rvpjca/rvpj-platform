"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Radio,
  Clock,
  FileText,
  Send,
  Users,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getWhatsAppStats,
  getWhatsAppBroadcasts,
  createWhatsAppBroadcast,
  sendBroadcast,
  getScheduledMessages,
  cancelScheduledMessage,
  getWhatsAppTemplates,
  createWhatsAppTemplate,
} from "../actions";

type Stats = {
  totalContacts: number;
  totalMessages: number;
  todayMessages: number;
  scheduledCount: number;
  broadcastCount: number;
};

type Broadcast = {
  id: string;
  name: string;
  content: string;
  totalContacts: number;
  sentCount: number;
  status: string;
  scheduledAt: Date | null;
  createdAt: Date;
};

type Template = {
  id: string;
  name: string;
  content: string;
  category: string;
  isApproved: boolean;
};

type ScheduledMsg = {
  id: string;
  content: string;
  scheduledAt: Date;
  contact: { id: string; name: string | null; phoneNumber: string };
};

export default function WhatsAppBulkPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [scheduledMsgs, setScheduledMsgs] = useState<ScheduledMsg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState({
    name: "",
    content: "",
    targetAll: true,
    tags: "",
    scheduledAt: "",
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    category: "MARKETING",
  });

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [statsRes, broadcastsRes, templatesRes, scheduledRes] = await Promise.all([
      getWhatsAppStats(),
      getWhatsAppBroadcasts(),
      getWhatsAppTemplates(),
      getScheduledMessages(),
    ]);

    if (statsRes.stats) setStats(statsRes.stats);
    if (broadcastsRes.broadcasts) setBroadcasts(broadcastsRes.broadcasts as Broadcast[]);
    if (templatesRes.templates) setTemplates(templatesRes.templates as Template[]);
    if (scheduledRes.messages) setScheduledMsgs(scheduledRes.messages as ScheduledMsg[]);
    setIsLoading(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateBroadcast = async () => {
    startTransition(async () => {
      const result = await createWhatsAppBroadcast({
        name: broadcastForm.name,
        content: broadcastForm.content,
        targetAll: broadcastForm.targetAll,
        targetTags: broadcastForm.tags ? broadcastForm.tags.split(",").map((t) => t.trim()) : [],
        scheduledAt: broadcastForm.scheduledAt || undefined,
      });

      if (result.broadcast) {
        setShowBroadcastModal(false);
        setBroadcastForm({ name: "", content: "", targetAll: true, tags: "", scheduledAt: "" });
        await loadData();
      } else {
        alert(result.error);
      }
    });
  };

  const handleSendBroadcast = async (broadcastId: string) => {
    if (!confirm("Send this broadcast now?")) return;
    startTransition(async () => {
      const result = await sendBroadcast(broadcastId);
      if (result.sentCount !== undefined) {
        alert(`Broadcast sent to ${result.sentCount} contacts!`);
        await loadData();
      } else {
        alert(result.error);
      }
    });
  };

  const handleCreateTemplate = async () => {
    startTransition(async () => {
      const result = await createWhatsAppTemplate(templateForm);
      if (result.template) {
        setShowTemplateModal(false);
        setTemplateForm({ name: "", content: "", category: "MARKETING" });
        await loadData();
      } else {
        alert(result.error);
      }
    });
  };

  const handleCancelScheduled = async (messageId: string) => {
    if (!confirm("Cancel this scheduled message?")) return;
    startTransition(async () => {
      await cancelScheduledMessage(messageId);
      await loadData();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6 text-green-600" />
            WhatsApp Bulk & Templates
          </h1>
          <p className="text-muted-foreground">
            Manage broadcasts, templates, and scheduled sends separately from live chat.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isPending}>
            Refresh
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalContacts}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Messages Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.broadcastCount}</p>
                  <p className="text-xs text-muted-foreground">Broadcast Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.scheduledCount}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Sends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Broadcasts */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Broadcast Campaigns</h2>
                <p className="text-sm text-muted-foreground">
                  Build, schedule, and review bulk outreach.
                </p>
              </div>
              <Button onClick={() => setShowBroadcastModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Broadcast
              </Button>
            </div>

            {broadcasts.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No broadcasts yet. Create your first campaign.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {broadcasts.map((broadcast) => (
                  <Card key={broadcast.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{broadcast.name}</CardTitle>
                      <CardDescription>
                        {broadcast.totalContacts} contacts · {broadcast.sentCount} sent
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {broadcast.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            broadcast.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : broadcast.status === "SCHEDULED"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {broadcast.status}
                        </span>
                        {broadcast.status === "DRAFT" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendBroadcast(broadcast.id)}
                            disabled={isPending}
                          >
                            Send Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Scheduled messages */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Scheduled Messages</h2>
                <p className="text-sm text-muted-foreground">
                  Messages waiting to be delivered.
                </p>
              </div>
            </div>

            {scheduledMsgs.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No scheduled messages.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduledMsgs.map((msg) => (
                  <Card key={msg.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">
                            {msg.contact.name || msg.contact.phoneNumber}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(msg.scheduledAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelScheduled(msg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Templates */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Message Templates</h2>
                <p className="text-sm text-muted-foreground">
                  Reusable copy approved for WhatsApp Business.
                </p>
              </div>
              <Button onClick={() => setShowTemplateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            {templates.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No templates yet. Create one to start personalising broadcasts.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            template.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {template.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <CardDescription>{template.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {template.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Broadcast</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowBroadcastModal(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Broadcast Name *</Label>
                <Input
                  value={broadcastForm.name}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, name: e.target.value })}
                  placeholder="GST Reminder March 2024"
                />
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea
                  value={broadcastForm.content}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  placeholder="Type your message..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Target</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={broadcastForm.targetAll}
                      onChange={() => setBroadcastForm({ ...broadcastForm, targetAll: true })}
                    />
                    All Contacts
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!broadcastForm.targetAll}
                      onChange={() => setBroadcastForm({ ...broadcastForm, targetAll: false })}
                    />
                    By Tags
                  </label>
                </div>
                {!broadcastForm.targetAll && (
                  <Input
                    className="mt-2"
                    value={broadcastForm.tags}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, tags: e.target.value })}
                    placeholder="client, vip (comma separated)"
                  />
                )}
              </div>
              <div>
                <Label>Schedule (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={broadcastForm.scheduledAt}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, scheduledAt: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBroadcastModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateBroadcast} className="flex-1" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Broadcast"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Template</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTemplateModal(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g., gst_reminder"
                />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Hello {{1}}, your GST return is due on {{2}}..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{{1}}"}, {"{{2}}"} for dynamic variables
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTemplateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} className="flex-1" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Template"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

