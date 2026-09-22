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
              if (data.type === "progress") {
                onProgress(data);
              } else if (data.type === "complete" && data.data) {
                onComplete(data.data);
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
  } catch (err) {
    if (err instanceof TypeError && err.message !== "Failed to fetch") {
      onError(err);
    }
    // Fall back to animated mock progression
  }

  // Simulated LangGraph 5-stage progression matching Phase 4 specifications
  const stages: Array<{ node: string; message: string; percentage: number; delay: number }> = [
    { node: "profileNode", message: "Normalizing student profile and target company requirements...", percentage: 18, delay: 500 },
    { node: "skillAssessmentNode", message: "Integrating assessment results and computing proficiency vector...", percentage: 40, delay: 800 },
    { node: "skillGapNode", message: "Analyzing skill gaps against Google, Amazon & Microsoft benchmarks...", percentage: 62, delay: 900 },
    { node: "roadmapGenerationNode", message: "Synthesizing 8-week structured roadmap with Gemini LLM...", percentage: 85, delay: 1100 },
    { node: "resourceRecommendationNode", message: "Retrieving semantic ChromaDB study materials & practice sets...", percentage: 95, delay: 700 },
    { node: "persistAndReturnNode", message: "Finalizing active roadmap and setting version snapshot...", percentage: 100, delay: 500 },
  ];

  let cumulativeDelay = 0;
  stages.forEach((stage, idx) => {
    cumulativeDelay += stage.delay;
    setTimeout(() => {
      onProgress({
        type: "progress",
        node: stage.node,
        message: stage.message,
        percentage: stage.percentage,
      });

      if (idx === stages.length - 1) {
        setTimeout(() => {
          onComplete(getMockGeneratedRoadmap());
        }, 300);
      }
    }, cumulativeDelay);
  });
}

function getMockGeneratedRoadmap(): Roadmap {
  return {
    id: "roadmap-" + Date.now(),
    userId: "demo-student-id-001",
    version: 1,
    generatedAt: new Date().toISOString(),
    status: "active",
    source: "ai_generated",
    weeks: [
      {
        weekNo: 1,
        topic: "Advanced Data Structures & Sliding Window",
        goals: ["Master Two Pointers & Sliding Window techniques", "Solve 15 LeetCode Mediums", "Review Heap/Priority Queue patterns"],
        resourceHints: ["NeetCode Roadmap", "Blind 75 Sliding Window Set"],
      },
      {
        weekNo: 2,
        topic: "Dynamic Programming: 1D & Subsequence",
        goals: ["Climbing stairs to Coin Change variations", "Longest Common Subsequence & Edit Distance", "Space optimization tricks"],
        resourceHints: ["MIT 6.006 DP Lectures", "LeetCode DP Patterns Guide"],
      },
      {
        weekNo: 3,
        topic: "Graph Algorithms & Shortest Path",
        goals: ["BFS/DFS traversal with cycle detection", "Dijkstra's Algorithm & Topological Sort", "Union-Find with path compression"],
        resourceHints: ["Graph Theory Visualizer", "CSES Problem Set"],
      },
      {
        weekNo: 4,
        topic: "System Design: Scaling & Architecture",
        goals: ["Horizontal scaling vs vertical scaling", "Database Sharding & Replication", "Caching layers with Redis/CDN"],
        resourceHints: ["Designing Data-Intensive Applications", "System Design Primer"],
      },
      {
        weekNo: 5,
        topic: "Database Internals & SQL Mastery",
        goals: ["B-Tree & LSM-Tree indexing", "ACID transactions & Isolation levels", "Complex SQL joins and query optimization"],
        resourceHints: ["Use The Index, Luke!", "PostgreSQL Performance Guide"],
      },
      {
        weekNo: 6,
        topic: "Operating Systems & Concurrency",
        goals: ["Threads, processes, and synchronization primitives", "Deadlock conditions & resolution", "Virtual memory & paging"],
        resourceHints: ["OSTEP (Three Easy Pieces)", "Java/C++ Concurrency Cheatsheet"],
      },
      {
        weekNo: 7,
        topic: "Low-Level Design & Design Patterns",
        goals: ["SOLID Principles in practice", "Factory, Strategy, Observer, Decorator patterns", "Design a Parking Lot / Rate Limiter"],
        resourceHints: ["Refactoring.Guru Design Patterns", "Grokking OOD"],
      },
      {
        weekNo: 8,
        topic: "Company Mock Interviews & STAR Behavioral",
        goals: ["Complete 3 timed mock interview sessions", "Refine 5 STAR behavioral stories", "Company-specific interview culture prep"],
        resourceHints: ["Pramp Mock Sessions", "PrepAgent Practice Bank"],
      },
    ],
    items: [
      {
        id: "item-1",
        roadmapId: "roadmap-1",
        weekNo: 1,
        topic: "Advanced Data Structures & Sliding Window",
        goals: ["Master Two Pointers & Sliding Window techniques", "Solve 15 LeetCode Mediums", "Review Heap/Priority Queue patterns"],
        status: "completed",
      },
      {
        id: "item-2",
        roadmapId: "roadmap-1",
        weekNo: 2,
        topic: "Dynamic Programming: 1D & Subsequence",
        goals: ["Climbing stairs to Coin Change variations", "Longest Common Subsequence & Edit Distance", "Space optimization tricks"],
        status: "started",
      },
      {
        id: "item-3",
        roadmapId: "roadmap-1",
        weekNo: 3,
        topic: "Graph Algorithms & Shortest Path",
        goals: ["BFS/DFS traversal with cycle detection", "Dijkstra's Algorithm & Topological Sort", "Union-Find with path compression"],
        status: "pending",
      },
      {
        id: "item-4",
        roadmapId: "roadmap-1",
        weekNo: 4,
        topic: "System Design: Scaling & Architecture",
        goals: ["Horizontal scaling vs vertical scaling", "Database Sharding & Replication", "Caching layers with Redis/CDN"],
        status: "pending",
      },
      {
        id: "item-5",
        roadmapId: "roadmap-1",
        weekNo: 5,
        topic: "Database Internals & SQL Mastery",
        goals: ["B-Tree & LSM-Tree indexing", "ACID transactions & Isolation levels", "Complex SQL joins and query optimization"],
        status: "pending",
      },
      {
        id: "item-6",
        roadmapId: "roadmap-1",
        weekNo: 6,
        topic: "Operating Systems & Concurrency",
        goals: ["Threads, processes, and synchronization primitives", "Deadlock conditions & resolution", "Virtual memory & paging"],
        status: "pending",
      },
      {
        id: "item-7",
        roadmapId: "roadmap-1",
        weekNo: 7,
        topic: "Low-Level Design & Design Patterns",
        goals: ["SOLID Principles in practice", "Factory, Strategy, Observer, Decorator patterns", "Design a Parking Lot / Rate Limiter"],
        status: "pending",
      },
      {
        id: "item-8",
        roadmapId: "roadmap-1",
        weekNo: 8,
        topic: "Company Mock Interviews & STAR Behavioral",
        goals: ["Complete 3 timed mock interview sessions", "Refine 5 STAR behavioral stories", "Company-specific interview culture prep"],
        status: "pending",
      },
    ],
  };
}
