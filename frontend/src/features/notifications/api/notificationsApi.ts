import { api } from "@/lib/axios";
import type { NotificationItem } from "@/types/notification";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "demo-student-id-001",
    type: "milestone_reminder",
    title: "Weekly Milestone Reminder",
    message: "You have 2 pending goals in Week 2 (Dynamic Programming). Keep up the daily streak!",
    readAt: null,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    userId: "demo-student-id-001",
    type: "reassessment_due",
    title: "Adaptive Reassessment Due",
    message: "It has been 14 days since your last Graph Algorithms check. Take a 10-min sprint.",
    readAt: null,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    userId: "demo-student-id-001",
    type: "roadmap_stale",
    title: "Target Company Profile Updated",
    message: "Your profile goals were modified. Click to trigger LangGraph roadmap regeneration.",
    readAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-4",
    userId: "demo-student-id-001",
    type: "system_alert",
    title: "New Google Interview Questions Added",
    message: "12 new coding and system design questions added to the Practice Bank.",
    readAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 75 * 3600 * 1000).toISOString(),
  },
];

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const response = await api.get<{ notifications: NotificationItem[] }>("/notifications");
      return response.data.notifications;
    } catch {
      const cached = localStorage.getItem("prepagent_notifications");
      return cached ? JSON.parse(cached) : MOCK_NOTIFICATIONS;
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      const current = await notificationsApi.getNotifications();
      const updated = current.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      );
      localStorage.setItem("prepagent_notifications", JSON.stringify(updated));
    }
  },

  markAllRead: async (): Promise<void> => {
    const current = await notificationsApi.getNotifications();
    const updated = current.map((n) => ({ ...n, readAt: new Date().toISOString() }));
    localStorage.setItem("prepagent_notifications", JSON.stringify(updated));
  },
};
