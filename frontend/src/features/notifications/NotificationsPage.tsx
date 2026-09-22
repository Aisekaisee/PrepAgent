import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationsApi } from "./api/notificationsApi";
import type { NotificationItem } from "@/types/notification";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    await notificationsApi.markRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
    await notificationsApi.markAllRead();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Notification Center"
        description="Automated cron alerts: milestone pacing reminders, reassessment prompts, and roadmap freshness notices."
        badge={
          unreadCount > 0 ? (
            <Badge variant="default" className="text-xs">
              {unreadCount} Unread
            </Badge>
          ) : undefined
        }
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="divide-y divide-border/60">
            {notifications.map((item) => {
              const isUnread = !item.readAt;
              return (
                <div
                  key={item.id}
                  className={`py-4 sm:px-2 rounded-xl transition-all flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${
                    isUnread ? "bg-primary/5 px-3" : "opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                        item.type === "milestone_reminder"
                          ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                          : item.type === "reassessment_due"
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                          : item.type === "roadmap_stale"
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                          : "bg-secondary border-border text-foreground"
                      }`}
                    >
                      {item.type === "milestone_reminder" && <Clock className="h-4 w-4" />}
                      {item.type === "reassessment_due" && <AlertCircle className="h-4 w-4" />}
                      {item.type === "roadmap_stale" && <Sparkles className="h-4 w-4" />}
                      {item.type === "system_alert" && <Bell className="h-4 w-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h4>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 block pt-1">
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 h-8"
                      >
                        Mark read
                      </Button>
                    )}
                    {item.type === "roadmap_stale" && (
                      <Link to="/roadmap">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Regenerate
                        </Button>
                      </Link>
                    )}
                    {item.type === "reassessment_due" && (
                      <Link to="/assessments">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Take Test
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
