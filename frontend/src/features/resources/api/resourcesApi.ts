import { api } from "@/lib/axios";
import type { Resource, ResourceFilterParams } from "@/types/resource";

const MOCK_RESOURCES: Resource[] = [
  {
    id: "res-1",
    type: "problem",
    title: "Coin Change (Minimum Coins Needed)",
    topic: "Dynamic Programming",
    difficulty: "medium",
    companyTags: ["Google", "Amazon", "Uber"],
    url: "https://leetcode.com/problems/coin-change/",
    content: "Classic unbounded knapsack pattern. Bottom-up dynamic programming tabulation.",
  },
  {
    id: "res-2",
    type: "article",
    title: "System Design: Scaling Cache Invalidation Strategies",
    topic: "System Design",
    difficulty: "hard",
    companyTags: ["Uber", "Meta"],
    url: "https://bytebytego.com",
    content: "Write-through vs Write-around vs Write-back caches with Redis clusters.",
  },
  {
    id: "res-3",
    type: "problem",
    title: "Course Schedule (Topological Sort / Cycle Detection)",
    topic: "Graph Algorithms",
    difficulty: "medium",
    companyTags: ["Microsoft", "Google"],
    url: "https://leetcode.com/problems/course-schedule/",
    content: "Kahn's Algorithm using in-degrees and BFS queue.",
  },
  {
    id: "res-4",
    type: "question",
    title: "Explain Database Isolation Levels and Phantom Reads",
    topic: "Database Management Systems",
    difficulty: "medium",
    companyTags: ["Amazon", "Oracle"],
    content: "Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
  },
  {
    id: "res-5",
    type: "problem",
    title: "Longest Substring Without Repeating Characters",
    topic: "Data Structures & Algorithms",
    difficulty: "medium",
    companyTags: ["Google", "Amazon", "Microsoft", "Apple"],
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    content: "Classic sliding window technique with hash set character frequency.",
  },
  {
    id: "res-6",
    type: "article",
    title: "Virtual Memory, Paging, and Page Fault Handling",
    topic: "Operating Systems",
    difficulty: "easy",
    companyTags: ["Microsoft", "Goldman Sachs"],
    content: "Translation Lookaside Buffer (TLB) caching and multi-level page tables.",
  },
  {
    id: "res-7",
    type: "problem",
    title: "LRU Cache Implementation",
    topic: "System Design",
    difficulty: "medium",
    companyTags: ["Amazon", "Google", "Microsoft"],
    url: "https://leetcode.com/problems/lru-cache/",
    content: "Hash map combined with doubly-linked list for O(1) get and put.",
  },
  {
    id: "res-8",
    type: "article",
    title: "Amazon 16 Leadership Principles: STAR Method Guide",
    topic: "Behavioral & STAR",
    difficulty: "easy",
    companyTags: ["Amazon"],
    content: "How to craft compelling behavioral interview answers using Situation, Task, Action, and Result.",
  },
];

export const resourcesApi = {
  getResources: async (params?: ResourceFilterParams): Promise<Resource[]> => {
    try {
      const response = await api.get<{ resources: Resource[] }>("/resources", { params });
      return response.data.resources;
    } catch {
      let filtered = [...MOCK_RESOURCES];
      if (params?.topic) {
        filtered = filtered.filter((r) =>
          r.topic.toLowerCase().includes(params.topic!.toLowerCase())
        );
      }
      if (params?.difficulty && params.difficulty !== "all") {
        filtered = filtered.filter((r) => r.difficulty === params.difficulty);
      }
      if (params?.type && params.type !== "all") {
        filtered = filtered.filter((r) => r.type === params.type);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.topic.toLowerCase().includes(q) ||
            r.companyTags.some((c) => c.toLowerCase().includes(q))
        );
      }
      return filtered;
    }
  },
};
