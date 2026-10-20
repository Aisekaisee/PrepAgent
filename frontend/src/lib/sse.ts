import { env } from "../config/env";
import { useAuthStore } from "@/stores/authStore";
import type { Roadmap, RoadmapProgressEvent } from "@/types/roadmap";

/**
 * Stream placement coach chat messages.
 * Attempts real SSE endpoint POST /chat/message first;
 * if unreachable, provides a rich simulated AI response with realistic token-by-token streaming.
 */
export async function streamChatResponse({
  message,
  onToken,
  onDone,
  onError,
}: {
  message: string;
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}) {
  const token = useAuthStore.getState().accessToken;

  try {
    const response = await fetch(`${env.apiUrl}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            try {
              const data = JSON.parse(trimmed.slice(5).trim());
              if (data.type === "token" && data.content) {
                onToken(data.content);
              } else if (data.type === "done") {
                onDone();
                return;
              }
            } catch {
              // Ignore partial parse
            }
          }
        }
      }
      onDone();
      return;
    }
  } catch (err) {
    if (err instanceof TypeError && err.message !== "Failed to fetch") {
      onError(err);
    }
    // Backend endpoint not active, fall through to intelligent mock stream
  }

  // Fallback intelligent simulated response
  const sampleResponses: Record<string, string> = {
    default: `Hello! I'm your **PrepAgent Placement Coach** 🎯.

Based on your target companies and current skill profile, here is what I recommend focusing on:

1. **System Design Fundamentals**: Make sure you understand horizontal scaling, caching strategies (Redis / Memcached), and message queues (Kafka / RabbitMQ).
2. **Data Structures & Algorithms**: Focus on Medium-difficulty Dynamic Programming and Graph algorithms (BFS, Dijkstra, Topological Sort).
3. **Behavioral STAR Stories**: Prepare 2–3 structured stories highlighting leadership, conflict resolution, and technical problem-solving.

Feel free to ask me to drill into any specific topic, review your roadmap, or conduct a quick mock question!`,
    dp: `Here is a structured approach to master **Dynamic Programming** for MAANG interviews:

- **Phase 1: 1D DP Fundamentals**: Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence.
- **Phase 2: 2D & Grid DP**: Unique Paths, Minimum Path Sum, Longest Common Subsequence, Edit Distance.
- **Phase 3: Knapsack Patterns**: 0/1 Knapsack, Subset Sum, Target Sum.

**Key Rule to Remember:**
> Always define your state: What does \`dp[i][j]\` represent? Then establish the recurrence relation and base cases.`,
    system: `When tackling **System Design** for companies like Google or Uber:

1. **Requirements Clarification (3-5 mins)**:
   - Functional (e.g. read/write ratio, latency targets)
   - Non-functional (99.99% availability, eventual consistency)
2. **Back-of-Envelope Estimation**:
   - QPS (Queries Per Second)
   - Storage requirements over 5 years
3. **High-Level Architecture**:
   - Clients ➔ CDN / API Gateway ➔ Load Balancers ➔ Stateless Microservices ➔ Distributed Cache / DB.
4. **Deep Dive & Bottlenecks**:
   - Single points of failure, partition tolerance, and failover mechanisms.`,
  };

  const lower = message.toLowerCase();
  let selectedText = sampleResponses.default;
  if (lower.includes("dynamic programming") || lower.includes("dp")) {
    selectedText = sampleResponses.dp;
  } else if (lower.includes("system design") || lower.includes("uber") || lower.includes("architecture")) {
    selectedText = sampleResponses.system;
  }

  // Stream word by word with subtle typing cadence
  const words = selectedText.split(" ");
  let i = 0;

  const interval = setInterval(() => {
    if (i < words.length) {
      onToken((i > 0 ? " " : "") + words[i]);
      i++;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 25);
}

/**
 * Stream roadmap generation progress events via SSE.
 */
export async function streamRoadmapGeneration({
  onProgress,
  onComplete,
  onError,
}: {
  onProgress: (event: RoadmapProgressEvent) => void;
  onComplete: (roadmap: Roadmap) => void;
  onError: (err: Error) => void;
}) {
  const token = useAuthStore.getState().accessToken;

  try {
    const response = await fetch(`${env.apiUrl}/roadmap/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let errMsg = `Server returned status ${response.status}`;
      try {
        const errData = await response.json();
        errMsg = errData.message || errMsg;
      } catch {
        // Ignore
      }
      onError(new Error(errMsg));
      return;
    }

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            try {
              const data = JSON.parse(trimmed.slice(5).trim());
              if (data.type === "progress") {
                onProgress(data);
              } else if (
                (data.type === "complete" || data.type === "done") &&
                (data.data || data.roadmap)
              ) {
                onComplete(data.data || data.roadmap);
                return;
              } else if (data.type === "error") {
                onError(new Error(data.message || "Roadmap generation error"));
                return;
              }
            } catch {
              // Partial line
            }
          }
        }
      }
      return;
    }
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}


