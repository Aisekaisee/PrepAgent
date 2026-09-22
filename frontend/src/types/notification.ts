export type NotificationType =
  | "milestone_reminder"
  | "reassessment_due"
  | "roadmap_stale"
  | "system_alert";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
}
