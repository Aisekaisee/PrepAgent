export type ChatRole = "user" | "agent";

export interface ChatMessage {
  id: string;
  userId?: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  source?: "ai_generated" | "system";
  isStreaming?: boolean;
}

export interface ChatStreamToken {
  type: "token" | "done" | "error";
  content?: string;
  source?: string;
  code?: string;
}
