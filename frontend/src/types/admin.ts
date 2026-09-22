export interface AdminAnalytics {
  activeStudents7d: number;
  totalAssessments: number;
  avgRoadmapCompletion: number;
  mostCommonGaps: Array<{ topic: string; count: number; avgGap: number }>;
  weeklySignups: Array<{ week: string; count: number }>;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
