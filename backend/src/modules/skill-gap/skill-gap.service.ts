import { AppError } from "../../utils/AppError.js";
import * as profileRepo from "../profile/profile.repository.js";
import * as skillGapRepo from "./skill-gap.repository.js";
import {
  PROFICIENCY_SCALE,
  type GapItem,
  type GapResult,
  type ProficiencyLevel,
} from "./skill-gap.types.js";

// Map a percentage score (0–100) or accuracy (0-1) to a proficiency level
function scoreToProficiency(score: number): ProficiencyLevel {
  const normalized = score <= 1 ? score * 100 : score;
  if (normalized >= 85) return "expert";
  if (normalized >= 70) return "advanced";
  if (normalized >= 45) return "intermediate";
  return "beginner";
}

const TOPIC_CONFIG: Record<
  string,
  { displayName: string; keywords: string[]; defaultExpected: ProficiencyLevel }
> = {
  "data-structures": {
    displayName: "Data Structures & Algorithms",
    keywords: ["data structure", "dsa", "tree", "linked list", "array", "heap", "hash"],
    defaultExpected: "expert",
  },
  algorithms: {
    displayName: "Graph & Dynamic Programming",
    keywords: ["algorithm", "dynamic programming", "graph", "dp", "recursion", "greedy"],
    defaultExpected: "expert",
  },
  "system-design": {
    displayName: "System Design & Scalability",
    keywords: ["system design", "scalability", "architecture", "distributed", "caching", "microservice"],
    defaultExpected: "advanced",
  },
  databases: {
    displayName: "Database Management & SQL",
    keywords: ["database", "dbms", "sql", "acid", "postgres", "mysql", "nosql"],
    defaultExpected: "intermediate",
  },
  "operating-systems": {
    displayName: "Operating Systems & Concurrency",
    keywords: ["operating system", "os", "concurrency", "thread", "process", "deadlock", "memory"],
    defaultExpected: "intermediate",
  },
  "object-oriented": {
    displayName: "Object-Oriented Design (OOD)",
    keywords: ["object-oriented", "ood", "oop", "design pattern", "solid", "class"],
    defaultExpected: "advanced",
  },
  "leadership-principles": {
    displayName: "Behavioral & Leadership",
    keywords: ["leadership", "behavioral", "star", "culture", "management"],
    defaultExpected: "advanced",
  },
  "product-sense": {
    displayName: "Product Sense & Architecture",
    keywords: ["product", "metric", "analytics", "feature"],
    defaultExpected: "intermediate",
  },
};

function matchesTopic(evalTopic: string, reqSlug: string): boolean {
  const normEval = evalTopic.toLowerCase();
  const config = TOPIC_CONFIG[reqSlug];
  if (!config) return normEval.includes(reqSlug.replace("-", " "));

  if (normEval === config.displayName.toLowerCase()) return true;
  return config.keywords.some((kw) => normEval.includes(kw));
}

export async function computeGap(userId: string): Promise<GapResult> {
  // 1. Fetch profile for target companies
  const profile = await profileRepo.findByUserId(userId);

  const targetCompanies: string[] =
    profile?.target_companies && profile.target_companies.length > 0
      ? profile.target_companies
      : ["Google", "Amazon", "Microsoft", "Meta"];

  // 2. Fetch what those companies require
  let requirements = await skillGapRepo.findCompanyRequirements(targetCompanies);

  // If DB doesn't have requirements for the specific target companies, fallback to all known requirements
  if (requirements.length === 0) {
    requirements = await skillGapRepo.findCompanyRequirements([
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
    ]);
  }

  // 3. Fetch candidate's submitted assessment sessions
  const sessions = await skillGapRepo.findAllAssessedSessionsByUser(userId);

  // Aggregate user's performance per topic across all submitted assessment sessions
  const userTopicPerformance: Record<
    string,
    { totalQuestions: number; correctQuestions: number; latestScore: number }
  > = {};

  for (const sess of sessions) {
    if (sess.topicBreakdown) {
      for (const [top, stats] of Object.entries(sess.topicBreakdown)) {
        if (!userTopicPerformance[top]) {
          userTopicPerformance[top] = {
            totalQuestions: 0,
            correctQuestions: 0,
            latestScore: sess.score ?? 0,
          };
        }
        userTopicPerformance[top].totalQuestions += stats.total || 0;
        userTopicPerformance[top].correctQuestions += stats.correct || 0;
      }
    } else if (sess.topic && sess.score !== null) {
      if (!userTopicPerformance[sess.topic]) {
        userTopicPerformance[sess.topic] = {
          totalQuestions: 5,
          correctQuestions: Math.round((sess.score / 100) * 5),
          latestScore: sess.score,
        };
      }
    }
  }

  // 4. Group requirements by topic slug
  const groupedReqs: Record<
    string,
    { expectedLevels: ProficiencyLevel[]; companies: Set<string> }
  > = {};

  for (const req of requirements) {
    if (!groupedReqs[req.topic]) {
      groupedReqs[req.topic] = {
        expectedLevels: [],
        companies: new Set(),
      };
    }
    groupedReqs[req.topic].expectedLevels.push(req.expectedLevel);
    groupedReqs[req.topic].companies.add(req.companyName);
  }

  // Ensure standard core technical topics exist even if company requirements are partial
  for (const [slug, cfg] of Object.entries(TOPIC_CONFIG)) {
    if (!groupedReqs[slug]) {
      groupedReqs[slug] = {
        expectedLevels: [cfg.defaultExpected],
        companies: new Set(targetCompanies.slice(0, 2)),
      };
    }
  }

  // 5. Compute dynamic gap per topic
  const gaps: GapItem[] = [];

  for (const [topicSlug, reqData] of Object.entries(groupedReqs)) {
    const config = TOPIC_CONFIG[topicSlug];
    const displayName = config ? config.displayName : topicSlug;

    // Determine highest required level among target companies
    let highestExpected: ProficiencyLevel = "intermediate";
    let maxExpectedScore = 0;
    for (const lvl of reqData.expectedLevels) {
      const score = PROFICIENCY_SCALE[lvl] || 2;
      if (score > maxExpectedScore) {
        maxExpectedScore = score;
        highestExpected = lvl;
      }
    }

    // Determine candidate's assessed level from assessments
    let isAssessed = false;
    let assessedAccuracy = 0;
    let matchedTotal = 0;
    let matchedCorrect = 0;

    for (const [evalTopic, perf] of Object.entries(userTopicPerformance)) {
      if (matchesTopic(evalTopic, topicSlug)) {
        isAssessed = true;
        matchedTotal += perf.totalQuestions;
        matchedCorrect += perf.correctQuestions;
      }
    }

    let currentLevel: ProficiencyLevel = "beginner";
    if (isAssessed && matchedTotal > 0) {
      assessedAccuracy = matchedCorrect / matchedTotal;
      currentLevel = scoreToProficiency(assessedAccuracy);
    } else {
      currentLevel = "beginner";
    }

    const currentScore = PROFICIENCY_SCALE[currentLevel];
    const requiredScore = PROFICIENCY_SCALE[highestExpected];
    const gapScore = Math.max(0, requiredScore - currentScore);

    const severity: "low" | "moderate" | "high" | "critical" =
      gapScore >= 3
        ? "critical"
        : gapScore === 2
        ? "high"
        : gapScore === 1
        ? "moderate"
        : "low";

    const relevantCompanies = Array.from(reqData.companies);

    gaps.push({
      topic: displayName,
      requiredLevel: highestExpected,
      required: highestExpected,
      requiredScore,
      currentLevel,
      current: currentLevel,
      currentScore,
      gapScore,
      severity,
      rank: 0,
      relevantCompanies:
        relevantCompanies.length > 0 ? relevantCompanies : targetCompanies.slice(0, 2),
      isAssessed,
    });
  }

  // 6. Rank gaps by gapScore descending (highest deficit first)
  gaps.sort((a, b) => b.gapScore - a.gapScore || b.requiredScore - a.requiredScore);
  gaps.forEach((g, idx) => {
    g.rank = idx + 1;
  });

  // 7. Dynamic AI synthesis insights based on real candidate performance
  const topGap = gaps[0];
  const secondGap = gaps[1];
  const strongTopic = gaps.find((g) => g.gapScore === 0 && g.isAssessed) || gaps[gaps.length - 1];

  const insights = {
    priority1: topGap
      ? {
          topic: topGap.topic,
          currentLevel: topGap.currentLevel,
          requiredLevel: topGap.requiredLevel,
          companies: topGap.relevantCompanies,
          description: topGap.isAssessed
            ? `Assessed at ${topGap.currentLevel.toUpperCase()} while ${topGap.relevantCompanies.join(" & ")} require ${topGap.requiredLevel.toUpperCase()} proficiency. High-priority targeted study recommended.`
            : `Not yet evaluated in assessments. ${topGap.relevantCompanies.join(" & ")} require ${topGap.requiredLevel.toUpperCase()} proficiency for placement readiness.`,
        }
      : undefined,
    priority2: secondGap
      ? {
          topic: secondGap.topic,
          currentLevel: secondGap.currentLevel,
          requiredLevel: secondGap.requiredLevel,
          companies: secondGap.relevantCompanies,
          description: secondGap.isAssessed
            ? `Current accuracy places you at ${secondGap.currentLevel} vs target hiring bar of ${secondGap.requiredLevel}. Focus on advanced interview scenarios.`
            : `Pending diagnostic benchmark. Minimum expectation for ${secondGap.relevantCompanies.join(" & ")} is ${secondGap.requiredLevel}.`,
        }
      : undefined,
    strongFoundation: strongTopic
      ? {
          topic: strongTopic.topic,
          currentLevel: strongTopic.currentLevel,
          companies: strongTopic.relevantCompanies,
          description: strongTopic.isAssessed
            ? `Verified proficiency in ${strongTopic.topic} meets the ${strongTopic.requiredLevel} hiring bar for ${strongTopic.relevantCompanies.join(" & ")}! Maintain consistency.`
            : `On track with baseline expectations for ${strongTopic.relevantCompanies.join(" & ")}.`,
        }
      : undefined,
  };

  return {
    userId,
    gaps,
    targetCompanies,
    computedAt: new Date(),
    insights,
  };
}
