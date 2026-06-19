import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Bell, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  match_found: "bg-blue-500",
  match_accepted: "bg-green-500",
  match_confirmed: "bg-primary",
  match_completed: "bg-amber-500",
  review_received: "bg-purple-500",
  match_rejected: "bg-destructive",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { data: notifications, isLoading, refetch } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "All notifications marked as read" });
        refetch();
      },
    });
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => refetch(),
    });
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <h2 className="text-xl font-semibold">Sign in to view notifications</h2>
              <Button asChild><Link href="/login">Login</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllRead.isPending} className="gap-2">
              <CheckCheck size={15} /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-20 animate-pulse bg-muted" />
            ))}
          </div>
        ) : !notifications?.length ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Bell size={28} className="text-primary/40" />
              </div>
              <h3 className="font-semibold text-lg">All clear</h3>
              <p className="text-muted-foreground text-sm">No notifications yet. Activity from your matches and reviews will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? "bg-background border-border opacity-70"
                    : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  notif.isRead ? "bg-muted-foreground/30" : (TYPE_COLORS[notif.type] || "bg-primary")
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.isRead ? "text-foreground/70" : "text-foreground"}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {timeAgo(notif.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
