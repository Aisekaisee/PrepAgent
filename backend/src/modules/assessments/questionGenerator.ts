import { z } from "zod";
import { getLLM } from "../../agents/llm/index.js";
import * as repository from "./assessment.repository.js";
import type { Question, Difficulty, QuestionType } from "./assessment.types.js";
import { logger } from "../../utils/logger.js";

export interface CandidateProfileContext {
  targetCompanies: string[];
  programmingSkills: string[];
  technicalSubjects: string[];
  education?: {
    degree?: string;
    institution?: string;
    year?: number;
  };
}

export interface DynamicQuestionParams {
  profile: CandidateProfileContext;
  topic: string;
  difficulty: Difficulty;
  questionIndex: number;
  excludePrompts: string[];
}

const GeneratedQuestionSchema = z.object({
  type: z.enum(["technical", "coding", "aptitude"]),
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  companyTags: z.array(z.string()).min(1),
  prompt: z.string().min(10),
  options: z.array(z.string()).optional(),
  correctOption: z.string().optional(),
  correct_option: z.string().optional(),
  answer: z.string().optional(),
  codeTemplate: z.string().optional(),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
      })
    )
    .optional(),
  hint: z.string().optional(),
  explanation: z.string().min(5),
});

type GeneratedQuestionData = z.infer<typeof GeneratedQuestionSchema>;

/**
 * Procedural Dynamic Question Generator
 * Generates tailored, dynamic questions based on user's profile, target companies,
 * preferred programming language, chosen topic, and adaptive difficulty.
 */
function generateProceduralQuestion(params: DynamicQuestionParams): GeneratedQuestionData {
  const { profile, topic, difficulty, questionIndex, excludePrompts } = params;

  const targetCompanies =
    profile.targetCompanies.length > 0
      ? profile.targetCompanies
      : ["Google", "Microsoft", "Amazon", "Meta"];
  const companyTag = [
    targetCompanies[(questionIndex - 1) % targetCompanies.length],
    targetCompanies[questionIndex % targetCompanies.length],
  ].filter(Boolean);

  const primaryLang = profile.programmingSkills[0] || "JavaScript";

  // Determine specific topic if session is general diagnostic
  let effectiveTopic = topic;
  if (topic === "Full Placement Diagnostic (Adaptive)" || !topic || topic === "general") {
    const sequence = [
      "Data Structures & Algorithms",
      "Operating Systems & Concurrency",
      "Database Management Systems",
      "Coding & Algorithmic Problem Solving",
      "System Design & Scalability",
    ];
    effectiveTopic = sequence[(questionIndex - 1) % sequence.length];
  }

  // Question pool matrix categorized by topic, difficulty, and type
  const dynamicCatalog: Record<
    string,
    Record<
      Difficulty,
      Array<{
        type: QuestionType;
        prompt: string;
        options?: string[];
        correctOption?: string;
        codeTemplate?: string;
        testCases?: Array<{ input: string; output: string }>;
        hint: string;
        explanation: string;
      }>
    >
  > = {
    "Data Structures & Algorithms": {
      easy: [
        {
          type: "technical",
          prompt: `In an interview at ${companyTag[0]}, you are asked: What is the time complexity to find an element in a balanced Binary Search Tree (AVL or Red-Black Tree) with N nodes?`,
          options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
          correctOption: "O(log N)",
          hint: "Think about how many elements are halved at each level of the tree.",
          explanation: "In a balanced BST, the height is guaranteed to be O(log N). Searching from root to leaf takes at most height comparisons.",
        },
        {
          type: "technical",
          prompt: `Which data structure is fundamentally utilized to implement Breadth-First Search (BFS) in graph traversal?`,
          options: ["Queue (FIFO)", "Stack (LIFO)", "Priority Queue / Min-Heap", "Hash Map"],
          correctOption: "Queue (FIFO)",
          hint: "BFS explores neighbors level-by-level in the order they were discovered.",
          explanation: "BFS explores nodes in first-in, first-out order, which requires a Queue. Stacks are used for Depth-First Search (DFS).",
        },
      ],
      medium: [
        {
          type: "technical",
          prompt: `At ${companyTag[0]}, you are designing an LRU Cache with O(1) get and O(1) put operations. Which combination of data structures is optimal?`,
          options: [
            "Doubly Linked List + Hash Map",
            "Singly Linked List + Binary Search Tree",
            "Array + Min-Heap",
            "Stack + Queue",
          ],
          correctOption: "Doubly Linked List + Hash Map",
          hint: "You need fast key lookup and fast node removal/re-insertion at both ends.",
          explanation: "The Hash Map provides O(1) key-to-node pointer lookup, and the Doubly Linked List allows O(1) node detachment and head insertion.",
        },
        {
          type: "technical",
          prompt: `What is the amortized time complexity of inserting N elements into a dynamic array (like std::vector in C++ or ArrayList in Java)?`,
          options: ["O(1) per insertion (O(N) total)", "O(N) per insertion (O(N^2) total)", "O(log N) per insertion", "O(N log N) total"],
          correctOption: "O(1) per insertion (O(N) total)",
          hint: "Array doubling happens geometrically (capacity doubles), spreading the cost across all previous insertions.",
          explanation: "When the array fills up, resizing takes O(N) copy operations, but this happens infrequently. Averaged over N insertions, the amortized cost per insert is O(1).",
        },
      ],
      hard: [
        {
          type: "technical",
          prompt: `In a ${companyTag[0]} distributed search architecture, you need to find the median of two sorted arrays of sizes M and N in logarithmic time. What is the optimal time complexity?`,
          options: ["O(log(min(M, N)))", "O(M + N)", "O(log(M + N)^2)", "O(min(M, N))"],
          correctOption: "O(log(min(M, N)))",
          hint: "Binary search can be applied on the partition index of the smaller array.",
          explanation: "By binary searching the partition cut on the smaller array, the remaining partition of the larger array is fixed in O(1), yielding O(log(min(M, N))).",
        },
        {
          type: "technical",
          prompt: `Which algorithm solves the All-Pairs Shortest Path problem in a directed weighted graph with arbitrary (including negative, but no negative cycles) edge weights in O(V^3) time?`,
          options: ["Floyd-Warshall Algorithm", "Dijkstra's Algorithm with Fibonacci Heap", "Kruskal's Algorithm", "Tarjan's Strongly Connected Components"],
          correctOption: "Floyd-Warshall Algorithm",
          hint: "It uses dynamic programming with three nested loops over intermediate vertices k, i, and j.",
          explanation: "Floyd-Warshall computes shortest paths between all vertex pairs in O(V^3) time using dynamic programming dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j]).",
        },
      ],
    },
    "Operating Systems & Concurrency": {
      easy: [
        {
          type: "technical",
          prompt: `Which of the following is NOT one of Coffman's four necessary conditions for a Deadlock to occur?`,
          options: ["Preemption allowed", "Mutual Exclusion", "Hold and Wait", "Circular Wait"],
          correctOption: "Preemption allowed",
          hint: "Deadlock requires that resources cannot be forcibly seized by the OS.",
          explanation: "No-preemption is required for deadlock. If preemption is allowed, the operating system can break deadlocks by forcibly reclaiming resources.",
        },
        {
          type: "technical",
          prompt: `What is the primary difference between a Process and a Thread in modern operating systems?`,
          options: [
            "Threads of the same process share memory space; processes have isolated address spaces",
            "Processes run in user space; threads always run in kernel space",
            "Threads cannot execute concurrently; processes always do",
            "Processes share file descriptors; threads do not",
          ],
          correctOption: "Threads of the same process share memory space; processes have isolated address spaces",
          hint: "Consider how memory isolation and context switching overhead differ.",
          explanation: "Processes have isolated virtual memory spaces protected by the MMU, while threads within the same process share the code segment, heap, and open handles.",
        },
      ],
      medium: [
        {
          type: "technical",
          prompt: `In multithreaded systems at ${companyTag[0]}, what is the primary purpose of an atomic Compare-And-Swap (CAS) instruction?`,
          options: [
            "To implement lock-free synchronization without mutual exclusion locks",
            "To speed up disk I/O interrupts",
            "To allocate memory directly from the virtual page table",
            "To serialize data across network sockets",
          ],
          correctOption: "To implement lock-free synchronization without mutual exclusion locks",
          hint: "CAS updates a memory location only if it matches an expected old value in a single CPU instruction.",
          explanation: "CAS enables lock-free algorithms by atomically updating a value only if it has not been modified by another thread, avoiding kernel lock contention.",
        },
        {
          type: "technical",
          prompt: `What phenomenon occurs when excessive page swapping degrades system performance to near zero due to insufficient physical memory?`,
          options: ["Thrashing", "Starvation", "Belady's Anomaly", "Priority Inversion"],
          correctOption: "Thrashing",
          hint: "The OS spends more time handling page faults than executing instructions.",
          explanation: "Thrashing occurs when the working set of active processes exceeds physical RAM, causing continuous page faulting and disk I/O thrash.",
        },
      ],
      hard: [
        {
          type: "technical",
          prompt: `In high-throughput services at ${companyTag[0]}, how does the OS handle Priority Inversion where a low-priority thread holds a lock needed by a high-priority thread?`,
          options: [
            "Priority Inheritance Protocol",
            "Preemptive Round-Robin time slicing",
            "Forced termination of low-priority threads",
            "Disabling hardware interrupts globally",
          ],
          correctOption: "Priority Inheritance Protocol",
          hint: "The low-priority thread temporarily inherits the higher priority until it releases the resource.",
          explanation: "Priority Inheritance raises the priority of the lock-holding thread to match the highest waiting thread, preventing intermediate threads from preempting it.",
        },
      ],
    },
    "Database Management Systems": {
      easy: [
        {
          type: "technical",
          prompt: `Which ACID property ensures that once a database transaction is committed, its changes survive power loss or system crashes?`,
          options: ["Durability", "Atomicity", "Consistency", "Isolation"],
          correctOption: "Durability",
          hint: "Usually implemented via Write-Ahead Logging (WAL) to non-volatile storage.",
          explanation: "Durability guarantees that committed transaction changes are permanently recorded in storage (WAL/disk) and survive crashes.",
        },
        {
          type: "technical",
          prompt: `In relational databases, what type of index is organized such that the physical order of rows in the table matches the index order?`,
          options: ["Clustered Index", "Non-Clustered Index", "Bitmap Index", "Full-Text Index"],
          correctOption: "Clustered Index",
          hint: "A table can only have one of these indices because physical storage can only be sorted in one way.",
          explanation: "A Clustered Index dictates the physical ordering of data on disk. Since data rows can only be stored in one physical order, only one clustered index can exist per table.",
        },
      ],
      medium: [
        {
          type: "technical",
          prompt: `At ${companyTag[0]}, your microservice requires transaction isolation that prevents Dirty Reads and Non-Repeatable Reads, but may still allow Phantom Reads. Which isolation level should you choose?`,
          options: ["Repeatable Read", "Read Committed", "Read Uncommitted", "Serializable"],
          correctOption: "Repeatable Read",
          hint: "Read Committed allows non-repeatable reads; Serializable prevents all anomalies.",
          explanation: "Repeatable Read guarantees that any row read during a transaction will return the same values if read again, preventing non-repeatable reads, but range queries may encounter phantom rows.",
        },
        {
          type: "technical",
          prompt: `Why do modern production databases (like PostgreSQL and MySQL InnoDB) use B+ Trees instead of standard binary trees or B-trees for indexing?`,
          options: [
            "B+ Trees store all actual record pointers in leaf nodes connected by pointers, optimizing sequential range scans and disk block reads",
            "B+ Trees require zero memory locks during write transactions",
            "B+ Trees have O(1) worst-case search time complexity",
            "B+ Trees eliminate the need for write-ahead logging",
          ],
          correctOption: "B+ Trees store all actual record pointers in leaf nodes connected by pointers, optimizing sequential range scans and disk block reads",
          hint: "Leaf nodes form a linked list, making range queries (BETWEEN x AND y) extremely fast.",
          explanation: "B+ trees have high fan-out (low depth minimizing disk I/O) and store data only in leaves linked sequentially, making range queries and disk block pre-fetching optimal.",
        },
      ],
      hard: [
        {
          type: "technical",
          prompt: `In distributed databases designed by ${companyTag[0]}, what protocol is typically used to ensure atomic commits across multiple distributed database shards?`,
          options: ["Two-Phase Commit (2PC)", "Paxos Consensus Algorithm", "Raft Leader Election", "Gossip Protocol"],
          correctOption: "Two-Phase Commit (2PC)",
          hint: "Consists of a Prepare phase followed by a Commit/Rollback phase coordinated by a master.",
          explanation: "Two-Phase Commit (2PC) guarantees atomic commit across multiple autonomous shard nodes: in Phase 1 (Prepare) all nodes vote, and in Phase 2 (Commit) changes are committed or aborted uniformly.",
        },
      ],
    },
    "Coding & Algorithmic Problem Solving": {
      easy: [
        {
          type: "coding",
          prompt: `Write a function \`twoSum(nums, target)\` frequently asked at ${companyTag[0]}. Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\` in O(N) time.`,
          codeTemplate:
            primaryLang.toLowerCase().includes("python")
              ? `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Use a hash map to store seen values and their indices\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`
              : primaryLang.toLowerCase().includes("c++")
              ? `#include <vector>\n#include <unordered_map>\n\nstd::vector<int> twoSum(const std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int diff = target - nums[i];\n        if (seen.find(diff) != seen.end()) {\n            return {seen[diff], i};\n        }\n        seen[nums[i]] = i;\n    }\n    return {};\n}`
              : `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}`,
          testCases: [
            { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
            { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
          ],
          hint: "Use a hash map to look up if the complement (target - current_number) was already encountered.",
          explanation: "Iterating through the array while storing indices in a hash map solves the problem in a single pass with O(N) time and O(N) space complexity.",
        },
      ],
      medium: [
        {
          type: "coding",
          prompt: `At ${companyTag[0]}, write a function \`maxSubArray(nums)\` (Kadane's Algorithm) that finds the contiguous subarray with the largest sum and returns that sum in O(N) time.`,
          codeTemplate:
            primaryLang.toLowerCase().includes("python")
              ? `def maxSubArray(nums: list[int]) -> int:\n    # Implement Kadane's algorithm\n    max_sum = nums[0]\n    current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum`
              : primaryLang.toLowerCase().includes("c++")
              ? `#include <vector>\n#include <algorithm>\n\nint maxSubArray(const std::vector<int>& nums) {\n    int max_sum = nums[0];\n    int current_sum = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        current_sum = std::max(nums[i], current_sum + nums[i]);\n        max_sum = std::max(max_sum, current_sum);\n    }\n    return max_sum;\n}`
              : `function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}`,
          testCases: [
            { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6" },
            { input: "nums = [5, 4, -1, 7, 8]", output: "23" },
          ],
          hint: "Keep track of the maximum sum ending at the current position: current_sum = max(num, current_sum + num).",
          explanation: "Kadane's algorithm computes the maximum subarray sum in O(N) time and O(1) extra space by deciding at each element whether to extend the current subarray or start fresh.",
        },
      ],
      hard: [
        {
          type: "coding",
          prompt: `Given an array of non-negative integers representing an elevation map where width of each bar is 1, compute how much water it can trap after raining (Trapping Rain Water) in O(N) time and O(1) space.`,
          codeTemplate:
            primaryLang.toLowerCase().includes("python")
              ? `def trap(height: list[int]) -> int:\n    left, right = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= left_max:\n                left_max = height[left]\n            else:\n                water += left_max - height[left]\n            left += 1\n        else:\n            if height[right] >= right_max:\n                right_max = height[right]\n            else:\n                water += right_max - height[right]\n            right -= 1\n    return water`
              : `function trap(height) {\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0;\n  let water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      if (height[left] >= leftMax) leftMax = height[left];\n      else water += leftMax - height[left];\n      left++;\n    } else {\n      if (height[right] >= rightMax) rightMax = height[right];\n      else water += rightMax - height[right];\n      right--;\n    }\n  }\n  return water;\n}`,
          testCases: [
            { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
            { input: "height = [4,2,0,3,2,5]", output: "9" },
          ],
          hint: "Use two pointers moving inward. The trapped water at any point is bounded by min(left_max, right_max) - height[i].",
          explanation: "Using two pointers achieves O(N) time and O(1) space by maintaining rolling left and right maximum boundaries.",
        },
      ],
    },
    "System Design & Scalability": {
      easy: [
        {
          type: "technical",
          prompt: `In horizontal scaling at ${companyTag[0]}, what is the primary role of a Reverse Proxy (e.g., NGINX)?`,
          options: [
            "Intercept client requests and distribute traffic to backend application servers",
            "Compile frontend TypeScript code on the fly",
            "Act as the primary database storage engine",
            "Encrypt physical hard drives on bare-metal servers",
          ],
          correctOption: "Intercept client requests and distribute traffic to backend application servers",
          hint: "Reverse proxies face the internet on behalf of internal server clusters.",
          explanation: "A reverse proxy sits in front of backend servers, handling SSL termination, load balancing, compression, and request routing.",
        },
      ],
      medium: [
        {
          type: "technical",
          prompt: `When designing a URL shortener service (like bit.ly) at ${companyTag[0]}, which hashing approach avoids hotspots and supports dynamic rebalancing across a cluster of Redis cache nodes?`,
          options: [
            "Consistent Hashing with Virtual Nodes",
            "Modulo-N Hashing (hash(key) % N)",
            "Round-Robin IP Hashing",
            "Linear Probing Hash Tables",
          ],
          correctOption: "Consistent Hashing with Virtual Nodes",
          hint: "When a node is added or removed, only K/N keys need to be remapped on average.",
          explanation: "Consistent Hashing maps servers and keys to a 360-degree hash ring. Virtual nodes ensure uniform distribution and prevent cascading cache stampedes.",
        },
      ],
      hard: [
        {
          type: "technical",
          prompt: `According to the CAP Theorem, when a network partition (P) occurs in a globally distributed system at ${companyTag[0]}, what trade-off must be made?`,
          options: [
            "Choose between Availability (returning stale data) or Consistency (returning error/blocking)",
            "Choose between high throughput and low disk latency",
            "Choose between encryption and compression",
            "Network partitions can be eliminated entirely using optical fiber redundancy",
          ],
          correctOption: "Choose between Availability (returning stale data) or Consistency (returning error/blocking)",
          hint: "In the presence of partition P, you can either satisfy Consistency (CP) or Availability (AP).",
          explanation: "Under network partition, if nodes cannot communicate, the system must either refuse requests to preserve consistency (CP) or proceed with local state risking inconsistency (AP).",
        },
      ],
    },
  };

  // Find candidate topic questions or fallback
  const topicBucket =
    dynamicCatalog[effectiveTopic] ||
    dynamicCatalog["Data Structures & Algorithms"];

  const difficultyList =
    topicBucket[difficulty] ||
    topicBucket["medium"] ||
    topicBucket["easy"];

  // Filter out questions matching previous prompts in this session
  const unusedList = difficultyList.filter(
    (item) => !excludePrompts.some((p) => p.includes(item.prompt.slice(0, 30)))
  );

  const selected = unusedList.length > 0 ? unusedList[0] : difficultyList[0];

  return {
    type: selected.type,
    topic: effectiveTopic,
    difficulty,
    companyTags: companyTag,
    prompt: selected.prompt,
    options: selected.options,
    correctOption: selected.correctOption,
    codeTemplate: selected.codeTemplate,
    testCases: selected.testCases,
    hint: selected.hint,
    explanation: selected.explanation,
  };
}

/**
 * Main entry point: Generates a truly dynamic question for the assessment session.
 * Uses Gemini LLM if configured and functional; seamlessly falls back to procedural
 * dynamic synthesis tailored to the candidate's target companies, skills, and topic.
 */
export async function generateDynamicQuestion(
  params: DynamicQuestionParams
): Promise<Question> {
  const { profile, topic, difficulty, questionIndex, excludePrompts } = params;

  let generatedData: GeneratedQuestionData | null = null;

  // Try LLM generation if possible
  try {
    const llm = getLLM();
    const targetCompanies =
      profile.targetCompanies.length > 0
        ? profile.targetCompanies
        : ["Google", "Microsoft", "Amazon", "Meta"];
    const programmingSkills =
      profile.programmingSkills.length > 0
        ? profile.programmingSkills
        : ["C++", "Python", "JavaScript"];

    const prompt = `
You are a senior technical interviewer creating an adaptive technical interview question.

Candidate Profile:
- Target Companies: ${targetCompanies.join(", ")}
- Known Programming Skills: ${programmingSkills.join(", ")}
- Technical Subjects: ${profile.technicalSubjects.join(", ") || "Data Structures, System Design, Algorithms"}
- Education: ${profile.education ? `${profile.education.degree || "Computer Science"} from ${profile.education.institution || "University"}` : "Undergraduate Computer Science"}

Session Requirements:
- Main Topic: ${topic}
- Question Number: ${questionIndex} of 5
- Calibrated Difficulty: ${difficulty.toUpperCase()}
- Previously Asked Questions in this Session (DO NOT REPEAT):
${excludePrompts.length > 0 ? excludePrompts.map((p, i) => `  ${i + 1}. ${p}`).join("\n") : "  (None)"}

Rules:
1. Create a brand-new, realistic technical question frequently asked in interviews at ${targetCompanies.slice(0, 2).join(" or ")}.
2. Format:
   - For question 4: You can make it a "coding" challenge if appropriate, with codeTemplate in ${programmingSkills[0]} and 2 sample test cases.
   - For other questions: Make it a "technical" or "aptitude" multiple choice question with EXACTLY 4 distinct options.
3. If MCQ:
   - Set "options" to an array of 4 string choices.
   - Exactly ONE option must be correct.
   - Set "correctOption" to the exact string matching the correct choice.
4. Provide a helpful "hint" and a clear educational "explanation".
5. Tag the question with 1 or 2 of the student's target companies in "companyTags".

Return valid JSON adhering to the schema.
`;

    generatedData = await llm.generate(prompt, GeneratedQuestionSchema);
  } catch (err) {
    logger.info({ err: (err as any)?.message }, "Using profile-tailored procedural dynamic question generator");
    generatedData = generateProceduralQuestion(params);
  }

  if (!generatedData) {
    generatedData = generateProceduralQuestion(params);
  }

  // Ensure correctOption is properly populated
  let correctOpt = (
    generatedData.correctOption ||
    (generatedData as any).correct_option ||
    (generatedData as any).answer ||
    ""
  ).trim();

  if (!correctOpt && generatedData.options && generatedData.options.length > 0) {
    const matching = generatedData.options.find((opt) =>
      generatedData.explanation.toLowerCase().includes(opt.toLowerCase())
    );
    correctOpt = matching || generatedData.options[0];
  }

  // Persist question in the database
  const savedQuestion = await repository.createQuestion({
    type: generatedData.type,
    topic: generatedData.topic,
    difficulty: generatedData.difficulty,
    companyTags: generatedData.companyTags,
    content: {
      prompt: generatedData.prompt,
      options: generatedData.options,
      codeTemplate: generatedData.codeTemplate,
      testCases: generatedData.testCases,
      hint: generatedData.hint,
    },
    answerKey: {
      correct_option: correctOpt,
      correctOption: correctOpt,
      explanation: generatedData.explanation,
    },
  });

  return savedQuestion;
}

