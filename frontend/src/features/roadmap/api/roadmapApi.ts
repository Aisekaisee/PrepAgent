import { api } from "@/lib/axios";
import type { Roadmap, RoadmapItemStatus, RoadmapProgressEvent } from "@/types/roadmap";
import { streamRoadmapGeneration } from "@/lib/sse";

const LOCAL_STORAGE_ROADMAP_KEY = "prepagent_active_roadmap";

export const roadmapApi = {
  getActiveRoadmap: async (): Promise<Roadmap> => {
    try {
      const response = await api.get<{ roadmap: Roadmap }>("/roadmap");
      return response.data.roadmap;
    } catch {
      // Local storage fallback
      const cached = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      // Generate default
      const defaultRoadmap = getDefaultRoadmap();
      localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(defaultRoadmap));
      return defaultRoadmap;
    }
  },

  updateItemStatus: async (
    itemId: string,
    status: RoadmapItemStatus
  ): Promise<void> => {
    try {
      await api.patch(`/roadmap/items/${itemId}`, { status });
    } catch {
      // Update local storage copy
      const cached = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
      if (cached) {
        const parsed: Roadmap = JSON.parse(cached);
        const item = parsed.items.find((i) => i.id === itemId);
        if (item) {
          item.status = status;
          localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(parsed));
        }
      }
    }
  },

  generateRoadmapStream: (
    onProgress: (event: RoadmapProgressEvent) => void,
    onComplete: (roadmap: Roadmap) => void,
    onError: (err: Error) => void
  ) => {
    return streamRoadmapGeneration({
      onProgress,
      onComplete: (roadmap) => {
        localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(roadmap));
        onComplete(roadmap);
      },
      onError,
    });
  },
};

function getDefaultRoadmap(): Roadmap {
  return {
    id: "roadmap-default-001",
    userId: "demo-student-id-001",
    version: 1,
    generatedAt: new Date().toISOString(),
    status: "active",
    source: "ai_generated",
    weeks: [
      {
        weekNo: 1,
        topic: "Advanced Data Structures & Sliding Window",
        goals: [
          "Master Two Pointers & Sliding Window techniques",
          "Solve 15 LeetCode Mediums",
          "Review Heap/Priority Queue patterns",
        ],
      },
      {
        weekNo: 2,
        topic: "Dynamic Programming: 1D & Subsequence",
        goals: [
          "Climbing stairs to Coin Change variations",
          "Longest Common Subsequence & Edit Distance",
          "Space optimization tricks",
        ],
      },
      {
        weekNo: 3,
        topic: "Graph Algorithms & Shortest Path",
        goals: [
          "BFS/DFS traversal with cycle detection",
          "Dijkstra's Algorithm & Topological Sort",
          "Union-Find with path compression",
        ],
      },
      {
        weekNo: 4,
        topic: "System Design: Scaling & Architecture",
        goals: [
          "Horizontal scaling vs vertical scaling",
          "Database Sharding & Replication",
          "Caching layers with Redis/CDN",
        ],
      },
      {
        weekNo: 5,
        topic: "Database Internals & SQL Mastery",
        goals: [
          "B-Tree & LSM-Tree indexing",
          "ACID transactions & Isolation levels",
          "Complex SQL joins and query optimization",
        ],
      },
      {
        weekNo: 6,
        topic: "Operating Systems & Concurrency",
        goals: [
          "Threads, processes, and synchronization primitives",
          "Deadlock conditions & resolution",
          "Virtual memory & paging",
        ],
      },
      {
        weekNo: 7,
        topic: "Low-Level Design & Design Patterns",
        goals: [
          "SOLID Principles in practice",
          "Factory, Strategy, Observer, Decorator patterns",
          "Design a Parking Lot / Rate Limiter",
        ],
      },
      {
        weekNo: 8,
        topic: "Company Mock Interviews & STAR Behavioral",
        goals: [
          "Complete 3 timed mock interview sessions",
          "Refine 5 STAR behavioral stories",
          "Company-specific interview culture prep",
        ],
      },
    ],
    items: [
      {
        id: "item-1",
        roadmapId: "roadmap-default-001",
        weekNo: 1,
        topic: "Advanced Data Structures & Sliding Window",
        goals: [
          "Master Two Pointers & Sliding Window techniques",
          "Solve 15 LeetCode Mediums",
          "Review Heap/Priority Queue patterns",
        ],
        status: "completed",
      },
      {
        id: "item-2",
        roadmapId: "roadmap-default-001",
        weekNo: 2,
        topic: "Dynamic Programming: 1D & Subsequence",
        goals: [
          "Climbing stairs to Coin Change variations",
          "Longest Common Subsequence & Edit Distance",
          "Space optimization tricks",
        ],
        status: "started",
      },
      {
        id: "item-3",
        roadmapId: "roadmap-default-001",
        weekNo: 3,
        topic: "Graph Algorithms & Shortest Path",
        goals: [
          "BFS/DFS traversal with cycle detection",
          "Dijkstra's Algorithm & Topological Sort",
          "Union-Find with path compression",
        ],
        status: "pending",
      },
      {
        id: "item-4",
        roadmapId: "roadmap-default-001",
        weekNo: 4,
        topic: "System Design: Scaling & Architecture",
        goals: [
          "Horizontal scaling vs vertical scaling",
          "Database Sharding & Replication",
          "Caching layers with Redis/CDN",
        ],
        status: "pending",
      },
      {
        id: "item-5",
        roadmapId: "roadmap-default-001",
        weekNo: 5,
        topic: "Database Internals & SQL Mastery",
        goals: [
          "B-Tree & LSM-Tree indexing",
          "ACID transactions & Isolation levels",
          "Complex SQL joins and query optimization",
        ],
        status: "pending",
      },
      {
        id: "item-6",
        roadmapId: "roadmap-default-001",
        weekNo: 6,
        topic: "Operating Systems & Concurrency",
        goals: [
          "Threads, processes, and synchronization primitives",
          "Deadlock conditions & resolution",
          "Virtual memory & paging",
        ],
        status: "pending",
      },
      {
        id: "item-7",
        roadmapId: "roadmap-default-001",
        weekNo: 7,
        topic: "Low-Level Design & Design Patterns",
        goals: [
          "SOLID Principles in practice",
          "Factory, Strategy, Observer, Decorator patterns",
          "Design a Parking Lot / Rate Limiter",
        ],
        status: "pending",
      },
      {
        id: "item-8",
        roadmapId: "roadmap-default-001",
        weekNo: 8,
        topic: "Company Mock Interviews & STAR Behavioral",
        goals: [
          "Complete 3 timed mock interview sessions",
          "Refine 5 STAR behavioral stories",
          "Company-specific interview culture prep",
        ],
        status: "pending",
      },
    ],
  };
}
