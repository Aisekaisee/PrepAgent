export type ResourceType = "problem" | "article" | "question";
export type ResourceDifficulty = "easy" | "medium" | "hard";

export interface Resource {
  id: string;
  type: ResourceType;
  topic: string;
  difficulty: ResourceDifficulty;
  companyTags: string[];
  title: string;
  url?: string;
  content?: string;
  createdAt?: string;
}

export interface ResourceFilterParams {
  topic?: string;
  difficulty?: string;
  company?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}
