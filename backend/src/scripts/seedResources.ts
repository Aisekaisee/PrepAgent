import { db } from "../db/client";
import { logger } from "../utils/logger";

const resources = [
  {
    type: "problem",
    topic: "algorithms",
    difficulty: "hard",
    company_tags: ["Google", "Meta"],
    title: "Median of Two Sorted Arrays",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    content: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log (m+n)) time complexity.",
  },
  {
    type: "problem",
    topic: "algorithms",
    difficulty: "medium",
    company_tags: ["Google", "Amazon"],
    title: "Course Schedule (Topological Sort)",
    url: "https://leetcode.com/problems/course-schedule/",
    content: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. Determine if you can finish all courses given prerequisites.",
  },
  {
    type: "article",
    topic: "system-design",
    difficulty: "medium",
    company_tags: ["Amazon", "Microsoft"],
    title: "Designing a Scalable Rate Limiter",
    url: "https://systemdesign.primer/rate-limiter",
    content: "Deep dive into Token Bucket, Leaky Bucket, and Fixed Window rate limiting algorithms for distributed API gateways.",
  },
  {
    type: "problem",
    topic: "data-structures",
    difficulty: "easy",
    company_tags: ["Amazon", "Flipkart"],
    title: "LRU Cache Implementation",
    url: "https://leetcode.com/problems/lru-cache/",
    content: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) time complexity operations.",
  },
];

async function seed() {
  try {
    for (const r of resources) {
      await db.query(
        `INSERT INTO resources (type, topic, difficulty, company_tags, title, url, content)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [r.type, r.topic, r.difficulty, r.company_tags, r.title, r.url, r.content]
      );
    }
    logger.info("Successfully seeded resources into PostgreSQL");
    process.exit(0);
  } catch (err) {
    logger.error(err, "Failed to seed resources");
    process.exit(1);
  }
}

seed();
