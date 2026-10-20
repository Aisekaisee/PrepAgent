import { api } from "@/lib/axios";
import type { Roadmap, RoadmapItemStatus, RoadmapProgressEvent } from "@/types/roadmap";
import { streamRoadmapGeneration } from "@/lib/sse";

const LOCAL_STORAGE_ROADMAP_KEY = "prepagent_active_roadmap";

// Purge any legacy prefilled mock roadmap from localStorage on load
try {
  const cached = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed?.id === "roadmap-default-001" || parsed?.userId === "demo-student-id-001") {
      localStorage.removeItem(LOCAL_STORAGE_ROADMAP_KEY);
    }
  }
} catch {
  // Ignore parse issues
}

export const roadmapApi = {
  getActiveRoadmap: async (): Promise<Roadmap | null> => {
    try {
      const response = await api.get<{
        roadmap: Roadmap;
        items?: Roadmap["items"];
      }>("/roadmap");

      const roadmapData = response.data.roadmap;
      if (!roadmapData) return null;

      const items = response.data.items || roadmapData.items || [];
      const normalizedRoadmap: Roadmap = {
        ...roadmapData,
        items,
      };

      // Cache the active dynamic roadmap
      localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(normalizedRoadmap));
      return normalizedRoadmap;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        localStorage.removeItem(LOCAL_STORAGE_ROADMAP_KEY);
        return null;
      }

      // Check if we have a valid previously generated roadmap cached (not mock)
      const cached = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
      if (cached) {
        try {
          const parsed: Roadmap = JSON.parse(cached);
          if (parsed && parsed.id !== "roadmap-default-001" && parsed.userId !== "demo-student-id-001") {
            return parsed;
          }
        } catch {
          // Ignore
        }
      }

      return null;
    }
  },

  updateItemStatus: async (
    itemId: string,
    status: RoadmapItemStatus
  ): Promise<void> => {
    try {
      await api.patch(`/roadmap/items/${itemId}`, { status });
    } catch {
      // Update local storage copy if present
      const cached = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
      if (cached) {
        const parsed: Roadmap = JSON.parse(cached);
        const item = parsed.items?.find((i) => i.id === itemId);
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
        if (roadmap) {
          localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(roadmap));
          onComplete(roadmap);
        }
      },
      onError,
    });
  },
};
