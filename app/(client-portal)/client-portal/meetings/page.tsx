"use client";

import { useState, useEffect } from "react";
import { Video, Calendar, Clock, User, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUpcomingMeetings } from "@/lib/chat-actions";

type Meeting = {
  id: string;
  title: string;
  description: string | null;
  meetingUrl: string;
  scheduledAt: Date;
  duration: number;
  status: string;
  host: { id: string; name: string | null };
};

export default function ClientMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setIsLoading(true);
    const result = await getUpcomingMeetings();
    if (result.meetings) {
      setMeetings(result.meetings as Meeting[]);
    }
    setIsLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMeetingNow = (scheduledAt: Date, duration: number) => {
    const now = new Date();
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + duration * 60000);
    return now >= start && now <= end;
  };

  const isUpcoming = (scheduledAt: Date) => {
    const now = new Date();
    const start = new Date(scheduledAt);
    const diff = start.getTime() - now.getTime();
    return diff > 0 && diff < 30 * 60000; // Within 30 minutes
  };

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
        <h1 className="text-2xl font-bold">Scheduled Meetings</h1>
        <p className="text-muted-foreground">View and join your scheduled video meetings</p>
      </div>

      {meetings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => {
            const isLive = isMeetingNow(meeting.scheduledAt, meeting.duration);
            const canJoinSoon = isUpcoming(meeting.scheduledAt);

            return (
              <Card key={meeting.id} className={isLive ? "border-green-500 bg-green-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{meeting.title}</CardTitle>
                      <CardDescription className="mt-1">{meeting.description}</CardDescription>
                    </div>
                    {isLive && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(meeting.scheduledAt)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(meeting.scheduledAt)} • {meeting.duration} mins
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Host: {meeting.host.name || "R V P J & Co."}
                  </div>

                  <Button
                    className="w-full mt-3"
                    disabled={!isLive && !canJoinSoon}
                    onClick={() => window.open(meeting.meetingUrl, "_blank")}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {isLive ? "Join Now" : canJoinSoon ? "Join Meeting" : "Join (Opens 30 mins before)"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Scheduled Meetings</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              You don&apos;t have any upcoming meetings. Our team will schedule meetings
              as needed through the chat.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/client-portal/chat"}>
              Start a Chat
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-3">Meeting Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ensure you have a stable internet connection</li>
            <li>• Use headphones for better audio quality</li>
            <li>• Test your camera and microphone before joining</li>
            <li>• Join 2-3 minutes before the scheduled time</li>
            <li>• Have relevant documents ready for discussion</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}



