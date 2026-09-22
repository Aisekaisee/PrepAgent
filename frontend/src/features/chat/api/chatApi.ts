import { api } from "@/lib/axios";
import type { ChatMessage } from "@/types/chat";
import { streamChatResponse } from "@/lib/sse";

const LOCAL_STORAGE_CHAT_KEY = "prepagent_chat_messages";

export const chatApi = {
  getChatHistory: async (): Promise<ChatMessage[]> => {
    try {
      const response = await api.get<{ messages: ChatMessage[] }>("/chat/history");
      return response.data.messages;
    } catch {
      const stored = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const initial: ChatMessage[] = [
        {
          id: "msg-welcome",
          role: "agent",
          content:
            "Hi Anuj! 👋 I'm your **PrepAgent AI Placement Coach**.\n\nI have reviewed your target companies (**Google, Amazon, Microsoft, Uber**) and diagnostic assessment results. You currently have a critical skill gap in **Dynamic Programming** and need polish in **System Design**.\n\nHow can I assist your prep today? You can ask me to explain algorithms, run a mock behavioral interview, or break down system architectures.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          source: "ai_generated",
        },
      ];
      localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(initial));
      return initial;
    }
  },

  sendMessageStream: (
    message: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ) => {
    return streamChatResponse({ message, onToken, onDone, onError });
  },

  saveHistory: (messages: ChatMessage[]) => {
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(messages));
  },
};
