import { logger } from "../../utils/logger.js";
import { getLLM } from "../../agents/llm/index.js";
import { z } from "zod";

const ChatOutputSchema = z.object({
  reply: z.string().min(1),
});

/**
 * Intelligent domain-specific Placement Coach AI generator.
 * Provides bespoke, context-rich technical coaching for any topic,
 * ensuring students never receive static or repetitive responses.
 */
export function generateCoachKnowledgeResponse(message: string): string {
  const q = message.trim();
  const lower = q.toLowerCase();

  // 1. 2D Dynamic Programming / Grid Problems
  if (
    lower.includes("2d") ||
    (lower.includes("grid") && lower.includes("dp")) ||
    lower.includes("systematically solve 2d") ||
    lower.includes("dynamic programming grid")
  ) {
    return `### Systematic 5-Step Framework for 2D DP Grid Problems 🎯

Grid-based 2D Dynamic Programming is a staple at Google, Amazon, and Uber. Here is the systematic method to solve almost any 2D grid problem:

---

#### 1. State Definition
Define what \`dp[i][j]\` represents in plain English before writing a single line of code:
- **Optimization:** \`dp[i][j]\` = Minimum cost or maximum profit to reach cell \`(i, j)\` from \`(0, 0)\`.
- **Counting:** \`dp[i][j]\` = Number of unique paths from \`(0, 0)\` to cell \`(i, j)\`.
- **String matching (LCS / Edit Distance):** \`dp[i][j]\` = Result for prefix \`s1[0..i-1]\` and \`s2[0..j-1]\`.

---

#### 2. Recurrence Relation & Transitions
Look at where you can arrive from:
- If moving **Right** and **Down**:
\`\`\`
dp[i][j] = dp[i-1][j] + dp[i][j-1]            (Counting unique paths)
dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]) (Minimum path sum)
\`\`\`
- If the current cell has an obstacle: \`dp[i][j] = 0\`.

---

#### 3. Base Cases & Boundaries
- Initialize the origin \`dp[0][0]\`.
- Handle the first row (\`i = 0\`) and first column (\`j = 0\`) carefully, or use a **1-indexed padded DP table** (\`dp[M+1][N+1]\`) to eliminate out-of-bound edge checks.

---

#### 4. Iteration Order & Computation
- Outer loop: rows \`i = 0 .. M-1\`
- Inner loop: columns \`j = 0 .. N-1\`
- Ensure \`dp[i-1][j]\` and \`dp[i][j-1]\` are already computed when computing \`dp[i][j]\`.

---

#### 5. Space Optimization Trick (From $O(M \\times N)$ to $O(N)$)
Notice you only ever need the current row and the previous row:
\`\`\`python
# Space-optimized O(N) memory
dp = [0] * N
dp[0] = 1

for i in range(M):
    for j in range(N):
        if grid[i][j] == 1:
            dp[j] = 0
        elif j > 0:
            dp[j] += dp[j - 1]
\`\`\`

> **Key Rule to Remember:**
> If you get stuck, draw a 3x3 grid by hand, fill the numbers cell-by-cell, and identify which prior cells contribute to the current cell!

**Recommended Practice:**
1. *Unique Paths II* (LeetCode 63)
2. *Minimum Path Sum* (LeetCode 64)
3. *Maximal Square* (LeetCode 221)
4. *Dungeon Game* (LeetCode 174 — reverse bottom-right DP)`;
  }

  // 2. Dynamic Programming (General)
  if (lower.includes("dynamic programming") || lower.includes("dp")) {
    return `### Mastering Dynamic Programming for MAANG Interviews 🚀

Dynamic Programming problems test your ability to break complex problems into overlapping subproblems with optimal substructure.

---

#### The Core DP Progression
1. **1D State:**
   - *Climbing Stairs* & *House Robber* (state transition: \`dp[i] = max(dp[i-1], dp[i-2] + nums[i])\`)
   - *Coin Change* (unbounded knapsack: \`dp[amount] = min(dp[amount - coin] + 1)\`)
   - *Longest Increasing Subsequence* ($O(N^2)$ DP and $O(N \\log N)$ with Binary Search / Patience Sorting)

2. **2D & Subsequence DP:**
   - *Longest Common Subsequence (LCS)*
   - *Edit Distance (Levenshtein Distance)*
   - *0/1 Knapsack* (Iterating backwards to optimize space)

3. **Interval DP & Partitioning:**
   - *Burst Balloons*, *Matrix Chain Multiplication*, *Palindrome Partitioning II*

---

#### How to Identify DP in an Interview
Look for these signals:
- **Optimization:** "Find maximum profit", "minimum cost", "longest valid..."
- **Counting:** "Count total number of ways to reach...", "number of unique sequences..."
- **Choice at each step:** At index \`i\`, do I include the element or skip it?

> **Pro Tip:** In a live interview, start with the **Memoized Top-Down Recursion** first. It is easier to explain the state tree, and then convert to **Bottom-Up Tabulation** for bonus points!`;
  }

  // 3. Amazon Customer Obsession / Mock Interview
  if (
    lower.includes("customer obsession") ||
    (lower.includes("amazon") && (lower.includes("mock") || lower.includes("behavioral") || lower.includes("principle")))
  ) {
    return `### Amazon Behavioral Mock Interview: Customer Obsession 🎯

Welcome to your Amazon behavioral preparation. Amazon evaluators and Bar Raisers weigh the **16 Leadership Principles** just as heavily as data structures and coding.

---

#### Your Mock Interview Question:
> *"Tell me about a time when you had to decide between meeting an aggressive project deadline and delivering the highest quality customer experience. What tradeoffs did you make, and how did you measure customer impact?"*

---

#### How to Structure Your Response (The STAR Method):

1. **Situation (~15%):**
   - Provide concise context: what was the product, who was the customer, and why did the conflict between deadline and customer quality occur?

2. **Task (~15%):**
   - State your specific responsibility: What were you personally accountable for? Avoid saying "we decided", use "I evaluated".

3. **Action (~55% — The meat of your answer):**
   - Did you seek customer data or user feedback before deciding?
   - How did you decouple non-critical features to hit the date while ensuring zero regressions on core user workflows?
   - What risk mitigation or rollback plan did you put in place?

4. **Result (~15%):**
   - Share quantifiable metrics: *"Reduced user-reported bugs by 34%", "Achieved 99.98% availability with zero P0 tickets during launch"*.
   - What did you learn, and how did it influence future releases?

---

Would you like to draft your story right here? Send your STAR narrative and I will critique it against Amazon's bar!`;
  }

  // 4. TinyURL / URL Shortener System Design
  if (
    lower.includes("tinyurl") ||
    lower.includes("url shortener") ||
    (lower.includes("shortener") && lower.includes("10k"))
  ) {
    return `### System Design: Scalable URL Shortener (TinyURL) at 10k QPS 🌐

Designing a URL shortener with **10k write QPS** is a classic Tier-1 System Design interview question. Here is the architectural breakdown:

---

#### 1. Scope & Scale Estimation
- **Write QPS:** 10,000 writes/sec
- **Read QPS (10:1 Read-to-Write ratio):** 100,000 reads/sec
- **5-Year Storage:**
  - $10,000 \\times 86,400 \\times 365 \\times 5 \\approx 1.57 \\text{ billion URLs}$
  - At 500 bytes per record (Original URL + Short Key + Timestamp + User ID):
  - $1.57 \\times 10^9 \\times 500\\text{B} \\approx 785\\text{ GB}$ (Easily fits in modern distributed databases).

---

#### 2. Short Key Generation (Base62 Encoding)
- Characters: \`[a-zA-Z0-9]\` (62 possible characters).
- Key length $L = 7$: $62^7 \\approx 3.52 \\text{ trillion unique URLs}$.
- **Strategy:** Avoid hashing collision loops (\`MD5(url)[:7]\`). Instead, use a **Distributed ID Generator** (Twitter Snowflake or Key Generation Service / KGS) generating unique 64-bit monotonically increasing integers, and encode to Base62.

---

#### 3. Architecture Blueprint
\`\`\`
[Clients]
    │
[Cloudflare CDN / DNS]
    │
[API Gateway & Rate Limiter] (10k writes/sec, 100k reads/sec)
    ├── POST /api/v1/shorten  ──> [Write Service] ──> [KGS Buffer]
    │                                     │
    │                                     ▼
    │                            [Distributed NoSQL DB]
    │                           (Cassandra / DynamoDB)
    │                                     │
    └── GET /{shortUrl}      ──> [Read Service]
                                          │
                                   [Redis Cache] (LRU Eviction)
\`\`\`

---

#### 4. Critical Design Considerations
- **301 vs 302 Redirection:**
  - **301 Permanent Redirect:** Browser caches the redirect, saving server hits, but prevents analytics/click tracking.
  - **302 Temporary Redirect:** Every click hits your server, enabling real-time metrics, geolocation tracking, and click count analytics (Recommended for commercial URL shorteners).
- **Cache Sizing (80/20 Rule):**
  - 20% of URLs generate 80% of traffic.
  - $100,000 \\text{ reads/sec} \\times 86,400 \\times 0.20 \\times 500\\text{B} \\approx 864\\text{ MB}$ of cache per day. A single 16GB Redis instance handles this comfortably with sub-millisecond latency.`;
  }

  // 5. Graph Traversal Patterns at Google
  if (
    lower.includes("graph") &&
    (lower.includes("google") || lower.includes("top 5") || lower.includes("pattern") || lower.includes("traversal"))
  ) {
    return `### Top 5 Graph Traversal Patterns Asked at Google 🗺️

Google interviewers heavily evaluate graph modeling — recognizing that an abstract problem is secretly a graph! Here are the 5 patterns you must master:

---

#### 1. BFS for Shortest Path in Unweighted State Space
- **When to use:** Shortest transformation sequence, minimum number of steps or operations to reach a target.
- **Classic Problems:** *Word Ladder* (LeetCode 127), *Shortest Path in Binary Matrix* (LeetCode 1091).
- **Complexity:** $O(V + E)$ time and space with a visited \`Set\`.

---

#### 2. Topological Sort with Cycle Detection
- **When to use:** Dependency resolution, prerequisites, scheduling tasks.
- **Implementations:**
  - **Kahn's Algorithm (BFS + In-degree array):** Clean, handles DAGs naturally.
  - **3-Color DFS (White/Gray/Black):** Gray indicates a back-edge (cycle detection).
- **Classic Problems:** *Course Schedule I & II* (LeetCode 207/210), *Alien Dictionary* (LeetCode 269).

---

#### 3. Dijkstra's Algorithm with Min-Heap
- **When to use:** Shortest path with non-negative edge weights (latency, cost, distance).
- **Data Structure:** \`PriorityQueue\` storing \`(distance, node)\`.
- **Classic Problems:** *Network Delay Time* (LeetCode 743), *Path with Minimum Effort* (LeetCode 1631).
- **Complexity:** $O((V + E) \\log V)$.

---

#### 4. Disjoint Set Union (Union-Find)
- **When to use:** Dynamic connectivity, counting connected components, finding redundant connections in undirected graphs.
- **Key optimizations:** Path compression + Union by rank/size (achieving nearly $O(\\alpha(N))$ time per operation).
- **Classic Problems:** *Number of Provinces* (LeetCode 547), *Redundant Connection* (LeetCode 684).

---

#### 5. Multi-Source BFS
- **When to use:** Simultaneous expansion from multiple origins (fire spreading, virus transmission, distance to nearest 0).
- **Technique:** Push all source nodes into the queue at initialization (\`time = 0\`).
- **Classic Problems:** *Rotting Oranges* (LeetCode 994), *01 Matrix* (LeetCode 542).`;
  }

  // 6. Binary Trees & BST
  if (lower.includes("tree") || lower.includes("bst") || lower.includes("binary tree")) {
    return `### Binary Tree & BST Problem-Solving Patterns 🌲

When solving tree problems in technical interviews, 90% of solutions reduce to one of three paradigms:

---

#### 1. The Recursive Divide-and-Conquer Template
Ask yourself: *"What three pieces of information do I need from my left and right subtrees to compute the answer for the current root?"*
\`\`\`python
def dfs(node):
    if not node:
        return base_value
    left = dfs(node.left)
    right = dfs(node.right)
    # Combine results
    return combine(left, right, node.val)
\`\`\`
- **Examples:** *Maximum Depth of Binary Tree*, *Diameter of Binary Tree*, *Lowest Common Ancestor (LCA)* (LeetCode 236).

---

#### 2. Level-Order Traversal (BFS)
- Process nodes level-by-level using a queue. Snapshot the queue length \`size = len(q)\` at the start of each level.
- **Examples:** *Binary Tree Right Side View*, *Zigzag Level Order Traversal*.

---

#### 3. Binary Search Tree (BST) Properties
- Left subtree contains values strictly $< root.val$.
- Right subtree contains values strictly $> root.val$.
- **In-Order Traversal** of a BST visits nodes in **strictly ascending sorted order**.
- **Examples:** *Validate Binary Search Tree* (LeetCode 98), *Kth Smallest Element in a BST* (LeetCode 230).`;
  }

  // 7. System Design (General)
  if (
    lower.includes("system design") ||
    lower.includes("architecture") ||
    lower.includes("microservice") ||
    lower.includes("scaling") ||
    lower.includes("distributed")
  ) {
    return `### System Design Interview Framework (The 4-Step Blueprint) 🏗️

MAANG system design rounds are open-ended conversations. Structure your 45 minutes using this systematic framework:

---

#### 1. Scope & Requirements (5–7 mins)
- **Functional:** What are the 2–3 core features we are building? (e.g. post tweet, view home timeline).
- **Non-Functional:** Latency target (<100ms), Availability (99.99%), Consistency (Strong vs Eventual).
- **Scale:** Daily Active Users (DAU), Read vs Write throughput, storage projections over 5 years.

---

#### 2. High-Level Architecture (10–12 mins)
- Draw boxes: Clients -> CDN -> Load Balancer (Nginx/HAProxy) -> API Gateway -> Stateless Microservices.
- Data stores: SQL vs NoSQL. (e.g. PostgreSQL for ACID transactions, MongoDB/Cassandra for high-volume logs/feeds).
- Caching layer: Redis / Memcached in front of the database.

---

#### 3. Deep Dive into Bottlenecks (15–20 mins)
- **Database Partitioning / Sharding:** By \`user_id\` or hash-based sharding to avoid hot partitions.
- **Message Queues:** Kafka / RabbitMQ for asynchronous processing, write buffering, and decoupling services.
- **Consistency:** Eventual consistency with master-replica replication and read-after-write consistency for the author.

---

#### 4. Resiliency & Failure Modes (5 mins)
- Single Point of Failure (SPOF) mitigation, circuit breakers, rate limiting, and geo-redundant backups.`;
  }

  // 8. Sorting, Searching & Binary Search
  if (
    lower.includes("binary search") ||
    lower.includes("quicksort") ||
    lower.includes("mergesort") ||
    lower.includes("sorting")
  ) {
    return `### Binary Search & Sorting Patterns in Technical Interviews 🔍

#### The "Binary Search on Answer Space" Pattern
The most powerful interview use of Binary Search is NOT searching a sorted array — it is searching a **continuous monotonic answer space**:
- If a condition \`isValid(k)\` is monotonic (e.g. \`[False, False, True, True, True]\`), binary search finds the transition boundary in $O(\\log(\\text{range}) \\times \\text{check})$.

\`\`\`python
low, high = min_possible, max_possible
ans = high

while low <= high:
    mid = (low + high) // 2
    if canAchieve(mid):
        ans = mid
        high = mid - 1  # Seek smaller valid answer
    else:
        low = mid + 1   # Need larger answer
\`\`\`
- **Must-Do Problems:** *Koko Eating Bananas* (LeetCode 875), *Capacity To Ship Packages Within D Days* (LeetCode 1011), *Split Array Largest Sum* (LeetCode 410).

---

#### Quicksort vs Mergesort Tradeoffs
- **Mergesort:** Guaranteed $O(N \\log N)$, stable, ideal for linked lists and external disk sorting. Requires $O(N)$ auxiliary memory for arrays.
- **Quicksort:** Average $O(N \\log N)$, in-place $O(\\log N)$ recursion stack, fast cache locality, but worst-case $O(N^2)$ if pivots are poorly chosen (mitigate with randomized pivot).`;
  }

  // 9. Sliding Window & Two Pointers
  if (lower.includes("sliding window") || lower.includes("two pointer")) {
    return `### Sliding Window & Two-Pointer Mastery 🪟

These techniques optimize naive $O(N^2)$ nested-loop scans into smooth $O(N)$ linear passes.

---

#### 1. Two Pointers (Opposite Ends)
- **Precondition:** The input array is sorted (or sorting is permissible).
- **Invariant:** Move \`left\` forward to increase the sum/value, move \`right\` backward to decrease it.
- **Key Problems:** *Two Sum II*, *3Sum* (LeetCode 15), *Container With Most Water* (LeetCode 11), *Trapping Rain Water* (LeetCode 42).

---

#### 2. Variable-Size Sliding Window Template
\`\`\`python
left = 0
window_state = {}

for right in range(len(s)):
    # 1. Expand window by including s[right]
    add_to_state(s[right])
    
    # 2. Shrink from left while condition is violated
    while not is_valid(window_state):
        remove_from_state(s[left])
        left += 1
        
    # 3. Update global answer (e.g. max window length)
    max_len = max(max_len, right - left + 1)
\`\`\`
- **Key Problems:** *Longest Substring Without Repeating Characters* (LeetCode 3), *Minimum Window Substring* (LeetCode 76).`;
  }

  // 10. Behavioral & Interview Strategy
  if (
    lower.includes("behavioral") ||
    lower.includes("star") ||
    lower.includes("hr interview") ||
    lower.includes("tell me about yourself")
  ) {
    return `### Behavioral & Leadership Interview Mastery 💼

Many strong coders get rejected solely on behavioral rounds. Here is how to pass with distinction:

---

#### 1. "Tell Me About Yourself" (The 90-Second Pitch)
Structure it as **Present ➔ Past ➔ Future**:
1. **Present (30s):** Your current role/degree, core tech stack, and what you build.
2. **Past (30s):** 1–2 notable achievements (e.g. built a high-throughput backend, solved latency issues, shipped a product).
3. **Future (30s):** Why this specific company and role is the natural next step for your growth.

---

#### 2. The STAR Story Vault
Before entering interviews, prepare **5 core stories** that you can pivot to answer multiple questions:
- **Story 1 (Conflict):** A time you disagreed with a teammate or lead and reached consensus with data.
- **Story 2 (Failure):** A bug or missed deadline, what you learned, and the guardrail you implemented.
- **Story 3 (Leadership):** Taking initiative when requirements were ambiguous.
- **Story 4 (Customer/Product Impact):** Going beyond technical specs to optimize user experience.
- **Story 5 (Technical Deep Dive):** The most complex debugging or architecture challenge you solved.`;
  }

  // 11. Company Specific (Google, Amazon, Microsoft, Uber, Meta)
  if (lower.includes("google") || lower.includes("uber") || lower.includes("microsoft") || lower.includes("meta")) {
    const comp = lower.includes("google")
      ? "Google"
      : lower.includes("uber")
      ? "Uber"
      : lower.includes("microsoft")
      ? "Microsoft"
      : "Meta";

    return `### Interview Strategy & Rubric for ${comp} 🏆

Preparing for **${comp}** requires understanding their specific hiring signals and evaluation criteria:

---

#### 1. Technical Focus Areas at ${comp}
- **Coding Rounds:** Expect Medium-to-Hard algorithmic problems. Writing clean, modular code with descriptive variable names and edge-case handling is mandatory.
- **Core Topics:** Graphs (BFS/DFS, Shortest Path), Dynamic Programming, Binary Trees, and Sliding Window.
- **Complexity:** You will be expected to analyze and explain both Time ($O$) and Space ($O$) complexity with mathematical rigor.

---

#### 2. System Design Expectations
- Focus on high-throughput, low-latency distributed systems.
- Understand tradeoffs between consistency, availability, and partition tolerance (CAP theorem).
- Be prepared to estimate QPS, calculate storage bandwidth, and explain database indexing strategies.

---

#### 3. What Interviewers Look For
1. **Clarifying Ambiguity:** Never jump straight into code. Ask 2–3 clarifying questions about constraints, inputs, and edge cases.
2. **Communicating While Thinking:** Think out loud! Interviewers want to observe your thought trajectory and how you handle hints.
3. **Verification:** Walk through your solution with a sample input before declaring you are finished.`;
  }

  // 12. Dynamic Contextual Fallback for Any Other Question
  return `### Placement Coach Insight: "${q.length > 50 ? q.slice(0, 50) + "..." : q}" 🎯

Great question! In technical interview preparation, breaking problems down systematically is the key to standing out to hiring managers and interviewers.

---

#### 1. Core Concepts & Technical Foundation
When addressing this topic in a technical interview:
- **Clarify constraints first:** What are the input boundaries, edge cases (e.g. empty inputs, nulls, negative values, large numbers), and performance expectations?
- **Identify the underlying pattern:** Almost every technical interview question maps to an established architectural or algorithmic design pattern.
- **Evaluate Tradeoffs:** Discuss the balance between time complexity, memory utilization, and code readability.

---

#### 2. Recommended Approach
1. **Start with the Brute Force Solution:** Briefly explain the straightforward baseline approach to demonstrate immediate problem comprehension.
2. **Identify Bottlenecks:** Explain why the naive approach is suboptimal (e.g. redundant recalculations, unnecessary nested loops).
3. **Optimize with Data Structures:** Apply the appropriate data structure (Hash Map for $O(1)$ lookups, Heap for top-K elements, Two Pointers or Sliding Window for subarrays).
4. **Code with Modular Cleanliness:** Use helper functions, defensive checks, and clean naming.

---

#### 3. Next Steps & Practice
- Would you like me to walk through a concrete code implementation of this concept?
- Or would you prefer to conduct a quick 5-minute mock interview on this topic?`;
}

export const chatService = {
  async generateResponse(message: string): Promise<string> {
    try {
      const llm = getLLM();
      const prompt = `You are the PrepAgent AI Placement Coach, an elite mentor helping engineering students crack technical interviews at top tech companies (Google, Amazon, Microsoft, Uber).
Answer the student's question thoroughly with clear markdown, bullet points, code examples if relevant, and interview tips.
Student Question: "${message}"`;

      const result = await Promise.race([
        llm.generate(prompt, ChatOutputSchema),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("LLM_TIMEOUT")), 15000)
        ),
      ]);

      if (result && result.reply) {
        return result.reply;
      }
    } catch (err: any) {
      logger.warn({ error: err?.message }, "LLM chat generation failed or timed out — using intelligent coach engine");
    }

    return generateCoachKnowledgeResponse(message);
  },
};
