import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { chatApi } from "./api/chatApi";
import type { ChatMessage } from "@/types/chat";

const SUGGESTED_PROMPTS = [
  "How do I systematically solve 2D Dynamic Programming grid problems?",
  "Conduct a 5-min mock interview on Amazon's Customer Obsession principle",
  "Design a URL Shortener (TinyURL) with 10k QPS scaling requirements",
  "What are the top 5 Graph traversal patterns asked at Google?",
];

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const history = await chatApi.getChatHistory();
      setMessages(history);
    }
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async (userPrompt?: string) => {
    const text = (userPrompt || input).trim();
    if (!text || isStreaming) return;

    setInput("");

    const userMessage: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const agentMessageId = "agent-" + Date.now();
    const initialAgentMessage: ChatMessage = {
      id: agentMessageId,
      role: "agent",
      content: "",
      createdAt: new Date().toISOString(),
      source: "ai_generated",
      isStreaming: true,
    };

    const updatedWithUser = [...messages, userMessage, initialAgentMessage];
    setMessages(updatedWithUser);
    setIsStreaming(true);

    let accumulatedContent = "";

    chatApi.sendMessageStream(
      text,
      (token: string) => {
        accumulatedContent += token;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      },
      () => {
        setIsStreaming(false);
        setMessages((prev) => {
          const final = prev.map((msg) =>
            msg.id === agentMessageId
              ? { ...msg, isStreaming: false }
              : msg
          );
          chatApi.saveHistory(final);
          return final;
        });
      },
      (err: Error) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMessageId
              ? {
                  ...msg,
                  content: `Error: ${err.message}. Please try again.`,
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    );
  };

  const handleClearHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: "msg-welcome",
        role: "agent",
        content:
          "Conversation cleared. How can I help you prepare for your technical interviews today?",
        createdAt: new Date().toISOString(),
        source: "ai_generated",
      },
    ];
    setMessages(initial);
    chatApi.saveHistory(initial);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render markdown-like formatting (bold, code blocks, bullet points)
  const formatContent = (content: string) => {
    // If empty streaming
    if (!content) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
        </span>
      );
    }

    return (
      <div className="space-y-2 leading-relaxed text-xs sm:text-sm">
        {content.split("\n\n").map((para, idx) => {
          if (para.startsWith("```")) {
            const lines = para.split("\n");
            const code = lines.slice(1, -1).join("\n");
            return (
              <pre
                key={idx}
                className="p-3.5 my-2 rounded-xl bg-black/70 border border-border/80 font-mono text-xs text-emerald-300 overflow-x-auto"
              >
                <code>{code}</code>
              </pre>
            );
          }
          if (para.startsWith("- ") || para.startsWith("* ") || /^\d+\./.test(para)) {
            const listItems = para.split("\n");
            return (
              <ul key={idx} className="space-y-1 my-1 pl-4 list-disc text-slate-200">
                {listItems.map((li, i) => (
                  <li key={i}>{li.replace(/^[-*]\s+|\d+\.\s+/, "")}</li>
                ))}
              </ul>
            );
          }
          if (para.startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="pl-3 border-l-2 border-blue-400 text-blue-200 italic my-2 bg-blue-950/20 py-1 rounded-r"
              >
                {para.replace(/^>\s+/, "")}
              </blockquote>
            );
          }

          return (
            <p key={idx} className="text-slate-200">
              {para}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 flex flex-col h-[calc(100vh-6rem)]">
      <PageHeader
        title="Placement Coach AI"
        description="Conversational placement mentor with RAG memory over your diagnostic gaps and company rubrics."
        badge={
          <Badge variant="purple" className="gap-1">
            <Sparkles className="h-3 w-3" /> SSE Token Stream
          </Badge>
        }
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-xs text-muted-foreground hover:text-rose-400 gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </Button>
        }
      />

      {/* Chat Messages Container */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/80 bg-card/75 backdrop-blur-xl shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isUser
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gradient-to-tr from-purple-600 to-indigo-600 border-indigo-500/50 text-white shadow-md shadow-indigo-500/20"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm group ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-secondary/70 border border-border/80 rounded-tl-xs"
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/40 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-purple-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-400" /> Placement Coach
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-foreground cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {formatContent(msg.content)}

                  <div className="text-[10px] text-muted-foreground/60 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-4 py-2 border-t border-border/50 bg-background/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 shrink-0">
            <Lightbulb className="h-3 w-3 text-amber-400" /> Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isStreaming}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/80 border border-border/60 text-slate-300 hover:text-foreground hover:bg-secondary shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 sm:p-4 border-t border-border/80 bg-background/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask placement coach anything (e.g. system design, DP, mock questions)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              className="flex-1 bg-secondary/40 border border-border/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <Button
              type="submit"
              variant="gradient"
              disabled={isStreaming || !input.trim()}
              className="h-10 px-4 rounded-xl shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
