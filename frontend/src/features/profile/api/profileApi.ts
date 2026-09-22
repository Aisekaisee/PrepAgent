import { api } from "@/lib/axios";
import type { Profile, ProfileUpdateRequest } from "@/types/profile";

const DEFAULT_PROFILE: Profile = {
  userId: "demo-student-id-001",
  education: {
    degree: "B.Tech in Computer Science & Engineering",
    institution: "National Institute of Technology",
    year: 2026,
  },
  programmingSkills: ["C++", "Python", "TypeScript", "SQL"],
  technicalSubjects: [
    "Data Structures & Algorithms",
    "Operating Systems",
    "Database Management Systems",
    "System Design",
  ],
  targetCompanies: ["Google", "Amazon", "Microsoft", "Uber"],
  timelineWeeks: 8,
  roadmapStale: false,
  updatedAt: new Date().toISOString(),
};

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    try {
      const response = await api.get<{ profile: Profile }>("/profile");
      return response.data.profile;
    } catch {
      // Return cached/default profile
      const local = localStorage.getItem("prepagent_profile");
      return local ? JSON.parse(local) : DEFAULT_PROFILE;
    }
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<Profile> => {
    try {
      const response = await api.put<{ profile: Profile }>("/profile", data);
      localStorage.setItem("prepagent_profile", JSON.stringify(response.data.profile));
      return response.data.profile;
    } catch {
      const updated: Profile = {
        ...DEFAULT_PROFILE,
        ...data,
        updatedAt: new Date().toISOString(),
        roadmapStale: true,
      };
      localStorage.setItem("prepagent_profile", JSON.stringify(updated));
      return updated;
    }
  },
};
