export interface Resource {
  id: string;
  type: "problem" | "article" | "question";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  companyTags: string[];
  title: string;
  url: string | null;
  content: string | null;
  embeddingId: string | null;
  createdAt: Date;
}

export interface ResourceFilters {
  topic?: string;
  difficulty?: string;
  companyTag?: string;
  page: number;
  limit: number;
}
