import { db } from "../db/client";
import { logger } from "../utils/logger";

const questions = [
  // Data Structures - Medium
  {
    type: "aptitude",
    topic: "data-structures",
    difficulty: "medium",
    company_tags: ["Google", "Amazon"],
    content: {
      prompt: "What is the time complexity of inserting an element into a max-heap of size N?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    },
    answer_key: {
      correctOption: "O(log N)",
    },
  },
  {
    type: "aptitude",
    topic: "data-structures",
    difficulty: "easy",
    company_tags: ["Microsoft", "Amazon"],
    content: {
      prompt: "Which data structure follows the First-In, First-Out (FIFO) principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
    },
    answer_key: {
      correctOption: "Queue",
    },
  },
  {
    type: "aptitude",
    topic: "data-structures",
    difficulty: "hard",
    company_tags: ["Google", "Meta"],
    content: {
      prompt: "What is the amortized time complexity of an operation in a Fibonacci Heap?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
    },
    answer_key: {
      correctOption: "O(1)",
    },
  },
  // Algorithms - Medium
  {
    type: "aptitude",
    topic: "algorithms",
    difficulty: "medium",
    company_tags: ["Google", "Amazon"],
    content: {
      prompt: "Which algorithm finds the shortest path from a single source node in a graph with non-negative edge weights?",
      options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
    },
    answer_key: {
      correctOption: "Dijkstra's Algorithm",
    },
  },
  {
    type: "aptitude",
    topic: "algorithms",
    difficulty: "easy",
    company_tags: ["Amazon", "Microsoft"],
    content: {
      prompt: "What is the average time complexity of QuickSort?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"],
    },
    answer_key: {
      correctOption: "O(N log N)",
    },
  },
  {
    type: "aptitude",
    topic: "algorithms",
    difficulty: "hard",
    company_tags: ["Google", "Meta"],
    content: {
      prompt: "What is the time complexity of the Knuth-Morris-Pratt (KMP) pattern searching algorithm?",
      options: ["O(N + M)", "O(N * M)", "O(N log M)", "O(N^2)"],
    },
    answer_key: {
      correctOption: "O(N + M)",
    },
  },
  // System Design - Medium
  {
    type: "technical",
    topic: "system-design",
    difficulty: "medium",
    company_tags: ["Google", "Amazon"],
    content: {
      prompt: "In CAP Theorem, which two properties are guaranteed by Cassandra under eventual consistency?",
      options: ["Consistency & Availability", "Availability & Partition Tolerance", "Consistency & Partition Tolerance", "Durability & Atomicity"],
    },
    answer_key: {
      correctOption: "Availability & Partition Tolerance",
    },
  },
];

async function seed() {
  try {
    for (const q of questions) {
      await db.query(
        `INSERT INTO questions (type, topic, difficulty, company_tags, content, answer_key)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [q.type, q.topic, q.difficulty, q.company_tags, JSON.stringify(q.content), JSON.stringify(q.answer_key)]
      );
    }
    logger.info("Successfully seeded questions into PostgreSQL");
    process.exit(0);
  } catch (err) {
    logger.error(err, "Failed to seed questions");
    process.exit(1);
  }
}

seed();
