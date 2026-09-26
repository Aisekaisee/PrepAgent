import { StateGraph, END } from "@langchain/langgraph";
import type { RoadmapGraphState } from "./roadmap.state.js";
import { profileNode } from "../nodes/profileNode.js";
import { skillAssessmentNode } from "../nodes/skillAssessmentNode.js";
import { skillGapNode } from "../nodes/skillGapNode.js";
import { roadmapGenerationNode } from "../nodes/roadmapGenerationNode.js";
import { resourceRecommendationNode } from "../nodes/resourceRecommendationNode.js";
import { persistAndReturnNode } from "../nodes/persistAndReturnNode.js";

// Initial state factory
export function createInitialState(userId: string, timelineWeeks: number): RoadmapGraphState {
  return {
    userId,
    timelineWeeks,
    skillProfile: null,
    assessedProfile: null,
    gapList: null,
    roadmapDraft: null,
    roadmap: null,
    errors: [],
    retryCount: 0,
  };
}

// Conditional edge: loop back to skillAssessment if no assessment data exists,
// otherwise proceed to roadmap generation
function routeAfterGapAnalysis(state: RoadmapGraphState): "roadmapGenerationNode" | "skillAssessmentNode" {
  const hasAssessedData = state.assessedProfile &&
    Object.keys(state.assessedProfile).length > 0;

  // Only loop back once to avoid infinite loops
  if (!hasAssessedData && state.retryCount === 0) {
    return "skillAssessmentNode";
  }

  return "roadmapGenerationNode";
}

// Build and compile the roadmap graph
const graphBuilder = new StateGraph<RoadmapGraphState>({
  channels: {
    userId: { value: (_: string, b: string) => b, default: () => "" },
    timelineWeeks: { value: (_: number, b: number) => b, default: () => 12 },
    skillProfile: { value: (_: any, b: any) => b, default: () => null },
    assessedProfile: { value: (_: any, b: any) => b, default: () => null },
    gapList: { value: (_: any, b: any) => b, default: () => null },
    roadmapDraft: { value: (_: any, b: any) => b, default: () => null },
    roadmap: { value: (_: any, b: any) => b, default: () => null },
    errors: {
      value: (a: string[], b: string[]) => [...a, ...b],
      default: () => [],
    },
    retryCount: { value: (_: number, b: number) => b, default: () => 0 },
  },
});

graphBuilder
  .addNode("profileNode", profileNode)
  .addNode("skillAssessmentNode", skillAssessmentNode)
  .addNode("skillGapNode", skillGapNode)
  .addNode("roadmapGenerationNode", roadmapGenerationNode)
  .addNode("resourceRecommendationNode", resourceRecommendationNode)
  .addNode("persistAndReturnNode", persistAndReturnNode)
  .addEdge("__start__", "profileNode")
  .addEdge("profileNode", "skillAssessmentNode")
  .addEdge("skillAssessmentNode", "skillGapNode")
  .addConditionalEdges("skillGapNode", routeAfterGapAnalysis, {
    skillAssessmentNode: "skillAssessmentNode",
    roadmapGenerationNode: "roadmapGenerationNode",
  })
  .addEdge("roadmapGenerationNode", "resourceRecommendationNode")
  .addEdge("resourceRecommendationNode", "persistAndReturnNode")
  .addEdge("persistAndReturnNode", END);

export const roadmapGraph = graphBuilder.compile();
